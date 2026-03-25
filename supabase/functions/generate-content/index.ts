import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Network-Specific Expertise ────────────────────────────

const NETWORK_GUIDELINES: Record<string, string> = {
  instagram: `INSTAGRAM:
- Regla 1/3: contenido de marca, educativo, y comunidad en partes iguales.
- Hooks visuales: la primera línea del copy debe detener el scroll.
- Formatos óptimos: carrusel (mayor engagement), reel (mayor alcance), historia (cercanía).
- Carruseles: Slide 1 = hook visual potente. Slides 2-7 = un insight por slide, máx 15 palabras. Slide final = CTA claro ("Guarda esto", "Comparte con alguien que lo necesite").
- Reels: hook en 3 segundos, texto overlay, duración ideal 15-30s.
- Hashtags: mezcla de populares (500K-5M), nicho (10K-500K) y de marca. Máximo 20.
- CTA que invite a guardar o compartir (señales fuertes para el algoritmo).
- Horario "golden hour": los primeros 60 min post-publicación son críticos.
- Tono: visual, aspiracional, comunidad. Nunca corporativo.`,

  facebook: `FACEBOOK:
- Priorizar contenido que genere conversación (el algoritmo premia comentarios largos).
- Formatos: video nativo > carrusel > imagen > link (links bajan alcance).
- Largo de copy: 40-80 palabras para posts regulares, más largo para storytelling.
- Pregunta al final para detonar comentarios.
- Grupos y comunidad: contenido que la gente quiera compartir en sus grupos.
- No incluir links en el copy principal; usar "link en comentarios".
- Hashtags: máximo 3-5, no son tan relevantes como en Instagram.
- Tono: conversacional, cercano, comunitario.`,

  x: `X (TWITTER):
- Hooks potentes en la primera línea (máx 280 caracteres para post principal).
- Hilos: tweet 1 = hook irresistible, tweets 2-8 = un punto por tweet, tweet final = CTA + resumen.
- Formato de listas numeradas funciona bien ("5 cosas que aprendí sobre X").
- Opiniones fuertes con datos generan debate (señal positiva).
- Sin hashtags o máximo 1-2 muy específicos.
- Timing: publicar cuando la audiencia objetivo está activa, responder en los primeros 30 min.
- Tono: directo, conciso, con personalidad. Nada genérico.`,

  linkedin: `LINKEDIN:
- Hook en la primera línea: debe ganar el clic de "...ver más". Ejemplos:
  * Curiosidad: "Casi rechazo el proyecto que cambió mi carrera."
  * Dato impactante: "El 73% de las estrategias de contenido fallan por esto."
  * Historia específica: "Martes, 9 PM. Estoy a punto de enviar el correo que cambiará todo."
- Cada post necesita un punto de vista defendible. Contenido neutral = resultados neutrales.
- Formato: un párrafo por idea, máximo 2-3 líneas, mucho espacio en blanco.
- NO incluir links en el cuerpo del post (LinkedIn penaliza links externos). Siempre "link en comentarios".
- Máximo 3-5 hashtags específicos (#marketingB2B mejor que #marketing).
- Carruseles: Slide 1 = hook, Slides 2-7 = un insight por slide con visual, Slide 8 = CTA ("Sígueme para más sobre [tema]").
- Tipos de post probados: historia personal → insight, opinión contraria + evidencia, datos sorprendentes + implicación.
- Los primeros 60 minutos son el test de calidad del algoritmo: responder cada comentario.
- CTA que invite a responder: "¿Qué agregarías?" es mejor que "Dale like si estás de acuerdo".
- Tono: autoridad con humanidad, opinado sin ser combativo, específico nunca vago.`,

  tiktok: `TIKTOK:
- Hook en 3 segundos obligatorio. Si no capturas atención inmediata, el algoritmo entierra el video.
- Mezcla de contenido: 40% educativo, 30% entretenimiento, 20% inspiracional, 10% promocional.
- Scripts de video: indicar texto overlay, transiciones, y audio sugerido.
- Duración ideal: 15-60 segundos (completar el video = señal fuerte).
- Hashtags: 5-8 total, mezcla de trending + nicho + marca.
- Pattern interrupts: sorpresas visuales, giros inesperados, elementos que rompan la monotonía.
- Estructura de arco narrativo: hook → problema → solución → CTA.
- Adaptar a formato vertical 9:16 siempre.
- Promover rewatches (incluir detalle que solo se nota la segunda vez).
- Tono: auténtico, energético, nativo de la plataforma. Nunca corporativo ni pulido en exceso.`,
};

function getNetworkGuidelines(networks: string[]): string {
  if (!networks || networks.length === 0) return "";
  const guidelines = networks
    .map(n => NETWORK_GUIDELINES[n.toLowerCase()])
    .filter(Boolean)
    .join("\n\n");
  return guidelines ? `\n\nGUÍAS ESPECIALIZADAS POR RED SOCIAL (APLICA ESTRICTAMENTE):\n${guidelines}` : "";
}

// ─── Prompts ───────────────────────────────────────────────

