import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { post, scenario, objective, platform, mode, visualDescription, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!post || !scenario || !platform) {
      return new Response(JSON.stringify({ error: "post, scenario, and platform are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileContext = userProfile
      ? `\nPERFIL DEL USUARIO:
- Industria/Profesión: ${userProfile.industry || "No especificada"}
- Audiencia objetivo: ${userProfile.audience || "No especificada"}
- Tono de marca: ${userProfile.tone || "No especificado"}
- Nivel de experiencia: ${userProfile.experience || "beginner"}`
      : "";

    const visualBlock = visualDescription
      ? `\nDESCRIPCIÓN VISUAL del usuario: "${visualDescription}"
Evalúa la coherencia entre el copy y la imagen/video descrito. ¿Es congruente? ¿Refuerza el mensaje? Incluye tu evaluación visual en el campo "visualFeedback".`
      : "";

    const systemPrompt = `Eres un analista experto de redes sociales y branding digital en Latinoamérica. 
Tu trabajo es evaluar posts de redes sociales y simular métricas de engagement realistas.

CONTEXTO:
- Plataforma: ${platform}
- Modo: ${mode === "personal" ? "Marca Personal" : "PyME / Empresa"}
- Escenario: ${scenario}
- Objetivo: ${objective}${profileContext}${visualBlock}

INSTRUCCIONES:
Evalúa el post del usuario y devuelve un JSON con exactamente esta estructura (sin markdown, sin backticks, solo JSON puro):
{
  "likes": <número entre 15 y 850 basado en la calidad>,
  "comments": <número entre 2 y 120>,
  "shares": <número entre 0 y 80>,
  "reach": <número entre 200 y 15000>,
  "engagement": <número entre 10 y 95, qué tan bueno es el post>,
  "feedback": "<2-3 oraciones de feedback constructivo en español, personalizado al perfil del usuario si está disponible>",
  "suggestions": ["<sugerencia 1 corta>", "<sugerencia 2 corta>", "<sugerencia 3 corta>"],
  "tone": "<positive si engagement >= 65, neutral si >= 40, negative si < 40>"${visualDescription ? ',\n  "visualFeedback": "<1-2 oraciones evaluando la coherencia entre el copy y la imagen/video descrito>"' : ""}
}

CRITERIOS DE EVALUACIÓN:
- Relevancia para la plataforma y el formato esperado
- Gancho en la primera línea (hook)
- Autenticidad y humanización
- Llamado a la acción claro
- Alineación con el objetivo del escenario
- Evitar contenido genérico o demasiado "vendedor"
- Un post vacío o de una sola palabra debe recibir engagement muy bajo (10-20)
${userProfile?.experience === "advanced" ? "- Sé más exigente: un usuario avanzado debe recibir feedback más detallado y estricto." : ""}
${userProfile?.experience === "beginner" ? "- Sé constructivo y alentador: el usuario es principiante. Da tips prácticos específicos." : ""}

Sé estricto pero justo. Un post mediocre debería tener 30-50 de engagement, uno bueno 60-80, uno excelente 80+.`;

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
          { role: "user", content: post },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    let metrics;
    try {
      const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      metrics = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", raw);
      metrics = {
        likes: 45,
        comments: 5,
        shares: 2,
        reach: 800,
        engagement: 35,
        feedback: "No pudimos analizar tu post en detalle. Intenta ser más específico y alineado con el objetivo del reto.",
        suggestions: ["Agrega un gancho en la primera línea", "Incluye un llamado a la acción", "Sé más específico"],
        tone: "neutral",
      };
    }

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulate-engagement error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
