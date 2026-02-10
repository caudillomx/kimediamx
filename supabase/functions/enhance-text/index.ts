import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!text || !type) {
      return new Response(JSON.stringify({ error: "text and type are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompts: Record<string, string> = {
      bio: `Eres un estratega de comunicación política en México. Mejora esta bio para redes sociales de una lideresa política. Hazla más poderosa, clara y profesional. Mantén la estructura y los datos, pero mejora la redacción. Máximo 160 caracteres. Devuelve SOLO el texto mejorado, sin explicaciones ni comillas.`,
      post: `Eres un estratega de comunicación política en México. Mejora este post político para redes sociales. Hazlo más impactante, emocional y con un llamado a la acción claro. Mantén el mensaje central pero mejora la redacción. Máximo 280 caracteres. Devuelve SOLO el texto mejorado, sin explicaciones ni comillas.`,
      message: `Eres un estratega de comunicación política en México. Mejora este mensaje político central. Hazlo más inspirador, claro y memorable. Mantén la esencia pero mejora la redacción. Máximo 200 caracteres. Devuelve SOLO el texto mejorado, sin explicaciones ni comillas.`,
    };

    const systemPrompt = prompts[type] || prompts.message;

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
          { role: "user", content: text },
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
    const enhanced = data.choices?.[0]?.message?.content?.trim() || text;

    return new Response(JSON.stringify({ enhanced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enhance-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
