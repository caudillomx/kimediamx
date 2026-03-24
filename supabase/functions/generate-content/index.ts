import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, profile, cycle, pieces, learnings, analytics, inputs } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate_grid") {
      systemPrompt = `Eres un estratega de contenidos digitales experto en redes sociales para Latinoamérica.
Tu tarea es generar una parrilla de contenido estructurada y detallada.

REGLAS:
- Cada pieza debe tener: fecha programada, red social, formato, pilar de contenido, objetivo, borrador de copy, hashtags sugeridos, CTA y tono.
- Varía los formatos (carrusel, reel, imagen estática, historia, hilo, etc.)
- Distribuye los pilares de contenido equitativamente
- Incluye CTAs variados y específicos
- Adapta el tono según la red social
- Considera días y horarios óptimos para cada red

Responde SIEMPRE en JSON válido con esta estructura:
{
  "pieces": [
    {
      "scheduled_date": "YYYY-MM-DD",
      "network": "instagram|facebook|x|linkedin|tiktok",
      "format": "carrusel|reel|imagen|historia|hilo|video|texto",
      "pillar": "nombre del pilar",
      "objective": "objetivo de la pieza",
      "draft_copy": "borrador completo del copy",
      "hashtags": ["tag1", "tag2"],
      "cta": "llamado a la acción",
      "tone": "tono de la pieza"
    }
  ]
}`;

      userPrompt = `Genera una parrilla de contenido con estos datos:

CLIENTE: ${profile.client_name}
INDUSTRIA: ${profile.industry || "No especificada"}
AUDIENCIA: ${profile.target_audience || "No especificada"}
TONO DE MARCA: ${profile.brand_tone || "Profesional"}
PILARES: ${(profile.content_pillars || []).join(", ") || "No definidos"}
REDES: ${(profile.preferred_networks || []).join(", ") || "Instagram, Facebook"}
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

IMPORTANTE: Cada pieza de la parrilla DEBE estar basada en uno o más de estos insumos. No inventes contenido que no esté respaldado por los materiales proporcionados. Indica en el campo "objective" de qué insumo proviene cada pieza.
` : ""}

${learnings && learnings.length > 0 ? `
APRENDIZAJES PREVIOS (considera esto para mejorar):
${learnings.map((l: any) => `- ${l.insight} (confianza: ${l.confidence})`).join("\n")}
` : ""}

${analytics ? `
MÉTRICAS RECIENTES:
- Mejor formato: ${analytics.bestFormat || "N/A"}
- Mejor pilar: ${analytics.bestPillar || "N/A"}
- Mejor día: ${analytics.bestDay || "N/A"}
- Engagement promedio: ${analytics.avgEngagement || "N/A"}
` : ""}`;
    } else if (action === "execute_pieces") {
      systemPrompt = `Eres un copywriter experto en contenido digital para Latinoamérica.
Tu tarea es tomar borradores de contenido aprobados y generar las versiones finales pulidas, listas para publicar.

Para cada pieza genera:
- Copy final optimizado para la red social específica
- Hashtags finales (máximo 30 para Instagram, 5 para otras)
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

      userPrompt = `Ejecuta estas piezas aprobadas para ${profile.client_name}:

TONO DE MARCA: ${profile.brand_tone || "Profesional"}
AUDIENCIA: ${profile.target_audience || "General"}

PIEZAS A EJECUTAR:
${pieces.map((p: any) => `
- ID: ${p.id}
- Red: ${p.network}
- Formato: ${p.format}
- Pilar: ${p.pillar}
- Borrador: ${p.draft_copy}
- CTA actual: ${p.cta}
`).join("\n")}`;
    } else if (action === "analyze_performance") {
      systemPrompt = `Eres un analista de marketing digital experto. 
Analiza las métricas de contenido orgánico y/o paid y genera insights accionables.

Responde en JSON:
{
  "summary": "Resumen ejecutivo del periodo",
  "kpis": { "total_reach": 0, "avg_engagement_rate": 0, "top_post_type": "", "growth_vs_previous": "" },
  "insights": [
    { "category": "formato|pilar|horario|audiencia|paid", "insight": "texto del insight", "confidence": 0.8, "action": "recomendación específica" }
  ],
  "recommendations": ["recomendación 1", "recomendación 2"],
  "next_month_focus": "enfoque sugerido para el próximo mes"
}`;

      userPrompt = `Analiza el rendimiento de contenido de ${profile.client_name}:

DATOS ORGÁNICOS:
${JSON.stringify(analytics?.organic || [], null, 2)}

${analytics?.paid ? `DATOS PUBLICITARIOS:
${JSON.stringify(analytics.paid, null, 2)}` : ""}

PERIODO: ${analytics?.period || "Último mes"}
OBJETIVOS DEL CLIENTE: ${analytics?.objectives || "No definidos"}`;
    } else {
      throw new Error(`Acción no reconocida: ${action}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "content_response",
            description: "Return structured content data",
            parameters: {
              type: "object",
              properties: {
                result: { type: "object" }
              },
              required: ["result"],
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "content_response" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta en un momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Error del servicio de IA");
    }

    const aiData = await response.json();
    let result;

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments).result;
    } else {
      // Fallback: parse from content
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : { error: "No se pudo parsear la respuesta" };
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
