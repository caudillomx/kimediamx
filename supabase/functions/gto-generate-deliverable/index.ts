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
    } = (await req.json()) as {
      deliverableType: DeliverableType;
      dependenciaId?: string;
      year: number;
      month: number;
      consultantName?: string;
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

    // Load training sessions of the period
    let sessionsQuery = admin
      .from("gto_training_sessions")
      .select("*")
      .gte("session_date", periodStart)
      .lte("session_date", periodEnd)
      .order("session_date", { ascending: true });
    if (dependenciaId) sessionsQuery = sessionsQuery.eq("dependencia_id", dependenciaId);
    const { data: sessions } = await sessionsQuery;

    // Load all dependencias for resumen / reporte global if needed
    const { data: allDeps } = await admin
      .from("gto_dependencias")
      .select("id, nombre, siglas");
    const depMap = new Map((allDeps ?? []).map((d: any) => [d.id, d]));

    // Load MCN scores
    let mcnQuery = admin
      .from("gto_mcn_scores")
      .select("*")
      .eq("period_year", year)
      .eq("period_month", month);
    if (dependenciaId) mcnQuery = mcnQuery.eq("dependencia_id", dependenciaId);
    const { data: mcnCurrent } = await mcnQuery;

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    let mcnPrevQuery = admin
      .from("gto_mcn_scores")
      .select("*")
      .eq("period_year", prevYear)
      .eq("period_month", prevMonth);
    if (dependenciaId)
      mcnPrevQuery = mcnPrevQuery.eq("dependencia_id", dependenciaId);
    const { data: mcnPrev } = await mcnPrevQuery;

    // Build context for AI
    const context = {
      deliverableType,
      dependencia: dep,
      year,
      month,
      monthName: new Date(year, month - 1, 1).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      }),
      consultantName,
      sessions: sessions ?? [],
      mcnCurrent: mcnCurrent ?? [],
      mcnPrev: mcnPrev ?? [],
      depMap: Array.from(depMap.values()),
    };

    const systemPrompt = `Eres consultor senior de KiMedia. Generas entregables institucionales formales en español de México sobre gobernabilidad narrativa.

Reglas estrictas:
- NO inventes datos. Si falta información, escribe "[pendiente]" para que el consultor lo complete.
- Tono profesional, claro, sin floritura.
- Usa los datos exactos del contexto (nombres, fechas, calificaciones).
- Devuelves SOLO JSON con la estructura solicitada según el tipo de entregable.`;

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
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
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

    // Save deliverable record
    const title = `${titleFor(deliverableType)} - ${dep?.siglas ?? "Global"} - ${context.monthName}`;
    const fileName = `${deliverableType}_${dep?.siglas ?? "global"}_${year}-${String(month).padStart(2, "0")}.html`;

    // Upload HTML to storage so it's downloadable as .doc-readable file
    const bucket = "gto-deliverables";
    const filePath = `${year}/${String(month).padStart(2, "0")}/${fileName}`;
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
        period_year: year,
        period_month: month,
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

