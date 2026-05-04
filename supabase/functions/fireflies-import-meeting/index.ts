import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/fireflies";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIREFLIES_API_KEY = Deno.env.get("FIREFLIES_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!FIREFLIES_API_KEY) throw new Error("FIREFLIES_API_KEY missing");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles").select("role")
      .eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { meetingId, client = null, preview = false } = await req.json();
    if (!meetingId) {
      return new Response(JSON.stringify({ error: "meetingId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: meeting, error: mErr } = await admin
      .from("fireflies_meetings").select("*").eq("id", meetingId).maybeSingle();
    if (mErr || !meeting) throw new Error("Meeting not found");
    if (!preview && meeting.review_status === "excluded") {
      throw new Error("Meeting is excluded");
    }

    // 1. Fetch full transcript with sentences
    const ffQuery = `
      query Transcript($id: String!) {
        transcript(id: $id) {
          id title date sentences { speaker_name text }
          summary { overview action_items }
        }
      }`;
    const ffRes = await fetch(`${GATEWAY_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIREFLIES_API_KEY,
      },
      body: JSON.stringify({ query: ffQuery, variables: { id: meeting.fireflies_id } }),
    });
    const ffData = await ffRes.json();
    if (!ffRes.ok || ffData.errors) {
      throw new Error(`Fireflies error: ${JSON.stringify(ffData)}`);
    }
    const t = ffData.data?.transcript;
    if (!t) throw new Error("Transcript not available");

    const fullTranscript: string = (t.sentences ?? [])
      .map((s: any) => `${s.speaker_name}: ${s.text}`).join("\n");

    // 2. Get team & contacts for AI resolution
    const [{ data: teamMembers }, { data: clientContacts }, { data: existingClients }] = await Promise.all([
      admin.from("team_members").select("id, full_name, role_title"),
      admin.from("client_contacts").select("client_name, full_name, role_title, nicknames"),
      admin.from("action_items").select("client").not("client", "is", null),
    ]);
    const teamList = (teamMembers || []).map((m: any) => m.full_name).join(", ");
    const contactsList = (clientContacts || []).map((c: any) =>
      `${c.full_name} (${c.role_title || "contacto"} de ${c.client_name}, apodos: ${(c.nicknames || []).join(", ")})`
    ).join("; ");
    const clientNames = [...new Set([
      ...(clientContacts || []).map((c: any) => c.client_name),
      ...(existingClients || []).map((r: any) => r.client),
    ])].filter(Boolean);
    const clientList = clientNames.join(", ");

    // 3. AI extraction with sensitivity filter
    const aiPrompt = `Eres un asistente que extrae tareas de minutas de KiMedia.

Equipo interno: ${teamList}.
Contactos externos: ${contactsList}.
Clientes conocidos: ${clientList}.

REGLAS:
- Resuelve apodos (Mara, Fili, Nava) y nombres cortos de cliente (Tinver=Actinver, Diluvio=El Diluvio, Doria=Mario Doria - Urólogo, MID=MID Clinic) a sus nombres completos.
- DESCARTA tareas que mencionen sueldos, evaluaciones de desempeño, datos personales, asuntos médicos, o información financiera privada del equipo. NO las incluyas en el array.
- Cliente sugerido para esta minuta: ${client || "no especificado"}.

Devuelve SOLO un JSON array. Cada tarea: { description, responsible_name (string|null), client (string|null), category (tarea|llamada|evento|cotizacion|reporte|prospecto|proyecto), priority (alta|media|baja), due_date (YYYY-MM-DD|null) }`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: aiPrompt },
          { role: "user", content: `Título: ${t.title}\nFecha: ${t.date}\nResumen: ${t.summary?.overview || ""}\nAction items Fireflies: ${Array.isArray(t.summary?.action_items) ? t.summary.action_items.join("\n") : (t.summary?.action_items || "")}\n\nTranscripción (con speakers):\n${fullTranscript.slice(0, 20000)}` },
        ],
        temperature: 0.1,
      }),
    });
    if (!aiRes.ok) throw new Error(`AI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let tasks: any[] = [];
    try { tasks = JSON.parse(content); } catch { tasks = []; }

    // 4. Create minute record linked to fireflies meeting
    const meetingDateOnly = meeting.meeting_date ? meeting.meeting_date.split("T")[0] : new Date().toISOString().split("T")[0];
    const { data: minute, error: minErr } = await admin.from("minutes").insert({
      title: meeting.title,
      meeting_date: meetingDateOnly,
      raw_text: fullTranscript.slice(0, 50000),
      file_name: `fireflies:${meeting.fireflies_id}`,
      parsed: true,
      fireflies_meeting_id: meeting.id,
    }).select().single();
    if (minErr) throw minErr;

    // 5. Insert action items
    const resolved = tasks.map((task: any) => {
      const member = (teamMembers || []).find((m: any) =>
        m.full_name.toLowerCase() === (task.responsible_name || "").toLowerCase()
      );
      return {
        minute_id: minute.id,
        description: task.description || "Sin descripción",
        responsible_id: member?.id || null,
        responsible_name: task.responsible_name || null,
        client: task.client || client || null,
        category: task.category || "tarea",
        priority: task.priority || "media",
        due_date: task.due_date || null,
        status: "pendiente",
      };
    });

    if (resolved.length) {
      if (preview) {
        return new Response(
          JSON.stringify({ success: true, preview: true, tasks: resolved, transcriptPreview: fullTranscript.slice(0, 2000) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { error: aiErr } = await admin.from("action_items").insert(resolved);
      if (aiErr) throw aiErr;
    }

    if (preview) {
      return new Response(
        JSON.stringify({ success: true, preview: true, tasks: [], transcriptPreview: fullTranscript.slice(0, 2000) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Mark meeting as imported
    await admin.from("fireflies_meetings").update({
      review_status: "imported",
      assigned_client: client,
      imported_minute_id: minute.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userData.user.id,
    }).eq("id", meeting.id);

    return new Response(
      JSON.stringify({ success: true, minuteId: minute.id, taskCount: resolved.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("fireflies-import-meeting error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});