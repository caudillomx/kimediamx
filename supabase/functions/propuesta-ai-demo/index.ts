import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, audience } = await req.json();
    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "Falta el tema" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurado");

    const systemPrompt = `Eres un estratega senior de comunicación política con 15 años de experiencia en campañas en México. Tu trabajo es generar, en segundos, piezas listas para usar en campaña a partir de un tema o causa.

Reglas:
- Tono: cercano, claro, sin jerga partidista, con perspectiva de género cuando aplique.
- Evita promesas vacías y lugares comunes.
- Estructura: hook directo, problema/oportunidad, propuesta concreta, llamado a la acción.
- No inventes datos numéricos específicos.

Devuelves SIEMPRE el resultado vía la herramienta generate_campaign_pack.`;

    const userPrompt = `Tema o causa: "${topic}"${audience ? `\nAudiencia objetivo: ${audience}` : ""}\n\nGenera un paquete completo listo para campaña.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_campaign_pack",
              description: "Genera un paquete completo de pieza de campaña.",
              parameters: {
                type: "object",
                properties: {
                  headline: {
                    type: "string",
                    description: "Titular potente (máx 90 caracteres) para feed.",
                  },
                  post: {
                    type: "string",
                    description: "Post completo para redes (Facebook/Instagram), 3 párrafos cortos máx., con CTA al final.",
                  },
                  video_hook: {
                    type: "string",
                    description: "Hook de los primeros 3 segundos para un Reel/TikTok, en primera persona.",
                  },
                  speech_line: {
                    type: "string",
                    description: "Una frase memorable para vocería en mitin o entrevista.",
                  },
                  hashtags: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 a 5 hashtags estratégicos sin signo #.",
                  },
                },
                required: ["headline", "post", "video_hook", "speech_line", "hashtags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_campaign_pack" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Sin créditos disponibles." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del modelo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Sin respuesta estructurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pack = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(pack), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("propuesta-ai-demo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});