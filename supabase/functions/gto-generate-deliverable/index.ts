import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type DeliverableType =
  | "registro_consultorias"
  | "resumen_consultorias"
  | "reporte_mcn"
  | "bitacora_simulacros";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

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

    const {
      deliverableType,
      dependenciaId,
      year,
      month,
      consultantName = "KiMedia",
      wholeCycle = false,
    } = (await req.json()) as {
      deliverableType: DeliverableType;
      dependenciaId?: string;
      year: number;
      month: number;
      consultantName?: string;
      wholeCycle?: boolean;
    };

    if (!deliverableType || !year || !month) {
      return new Response(
        JSON.stringify({ error: "deliverableType, year, month required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Period dates
    const periodStart = new Date(year, month - 1, 1)
      .toISOString()
      .split("T")[0];
    const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

    // El ciclo de capacitación GTO es una intervención única (Abril 2026)
    // que incluye la sesión de cierre del 5 de mayo. Todos los entregables
    // del ciclo se etiquetan como ABRIL 2026.
    const cycleYear = 2026;
    const cycleMonth = 4; // Abril
    const effectiveYear = wholeCycle ? cycleYear : year;
    const effectiveMonth = wholeCycle ? cycleMonth : month;

    // Load dependencia (if applicable)
    let dep: any = null;
    if (dependenciaId) {
      const { data } = await admin
        .from("gto_dependencias")
        .select("*")
        .eq("id", dependenciaId)
        .maybeSingle();
      dep = data;
    }

    // Load training sessions of the period (or full cycle when wholeCycle=true)
    let sessionsQuery = admin
      .from("gto_training_sessions")
      .select("*")
      .order("session_date", { ascending: true });
    if (!wholeCycle) {
      sessionsQuery = sessionsQuery
        .gte("session_date", periodStart)
        .lte("session_date", periodEnd);
    }
    if (dependenciaId) sessionsQuery = sessionsQuery.eq("dependencia_id", dependenciaId);
    const { data: rawSessions } = await sessionsQuery;

    // Dedupe por fireflies_meeting_id (una misma reunión puede estar enlazada a varias dependencias)
    const seen = new Set<string>();
    const sessions = (rawSessions ?? []).filter((s: any) => {
      const k = s.fireflies_meeting_id || s.id;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // Reclasificación semántica:
    // - simulacro: session_type='simulacro'|'simulacion' o tópico con crisis/simulación
    // - entrenamiento: session_type='entrenamiento' o consultoría grupal (>=3 asistentes)
    // - consultoria 1:1: consultoría individual (<3 asistentes) y sin marca de simulacro
    const isSimulacro = (s: any) => {
      if (["simulacro", "simulacion"].includes(s.session_type)) return true;
      const t = (s.topic ?? "").toLowerCase();
      return /simulaci[óo]n|simulacro|crisis/.test(t);
    };
    const isEntrenamiento = (s: any) => {
      if (isSimulacro(s)) return false;
      if (s.session_type === "entrenamiento") return true;
      return s.session_type === "consultoria" && (s.attendee_count ?? 0) >= 3;
    };
    const isConsultoria1a1 = (s: any) =>
      !isSimulacro(s) && !isEntrenamiento(s) && s.session_type === "consultoria";

    const consultoriaSessions = sessions.filter(isConsultoria1a1);
    const entrenamientoSessions = sessions.filter(isEntrenamiento);
    const simulacroSessions = sessions.filter(isSimulacro);

    // Load all dependencias for resumen / reporte global if needed
    const { data: allDeps } = await admin
      .from("gto_dependencias")
      .select("id, nombre, siglas");
    const depMap = new Map((allDeps ?? []).map((d: any) => [d.id, d]));

    // Load MCN scores (usando el período efectivo del ciclo)
    let mcnQuery = admin
      .from("gto_mcn_scores")
      .select("*")
      .eq("period_year", effectiveYear)
      .eq("period_month", effectiveMonth);
    if (dependenciaId) mcnQuery = mcnQuery.eq("dependencia_id", dependenciaId);
    const { data: mcnCurrent } = await mcnQuery;
    // Si no hay del mes seleccionado, busca el MCN más reciente (cuando wholeCycle=true o ciclos cortos)
    let mcnEffective = mcnCurrent ?? [];
    if ((mcnEffective?.length ?? 0) === 0) {
      let fallback = admin
        .from("gto_mcn_scores")
        .select("*")
        .order("computed_at", { ascending: false })
        .limit(50);
      if (dependenciaId) fallback = fallback.eq("dependencia_id", dependenciaId);
      const { data: f } = await fallback;
      mcnEffective = f ?? [];
    }

    const prevMonth = effectiveMonth === 1 ? 12 : effectiveMonth - 1;
    const prevYear = effectiveMonth === 1 ? effectiveYear - 1 : effectiveYear;
    let mcnPrevQuery = admin
      .from("gto_mcn_scores")
      .select("*")
      .eq("period_year", prevYear)
      .eq("period_month", prevMonth);
    if (dependenciaId)
      mcnPrevQuery = mcnPrevQuery.eq("dependencia_id", dependenciaId);
    const { data: mcnPrev } = await mcnPrevQuery;

    // Bitácoras del curso por dependencia (evidencia de adopción)
    const bitacora = await loadBitacoraCurso(admin, dependenciaId ?? null);

    // Build context for AI
    const context = {
      deliverableType,
      dependencia: dep,
      year: effectiveYear,
      month: effectiveMonth,
      wholeCycle,
      monthName: new Date(effectiveYear, effectiveMonth - 1, 1).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      }),
      periodo_label: "Abril 2026 (ciclo único; incluye sesión de cierre del 5 de mayo)",
      consultantName,
      sessions_total: sessions.length,
      consultoria_sessions: consultoriaSessions.map(slimSession),
      entrenamiento_sessions: entrenamientoSessions.map(slimSession),
      simulacro_sessions: simulacroSessions.map(slimSession),
      mcnCurrent: mcnEffective,
      mcnPrev: mcnPrev ?? [],
      depMap: Array.from(depMap.values()),
      bitacora_curso: bitacora,
    };

    const systemPrompt = `Eres consultor senior de KiMedia. Generas entregables institucionales formales en español de México sobre gobernabilidad narrativa para el Gobierno de Guanajuato.

REGLAS DURAS:
- NUNCA inventes datos. Si no hay evidencia, deja el campo vacío ("") o el arreglo vacío ([]). NO uses "[pendiente]" salvo en bullets explícitos del consultor.
- Usa SOLO el contexto. Cita transcript (frase textual entre comillas + fecha) cuando lo uses como evidencia.
- El ciclo de capacitación fue una intervención única solicitada por el Gobierno de Guanajuato durante ABRIL 2026 (incluye la sesión de cierre del 5 de mayo, que administrativamente forma parte del ciclo de abril). NUNCA dividas el reporte en "abril" vs "mayo": todo el contenido pertenece al ciclo ABRIL 2026. Usa "periodo_label" como referencia textual.
- Si un arreglo (consultorias / simulacros / entrenamientos) no tiene sesiones en el contexto, devuélvelo vacío []. NO inventes filas placebo.
- Para cada consultoría: extrae 3–6 recomendaciones específicas citando frase del transcript. Para "asesoria_descripcion" da 3–5 líneas reales, no slogans.
- "bitacora_curso" es evidencia adicional de adopción real (corpus subido, diagnósticos, brief del titular, herramienta IA, compromisos). Úsala literalmente; si está vacía, declara que no hay adopción registrada.
- ASISTENTES: intenta identificar nombres/cargos a partir del transcript_excerpt (presentaciones del tipo "soy X, de Y", "habla X", etiquetas de hablante). Si no se distinguen con claridad, deja el campo vacío y reporta solo el conteo numérico. NUNCA inventes nombres.
- Tono profesional, técnico, sin floritura. Español MX.
- Devuelves SOLO JSON válido con la estructura solicitada.`;

    const userPrompt = buildUserPrompt(deliverableType, context);

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
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 8192,
        }),
      }
    );
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      throw new Error(`AI generation failed [${aiRes.status}]: ${txt}`);
    }
    const aiData = await aiRes.json();
    let generated: any = {};
    try {
      generated = JSON.parse(aiData.choices?.[0]?.message?.content ?? "{}");
    } catch {
      generated = {};
    }

    // Build HTML for the deliverable (Word-importable)
    const html = renderHtml(deliverableType, context, generated);

    // Save deliverable record (etiquetado como Abril 2026 cuando es ciclo)
    const title = `${titleFor(deliverableType)} - ${dep?.siglas ?? "Global"} - ${context.monthName}`;
    const fileName = `${deliverableType}_${dep?.siglas ?? "global"}_${effectiveYear}-${String(effectiveMonth).padStart(2, "0")}.html`;

    // Upload HTML to storage so it's downloadable as .doc-readable file
    const bucket = "gto-deliverables";
    const filePath = `${effectiveYear}/${String(effectiveMonth).padStart(2, "0")}/${fileName}`;
    const blob = new Blob([html], { type: "text/html" });
    const { error: uploadErr } = await admin.storage
      .from(bucket)
      .upload(filePath, blob, {
        upsert: true,
        contentType: "text/html",
      });
    if (uploadErr) console.error("Upload error:", uploadErr);

    const { data: signed } = await admin.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    const { data: deliverableRow, error: dErr } = await admin
      .from("gto_deliverables")
      .insert({
        deliverable_type: deliverableType,
        dependencia_id: dependenciaId ?? null,
        period_year: effectiveYear,
        period_month: effectiveMonth,
        title,
        status: "borrador",
        consultant_name: consultantName,
        generated_content: { html, structured: generated, context_summary: { sessionsCount: (sessions ?? []).length } },
        file_url: signed?.signedUrl ?? null,
        file_name: fileName,
        created_by: userData.user.id,
      })
      .select()
      .single();
    if (dErr) throw dErr;

    return new Response(
      JSON.stringify({ success: true, deliverable: deliverableRow, html }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("gto-generate-deliverable error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function titleFor(t: DeliverableType): string {
  switch (t) {
    case "registro_consultorias":
      return "Registro Sistematizado de Consultorías 1:1";
    case "resumen_consultorias":
      return "Resumen Mensual de Consultorías";
    case "reporte_mcn":
      return "Reporte Mensual MCN";
    case "bitacora_simulacros":
      return "Bitácora de Entrenamientos y Simulacros";
  }
}

function slimSession(s: any) {
  return {
    id: s.id,
    fecha: s.session_date,
    tipo: s.session_type,
    tema: s.topic,
    duracion_min: s.duration_minutes,
    asistentes: s.attendee_count,
    participantes: s.attendees ?? s.participants ?? null,
    decisiones_clave: s.key_decisions,
    pendientes: s.pending_actions,
    resumen: s.summary,
    transcript_excerpt: typeof s.transcript === "string" ? s.transcript.slice(0, 8000) : null,
  };
}

function buildUserPrompt(t: DeliverableType, ctx: any): string {
  const base = `CONTEXTO (datos reales del sistema):\n${JSON.stringify(ctx, null, 2)}\n\n`;
  switch (t) {
    case "registro_consultorias":
      return (
        base +
        `Genera el contenido para el "Registro Sistematizado de Consultorías 1:1" del ciclo (${ctx.periodo_label}) para la dependencia ${ctx.dependencia?.nombre}.

Usa EXCLUSIVAMENTE las sesiones de "consultoria_sessions" del contexto. Si ese arreglo está vacío, devuelve "consultorias": [] y marca observaciones_globales con la nota: "Sin consultorías 1:1 registradas en el ciclo."

Para cada consultoría debes citar al menos 2 frases textuales del transcript_excerpt entre comillas (en "asesoria_descripcion" o "recomendaciones"). Si el transcript está vacío, omite las comillas pero deja el campo con resumen breve apoyado en summary/decisiones_clave/pendientes.

Devuelve JSON con:
{
  "resumen_ejecutivo": "máx 10 líneas",
  "consultorias": [
    {
      "persona": "...", "cargo": "...", "fecha": "...", "duracion": "...", "modalidad": "...",
      "tema_coyuntural": "...", "asesoria_descripcion": "3-5 líneas reales con cita textual",
      "recomendaciones": ["3-6 bullets accionables, específicos al caso"],
      "resultado_tipo": "...", "resultado_descripcion": "...",
      "evidencias": ["bitacora_individual","recomendaciones_escritas"]
    }
  ],
  "observaciones_globales": "patrones, riesgos transversales, aprendizajes",
  "conclusion_tecnica": "...",
  "evidencia_adopcion": {
    "resumen": "2-3 líneas sobre adopción real del curso de IA. Si bitacora_curso está vacío, escribe: 'No se registró actividad de la dependencia en el panel del curso.'",
    "items": ["bullet con dato concreto + fecha"]
  }
}`
      );
    case "resumen_consultorias":
      return (
        base +
        `Genera la "Sistematización Consolidada de Consultorías" del ciclo (${ctx.periodo_label}). Usa SOLO consultoria_sessions de TODAS las dependencias presentes en el contexto.

Devuelve JSON:
{
  "filas": [
    {"dependencia":"...","personas":"...","tema":"...","fecha":"...","duracion":"...","resultado":"...","evidencias":"..."}
  ],
  "conclusion": "2-4 líneas que sinteticen patrones del ciclo (qué temas dominaron, qué dependencias salieron mejor preparadas)."
}
Una fila por cada consultoría real; si no hay, devuelve filas: [].`
      );
    case "reporte_mcn":
      return (
        base +
        `Genera el "Reporte MCN del ciclo" (${ctx.periodo_label})${ctx.dependencia ? ` para ${ctx.dependencia.nombre}` : " (consolidado global)"}.

IMPORTANTE: Usa los scores reales que vienen en mcnCurrent (campo 'evidence' incluye las citas que justifican cada puntaje). NO inventes números: si una dimensión viene null, deja mes_actual: null y marca observación como "Sin evidencia suficiente".

Las 5 dimensiones MCN son:
1. Detección temprana de señales
2. Análisis y valoración de riesgos
3. Coordinación y escalamiento interno
4. Tiempo y eficacia de respuesta
5. Evidencia y trazabilidad institucional

Devuelve JSON:
{
  "resumen_ejecutivo": "...",
  "tabla_mcn": [
    {"dimension":"1. Detección temprana","mes_anterior":N,"mes_actual":N,"variacion":"mejoró|empeoró|igual","observacion":"..."}
  ],
  "fortalezas": ["...","..."],
  "areas_mejora": ["...","..."],
  "tendencia_global": {"mejoraron":N,"empeoraron":N,"total":N,"lectura":"..."},
  "hallazgos": ["...","...","...","..."],
  "recomendaciones_transversales": ["...","..."],
  "recomendaciones_dimension": [{"dimension":"...","recomendacion":"..."}],
  "evidencia_adopcion": {
    "resumen": "Cómo la dependencia está aplicando lo aprendido en el curso. Si bitacora_curso vacía: 'No se registró actividad en el panel del curso.'",
    "items": ["bullet con dato concreto + fecha"]
  }
}

Usa mcnCurrent y mcnPrev del contexto. Si una dimensión no tiene calificación previa, deja mes_anterior:null.`
      );
    case "bitacora_simulacros":
      return (
        base +
        `Genera la "Bitácora de Entrenamientos y Simulacros" del ciclo (${ctx.periodo_label}) para ${ctx.dependencia?.nombre ?? "todas las dependencias"}.

Para los ENTRENAMIENTOS usa EXCLUSIVAMENTE "entrenamiento_sessions" (incluye sesiones grupales de capacitación con varios asistentes; el ciclo GTO usó sesiones grupales el 29 de abril y la de cierre del 5 de mayo).
Para los SIMULACROS usa EXCLUSIVAMENTE "simulacro_sessions" (ejercicios prácticos tipo crisis/simulación).

Reglas:
- Si "entrenamiento_sessions" tiene elementos, llena el arreglo "entrenamientos" con UNA fila por sesión, citando frase del transcript_excerpt y listando 3-5 competencias trabajadas.
- Si "simulacro_sessions" está vacío, devuelve "simulacros": [] y aclara en conclusion_avance que en este ciclo no se ejecutaron simulacros formales.
- Si AMBOS están vacíos, devuelve los tres arreglos vacíos y en conclusion_avance escribe: "No se realizaron entrenamientos ni simulacros formales en el ciclo. Las sesiones registradas fueron consultorías 1:1."
- En recomendaciones_siguiente_mes sugiere 2-3 simulacros pertinentes para esta dependencia con base en entrenamiento_sessions, consultoria_sessions y bitacora_curso.

Devuelve JSON:
{
  "resumen_ejecutivo": "...",
  "entrenamientos": [
    {"fecha":"","duracion":"","modalidad":"","instructor":"","areas":"","asistentes":N,"objetivo":"","competencias":["..."],"evidencias":"","observaciones":""}
    /* En "areas" puedes listar nombres/cargos detectados en el transcript separados por coma. Si no se identifican con seguridad, déjalo vacío y reporta solo "asistentes":N. */
  ],
  "simulacros": [
    {"fecha":"","tipo":"","duracion":"","dependencia":"","integrantes":N,
     "escenario":"","primera_vuelta":{"tiempo":"","mensaje":"","reaccion":"","claridad":"","alineacion":"","calidad":""},
     "retroalimentacion":"","segunda_vuelta":{"tiempo":"","mensaje":"","mejora":"sí|no"}}
  ],
  "comparativo_evolutivo": [
    {"competencia":"Identificación de riesgos","mes_anterior":N,"mes_actual":N,"variacion":"mejoró|empeoró"}
  ],
  "conclusion_avance": "...",
  "recomendaciones_siguiente_mes": ["...","..."]
}`
      );
  }
}

function renderHtml(
  t: DeliverableType,
  ctx: any,
  g: any
): string {
  const css = `
    <style>
      body { font-family: 'Calibri', Arial, sans-serif; color:#1a1a1a; max-width:840px; margin:40px auto; padding:0 24px; line-height:1.5; }
      h1 { font-size:22px; border-bottom:3px solid #b8860b; padding-bottom:8px; }
      h2 { font-size:17px; color:#b8860b; margin-top:28px; }
      h3 { font-size:14px; margin-top:18px; }
      table { border-collapse:collapse; width:100%; margin:12px 0; }
      th, td { border:1px solid #ccc; padding:8px 10px; text-align:left; font-size:13px; vertical-align:top; }
      th { background:#f5f1e8; font-weight:600; }
      .meta { background:#faf8f3; padding:12px 16px; border-left:4px solid #b8860b; margin:16px 0; font-size:13px; }
      .meta div { margin:4px 0; }
      ul, ol { padding-left:22px; }
      .placeholder { color:#999; font-style:italic; }
      .footer { margin-top:40px; padding-top:16px; border-top:1px solid #ddd; font-size:12px; color:#666; }
    </style>
  `;
  const head = `${titleFor(t)}`;
  const meta = `
    <div class="meta">
      <div><strong>Dependencia:</strong> ${ctx.dependencia?.nombre ?? "Global / Todas"}</div>
      <div><strong>Mes evaluado:</strong> ${ctx.monthName}</div>
      <div><strong>Fecha de entrega:</strong> ${new Date().toLocaleDateString("es-MX")}</div>
      <div><strong>Consultor responsable:</strong> ${ctx.consultantName}</div>
    </div>
  `;
  let body = "";
  if (t === "registro_consultorias") {
    const cons = Array.isArray(g.consultorias) ? g.consultorias : [];
    body = `
      <h2>1. Resumen Ejecutivo</h2>
      <p>${esc(g.resumen_ejecutivo)}</p>
      <h2>2. Registro Individual de Consultorías 1:1</h2>
      ${cons.length === 0 ? `<p class="placeholder">Sin consultorías 1:1 registradas en el ciclo para esta dependencia.</p>` : cons.map((c: any, i: number) => `
        <h3>Consultoría ${i + 1}</h3>
        <table>
          <tr><th>Persona(s) atendida(s)</th><td>${esc(c.persona)}</td></tr>
          <tr><th>Cargo(s)</th><td>${esc(c.cargo)}</td></tr>
          <tr><th>Fecha</th><td>${esc(c.fecha)}</td></tr>
          <tr><th>Duración</th><td>${esc(c.duracion)}</td></tr>
          <tr><th>Modalidad</th><td>${esc(c.modalidad)}</td></tr>
        </table>
        <p><strong>Tema coyuntural:</strong> ${esc(c.tema_coyuntural)}</p>
        <p><strong>Asesoría brindada:</strong> ${esc(c.asesoria_descripcion)}</p>
        <p><strong>Recomendaciones:</strong></p>
        <ol>${(c.recomendaciones ?? []).map((r: string) => `<li>${esc(r)}</li>`).join("")}</ol>
        <p><strong>Resultado:</strong> ${esc(c.resultado_tipo)} — ${esc(c.resultado_descripcion)}</p>
      `).join("")}
      <h2>3. Observaciones globales del mes</h2>
      <p>${esc(g.observaciones_globales)}</p>
      <h2>4. Conclusión técnica</h2>
      <p>${esc(g.conclusion_tecnica)}</p>
      ${renderEvidenciaAdopcion(g)}
    `;
  } else if (t === "resumen_consultorias") {
    const filas = Array.isArray(g.filas) ? g.filas : [];
    body = `
      <h2>Sistematización Mensual Consolidada de Consultorías</h2>
      ${filas.length === 0 ? `<p class="placeholder">No hay consultorías 1:1 registradas en el ciclo.</p>` : `<table>
        <tr><th>Dependencia</th><th>Persona(s)</th><th>Tema</th><th>Fecha</th><th>Duración</th><th>Resultado</th><th>Evidencias</th></tr>
        ${filas.map((f: any) => `
          <tr>
            <td>${esc(f.dependencia)}</td><td>${esc(f.personas)}</td><td>${esc(f.tema)}</td>
            <td>${esc(f.fecha)}</td><td>${esc(f.duracion)}</td><td>${esc(f.resultado)}</td><td>${esc(f.evidencias)}</td>
          </tr>
        `).join("")}
      </table>`}
      ${g.conclusion ? `<h2>Conclusión del ciclo</h2><p>${esc(g.conclusion)}</p>` : ""}
    `;
  } else if (t === "reporte_mcn") {
    body = `
      <h2>1. Resumen Ejecutivo</h2>
      <p>${esc(g.resumen_ejecutivo)}</p>
      <h2>2. Resultados MCN</h2>
      <table>
        <tr><th>Dimensión MCN</th><th>Mes anterior</th><th>Mes actual</th><th>Variación</th><th>Observaciones</th></tr>
        ${(g.tabla_mcn ?? []).map((r: any) => `
          <tr><td>${esc(r.dimension)}</td><td>${esc(r.mes_anterior)}</td><td>${esc(r.mes_actual)}</td><td>${esc(r.variacion)}</td><td>${esc(r.observacion)}</td></tr>
        `).join("")}
      </table>
      <h3>Fortalezas detectadas</h3>
      <ul>${(g.fortalezas ?? []).map((x: string) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h3>Áreas de mejora</h3>
      <ul>${(g.areas_mejora ?? []).map((x: string) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h2>3. Tendencia global del gobierno estatal</h2>
      <p>Dependencias que mejoraron: <strong>${g.tendencia_global?.mejoraron ?? "[pendiente]"}</strong> de ${g.tendencia_global?.total ?? "[pendiente]"}.<br/>
      Dependencias que empeoraron: <strong>${g.tendencia_global?.empeoraron ?? "[pendiente]"}</strong> de ${g.tendencia_global?.total ?? "[pendiente]"}.</p>
      <p>${esc(g.tendencia_global?.lectura)}</p>
      <h2>4. Principales hallazgos técnicos</h2>
      <ol>${(g.hallazgos ?? []).map((h: string) => `<li>${esc(h)}</li>`).join("")}</ol>
      <h2>5. Recomendaciones</h2>
      <h3>5.1 Transversales</h3>
      <ul>${(g.recomendaciones_transversales ?? []).map((x: string) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h3>5.2 Por dimensión</h3>
      <table>
        <tr><th>Dimensión MCN</th><th>Recomendación</th></tr>
        ${(g.recomendaciones_dimension ?? []).map((r: any) => `
          <tr><td>${esc(r.dimension)}</td><td>${esc(r.recomendacion)}</td></tr>
        `).join("")}
      </table>
      ${renderEvidenciaAdopcion(g)}
    `;
  } else if (t === "bitacora_simulacros") {
    const ents = Array.isArray(g.entrenamientos) ? g.entrenamientos : [];
    const sims = Array.isArray(g.simulacros) ? g.simulacros : [];
    const comps = Array.isArray(g.comparativo_evolutivo) ? g.comparativo_evolutivo : [];
    const isEmpty = ents.length === 0 && sims.length === 0;
    body = `
      <h2>1. Resumen Ejecutivo</h2>
      <p>${esc(g.resumen_ejecutivo)}</p>
      ${isEmpty ? `<p class="placeholder">No se realizaron simulacros ni entrenamientos formales en este ciclo para esta dependencia.</p>` : ""}
      ${ents.length ? `<h2>2. Bitácoras de Entrenamiento</h2>` : ""}
      ${ents.map((e: any, i: number) => `
        <h3>Entrenamiento ${i + 1}</h3>
        <table>
          <tr><th>Fecha</th><td>${esc(e.fecha)}</td></tr>
          <tr><th>Duración</th><td>${esc(e.duracion)}</td></tr>
          <tr><th>Modalidad</th><td>${esc(e.modalidad)}</td></tr>
          <tr><th>Instructor</th><td>${esc(e.instructor)}</td></tr>
          <tr><th>Áreas participantes</th><td>${esc(e.areas)}</td></tr>
          <tr><th>Asistentes</th><td>${esc(e.asistentes)}</td></tr>
        </table>
        <p><strong>Objetivo:</strong> ${esc(e.objetivo)}</p>
        <p><strong>Competencias trabajadas:</strong> ${(e.competencias ?? []).map(esc).join(", ")}</p>
        <p><strong>Evidencias:</strong> ${esc(e.evidencias)}</p>
        <p><strong>Observaciones del facilitador:</strong> ${esc(e.observaciones)}</p>
      `).join("")}
      ${sims.length ? `<h2>3. Bitácoras de Simulacro</h2>` : ""}
      ${sims.map((s: any, i: number) => `
        <h3>Simulacro ${i + 1}</h3>
        <table>
          <tr><th>Fecha</th><td>${esc(s.fecha)}</td></tr>
          <tr><th>Tipo</th><td>${esc(s.tipo)}</td></tr>
          <tr><th>Duración</th><td>${esc(s.duracion)}</td></tr>
          <tr><th>Dependencia</th><td>${esc(s.dependencia)}</td></tr>
          <tr><th>Integrantes</th><td>${esc(s.integrantes)}</td></tr>
        </table>
        <p><strong>Escenario detonador:</strong> ${esc(s.escenario)}</p>
        <p><strong>Primera vuelta:</strong> ${esc(s.primera_vuelta?.tiempo)} — ${esc(s.primera_vuelta?.mensaje)}</p>
        <p>Reacción: ${esc(s.primera_vuelta?.reaccion)} · Claridad: ${esc(s.primera_vuelta?.claridad)} · Alineación: ${esc(s.primera_vuelta?.alineacion)} · Calidad: ${esc(s.primera_vuelta?.calidad)}</p>
        <p><strong>Retroalimentación:</strong> ${esc(s.retroalimentacion)}</p>
        <p><strong>Segunda vuelta:</strong> ${esc(s.segunda_vuelta?.tiempo)} — ${esc(s.segunda_vuelta?.mensaje)} (¿mejoró?: ${esc(s.segunda_vuelta?.mejora)})</p>
      `).join("")}
      ${comps.length ? `<h2>4. Comparativo evolutivo</h2>
      <table>
        <tr><th>Competencia</th><th>Mes anterior</th><th>Mes actual</th><th>Variación</th></tr>
        ${comps.map((c: any) => `
          <tr><td>${esc(c.competencia)}</td><td>${esc(c.mes_anterior)}</td><td>${esc(c.mes_actual)}</td><td>${esc(c.variacion)}</td></tr>
        `).join("")}
      </table>` : ""}
      <h2>${comps.length ? 5 : (ents.length || sims.length ? 4 : 2)}. Conclusión del avance narrativo</h2>
      <p>${esc(g.conclusion_avance)}</p>
      <h2>${comps.length ? 6 : (ents.length || sims.length ? 5 : 3)}. Recomendaciones siguientes</h2>
      <ul>${(g.recomendaciones_siguiente_mes ?? []).map((r: string) => `<li>${esc(r)}</li>`).join("")}</ul>
    `;
  }

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${head}</title>${css}</head><body><h1>${head}</h1>${meta}${body}<div class="footer">Generado automáticamente por la plataforma KiMedia · Borrador editable, validar antes de entregar.</div></body></html>`;
}

function esc(v: any): string {
  if (v === null || v === undefined || v === "") return '<span class="placeholder">[pendiente]</span>';
  return String(v).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
}

function renderEvidenciaAdopcion(g: any): string {
  const e = g?.evidencia_adopcion;
  if (!e) return "";
  const items = Array.isArray(e.items) ? e.items : [];
  return `
    <h2>Evidencia de adopción (curso IA)</h2>
    <p>${esc(e.resumen)}</p>
    ${items.length ? `<ul>${items.map((i: string) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
  `;
}

/**
 * Carga la bitácora del curso (sesiones del panel del participante, corpus subido,
 * diagnósticos hechos y compromisos cumplidos) para una dependencia o para todas.
 * Devuelve un objeto resumido pensado para meter al prompt sin saturar tokens.
 */
async function loadBitacoraCurso(admin: any, dependenciaId: string | null) {
  let sesionesQ = admin.from("gto_sesiones").select("*");
  if (dependenciaId) sesionesQ = sesionesQ.eq("dependencia_id", dependenciaId);
  const { data: cursoSesiones } = await sesionesQ;
  const ids = (cursoSesiones ?? []).map((s: any) => s.id);
  if (ids.length === 0) {
    return {
      curso_sesiones: [],
      participantes_count: 0,
      corpus_count: 0,
      diagnosticos_count: 0,
      corpus_resumen: [],
      diagnosticos_resumen: [],
    };
  }
  const [{ data: p }, { data: c }, { data: d }] = await Promise.all([
    admin
      .from("gto_participantes")
      .select("id, sesion_id, nombre, cargo, ultimo_paso, ultima_actividad")
      .in("sesion_id", ids),
    admin
      .from("gto_corpus_uploads")
      .select("id, sesion_id, participante_id, doc_tipo, file_name, created_at")
      .in("sesion_id", ids),
    admin
      .from("gto_diagnostico_textos")
      .select("id, sesion_id, participante_nombre, titulo, score_calidad, errores_detectados, analizado_at")
      .in("sesion_id", ids),
  ]);
  return {
    curso_sesiones: (cursoSesiones ?? []).map((s: any) => ({
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
    participantes_count: (p ?? []).length,
    corpus_count: (c ?? []).length,
    diagnosticos_count: (d ?? []).length,
    corpus_resumen: (c ?? []).slice(0, 30).map((x: any) => ({
      doc_tipo: x.doc_tipo,
      file_name: x.file_name,
      created_at: x.created_at,
    })),
    diagnosticos_resumen: (d ?? []).slice(0, 20).map((x: any) => ({
      titulo: x.titulo,
      participante: x.participante_nombre,
      score: x.score_calidad,
      errores: Array.isArray(x.errores_detectados) ? x.errores_detectados.length : null,
      analizado_at: x.analizado_at,
    })),
  };
}