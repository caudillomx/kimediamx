import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "openai/gpt-6-astra";

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
    const input = JSON.stringify(body.data).slice(0, 16000);

    const system = `Eres estratega senior de contenido de la agencia KiMedia (México). Escribes una lectura que el cliente y el equipo entiendan a la primera.
Reglas de datos: usa SOLO los datos recibidos; no inventes cifras ni hechos externos. Español de México, directo, explicativo, sin tecnicismos ni jerga de marketing.

Reglas de criterio (obligatorias):
- NUNCA recomiendes "hacer más piezas sobre" un tema, santo, persona o palabra concreta: eso vuelve la cuenta monotemática. Si un ejemplo funcionó, explica QUÉ tenía (historia concreta, personaje, pregunta directa, aplicación a la vida diaria, formato, duración) y cómo llevar ese enfoque a otros temas.
- Nunca cites palabras sueltas entre comillas como si fueran temas ("pablo", "recuperar"). Describe la pieza con su contenido real.
- Explica cada número en lenguaje claro: "1.9×" = "casi el doble de interacciones de lo normal en esa red". No uses diferencias menores a 15%.
- Considera tres métricas distintas: interacciones (involucramiento), alcance (personas a las que llegó) y vistas (reproducciones). Un formato puede conversar poco y aun así dar mucho alcance o vistas; dilo y propón cómo combinar ambos papeles.
- Cada recomendación debe decir: qué hacer, por qué (con la cifra) y cómo se vería en la práctica.

Formato (texto plano, sin markdown ni asteriscos):
Lo que nos dicen los datos: 3-4 frases con la lectura principal, citando cifras y separando involucramiento de alcance/vistas.
Cuatro movimientos para el próximo periodo: numerados 1-4. Cada uno en 2 frases: la acción concreta y la evidencia que la sostiene.
Lo que conviene vigilar: 1-2 frases sobre un riesgo o algo que no está funcionando, con su dato.
Una idea para probar: 1-2 frases con una pieza concreta (formato, red, día, enfoque) que no repita el mismo tema de la pieza ganadora.
Máximo 300 palabras.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
        "X-Lovable-AIG-SDK": "fetch",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: [{ role: "system", content: system }, { role: "user", content: input }],
        reasoning: { effort: "low" },
        store: false,
        stream: true,
      }),
    });
    if (!r.ok || !r.body) {
      const details = await r.text();
      const status = [402, 403, 429].includes(r.status) ? r.status : 500;
      return json({ error: "IA no disponible", status: r.status, details }, status);
    }

    // Consumir el stream SSE y devolver el texto final.
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
          if (ev.type === "error" || ev.type === "response.failed") return json({ error: ev?.error?.message ?? ev?.response?.error?.message ?? "Error de IA" }, 500);
        } catch { /* línea parcial */ }
      }
    }
    if (!text.trim()) return json({ error: "La IA no devolvió texto" }, 502);
    return json({ text: text.replace(/\*\*/g, "").trim() });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
