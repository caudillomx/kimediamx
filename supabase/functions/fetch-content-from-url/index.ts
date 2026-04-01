import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, cycle_id, title } = await req.json();
    if (!url || !cycle_id) throw new Error("url y cycle_id son requeridos");

    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KiMediaBot/1.0)" }
    });
    if (!pageRes.ok) throw new Error(`No se pudo acceder a la URL: ${pageRes.status}`);
    const html = await pageRes.text();

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY no configurada");

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-20250514",
        max_tokens: 2000,
        system: "Extrae el contenido principal y relevante de este texto. Elimina navegación, anuncios, footers y contenido irrelevante. Devuelve solo el contenido editorial limpio, en español si es posible. Máximo 1500 palabras.",
        messages: [{ role: "user", content: text }],
      }),
    });

    const aiData = await aiRes.json();
    const cleanContent = aiData.content?.[0]?.text || text.slice(0, 2000);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from("content_inputs").insert({
      cycle_id,
      input_type: "url",
      title: title || url,
      content: cleanContent,
      url,
      sort_order: 99,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
