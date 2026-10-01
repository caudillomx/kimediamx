import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: "No autorizado" }, 401);

    const body = await req.json().catch(() => null);
    if (!body?.data || typeof body.data !== "object") return json({ error: "Faltan datos" }, 400);
    const input = JSON.stringify(body.data).slice(0, 12000);

    const system = `Eres estratega senior de contenido de la agencia KiMedia (México). Escribes para el cliente y para el equipo.
Reglas: usa SOLO los datos que recibes; no inventes cifras, benchmarks ni hechos externos. Español de México, directo, sin rodeos ni tecnicismos.
Claridad: nunca cites una palabra suelta como "tema" (p. ej. "el tema pablo"); explica de qué se habló usando el campo ejemplo_de_uso (p. ej. "las piezas sobre San Pablo"). Si no queda claro, no lo uses.
"1.9×" significa "casi el doble de interacciones de lo normal en esa red"; dilo así. No uses diferencias menores a 15% como recomendación.
Formatos: distingue cantidad absoluta (interacciones promedio) de rendimiento contra su red. Si un formato tiene muchas interacciones pero rinde bajo frente a su red, dilo explícitamente para no contradecirte.
Formato (texto plano, sin markdown ni asteriscos):
Lo que nos dicen los datos: 2-3 frases con la lectura principal y su cifra.
Tres movimientos para el próximo periodo: numerados 1-3, cada uno con la acción concreta y la evidencia.
Una idea para probar: 1 frase con una pieza concreta (formato, tema, día).
Máximo 170 palabras.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: system }, { role: "user", content: input }] }),
    });
    if (!r.ok) return json({ error: "IA no disponible", status: r.status, details: await r.text() }, r.status === 429 || r.status === 402 ? r.status : 500);
    const d = await r.json();
    return json({ text: d.choices?.[0]?.message?.content?.replace(/\*\*/g, "") ?? "" });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
