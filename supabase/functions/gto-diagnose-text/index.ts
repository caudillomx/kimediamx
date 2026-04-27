import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un editor senior de comunicación gubernamental con 20 años revisando textos institucionales en México. Vas a analizar un texto que probablemente fue generado o muy editado con IA por una dependencia de gobierno. Tu trabajo es detectar específicamente estos 5 errores recurrentes:

1. PROMPTS_SIN_ESTRATEGIA: el texto no tiene una intención clara, mezcla audiencias, no se sabe para qué fue escrito.
2. LENGUAJE_IA_NO_DEPURADO: frases reveladoras de IA: "no solo... sino también", "es importante destacar", "en un mundo cada vez más", "dejar huella", "trascender", "sinergia", "robusto", "abordar de manera integral", muletillas grandilocuentes.
3. REGISTRO_UNIFORME: tono igual para todas las audiencias, sin distinguir si es ciudadanía, medios, o público técnico.
4. SIN_ESTRUCTURA: no hay apertura clara, cuerpo y cierre. Texto que crece sin orden o sin llamada a la acción.
5. DATOS_SIN_VERIFICAR: cifras, porcentajes, fechas o nombres dichos con autoridad pero sin fuente clara, o redondeos sospechosos.

Sé directo y útil. NO inventes errores que no estén. Si el texto no tiene un error específico, NO lo incluyas.
Devuelve SIEMPRE el resultado vía la herramienta diagnose_text.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texto, titulo } = await req.json();
    if (!texto || typeof texto !== "string" || texto.trim().length < 30) {
      return new Response(JSON.stringify({ error: "El texto es muy corto para analizar (mínimo 30 caracteres)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurado");

    const userPrompt = `${titulo ? `Título: ${titulo}\n\n` : ""}Texto a diagnosticar:\n"""\n${texto}\n"""`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "diagnose_text",
              description: "Devuelve el diagnóstico de errores detectados en el texto.",
              parameters: {
                type: "object",
                properties: {
                  resumen: {
                    type: "string",
                    description: "Resumen de 2-3 oraciones del estado del texto.",
                  },
                  score_calidad: {
                    type: "integer",
                    description: "Calidad general del 1 al 10. 10 = listo para publicar.",
                  },
                  errores_detectados: {
                    type: "array",
                    description: "Lista solo de los errores que SÍ están presentes.",
                    items: {
                      type: "object",
                      properties: {
                        tipo: {
                          type: "string",
                          enum: [
                            "PROMPTS_SIN_ESTRATEGIA",
                            "LENGUAJE_IA_NO_DEPURADO",
                            "REGISTRO_UNIFORME",
                            "SIN_ESTRUCTURA",
                            "DATOS_SIN_VERIFICAR",
                          ],
                        },
                        ejemplo: {
                          type: "string",
                          description: "Cita textual breve del texto donde aparece el error.",
                        },
                        sugerencia: {
                          type: "string",
                          description: "Cómo corregirlo en una oración accionable.",
                        },
                      },
                      required: ["tipo", "ejemplo", "sugerencia"],
                      additionalProperties: false,
                    },
                  },
                  terminos_prohibidos_sugeridos: {
                    type: "array",
                    description: "3-8 frases o palabras que esta dependencia debería agregar a su lista de términos prohibidos.",
                    items: { type: "string" },
                  },
                },
                required: ["resumen", "score_calidad", "errores_detectados", "terminos_prohibidos_sugeridos"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "diagnose_text" } },
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
        return new Response(JSON.stringify({ error: "Sin créditos disponibles en el espacio de Lovable AI." }), {
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

    const diagnostico = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(diagnostico), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gto-diagnose-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});