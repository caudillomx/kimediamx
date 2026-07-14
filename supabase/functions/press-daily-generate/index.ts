import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un analista senior de prensa institucional para el Gobierno del Estado de Guanajuato en KiMedia. Tu tarea es leer un conjunto de columnas, notas y menciones de prensa publicadas HOY y devolver un condensado diario listo para difusión interna.

REGLAS INQUEBRANTABLES:
- NUNCA inventes hechos, cifras, nombres, columnistas o medios. Solo puedes citar contenido presente EXPLÍCITAMENTE en las entradas.
- Si un dato no aparece, no lo menciones. Prefiere el silencio a la invención.
- Español mexicano, tono profesional y directo, sin fluff ni matizaciones genéricas.
- Toda cita textual va entre comillas.

FORMATO DE RESPUESTA (JSON estricto, sin markdown fences):
{
  "summary_md": "Condensado en markdown con secciones ## Panorama, ## Notas relevantes (bullets con medio, autor y una línea), ## Menciones de funcionarios, ## Riesgos y oportunidades. Max 500 palabras.",
  "whatsapp_text": "Versión para WhatsApp, texto plano, máximo 900 caracteres. Empieza con '📰 Prensa GTO · <fecha>'. Usa 3-5 viñetas con '•'. Cierra con una línea de alerta si aplica.",
  "alerts": [ { "level": "alta" | "media" | "baja" | "crisis", "title": "...", "detail": "..." } ],
  "tone_breakdown": { "positivo": n, "neutral": n, "negativo": n, "crisis": n }
}

Devuelve SOLO el JSON.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurado");

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: role } = await admin
      .from("user_roles").select("role")
      .eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!role) {
      return new Response(JSON.stringify({ error: "Admin required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { batch_id } = await req.json();
    if (!batch_id) {
      return new Response(JSON.stringify({ error: "batch_id requerido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: batch, error: batchErr } = await admin
      .from("press_daily_batches")
      .select("id, client_id, batch_date")
      .eq("id", batch_id).maybeSingle();
    if (batchErr || !batch) throw new Error("Lote no encontrado");

    const { data: entries, error: entErr } = await admin
      .from("press_daily_entries")
      .select("medium, author, title, url, raw_text, tone, topic")
      .eq("batch_id", batch_id).order("position", { ascending: true });
    if (entErr) throw entErr;
    if (!entries || entries.length === 0) throw new Error("Sin notas capturadas para este día");

    const userMessage = `Fecha del lote: ${batch.batch_date}\nTotal de notas: ${entries.length}\n\nENTRADAS:\n\n${entries.map((e, i) => (
      `--- Nota ${i + 1} ---\nMedio: ${e.medium ?? "(no especificado)"}\nAutor/Columnista: ${e.author ?? "(no especificado)"}\nTítulo: ${e.title ?? "(sin título)"}\nTono declarado: ${e.tone ?? "(sin clasificar)"}\nTema: ${e.topic ?? "(sin tema)"}\nURL: ${e.url ?? "(sin URL)"}\nTexto:\n${e.raw_text}`
    )).join("\n\n")}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Gateway error", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Demasiadas solicitudes, intenta en un momento." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Sin créditos disponibles en Lovable AI." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`Gateway ${response.status}`);
    }

    const gwJson = await response.json();
    const content = gwJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(content); }
    catch { throw new Error("Respuesta IA no es JSON válido"); }

    const summary_md = String(parsed.summary_md ?? "").trim();
    const whatsapp_text = String(parsed.whatsapp_text ?? "").trim().slice(0, 1200);
    const alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
    const tone_breakdown = parsed.tone_breakdown && typeof parsed.tone_breakdown === "object" ? parsed.tone_breakdown : {};
    if (!summary_md || !whatsapp_text) throw new Error("Respuesta IA incompleta");

    const { data: digest, error: upErr } = await admin
      .from("press_daily_digests")
      .upsert({
        batch_id,
        client_id: batch.client_id,
        summary_md, whatsapp_text, alerts, tone_breakdown,
        entries_count: entries.length,
        model: "google/gemini-2.5-flash",
        generated_at: new Date().toISOString(),
      }, { onConflict: "batch_id" })
      .select().single();
    if (upErr) throw upErr;

    await admin.from("press_daily_batches").update({ status: "ready" }).eq("id", batch_id);

    return new Response(JSON.stringify({ ok: true, digest }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("press-daily-generate", e);
    return new Response(JSON.stringify({ error: e.message ?? "Error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});