import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/fireflies";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIREFLIES_API_KEY = Deno.env.get("FIREFLIES_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!FIREFLIES_API_KEY) throw new Error("FIREFLIES_API_KEY missing");

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      transcriptId,
      dependenciaId,
      sessionType = "consultoria",
      sesionId = null,
    } = body ?? {};
    if (!transcriptId || !dependenciaId) {
      return new Response(
        JSON.stringify({ error: "transcriptId and dependenciaId required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1. Get transcript with sentences from Fireflies
    const ffQuery = `
      query Transcript($id: String!) {
        transcript(id: $id) {
          id title date duration
          host_email organizer_email participants
          transcript_url
          summary { overview short_summary action_items keywords topics_discussed }
          sentences { speaker_name text }
        }
      }
    `;
    const ffRes = await fetch(`${GATEWAY_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIREFLIES_API_KEY,
      },
      body: JSON.stringify({ query: ffQuery, variables: { id: transcriptId } }),
    });
    const ffData = await ffRes.json();
    if (!ffRes.ok || ffData.errors) {
      throw new Error(
        `Fireflies error [${ffRes.status}]: ${JSON.stringify(ffData)}`
      );
    }
    const t = ffData.data?.transcript;
    if (!t) throw new Error("Transcript not found");

    const fullTranscript: string = (t.sentences ?? [])
      .map((s: any) => `${s.speaker_name}: ${s.text}`)
      .join("\n");

    // 2. Extract structured data with Lovable AI
    const systemPrompt = `Eres analista de KiMedia. Extraes datos estructurados de transcripciones de capacitaciones gubernamentales sobre IA y comunicación institucional.

Tipo de sesión: ${sessionType} (consultoria | entrenamiento | simulacro).

Devuelve SOLO JSON válido con este shape:
{
  "topic": "tema coyuntural tratado, 1 frase",
  "objective": "objetivo de la sesión, 1 frase",
  "attendees": [{"nombre": "...", "cargo": "..."}],
  "modality": "virtual | presencial | hibrido",
  "facilitator": "nombre del consultor/facilitador KiMedia",
  "asesoria_descripcion": "2-4 líneas describiendo el acompañamiento brindado",
  "recomendaciones": ["recomendación 1", "..."],
  "competencias_trabajadas": ["Identificación de riesgos narrativos", "Interpretación de señales", "Coordinación institucional", "Respuesta narrativa", "Trazabilidad y documentación"],
  "resultado_tipo": "resolucion | claridad_narrativa | respuesta_institucional | otro",
  "resultado_descripcion": "breve descripción del resultado",
  "observaciones_facilitador": "patrones, riesgos, aprendizajes",
  "simulacro": {
    "tema_detonador": "...",
    "primera_vuelta": {"tiempo_respuesta": "mm:ss", "mensaje": "...", "claridad": "alta|media|baja", "alineacion": "si|no"},
    "segunda_vuelta": {"tiempo_respuesta": "mm:ss", "mensaje_corregido": "...", "hubo_mejora": true},
    "retroalimentacion": "..."
  }
}

Si la sesión NO es simulacro, deja "simulacro" como null. Si un dato no está, usa null o []. NO inventes nada que no esté en la transcripción.`;

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Título: ${t.title}\nFecha: ${t.date}\nParticipantes (correos): ${(t.participants ?? []).join(", ")}\nResumen Fireflies: ${t.summary?.overview ?? ""}\n\nTranscripción:\n${fullTranscript.slice(0, 25000)}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      }
    );
    if (!aiRes.ok) {
      throw new Error(`AI extraction failed: ${aiRes.status}`);
    }
    const aiData = await aiRes.json();
    let extracted: any = {};
    try {
      extracted = JSON.parse(aiData.choices?.[0]?.message?.content ?? "{}");
    } catch (e) {
      console.error("AI JSON parse failed", e);
    }

    // 3. Insert training session
    const durationMin = t.duration
      ? Math.round(Number(t.duration) / 60)
      : null;
    const sessionDate = t.date
      ? new Date(Number(t.date)).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const { data: inserted, error: insertErr } = await admin
      .from("gto_training_sessions")
      .insert({
        dependencia_id: dependenciaId,
        sesion_id: sesionId,
        session_type: sessionType,
        session_date: sessionDate,
        duration_minutes: durationMin,
        modality: extracted.modality ?? "virtual",
        attendees: extracted.attendees ?? [],
        attendee_count: (extracted.attendees ?? []).length,
        facilitator: extracted.facilitator ?? null,
        topic: extracted.topic ?? t.title,
        objective: extracted.objective ?? null,
        fireflies_meeting_id: t.id,
        fireflies_url: t.transcript_url ?? null,
        transcript_text: fullTranscript,
        transcript_summary: t.summary?.overview ?? null,
        ai_extracted: extracted,
        ai_extracted_at: new Date().toISOString(),
        result_type: extracted.resultado_tipo ?? null,
        result_description: extracted.resultado_descripcion ?? null,
        notes: extracted.observaciones_facilitador ?? null,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ success: true, session: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("fireflies-import-session error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});