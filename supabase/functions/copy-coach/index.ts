import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT_REVIEW = `Eres el Copy Coach interno de KiMedia, una agencia digital mexicana. Tu trabajo es analizar copy y dar feedback accionable.

GUIDELINES DE MARCA KIMEDIA:
- Tono: Profesional pero cercano. Nunca frío ni corporativo.
- Pilares: Reputación digital, estrategia basada en datos, resultados medibles.
- Estructura ideal: Hook → Problema → Solución → CTA
- Frases cortas y directas. Máximo 3 líneas por párrafo.
- Evitar: superlativos vacíos ("el mejor", "líder"), promesas sin respaldo, jerga técnica excesiva.
- Usar datos cuando sea posible (ej: "93% de consumidores leen reseñas").
- CTAs específicos y orientados a acción.

FORMATO DE RESPUESTA:
Responde en español con markdown. Incluye:
## ✅ Lo que funciona
## ⚠️ Áreas de mejora  
## 💡 Sugerencias concretas
## Score de marca: X/10

Sé directo, específico y da ejemplos de reescritura cuando sea posible.`;

const SYSTEM_PROMPT_GENERATE = `Eres el Copy Coach interno de KiMedia, una agencia digital mexicana. Tu trabajo es generar copy alineado con la marca.

GUIDELINES DE MARCA KIMEDIA:
- Tono: Profesional pero cercano. Nunca frío ni corporativo.
- Pilares: Reputación digital, estrategia basada en datos, resultados medibles.
- Estructura ideal: Hook → Problema → Solución → CTA
- Frases cortas y directas. Máximo 3 líneas por párrafo.
- Usar datos cuando sea posible (ej: "93% de consumidores leen reseñas").
- CTAs específicos y orientados a acción.

FORMATO DE RESPUESTA:
Responde en español con markdown. Genera:
- Variante A (principal)
- Variante B (alternativa con enfoque diferente)
- 3 opciones de CTA
- Hashtags sugeridos si aplica

Adapta el tono y extensión al tipo de copy solicitado.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, mode, copyType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = mode === "review" ? SYSTEM_PROMPT_REVIEW : SYSTEM_PROMPT_GENERATE;
    const userMessage =
      mode === "review"
        ? `Analiza este copy para ${copyType}:\n\n${text}`
        : `Genera copy para ${copyType} con este brief:\n\n${text}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("copy-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
