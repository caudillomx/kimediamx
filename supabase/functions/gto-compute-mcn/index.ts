import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Calcula calificaciones MCN (Matriz de Competencias Narrativas) por dependencia
 * usando evidencia real:
 *  - Sesiones Fireflies del periodo (consultorías, entrenamientos, simulacros)
 *  - Bitácoras del curso (gto_sesiones + participantes + corpus + diagnósticos)
 *
 * Reglas duras:
 *  - La IA SOLO califica si encuentra evidencia. Si no, devuelve null y lo reporta
 *    como pendiente en areas_mejora. Nunca inventa.
 *  - Cada score viene con cita (frase de transcripción o referencia a documento/fecha).
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

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
    const dependenciaId: string | undefined = body?.dependenciaId;
    const year: number = Number(body?.year);
    const month: number = Number(body?.month);
    const wholeCycle: boolean = !!body?.wholeCycle;
    if (!dependenciaId || !year || !month) {
      return new Response(
        JSON.stringify({ error: "dependenciaId, year, month requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const periodStart = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

    // Ciclo único GTO: cuando wholeCycle=true, todos los scores se etiquetan como Abril 2026.
    const effectiveYear = wholeCycle ? 2026 : year;
    const effectiveMonth = wholeCycle ? 4 : month;

    // 1) Dependencia
    const { data: dep } = await admin
      .from("gto_dependencias")
      .select("id, nombre, siglas")
      .eq("id", dependenciaId)
      .maybeSingle();
    if (!dep) {
      return new Response(JSON.stringify({ error: "Dependencia no existe" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Sesiones Fireflies del mes
    let sessionsQ = admin
      .from("gto_training_sessions")
      .select("*")
      .eq("dependencia_id", dependenciaId)
      .order("session_date", { ascending: true });
    if (!wholeCycle) {
      sessionsQ = sessionsQ.gte("session_date", periodStart).lte("session_date", periodEnd);
    }
    const { data: rawSessions } = await sessionsQ;
    const seen = new Set<string>();
    const sessions = (rawSessions ?? []).filter((s: any) => {
      const k = s.fireflies_meeting_id || s.id;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // 3) MCN previo (mes anterior) y actual (para auditoría)
    const prevMonth = effectiveMonth === 1 ? 12 : effectiveMonth - 1;
    const prevYear = effectiveMonth === 1 ? effectiveYear - 1 : effectiveYear;
    const { data: mcnPrev } = await admin
      .from("gto_mcn_scores")
      .select("*")
      .eq("dependencia_id", dependenciaId)
      .eq("period_year", prevYear)
      .eq("period_month", prevMonth)
      .maybeSingle();

    // 4) Bitácoras del curso para esa dependencia
    const { data: cursoSesiones } = await admin
      .from("gto_sesiones")
      .select("*")
      .eq("dependencia_id", dependenciaId);

    const cursoSesionIds = (cursoSesiones ?? []).map((s: any) => s.id);
    let participantes: any[] = [];
    let corpus: any[] = [];
    let diagnosticos: any[] = [];
    if (cursoSesionIds.length > 0) {
      const [{ data: p }, { data: c }, { data: d }] = await Promise.all([
        admin
          .from("gto_participantes")
          .select("id, sesion_id, nombre, cargo, email, ultimo_paso, prompt_enviado, ultima_actividad, created_at")
          .in("sesion_id", cursoSesionIds),
        admin
          .from("gto_corpus_uploads")
          .select("id, sesion_id, participante_id, doc_tipo, file_name, created_at")
          .in("sesion_id", cursoSesionIds),
        admin
          .from("gto_diagnostico_textos")
          .select("id, sesion_id, participante_nombre, titulo, score_calidad, errores_detectados, analizado_at, created_at")
          .in("sesion_id", cursoSesionIds),
      ]);
      participantes = p ?? [];
      corpus = c ?? [];
      diagnosticos = d ?? [];
    }

    // 5) Construir contexto resumido para la IA
    const sessionsForAI = sessions.map((s: any) => ({
      session_date: s.session_date,
      session_type: s.session_type,
      topic: s.topic,
      duration_minutes: s.duration_minutes,
      attendee_count: s.attendee_count,
      key_decisions: s.key_decisions,
      pending_actions: s.pending_actions,
      extracted_excerpt: typeof s.transcript === "string" ? s.transcript.slice(0, 9000) : null,
      summary: s.summary,
    }));

    const bitacora = {
      curso_sesiones: (cursoSesiones ?? []).map((s: any) => ({
        id: s.id,
        titular_nombre: s.titular_nombre,
        titular_cargo: s.titular_cargo,
        herramienta_ia: s.herramienta_ia,
        estado: s.estado,
        paso_actual: s.paso_actual,
        brief: {
          mision: s.brief_mision,
          tono: s.brief_tono,
          audiencias: s.brief_audiencias,
          tipo_texto: s.brief_tipo_texto,
          mensajes_clave: s.brief_mensajes_clave,
          terminos_preferidos: s.brief_terminos_preferidos,
          terminos_prohibidos: s.brief_terminos_prohibidos,
        },
        compromisos: {
          corpus_subido: s.compromiso_corpus_subido,
          prompt_probado: s.compromiso_prompt_probado,
          resultado_compartido: s.compromiso_resultado_compartido,
        },
        prompt_generado_at: s.prompt_generado_at,
        completed_at: s.completed_at,
      })),
      participantes_count: participantes.length,
      participantes_resumen: participantes.slice(0, 20).map((p: any) => ({
        nombre: p.nombre,
        cargo: p.cargo,
        ultimo_paso: p.ultimo_paso,
        ultima_actividad: p.ultima_actividad,
      })),
      corpus_count: corpus.length,
      corpus_resumen: corpus.slice(0, 30).map((c: any) => ({
        doc_tipo: c.doc_tipo,
        file_name: c.file_name,
        created_at: c.created_at,
      })),
      diagnosticos_count: diagnosticos.length,
      diagnosticos_resumen: diagnosticos.slice(0, 20).map((d: any) => ({
        titulo: d.titulo,
        participante: d.participante_nombre,
        score: d.score_calidad,
        errores: Array.isArray(d.errores_detectados) ? d.errores_detectados.length : null,
        analizado_at: d.analizado_at,
      })),
    };

    const context = {
      dependencia: { id: dep.id, nombre: dep.nombre, siglas: dep.siglas },
      periodo: { year, month, inicio: periodStart, fin: periodEnd },
      fireflies_sessions: sessionsForAI,
      mcn_mes_anterior: mcnPrev
        ? {
            coordinacion: mcnPrev.coordinacion,
            tiempo_respuesta: mcnPrev.tiempo_respuesta,
            trazabilidad: mcnPrev.trazabilidad,
            analisis_riesgos: mcnPrev.analisis_riesgos,
            deteccion_temprana: mcnPrev.deteccion_temprana,
          }
        : null,
      bitacora_curso: bitacora,
    };

    // 6) Prompt
    const systemPrompt = `Eres consultor senior de KiMedia, evaluador técnico de la Matriz de Competencias Narrativas (MCN) para dependencias del gobierno de Guanajuato.

Tu tarea: calificar 5 dimensiones MCN en escala 0–10 usando EXCLUSIVAMENTE la evidencia provista en el contexto (transcripciones de sesiones Fireflies + bitácoras del curso de IA).

RÚBRICA POR DIMENSIÓN (0–10):
- 0–3: no hay evidencia o desempeño deficiente
- 4–6: cumple parcialmente, vacíos importantes
- 7–8: cumple bien, evidencia clara y consistente
- 9–10: excelencia, supera lo esperado

DIMENSIONES:
1. deteccion_temprana — Capacidad de identificar señales/riesgos antes de que escalen.
2. analisis_riesgos — Calidad del análisis y priorización de riesgos reputacionales.
3. coordinacion — Coordinación interna, claridad de roles, escalamiento.
4. tiempo_respuesta — Velocidad y eficacia de respuesta ante eventos.
5. trazabilidad — Documentación, evidencia institucional, soporte de decisiones.

REGLAS DURAS:
- NO inventes. Si NO hay evidencia suficiente para una dimensión, devuelve null en su score y registra "Sin evidencia suficiente este mes" en su entry de evidencia.
- Cada score (cuando no es null) debe ir acompañado de al menos una cita textual o referencia concreta (fecha + tipo de evidencia + breve frase).
- Las fortalezas y áreas de mejora deben citar dependencia, fecha o documento.
- Tono profesional, claro, sin floritura.
- Usa SOLO el contexto provisto; nunca conocimiento externo.`;

    const userPrompt = `CONTEXTO:\n${JSON.stringify(context, null, 2)}\n\nDevuelve EXCLUSIVAMENTE el objeto JSON usando la herramienta score_mcn.`;

    const tool = {
      type: "function",
      function: {
        name: "score_mcn",
        description: "Calificaciones MCN basadas en evidencia.",
        parameters: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                deteccion_temprana: { type: ["number", "null"] },
                analisis_riesgos: { type: ["number", "null"] },
                coordinacion: { type: ["number", "null"] },
                tiempo_respuesta: { type: ["number", "null"] },
                trazabilidad: { type: ["number", "null"] },
              },
              required: [
                "deteccion_temprana",
                "analisis_riesgos",
                "coordinacion",
                "tiempo_respuesta",
                "trazabilidad",
              ],
              additionalProperties: false,
            },
            evidence: {
              type: "object",
              description:
                "Citas que justifican cada score. Cada eje es un arreglo de evidencias.",
              properties: {
                deteccion_temprana: { type: "array", items: { type: "string" } },
                analisis_riesgos: { type: "array", items: { type: "string" } },
                coordinacion: { type: "array", items: { type: "string" } },
                tiempo_respuesta: { type: "array", items: { type: "string" } },
                trazabilidad: { type: "array", items: { type: "string" } },
              },
              required: [
                "deteccion_temprana",
                "analisis_riesgos",
                "coordinacion",
                "tiempo_respuesta",
                "trazabilidad",
              ],
              additionalProperties: false,
            },
            fortalezas: { type: "string" },
            areas_mejora: { type: "string" },
            resumen_ejecutivo: { type: "string" },
          },
          required: ["scores", "evidence", "fortalezas", "areas_mejora", "resumen_ejecutivo"],
          additionalProperties: false,
        },
      },
    };

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [tool],
          tool_choice: { type: "function", function: { name: "score_mcn" } },
          temperature: 0.2,
          max_tokens: 6144,
        }),
      }
    );

    if (aiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: "Límite de IA alcanzado. Intenta más tarde." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (aiRes.status === 402) {
      return new Response(
        JSON.stringify({ error: "Sin créditos de IA. Recarga en Lovable Cloud." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      throw new Error(`AI failed [${aiRes.status}]: ${txt}`);
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("La IA no devolvió la herramienta score_mcn.");
    }
    let parsed: any;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      throw new Error("Argumentos inválidos de la herramienta IA.");
    }

    const clamp = (v: any) => {
      if (v === null || v === undefined) return null;
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      return Math.max(0, Math.min(10, n));
    };

    const upsertPayload: any = {
      dependencia_id: dependenciaId,
      period_year: year,
      period_month: month,
      deteccion_temprana: clamp(parsed.scores?.deteccion_temprana),
      analisis_riesgos: clamp(parsed.scores?.analisis_riesgos),
      coordinacion: clamp(parsed.scores?.coordinacion),
      tiempo_respuesta: clamp(parsed.scores?.tiempo_respuesta),
      trazabilidad: clamp(parsed.scores?.trazabilidad),
      fortalezas: parsed.fortalezas ?? null,
      areas_mejora: parsed.areas_mejora ?? null,
      observaciones: { resumen_ejecutivo: parsed.resumen_ejecutivo ?? null },
      evidence: parsed.evidence ?? {},
      computed_by: "ai",
      computed_at: new Date().toISOString(),
      created_by: userData.user.id,
    };

    const { data: saved, error: upsertErr } = await admin
      .from("gto_mcn_scores")
      .upsert(upsertPayload, {
        onConflict: "dependencia_id,period_year,period_month",
      })
      .select()
      .single();
    if (upsertErr) throw upsertErr;

    return new Response(
      JSON.stringify({
        success: true,
        score: saved,
        sources: {
          fireflies_sessions: sessionsForAI.length,
          curso_sesiones: bitacora.curso_sesiones.length,
          participantes: bitacora.participantes_count,
          corpus_docs: bitacora.corpus_count,
          diagnosticos: bitacora.diagnosticos_count,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("gto-compute-mcn error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