function buildGridPrompt(profile: any, cycle: any, inputs: any[], learnings: any[], analytics: any, trendResults?: any[]) {
  const networks = profile.preferred_networks || ["Instagram", "Facebook"];

  const systemPrompt = `Eres un estratega de contenidos digitales de élite para Latinoamérica, con expertise especializado en cada red social.

PRINCIPIOS FUNDAMENTALES:
- Cada pieza debe tener un HOOK potente que detenga el scroll en los primeros 3 segundos / primera línea.
- El copy debe tener un punto de vista defendible. Contenido genérico = resultados genéricos.
- Especificidad sobre inspiración: "Perdimos 30% de clientes y así los recuperamos" > "La retención es importante".
- Adaptar tono, formato y estructura A CADA RED SOCIAL según sus reglas específicas.
- Cada pieza debe incluir un CTA específico y accionable (no genérico).

REGLAS TÉCNICAS:
- Cada pieza: fecha, red social, formato, pilar, objetivo, borrador de copy COMPLETO, hashtags, CTA y tono.
- Variar formatos según la red (carrusel/reel/historia para IG, hilo para X, video nativo para TikTok, etc.)
- Distribuir pilares equitativamente.
- Considerar días y horarios óptimos por red.
${getNetworkGuidelines(networks)}

Responde SIEMPRE en JSON válido:
{
  "pieces": [
    {
      "scheduled_date": "YYYY-MM-DD",
      "network": "instagram|facebook|x|linkedin|tiktok",
      "format": "carrusel|reel|imagen|historia|hilo|video|texto",
      "pillar": "nombre del pilar",
      "objective": "objetivo + insumo de origen",
      "draft_copy": "COPY COMPLETO listo para publicar, con hook potente, desarrollo y CTA",
      "hashtags": ["tag1", "tag2"],
      "cta": "llamado a la acción específico",
      "tone": "tono de la pieza"
    }
  ]
}`;

  const userPrompt = `Genera una parrilla de contenido:

CLIENTE: ${profile.client_name}
INDUSTRIA: ${profile.industry || "No especificada"}
AUDIENCIA: ${profile.target_audience || "No especificada"}
TONO DE MARCA: ${profile.brand_tone || "Profesional"}
PILARES: ${(profile.content_pillars || []).join(", ") || "No definidos"}
REDES: ${networks.join(", ")}
FRECUENCIA: ${profile.posting_frequency || "3 veces por semana"}
RESTRICCIONES: ${profile.restrictions || "Ninguna"}

PERIODO: ${cycle.start_date} a ${cycle.end_date}
TIPO DE CICLO: ${cycle.cycle_type}

${cycle.briefing_data?.objective ? `OBJETIVO DEL CICLO: ${cycle.briefing_data.objective}` : ""}
${cycle.briefing_data?.themes ? `TEMAS PRIORITARIOS: ${cycle.briefing_data.themes}` : ""}

${inputs && inputs.length > 0 ? `
INSUMOS CLAVE (BASA LA PARRILLA EN ESTOS MATERIALES):
${inputs.map((inp: any, i: number) => `
--- Insumo ${i + 1}: ${inp.title || "Sin título"} [${inp.input_type}] ---
${inp.content || ""}
${inp.url ? `URL: ${inp.url}` : ""}
${inp.tags?.length > 0 ? `Tags: ${inp.tags.join(", ")}` : ""}
`).join("\n")}

IMPORTANTE: Cada pieza DEBE estar basada en uno o más insumos. No inventes contenido que no esté respaldado por los materiales. Indica en "objective" de qué insumo proviene.
` : ""}

${learnings && learnings.length > 0 ? `
APRENDIZAJES PREVIOS:
${learnings.map((l: any) => `- ${l.insight} (confianza: ${l.confidence})`).join("\n")}
` : ""}

${analytics ? `
MÉTRICAS RECIENTES:
- Mejor formato: ${analytics.bestFormat || "N/A"}
- Mejor pilar: ${analytics.bestPillar || "N/A"}
- Mejor día: ${analytics.bestDay || "N/A"}
- Engagement promedio: ${analytics.avgEngagement || "N/A"}
` : ""}`;

  return { systemPrompt, userPrompt };
}

function buildExecutePrompt(profile: any, pieces: any[]) {
  const systemPrompt = `Eres un copywriter experto en contenido digital para Latinoamérica.
Toma borradores aprobados y genera versiones finales pulidas, listas para publicar.

Para cada pieza genera:
- Copy final optimizado para la red social específica (aplicando las mejores prácticas de esa red)
- Hashtags finales
- CTA refinado
- Prompt de diseño detallado para el equipo creativo

Responde en JSON:
{
  "executed_pieces": [
    {
      "id": "uuid de la pieza",
      "final_copy": "copy final pulido",
      "hashtags": ["tag1"],
      "cta": "CTA refinado",
      "design_prompt": "Descripción detallada para el diseñador"
    }
  ]
}`;

  const userPrompt = `Ejecuta estas piezas para ${profile.client_name}:

TONO: ${profile.brand_tone || "Profesional"}
AUDIENCIA: ${profile.target_audience || "General"}

PIEZAS:
${pieces.map((p: any) => `
- ID: ${p.id}
- Red: ${p.network}
- Formato: ${p.format}
- Pilar: ${p.pillar}
- Borrador: ${p.draft_copy}
- CTA: ${p.cta}
`).join("\n")}`;

  return { systemPrompt, userPrompt };
}

