import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profileId, profileToken } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!profileId || !profileToken) {
      return new Response(JSON.stringify({ error: "profileId and profileToken are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile from Supabase
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/brand_kit_profiles?id=eq.${profileId}&profile_token=eq.${profileToken}&select=*`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profile = profiles[0];

    const systemPrompt = `Eres un estratega de contenido digital en México especializado en marca personal. 
Tu tarea es crear una parrilla de contenido semanal de 7 posts (uno por día, de lunes a domingo) para redes sociales.

DATOS DEL USUARIO:
- Nombre: ${profile.full_name}
- Profesión: ${profile.profession}
- Industria: ${profile.industry || "general"}
- Propuesta de valor: ${profile.value_proposition || "no definida"}
- Audiencia objetivo: ${profile.target_audience || "público general"}
- Diferenciador: ${profile.differentiator || "no definido"}
- Tono de marca: ${profile.brand_tone || "profesional"}
- Canal principal: ${profile.main_channel || "Instagram"}

REGLAS:
- Cada post debe tener máximo 280 caracteres
- Incluir hashtags relevantes (2-3 por post)
- Variar formatos: tip, storytelling, pregunta, dato, CTA, reflexión, testimonio
- El tono debe coincidir con el tono de marca del usuario
- Los posts deben ser listos para publicar
- Incluir emojis de forma moderada y profesional`;

    const userPrompt = `Genera la parrilla de 7 posts para esta semana. Usa EXACTAMENTE este formato JSON (sin markdown, sin backticks, solo JSON puro):

[
  {"day": "Lunes", "format": "Tip", "content": "texto del post", "hashtags": ["#tag1", "#tag2"]},
  {"day": "Martes", "format": "Storytelling", "content": "texto del post", "hashtags": ["#tag1", "#tag2"]},
  {"day": "Miércoles", "format": "Pregunta", "content": "texto del post", "hashtags": ["#tag1", "#tag2"]},
  {"day": "Jueves", "format": "Dato", "content": "texto del post", "hashtags": ["#tag1", "#tag2"]},
  {"day": "Viernes", "format": "CTA", "content": "texto del post", "hashtags": ["#tag1", "#tag2"]},
  {"day": "Sábado", "format": "Reflexión", "content": "texto del post", "hashtags": ["#tag1", "#tag2"]},
  {"day": "Domingo", "format": "Testimonio", "content": "texto del post", "hashtags": ["#tag1", "#tag2"]}
]`;

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
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
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
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "[]";

    // Parse the JSON - handle potential markdown wrapping
    let grid;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      grid = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return new Response(JSON.stringify({ error: "Error al procesar la respuesta de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save to DB
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/brand_kit_profiles?id=eq.${profileId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ content_grid: grid }),
    });

    if (!updateRes.ok) {
      console.error("DB update error:", await updateRes.text());
    }

    return new Response(JSON.stringify({ grid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content-grid error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
