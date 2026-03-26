export const pymeIndustryOptions = [
  "Alimentos y bebidas",
  "Comercio minorista",
  "Servicios profesionales",
  "Tecnología",
  "Salud y bienestar",
  "Educación",
  "Construcción",
  "Manufactura",
  "Turismo y hospitalidad",
  "Belleza y cuidado personal",
  "Automotriz",
  "Agropecuario",
  "Logística y transporte",
  "Otro",
];

export const companySizeOptions = [
  { value: "1", label: "Solo yo (freelancer)" },
  { value: "2-5", label: "2 a 5 empleados" },
  { value: "6-15", label: "6 a 15 empleados" },
  { value: "16-50", label: "16 a 50 empleados" },
  { value: "50+", label: "Más de 50 empleados" },
];

export const yearsOptions = [
  { value: "menos-1", label: "Menos de 1 año" },
  { value: "1-3", label: "1 a 3 años" },
  { value: "3-5", label: "3 a 5 años" },
  { value: "5-10", label: "5 a 10 años" },
  { value: "10+", label: "Más de 10 años" },
];

export const pymeChannelOptions = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google-business", label: "Google Business" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp-business", label: "WhatsApp Business" },
  { value: "linkedin", label: "LinkedIn" },
];

export const pymeToneOptions = [
  { value: "corporativo", label: "Corporativo", desc: "Formal, confiable, institucional" },
  { value: "cercano", label: "Cercano", desc: "Amigable, accesible, familiar" },
  { value: "innovador", label: "Innovador", desc: "Moderno, disruptivo, fresco" },
  { value: "experto", label: "Experto", desc: "Autoridad, especialista, técnico" },
];

export const pymeGoalOptions = [
  "Aumentar ventas y clientes nuevos",
  "Posicionar la marca en mi mercado local",
  "Lanzar un nuevo producto o servicio",
  "Fidelizar clientes actuales",
  "Expandir a nuevos mercados o canales",
];

export const pymeDiagnosticQuestions = [
  {
    id: 1,
    question: "¿Tu empresa tiene una identidad visual consistente (logo, colores, tipografía)?",
    options: [
      { label: "No tenemos identidad visual definida", value: 0 },
      { label: "Tenemos logo pero no es consistente", value: 1 },
      { label: "Sí, identidad visual profesional y consistente", value: 2 },
    ],
  },
  {
    id: 2,
    question: "¿Tienen un perfil de empresa actualizado en redes sociales?",
    options: [
      { label: "No tenemos perfiles o están abandonados", value: 0 },
      { label: "Tenemos pero no están completos ni actualizados", value: 1 },
      { label: "Sí, perfiles completos con información vigente", value: 2 },
    ],
  },
  {
    id: 3,
    question: "¿Publican contenido sobre sus productos o servicios regularmente?",
    options: [
      { label: "Nunca o casi nunca", value: 0 },
      { label: "De vez en cuando, sin calendario", value: 1 },
      { label: "Sí, con una frecuencia definida", value: 2 },
    ],
  },
  {
    id: 4,
    question: "¿Han recibido clientes o ventas directamente de redes sociales?",
    options: [
      { label: "No, nunca", value: 0 },
      { label: "Alguna vez de forma esporádica", value: 1 },
      { label: "Sí, es un canal de ventas activo", value: 2 },
    ],
  },
  {
    id: 5,
    question: "¿Responden mensajes y comentarios de clientes en redes?",
    options: [
      { label: "Rara vez o nunca", value: 0 },
      { label: "A veces, cuando podemos", value: 1 },
      { label: "Siempre, en menos de 24 horas", value: 2 },
    ],
  },
  {
    id: 6,
    question: "¿Conocen a su competencia digital y cómo se posicionan?",
    options: [
      { label: "No sabemos qué hace la competencia en digital", value: 0 },
      { label: "Tenemos idea general pero sin análisis", value: 1 },
      { label: "Sí, monitoreamos y nos diferenciamos activamente", value: 2 },
    ],
  },
  {
    id: 7,
    question: "¿Tienen una estrategia de contenido definida?",
    options: [
      { label: "No, publicamos lo que se nos ocurre", value: 0 },
      { label: "Tenemos ideas pero sin estructura formal", value: 1 },
      { label: "Sí, con pilares de contenido y calendario", value: 2 },
    ],
  },
  {
    id: 8,
    question: "¿Utilizan promociones, ofertas o campañas en redes?",
    options: [
      { label: "Nunca hemos hecho", value: 0 },
      { label: "Alguna vez, sin medir resultados", value: 1 },
      { label: "Sí, con frecuencia y midiendo impacto", value: 2 },
    ],
  },
  {
    id: 9,
    question: "¿Miden los resultados de su presencia digital (métricas)?",
    options: [
      { label: "No medimos nada", value: 0 },
      { label: "Vemos los likes pero no analizamos a fondo", value: 1 },
      { label: "Sí, revisamos alcance, engagement y conversiones", value: 2 },
    ],
  },
  {
    id: 10,
    question: "¿Tienen un sitio web o tienda en línea funcional?",
    options: [
      { label: "No tenemos presencia web", value: 0 },
      { label: "Tenemos una página básica o desactualizada", value: 1 },
      { label: "Sí, sitio web profesional y optimizado", value: 2 },
    ],
  },
  // --- Nuevas preguntas alineadas con el Motor de Contenido ---
  {
    id: 11,
    question: "¿Invierten en publicidad digital (Facebook Ads, Google Ads, etc.)?",
    options: [
      { label: "No invertimos en pauta digital", value: 0 },
      { label: "Hemos probado pero sin medir retorno", value: 1 },
      { label: "Sí, con presupuesto definido y seguimiento de ROI", value: 2 },
    ],
  },
  {
    id: 12,
    question: "¿Tienen su ficha de Google Business Profile actualizada?",
    options: [
      { label: "No la tenemos o no sabemos qué es", value: 0 },
      { label: "La tenemos pero no la actualizamos", value: 1 },
      { label: "Sí, con fotos, reseñas y publicaciones regulares", value: 2 },
    ],
  },
  {
    id: 13,
    question: "¿Varían los formatos de contenido (fotos, videos, carruseles, stories)?",
    options: [
      { label: "Solo publicamos fotos con texto", value: 0 },
      { label: "A veces probamos video o stories", value: 1 },
      { label: "Usamos múltiples formatos adaptados a cada plataforma", value: 2 },
    ],
  },
  {
    id: 14,
    question: "¿Tienen un tono de comunicación definido para la marca?",
    options: [
      { label: "Cada quien escribe como quiere", value: 0 },
      { label: "Hay una idea general pero no está documentada", value: 1 },
      { label: "Sí, tenemos lineamientos claros de voz y tono", value: 2 },
    ],
  },
  {
    id: 15,
    question: "¿Capturan datos de clientes potenciales (email, WhatsApp, formularios)?",
    options: [
      { label: "No capturamos datos de prospectos", value: 0 },
      { label: "Tenemos WhatsApp pero sin base de datos organizada", value: 1 },
      { label: "Sí, con formularios, base de datos y seguimiento", value: 2 },
    ],
  },
];

