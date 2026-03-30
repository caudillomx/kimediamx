import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract plain text from a .docx file (ZIP containing XML)
async function extractDocxText(blob: Blob): Promise<string> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (!documentXml) {
      console.log("No word/document.xml found, falling back to raw text");
      return await blob.text();
    }
    // Strip XML tags, decode entities, clean up whitespace
    const text = documentXml
      .replace(/<w:p[^>]*>/g, "\n") // paragraph breaks
      .replace(/<w:tab\/>/g, "\t") // tabs
      .replace(/<w:br[^>]*\/>/g, "\n") // line breaks
      .replace(/<[^>]+>/g, "") // strip all XML tags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\n{3,}/g, "\n\n") // collapse multiple newlines
      .trim();
    return text;
  } catch (e) {
    console.error("DOCX parse error, falling back to raw text:", e);
    return await blob.text();
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { minuteId, filePath } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("minutes")
      .download(filePath);

    if (downloadError) throw downloadError;

    // Extract text from the file (handles .docx properly)
    const isDocx = filePath.toLowerCase().endsWith(".docx");
    const text = isDocx ? await extractDocxText(fileData) : await fileData.text();
    console.log(`Extracted text length: ${text.length} chars (first 200): ${text.substring(0, 200)}`);

    // Get team members and client contacts for matching
    const [{ data: teamMembers }, { data: clientContacts }] = await Promise.all([
      supabase.from("team_members").select("id, full_name, role_title"),
      supabase.from("client_contacts").select("client_name, full_name, role_title, nicknames"),
    ]);

    const teamList = (teamMembers || []).map(m => m.full_name).join(", ");
    const contactsList = (clientContacts || []).map(c => `${c.full_name} (${c.role_title || 'contacto'} de ${c.client_name}, apodos: ${(c.nicknames || []).join(', ')})`).join("; ");

    // Build unique client list from contacts
    const clientNames = [...new Set((clientContacts || []).map(c => c.client_name))];
    // Add known clients from action_items
    const { data: existingClients } = await supabase.from("action_items").select("client").not("client", "is", null);
    const allClients = [...new Set([...clientNames, ...(existingClients || []).map((r: any) => r.client)])].filter(Boolean);
    const clientList = allClients.join(", ");

    // Use AI to parse the minutes
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Eres un asistente que extrae tareas y compromisos de minutas de reunión de la agencia KiMedia.

El equipo interno incluye: ${teamList}.

Contactos externos por cliente: ${contactsList}.

Clientes conocidos: ${clientList}.

IMPORTANTE:
- Cuando en la minuta aparezca un apodo o nombre corto (ej: "Mara", "Fili", "Nava"), resuélvelo al nombre completo del contacto o miembro del equipo correspondiente.
- Cuando aparezca un nombre abreviado o informal de cliente (ej: "Tinver" = "Actinver", "Diluvio" = "El Diluvio", "Doria" = "Mario Doria - Urólogo", "MID" = "MID Clinic"), resuélvelo al nombre exacto de la lista de clientes conocidos.

Extrae cada tarea/compromiso/pendiente como un objeto JSON con estos campos:
- description: descripción clara de la tarea
- responsible_name: nombre exacto del responsable (debe coincidir con la lista del equipo). Si no es claro, pon null.
- client: nombre exacto del cliente de la lista de clientes conocidos. Si no aplica, pon null.
- category: una de [tarea, llamada, evento, cotizacion, reporte, prospecto, proyecto]
- priority: una de [alta, media, baja]
- due_date: fecha en formato YYYY-MM-DD si se menciona, o null

Responde SOLO con un JSON array. Sin explicaciones.`,
          },
          {
            role: "user",
            content: `Extrae las tareas de esta minuta:\n\n${text.substring(0, 15000)}`,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "[]";

    // Clean markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let tasks: any[];
    try {
      tasks = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      tasks = [];
    }

    // Match responsible names to team member IDs
    const resolvedTasks = tasks.map((task: any) => {
      const member = teamMembers?.find(
        m => m.full_name.toLowerCase() === (task.responsible_name || "").toLowerCase()
      );
      return {
        minute_id: minuteId,
        description: task.description || "Sin descripción",
        responsible_id: member?.id || null,
        responsible_name: task.responsible_name || null,
        client: task.client || null,
        category: task.category || "tarea",
        priority: task.priority || "media",
        due_date: task.due_date || null,
        status: "pendiente",
      };
    });

    // Insert action items
    if (resolvedTasks.length > 0) {
      const { error: insertError } = await supabase
        .from("action_items")
        .insert(resolvedTasks);

      if (insertError) throw insertError;
    }

    // Mark minute as parsed
    await supabase
      .from("minutes")
      .update({ parsed: true })
      .eq("id", minuteId);

    return new Response(
      JSON.stringify({ success: true, count: resolvedTasks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
