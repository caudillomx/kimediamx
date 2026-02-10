import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    if (!NOTION_API_KEY) throw new Error("NOTION_API_KEY is not configured");

    const { pageId } = await req.json();
    if (!pageId) throw new Error("pageId is required");

    const headers = {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    };

    // 1. Create "Clientes" database
    const clientesDb = await fetch(`${NOTION_API}/databases`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        parent: { type: "page_id", page_id: pageId },
        title: [{ type: "text", text: { content: "📋 Clientes" } }],
        properties: {
          "Nombre": { title: {} },
          "Industria": { rich_text: {} },
          "Audiencia": { rich_text: {} },
          "Tono": {
            select: {
              options: [
                { name: "Profesional", color: "blue" },
                { name: "Cercano", color: "green" },
                { name: "Audaz", color: "red" },
                { name: "Institucional", color: "purple" },
                { name: "Inspirador", color: "orange" },
              ],
            },
          },
          "Palabras clave": { rich_text: {} },
          "Palabras prohibidas": { rich_text: {} },
          "Diferenciadores": { rich_text: {} },
          "Objetivos": { rich_text: {} },
          "Activo": { checkbox: {} },
        },
      }),
    });

    if (!clientesDb.ok) {
      const err = await clientesDb.text();
      console.error("Error creating Clientes DB:", err);
      throw new Error(`Failed to create Clientes DB: ${err}`);
    }
    const clientesData = await clientesDb.json();

    // 2. Create "Tono y Voz" database
    const tonoDb = await fetch(`${NOTION_API}/databases`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        parent: { type: "page_id", page_id: pageId },
        title: [{ type: "text", text: { content: "🎨 Tono y Voz" } }],
        properties: {
          "Regla": { title: {} },
          "Categoría": {
            select: {
              options: [
                { name: "Estructura", color: "blue" },
                { name: "Tono", color: "green" },
                { name: "Prohibido", color: "red" },
                { name: "CTA", color: "orange" },
                { name: "Datos", color: "purple" },
              ],
            },
          },
          "Descripción": { rich_text: {} },
          "Ejemplo": { rich_text: {} },
          "Aplica a": {
            multi_select: {
              options: [
                { name: "General", color: "gray" },
                { name: "Redes Sociales", color: "blue" },
                { name: "Email", color: "green" },
                { name: "Ads", color: "red" },
                { name: "Blog", color: "orange" },
              ],
            },
          },
        },
      }),
    });

    if (!tonoDb.ok) {
      const err = await tonoDb.text();
      console.error("Error creating Tono DB:", err);
      throw new Error(`Failed to create Tono DB: ${err}`);
    }
    const tonoData = await tonoDb.json();

    // Add default tone rules
    const defaultRules = [
      {
        regla: "Hook primero",
        categoria: "Estructura",
        descripcion: "Siempre iniciar con un gancho que atrape la atención en la primera línea.",
        ejemplo: "El 93% de los consumidores leen reseñas antes de comprar. ¿Tú las estás gestionando?",
        aplica: ["General"],
      },
      {
        regla: "Profesional pero cercano",
        categoria: "Tono",
        descripcion: "Nunca frío ni corporativo. Hablar como un experto accesible.",
        ejemplo: "En lugar de 'Implementamos soluciones digitales', usar 'Te ayudamos a que tu marca hable por ti'",
        aplica: ["General"],
      },
      {
        regla: "Sin superlativos vacíos",
        categoria: "Prohibido",
        descripcion: "Evitar 'el mejor', 'líder', 'número uno' sin respaldo de datos.",
        ejemplo: "En lugar de 'Somos los mejores', usar 'Hemos ayudado a 50+ marcas a crecer su reputación digital'",
        aplica: ["General"],
      },
      {
        regla: "CTA específico",
        categoria: "CTA",
        descripcion: "Llamados a la acción claros y orientados a una acción concreta.",
        ejemplo: "En lugar de 'Contáctanos', usar 'Agenda tu diagnóstico gratuito'",
        aplica: ["General"],
      },
      {
        regla: "Usar datos reales",
        categoria: "Datos",
        descripcion: "Incluir estadísticas y datos verificables para reforzar mensajes.",
        ejemplo: "93% de consumidores leen reseñas online. 88% confían tanto en reseñas como en recomendaciones.",
        aplica: ["General"],
      },
      {
        regla: "Frases cortas",
        categoria: "Estructura",
        descripcion: "Máximo 3 líneas por párrafo. Frases directas y sin rodeos.",
        ejemplo: "Tu reputación digital es tu activo más valioso. Protégela.",
        aplica: ["Redes Sociales", "Ads"],
      },
    ];

    for (const rule of defaultRules) {
      await fetch(`${NOTION_API}/pages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          parent: { database_id: tonoData.id },
          properties: {
            "Regla": { title: [{ text: { content: rule.regla } }] },
            "Categoría": { select: { name: rule.categoria } },
            "Descripción": { rich_text: [{ text: { content: rule.descripcion } }] },
            "Ejemplo": { rich_text: [{ text: { content: rule.ejemplo } }] },
            "Aplica a": { multi_select: rule.aplica.map((a) => ({ name: a })) },
          },
        }),
      });
    }

    // 3. Create "Historial de Copys" database
    const historialDb = await fetch(`${NOTION_API}/databases`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        parent: { type: "page_id", page_id: pageId },
        title: [{ type: "text", text: { content: "📝 Historial de Copys" } }],
        properties: {
          "Título": { title: {} },
          "Cliente": { rich_text: {} },
          "Tipo": {
            select: {
              options: [
                { name: "Redes Sociales", color: "blue" },
                { name: "Email", color: "green" },
                { name: "Ads", color: "red" },
                { name: "Blog", color: "orange" },
              ],
            },
          },
          "Modo": {
            select: {
              options: [
                { name: "Revisión", color: "blue" },
                { name: "Generación", color: "green" },
              ],
            },
          },
          "Score": { number: {} },
          "Copy Original": { rich_text: {} },
          "Resultado IA": { rich_text: {} },
          "Fecha": { date: {} },
        },
      }),
    });

    if (!historialDb.ok) {
      const err = await historialDb.text();
      console.error("Error creating Historial DB:", err);
      throw new Error(`Failed to create Historial DB: ${err}`);
    }
    const historialData = await historialDb.json();

    return new Response(
      JSON.stringify({
        success: true,
        databases: {
          clientes: clientesData.id,
          tono: tonoData.id,
          historial: historialData.id,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("notion-setup error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