export function getPymeDiagnosticLevel(score: number) {
  // Max score = 15 preguntas × 2 = 30
  if (score <= 9) {
    return {
      level: "rojo",
      color: "bg-red-500",
      label: "Presencia digital en construcción",
      message: "Tu empresa necesita construir su presencia digital desde cero. ¡Este kit te dará las bases!",
    };
  }
  if (score <= 19) {
    return {
      level: "amarillo",
      color: "bg-yellow-500",
      label: "Presencia digital en desarrollo",
      message: "Ya tienen algo de presencia pero falta estrategia y consistencia. Este kit les dará dirección.",
    };
  }
  return {
    level: "verde",
    color: "bg-green-500",
    label: "Presencia digital sólida",
    message: "¡Excelente! Su empresa ya tiene buena presencia. Vamos a optimizarla para maximizar resultados.",
  };
}

export function generatePymeBio(
  companyName: string,
  industry: string,
  valueProposition: string,
  targetAudience: string,
  tone: string
): string {
  const toneEmoji: Record<string, string> = {
    corporativo: "🏢",
    cercano: "🤝",
    innovador: "🚀",
    experto: "🎯",
  };
  const emoji = toneEmoji[tone] || "🏢";

  return `${companyName}\n${industry}\n${emoji} ${valueProposition}\nSoluciones para ${targetAudience.toLowerCase()}\n📍 Contáctanos · 📩 Cotizaciones`;
}

export const pymePostTemplates = {
  producto: {
    hook: "¿Sabías que {valueProposition}?",
    body: "En {companyName} nos especializamos en ofrecer {industry} de calidad. Lo que nos hace diferentes: {differentiator}.",
    cta: "¿Quieres saber más? Escríbenos por DM o visita nuestro perfil 👇",
  },
  caso: {
    hook: "Así ayudamos a uno de nuestros clientes:",
    body: "En {companyName} entendemos las necesidades de {audience}. Por eso creamos soluciones que {valueProposition}. {differentiator}.",
    cta: "¿Tu negocio necesita algo similar? ¡Platiquemos! 💬",
  },
  tips: {
    hook: "3 errores que cometen las empresas de {industry}:",
    body: "1️⃣ No definir su audiencia objetivo\n2️⃣ Publicar sin estrategia\n3️⃣ No medir resultados\n\nEn {companyName} te ayudamos a evitarlos.",
    cta: "Guarda este post y compártelo con otros empresarios 📌",
  },
};

export function generatePymePost(
  type: keyof typeof pymePostTemplates,
  companyName: string,
  industry: string,
  valueProposition: string,
  targetAudience: string,
  differentiator: string
): string {
  const template = pymePostTemplates[type];
  const text = `${template.hook}\n\n${template.body}\n\n${template.cta}`;
  return text
    .replace(/{companyName}/g, companyName)
    .replace(/{industry}/g, industry.toLowerCase())
    .replace(/{valueProposition}/g, valueProposition.toLowerCase())
    .replace(/{audience}/g, targetAudience.toLowerCase())
    .replace(/{differentiator}/g, differentiator.toLowerCase());
}
