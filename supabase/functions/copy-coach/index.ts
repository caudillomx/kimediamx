import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// Database IDs from the setup
const TONO_DB_ID = "30360b3f-7897-8158-9a8d-c617ab002313";
const CLIENTES_DB_ID = "30360b3f-7897-816b-ac6e-e6b9496e6d2a";
const HISTORIAL_DB_ID = "30360b3f-7897-8166-9ccf-e90f4ce46aaa";

async function fetchNotionGuidelines(notionKey: string, copyType?: string): Promise<string> {
  const headers = {
    Authorization: `Bearer ${notionKey}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };

  // Fetch tone rules
  const filterBody: Record<string, unknown> = {};
  if (copyType) {
    const typeMap: Record<string, string> = {
      social: "Redes Sociales",
      email: "Email",
      ad: "Ads",
      blog: "Blog",
    };
    const notionType = typeMap[copyType] || copyType;
    filterBody.filter = {
      or: [
        { property: "Aplica a", multi_select: { contains: "General" } },
        { property: "Aplica a", multi_select: { contains: notionType } },
      ],
    };
  }

  const tonoResp = await fetch(`${NOTION_API}/databases/${TONO_DB_ID}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify(filterBody),
  });

  let guidelinesText = "GUIDELINES DE MARCA KIMEDIA (desde Notion):\n";

  if (tonoResp.ok) {
    const tonoData = await tonoResp.json();
    for (const page of tonoData.results) {
      const props = page.properties;
      const regla = props["Regla"]?.title?.[0]?.plain_text || "";
      const categoria = props["Categoría"]?.select?.name || "";
      const descripcion = props["Descripción"]?.rich_text?.[0]?.plain_text || "";
      const ejemplo = props["Ejemplo"]?.rich_text?.[0]?.plain_text || "";

      guidelinesText += `\n- [${categoria}] ${regla}: ${descripcion}`;
      if (ejemplo) guidelinesText += ` Ejemplo: "${ejemplo}"`;
    }
  } else {
    console.error("Failed to fetch tone rules:", await tonoResp.text());
    guidelinesText += "\n- Tono: Profesional pero cercano. Nunca frío ni corporativo.";
    guidelinesText += "\n- Estructura: Hook → Problema → Solución → CTA";
    guidelinesText += "\n- Evitar superlativos vacíos y jerga técnica excesiva.";
  }

  return guidelinesText;
}

async function fetchClientGuidelines(notionKey: string, clientName?: string): Promise<string> {
  if (!clientName) return "";

  const headers = {
    Authorization: `Bearer ${notionKey}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };

  const resp = await fetch(`${NOTION_API}/databases/${CLIENTES_DB_ID}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Nombre", title: { contains: clientName } },
          { property: "Activo", checkbox: { equals: true } },
        ],
      },
    }),
  });

  if (!resp.ok) return "";
  const data = await resp.json();
  if (!data.results?.length) return "";

  const client = data.results[0].properties;
  let text = "\n\nGUIDELINES ESPECÍFICOS DEL CLIENTE:";
  const fields = ["Industria", "Audiencia", "Palabras clave", "Palabras prohibidas", "Diferenciadores", "Objetivos"];

  for (const field of fields) {
    const val = client[field]?.rich_text?.[0]?.plain_text;
    if (val) text += `\n- ${field}: ${val}`;
  }

  const tono = client["Tono"]?.select?.name;
  if (tono) text += `\n- Tono del cliente: ${tono}`;

  return text;
}