function buildAnalyzePrompt(profile: any, analytics: any) {
  const systemPrompt = `Eres un analista de marketing digital experto.
Analiza métricas de contenido orgánico y/o paid y genera insights accionables.

Responde en JSON:
{
  "summary": "Resumen ejecutivo",
  "kpis": { "total_reach": 0, "avg_engagement_rate": 0, "top_post_type": "", "growth_vs_previous": "" },
  "insights": [
    { "category": "formato|pilar|horario|audiencia|paid", "insight": "texto", "confidence": 0.8, "action": "recomendación" }
  ],
  "recommendations": ["rec 1", "rec 2"],
  "next_month_focus": "enfoque sugerido"
}`;

  const userPrompt = `Analiza el rendimiento de ${profile.client_name}:

DATOS ORGÁNICOS:
${JSON.stringify(analytics?.organic || [], null, 2)}

${analytics?.paid ? `DATOS PUBLICITARIOS:
${JSON.stringify(analytics.paid, null, 2)}` : ""}

PERIODO: ${analytics?.period || "Último mes"}
OBJETIVOS: ${analytics?.objectives || "No definidos"}`;

  return { systemPrompt, userPrompt };
}

function buildReviewPrompt(profile: any, pieces: any[]) {
  const systemPrompt = `Eres un editor senior de contenido digital y estratega de engagement para Latinoamérica.
Tu trabajo es REVISAR piezas de contenido generadas por IA y mejorarlas.

Para cada pieza evalúa:
1. HOOK: ¿La primera línea detiene el scroll? Si no, reescríbela.
2. ESPECIFICIDAD: ¿Tiene datos, historias o ejemplos concretos? Elimina generalidades.
3. CTA: ¿Es específico y accionable? "Comenta qué opinas" es débil. Mejóralo.
4. TONO: ¿Es auténtico para la red social? LinkedIn ≠ TikTok ≠ Instagram.
5. ENGAGEMENT POTENTIAL: Puntuación 1-10 de probabilidad de generar interacción.

Responde en JSON:
{
  "reviews": [
    {
      "piece_index": 0,
      "engagement_score": 8,
      "improvements": ["mejora 1", "mejora 2"],
      "improved_copy": "copy mejorado completo (o null si el original está bien)",
      "improved_cta": "CTA mejorado (o null)",
      "improved_hashtags": ["tags mejorados"] 
    }
  ],
  "general_notes": "observaciones generales sobre la parrilla"
}`;

  const userPrompt = `Revisa estas ${pieces.length} piezas para ${profile.client_name} (${profile.industry || "sin industria"}, audiencia: ${profile.target_audience || "general"}):

${pieces.map((p: any, i: number) => `
--- Pieza ${i} [${p.network} / ${p.format}] ---
Copy: ${p.draft_copy}
CTA: ${p.cta}
Hashtags: ${(p.hashtags || []).join(", ")}
Pilar: ${p.pillar}
`).join("\n")}

Sé exigente. Si un copy es genérico o aburrido, reescríbelo con más punch.`;

  return { systemPrompt, userPrompt };
}

// ─── AI Call ───────────────────────────────────────────────

async function callAI(systemPrompt: string, userPrompt: string, apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw { status: 429, message: "Límite de solicitudes excedido. Intenta en un momento." };
    if (response.status === 402) throw { status: 402, message: "Créditos agotados." };
    const t = await response.text();
    console.error("AI error:", response.status, t);
    throw { status: 500, message: "Error del servicio de IA" };
  }

  const aiData = await response.json();
  const content = aiData.choices?.[0]?.message?.content || "";
  
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return args.result || args;
    }
  }
  return null;
}

// ─── Main Handler ─────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, profile, cycle, pieces, learnings, analytics, inputs } = await req.json();

    let systemPrompt: string;
    let userPrompt: string;

    if (action === "generate_grid") {
      ({ systemPrompt, userPrompt } = buildGridPrompt(profile, cycle, inputs, learnings, analytics));
    } else if (action === "execute_pieces") {
      ({ systemPrompt, userPrompt } = buildExecutePrompt(profile, pieces));
    } else if (action === "analyze_performance") {
      ({ systemPrompt, userPrompt } = buildAnalyzePrompt(profile, analytics));
    } else if (action === "review_pieces") {
      ({ systemPrompt, userPrompt } = buildReviewPrompt(profile, pieces));
    } else {
      throw new Error(`Acción no reconocida: ${action}`);
    }

    const result = await callAI(systemPrompt, userPrompt, LOVABLE_API_KEY);

    if (!result || (typeof result === "object" && Object.keys(result).length === 0)) {
      throw new Error("La IA no generó contenido. Intenta agregar insumos con más texto o contenido.");
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-content error:", e);
    const status = e?.status || 500;
    const message = e?.message || (e instanceof Error ? e.message : "Error desconocido");
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
