import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { copy, copyType, industry, audience, goal, platform, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!copy || copy.trim().length < 10) {
      return new Response(JSON.stringify({ error: "El copy debe tener al menos 10 caracteres." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const platformNames: Record<string, string> = {
      instagram: "Instagram",
      linkedin: "LinkedIn",
      twitter: "X (Twitter)",
      tiktok: "TikTok",
    };

    const copyTypeNames: Record<string, string> = {
      caption: "Caption / Post",
      bio: "Bio de perfil",
      ad: "Anuncio publicitario",
      story: "Guión de Story/Reel",
    };

    const systemPrompt = `Eres un copywriter senior y consultor de comunicación digital en Latinoamérica con 15 años de experiencia.
Tu trabajo es revisar el copy de un usuario y darle feedback profesional, constructivo y accionable.

CONTEXTO DEL COPY:
- Tipo: ${copyTypeNames[copyType] || copyType}
- Plataforma: ${platformNames[platform] || platform}
- Industria/Nicho: ${industry}
- Audiencia objetivo: ${audience || "No especificada"}
- Objetivo del copy: ${goal}
- Tono deseado: ${tone || "No especificado"}

INSTRUCCIONES:
Analiza el copy del usuario y responde con un JSON puro (sin markdown, sin backticks) con esta estructura exacta:
{
  "score": <número 0-100, qué tan efectivo es el copy para su objetivo>,
  "summary": "<1 oración resumen del análisis>",
  "strengths": ["<fortaleza 1>", "<fortaleza 2>"],
  "improvements": ["<mejora concreta 1>", "<mejora concreta 2>", "<mejora concreta 3>"],
  "rewrite": "<versión mejorada del copy completo, manteniendo la voz del usuario pero optimizado>",
  "platformTips": ["<tip específico para ${platformNames[platform] || platform} 1>", "<tip 2>"]
}

CRITERIOS DE EVALUACIÓN:
1. Hook/gancho en la primera línea (¿atrapa la atención?)
2. Claridad del mensaje (¿se entiende qué ofrece/pide?)
3. Alineación con el objetivo declarado
4. Adecuación al tono solicitado
5. Formato adecuado para la plataforma
6. Llamado a la acción (CTA)
7. Longitud apropiada para la plataforma
8. Autenticidad (¿suena humano o genérico/IA?)

Sé honesto pero constructivo. El rewrite debe ser significativamente mejor pero mantener la esencia del usuario.`;

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
          { role: "user", content: copy },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    let result;
    try {
      const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", raw);
      result = {
        score: 50,
        summary: "No pudimos analizar tu copy en detalle. Intenta con un texto más completo.",
        strengths: ["Buen intento de comunicación"],
        improvements: ["Agrega un gancho en la primera línea", "Incluye un llamado a la acción", "Sé más específico con tu propuesta de valor"],
        rewrite: copy,
        platformTips: ["Adapta la longitud al formato de la plataforma"],
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-copy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