async function saveToHistory(
  notionKey: string,
  data: { copyType: string; mode: string; originalText: string; result: string; clientName?: string }
) {
  try {
    const headers = {
      Authorization: `Bearer ${notionKey}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    };

    const typeMap: Record<string, string> = {
      social: "Redes Sociales",
      email: "Email",
      ad: "Ads",
      blog: "Blog",
    };

    // Truncate to 2000 chars (Notion limit for rich_text)
    const truncate = (s: string) => (s.length > 2000 ? s.slice(0, 1997) + "..." : s);

    await fetch(`${NOTION_API}/pages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        parent: { database_id: HISTORIAL_DB_ID },
        properties: {
          "Título": { title: [{ text: { content: `${data.mode === "review" ? "Revisión" : "Generación"} - ${typeMap[data.copyType] || data.copyType}` } }] },
          "Cliente": { rich_text: [{ text: { content: data.clientName || "General" } }] },
          "Tipo": { select: { name: typeMap[data.copyType] || "Redes Sociales" } },
          "Modo": { select: { name: data.mode === "review" ? "Revisión" : "Generación" } },
          "Copy Original": { rich_text: [{ text: { content: truncate(data.originalText) } }] },
          "Resultado IA": { rich_text: [{ text: { content: truncate(data.result) } }] },
          "Fecha": { date: { start: new Date().toISOString().split("T")[0] } },
        },
      }),
    });
  } catch (e) {
    console.error("Failed to save to history:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, mode, copyType, clientName, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");

    // Action: fetch guidelines for the UI panel
    if (action === "fetch-guidelines") {
      if (!NOTION_API_KEY) {
        return new Response(JSON.stringify({ guidelines: [], clients: [], clientDetails: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const notionHeaders = {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      };

      // Fetch tone rules
      const tonoResp = await fetch(`${NOTION_API}/databases/${TONO_DB_ID}/query`, {
        method: "POST",
        headers: notionHeaders,
        body: JSON.stringify({}),
      });

      const guidelines: Array<{ title: string; description: string; category: string; example: string }> = [];
      if (tonoResp.ok) {
        const tonoData = await tonoResp.json();
        for (const page of tonoData.results) {
          const props = page.properties;
          guidelines.push({
            title: props["Regla"]?.title?.[0]?.plain_text || "",
            description: props["Descripción"]?.rich_text?.[0]?.plain_text || "",
            category: props["Categoría"]?.select?.name || "",
            example: props["Ejemplo"]?.rich_text?.[0]?.plain_text || "",
          });
        }
      }

      // Fetch active clients
      const clientsResp = await fetch(`${NOTION_API}/databases/${CLIENTES_DB_ID}/query`, {
        method: "POST",
        headers: notionHeaders,
        body: JSON.stringify({ filter: { property: "Activo", checkbox: { equals: true } } }),
      });

      const clients: Array<{ name: string; industry: string; tone: string }> = [];
      let contextualizedGuidelines = guidelines;

      if (clientsResp.ok) {
        const clientsData = await clientsResp.json();
        for (const page of clientsData.results) {
          const props = page.properties;
          const name = props["Nombre"]?.title?.[0]?.plain_text || "";
          const industry = props["Industria"]?.rich_text?.[0]?.plain_text || "";
          const tone = props["Tono"]?.select?.name || "";
          clients.push({ name, industry, tone });

          // If selected client, build contextualized guidelines
          if (clientName && name.toLowerCase().includes(clientName.toLowerCase())) {
            const audience = props["Audiencia"]?.rich_text?.[0]?.plain_text || "";
            const keywords = props["Palabras clave"]?.rich_text?.[0]?.plain_text || "";
            const forbidden = props["Palabras prohibidas"]?.rich_text?.[0]?.plain_text || "";
            const differentiators = props["Diferenciadores"]?.rich_text?.[0]?.plain_text || "";
            const objectives = props["Objetivos"]?.rich_text?.[0]?.plain_text || "";

            // Build client-specific guidelines that replace the generic ones
            contextualizedGuidelines = [
              {
                title: `Tono: ${tone || "Sin definir"}`,
                description: `Para ${name}, usar tono ${tone?.toLowerCase() || "profesional"}. Audiencia principal: ${audience || "general"}.`,
                category: "Tono",
                example: "",
              },
              {
                title: "Palabras clave obligatorias",
                description: keywords || "Sin palabras clave definidas.",
                category: "Datos",
                example: "",
              },
              {
                title: "Palabras y enfoques prohibidos",
                description: forbidden || "Sin restricciones específicas.",
                category: "Prohibido",
                example: "",
              },
              {
                title: "Diferenciadores estratégicos",
                description: differentiators || "Sin diferenciadores definidos.",
                category: "Estructura",
                example: `Usar estos puntos como eje narrativo del copy.`,
              },
              {
                title: "Objetivos de comunicación",
                description: objectives || "Sin objetivos definidos.",
                category: "CTA",
                example: `Alinear cada CTA con estos objetivos.`,
              },
              // Keep the generic structural rules too
              ...guidelines.filter(g => g.category === "Estructura" || g.category === "CTA"),
            ];
          }
        }
      }

      return new Response(JSON.stringify({ guidelines: contextualizedGuidelines, clients }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Main copy coach flow
    const notionGuidelines = NOTION_API_KEY
      ? await fetchNotionGuidelines(NOTION_API_KEY, copyType)
      : `GUIDELINES DE MARCA KIMEDIA:
- Tono: Profesional pero cercano. Nunca frío ni corporativo.
- Pilares: Reputación digital, estrategia basada en datos, resultados medibles.
- Estructura ideal: Hook → Problema → Solución → CTA
- Frases cortas y directas. Máximo 3 líneas por párrafo.
- Evitar: superlativos vacíos, promesas sin respaldo, jerga técnica excesiva.
- Usar datos cuando sea posible.
- CTAs específicos y orientados a acción.`;

    const clientGuidelines = NOTION_API_KEY && clientName
      ? await fetchClientGuidelines(NOTION_API_KEY, clientName)
      : "";

    const basePromptReview = `Eres el Copy Coach interno de KiMedia, una agencia digital mexicana. Tu trabajo es analizar copy y dar feedback accionable.

${notionGuidelines}${clientGuidelines}

FORMATO DE RESPUESTA:
Responde en español con markdown. Incluye:
## ✅ Lo que funciona
## ⚠️ Áreas de mejora  
## 💡 Sugerencias concretas
## Score de marca: X/10

Sé directo, específico y da ejemplos de reescritura cuando sea posible.`;

    const basePromptGenerate = `Eres el Copy Coach interno de KiMedia, una agencia digital mexicana. Tu trabajo es generar copy alineado con la marca.

${notionGuidelines}${clientGuidelines}

FORMATO DE RESPUESTA:
Responde en español con markdown. Genera:
- Variante A (principal)
- Variante B (alternativa con enfoque diferente)
- 3 opciones de CTA
- Hashtags sugeridos si aplica

Adapta el tono y extensión al tipo de copy solicitado.`;

    const systemPrompt = mode === "review" ? basePromptReview : basePromptGenerate;
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

    // Save to history in background (non-blocking)
    if (NOTION_API_KEY) {
      // We can't easily save streamed result, but we save the input
      saveToHistory(NOTION_API_KEY, {
        copyType,
        mode,
        originalText: text,
        result: "(streaming - ver resultado en la app)",
        clientName,
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