function buildUserPrompt(t: DeliverableType, ctx: any): string {
  const base = `CONTEXTO (datos reales del sistema):\n${JSON.stringify(ctx, null, 2)}\n\n`;
  switch (t) {
    case "registro_consultorias":
      return (
        base +
        `Genera el contenido para el "Registro Sistematizado de Consultorías Especializadas 1:1 por Dependencia" del mes ${ctx.monthName} para la dependencia ${ctx.dependencia?.nombre}.

Devuelve JSON con:
{
  "resumen_ejecutivo": "máx 10 líneas",
  "consultorias": [ // una por cada session de tipo consultoria
    {
      "persona": "...", "cargo": "...", "fecha": "...", "duracion": "...", "modalidad": "...",
      "tema_coyuntural": "...", "asesoria_descripcion": "...",
      "recomendaciones": ["...","...","..."],
      "resultado_tipo": "...", "resultado_descripcion": "...",
      "evidencias": ["bitacora_individual","recomendaciones_escritas"]
    }
  ],
  "observaciones_globales": "patrones, riesgos transversales, aprendizajes",
  "conclusion_tecnica": "..."
}`
      );
    case "resumen_consultorias":
      return (
        base +
        `Genera la "Sistematización Mensual Consolidada de Consultorías" del mes ${ctx.monthName}.

Devuelve JSON:
{
  "filas": [
    {"dependencia":"...","personas":"...","tema":"...","fecha":"...","duracion":"...","resultado":"...","evidencias":"..."}
  ]
}
Una fila por cada session de tipo consultoria de TODAS las dependencias del mes.`
      );
    case "reporte_mcn":
      return (
        base +
        `Genera el "Reporte Mensual MCN" del mes ${ctx.monthName}${ctx.dependencia ? ` para ${ctx.dependencia.nombre}` : " (consolidado global)"}.

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
  "recomendaciones_dimension": [{"dimension":"...","recomendacion":"..."}]
}

Usa mcnCurrent y mcnPrev del contexto. Si una dimensión no tiene calificación previa, deja mes_anterior:null.`
      );
    case "bitacora_simulacros":
      return (
        base +
        `Genera la "Bitácora Mensual de Entrenamientos y Simulacros" del mes ${ctx.monthName} para ${ctx.dependencia?.nombre ?? "todas las dependencias"}.

Devuelve JSON:
{
  "resumen_ejecutivo": "...",
  "entrenamientos": [
    {"fecha":"","duracion":"","modalidad":"","instructor":"","areas":"","asistentes":N,"objetivo":"","competencias":["..."],"evidencias":"","observaciones":""}
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
    body = `
      <h2>1. Resumen Ejecutivo</h2>
      <p>${esc(g.resumen_ejecutivo)}</p>
      <h2>2. Registro Individual de Consultorías 1:1</h2>
      ${(g.consultorias ?? []).map((c: any, i: number) => `
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
    `;
  } else if (t === "resumen_consultorias") {
    body = `
      <h2>Sistematización Mensual Consolidada de Consultorías</h2>
      <table>
        <tr><th>Dependencia</th><th>Persona(s)</th><th>Tema</th><th>Fecha</th><th>Duración</th><th>Resultado</th><th>Evidencias</th></tr>
        ${(g.filas ?? []).map((f: any) => `
          <tr>
            <td>${esc(f.dependencia)}</td><td>${esc(f.personas)}</td><td>${esc(f.tema)}</td>
            <td>${esc(f.fecha)}</td><td>${esc(f.duracion)}</td><td>${esc(f.resultado)}</td><td>${esc(f.evidencias)}</td>
          </tr>
        `).join("")}
      </table>
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
    `;
  } else if (t === "bitacora_simulacros") {
    body = `
      <h2>1. Resumen Ejecutivo</h2>
      <p>${esc(g.resumen_ejecutivo)}</p>
      <h2>2. Bitácoras de Entrenamiento</h2>
      ${(g.entrenamientos ?? []).map((e: any, i: number) => `
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
      <h2>3. Bitácoras de Simulacro</h2>
      ${(g.simulacros ?? []).map((s: any, i: number) => `
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
      <h2>4. Comparativo evolutivo mensual</h2>
      <table>
        <tr><th>Competencia</th><th>Mes anterior</th><th>Mes actual</th><th>Variación</th></tr>
        ${(g.comparativo_evolutivo ?? []).map((c: any) => `
          <tr><td>${esc(c.competencia)}</td><td>${esc(c.mes_anterior)}</td><td>${esc(c.mes_actual)}</td><td>${esc(c.variacion)}</td></tr>
        `).join("")}
      </table>
      <h2>5. Conclusión del avance narrativo</h2>
      <p>${esc(g.conclusion_avance)}</p>
      <h2>6. Recomendaciones para el siguiente mes</h2>
      <ul>${(g.recomendaciones_siguiente_mes ?? []).map((r: string) => `<li>${esc(r)}</li>`).join("")}</ul>
    `;
  }

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${head}</title>${css}</head><body><h1>${head}</h1>${meta}${body}<div class="footer">Generado automáticamente por la plataforma KiMedia · Borrador editable, validar antes de entregar.</div></body></html>`;
}

function esc(v: any): string {
  if (v === null || v === undefined || v === "") return '<span class="placeholder">[pendiente]</span>';
  return String(v).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
}