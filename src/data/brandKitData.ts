export const channelOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
];

export const followerRanges = [
  "Menos de 500",
  "500 – 2,000",
  "2,000 – 10,000",
  "10,000 – 50,000",
  "Más de 50,000",
];

export const industryOptions = [
  "Tecnología",
  "Salud y bienestar",
  "Educación",
  "Finanzas y negocios",
  "Marketing y publicidad",
  "Arte y diseño",
  "Consultoría",
  "Gastronomía",
  "Fitness y deporte",
  "Moda y belleza",
  "Legal",
  "Construcción e inmobiliaria",
  "Otro",
];

export const toneOptions = [
  { value: "profesional", label: "Profesional", desc: "Serio, confiable, experto" },
  { value: "cercano", label: "Cercano", desc: "Amigable, accesible, humano" },
  { value: "inspirador", label: "Inspirador", desc: "Motivador, visionario" },
  { value: "educativo", label: "Educativo", desc: "Didáctico, informativo" },
];

export const frequencyOptions = [
  { value: "nunca", label: "Nunca o casi nunca" },
  { value: "mensual", label: "Unas pocas veces al mes" },
  { value: "semanal", label: "1-3 veces por semana" },
  { value: "diario", label: "Casi todos los días" },
];

export const perceptionOptions = [
  "Experto en mi tema",
  "Accesible y confiable",
  "Poco visible o desconocido",
  "Activo pero sin estrategia clara",
  "Referente en mi industria",
];

export const goalOptions = [
  "Conseguir más clientes o proyectos",
  "Posicionarme como referente en mi industria",
  "Crear una comunidad alrededor de mi marca",
  "Lanzar un producto o servicio nuevo",
  "Aumentar mi visibilidad profesional",
];

export const diagnosticQuestions = [
  {
    id: 1,
    question: "¿Tienes una foto profesional consistente en tus redes?",
    options: [
      { label: "No tengo foto profesional", value: 0 },
      { label: "Tengo pero no es consistente entre redes", value: 1 },
      { label: "Sí, uso la misma imagen profesional en todas", value: 2 },
    ],
  },
  {
    id: 2,
    question: "¿Tu bio comunica claramente qué haces y a quién ayudas?",
    options: [
      { label: "No tengo bio o es muy genérica", value: 0 },
      { label: "Dice qué hago pero no a quién ayudo", value: 1 },
      { label: "Sí, es clara sobre mi expertise y audiencia", value: 2 },
    ],
  },
  {
    id: 3,
    question: "¿Tu contenido refleja tu expertise profesional?",
    options: [
      { label: "Publico cosas personales sin estrategia", value: 0 },
      { label: "A veces comparto contenido profesional", value: 1 },
      { label: "Mi contenido demuestra conocimiento consistentemente", value: 2 },
    ],
  },
  {
    id: 4,
    question: "¿Te han contactado clientes o colaboradores por tus redes?",
    options: [
      { label: "Nunca", value: 0 },
      { label: "Alguna vez", value: 1 },
      { label: "Sí, con frecuencia", value: 2 },
    ],
  },
  {
    id: 5,
    question: "¿Interactúas con tu audiencia (respondes comentarios, DMs)?",
    options: [
      { label: "Casi nunca", value: 0 },
      { label: "A veces", value: 1 },
      { label: "Siempre o casi siempre", value: 2 },
    ],
  },
  {
    id: 6,
    question: "¿Tienes un estilo visual consistente (colores, tipografía, formato)?",
    options: [
      { label: "No, cada post es diferente", value: 0 },
      { label: "Intento mantener algo de consistencia", value: 1 },
      { label: "Sí, mi feed tiene identidad visual clara", value: 2 },
    ],
  },
  {
    id: 7,
    question: "¿Planificas tu contenido con anticipación?",
    options: [
      { label: "No, publico cuando se me ocurre", value: 0 },
      { label: "Tengo ideas pero sin calendario", value: 1 },
      { label: "Sí, planifico al menos 1 semana antes", value: 2 },
    ],
  },
  {
    id: 8,
    question: "¿Compartes testimonios, casos de éxito o resultados?",
    options: [
      { label: "Nunca lo he hecho", value: 0 },
      { label: "Rara vez", value: 1 },
      { label: "Sí, es parte de mi estrategia", value: 2 },
    ],
  },
  {
    id: 9,
    question: "¿Revisas las métricas de tus publicaciones?",
    options: [
      { label: "Nunca reviso estadísticas", value: 0 },
      { label: "A veces veo los likes", value: 1 },
      { label: "Sí, analizo alcance, guardados e interacción", value: 2 },
    ],
  },
  {
    id: 10,
    question: "¿Tu presencia digital te ha generado oportunidades concretas?",
    options: [
      { label: "No, ninguna", value: 0 },
      { label: "Algunas indirectas", value: 1 },
      { label: "Sí, clientes, invitaciones o colaboraciones", value: 2 },
    ],
  },
  // --- Nuevas preguntas alineadas con el Motor de Contenido ---
  {
    id: 11,
    question: "¿Tienes definidos tus pilares de contenido (temas clave que comunicas)?",
    options: [
      { label: "No sé qué son pilares de contenido", value: 0 },
      { label: "Tengo temas pero no están formalizados", value: 1 },
      { label: "Sí, tengo 3-5 pilares claros que guían todo mi contenido", value: 2 },
    ],
  },
  {
    id: 12,
    question: "¿Varías los formatos de tu contenido (carruseles, reels, stories, texto largo)?",
    options: [
      { label: "Solo publico un tipo de formato", value: 0 },
      { label: "A veces pruebo algo diferente", value: 1 },
      { label: "Uso varios formatos según la plataforma y el objetivo", value: 2 },
    ],
  },
  {
    id: 13,
    question: "¿Defines el tono de tu comunicación de forma intencional?",
    options: [
      { label: "No he pensado en mi tono de voz", value: 0 },
      { label: "Tengo una idea pero no es consistente", value: 1 },
      { label: "Sí, tengo un tono definido (profesional, educativo, cercano, etc.)", value: 2 },
    ],
  },
  {
    id: 14,
    question: "¿Incluyes llamados a la acción (CTAs) claros en tus publicaciones?",
    options: [
      { label: "Nunca o no sé qué es un CTA", value: 0 },
      { label: "A veces pido que comenten o compartan", value: 1 },
      { label: "Cada post tiene un CTA estratégico según su objetivo", value: 2 },
    ],
  },
  {
    id: 15,
    question: "¿Investigas tendencias o temas relevantes antes de crear contenido?",
    options: [
      { label: "No, publico lo que se me ocurre en el momento", value: 0 },
      { label: "A veces veo qué está de moda", value: 1 },
      { label: "Investigo tendencias y las adapto a mi marca regularmente", value: 2 },
    ],
  },
];

export function getDiagnosticLevel(score: number): {
  level: string;
  color: string;
  label: string;
  message: string;
} {
  // Max score = 15 preguntas × 2 = 30
  if (score <= 9) {
    return {
      level: "rojo",
      color: "bg-red-500",
      label: "Marca en construcción",
      message:
        "Tu marca personal está en fase inicial. ¡Este es el momento perfecto para construirla con estrategia! Sigue adelante.",
    };
  }
  if (score <= 19) {
    return {
      level: "amarillo",
      color: "bg-yellow-500",
      label: "Marca en desarrollo",
      message:
        "Ya tienes bases pero necesitas más consistencia y estrategia. Este kit te ayudará a dar el salto.",
    };
  }
  return {
    level: "verde",
    color: "bg-green-500",
    label: "Marca posicionada",
    message:
      "¡Excelente! Tu marca personal es sólida. Vamos a optimizarla para que genere aún más oportunidades.",
  };
}

export function generateBrandBio(
  name: string,
  profession: string,
  industry: string,
  valueProposition: string,
  targetAudience: string,
  tone: string
): string {
  const toneEmoji: Record<string, string> = {
    profesional: "💼",
    cercano: "🤝",
    inspirador: "✨",
    educativo: "📚",
  };
  const emoji = toneEmoji[tone] || "💼";

  return `${name}\n${profession} | ${industry}\n${emoji} ${valueProposition}\nAyudo a ${targetAudience.toLowerCase()}\n📩 Contacto / Colaboraciones`;
}

export const postTemplates = {
  expertise: {
    hook: "Lo que nadie te dice sobre {industry}:",
    body: "Después de años como {profession}, descubrí que {valueProposition}. La mayoría comete el error de [error común]. Aquí te comparto lo que realmente funciona.",
    cta: "¿Te ha pasado? Cuéntame en los comentarios 👇",
  },
  historia: {
    hook: "Empecé desde cero. Hoy ayudo a {audience} a transformar su realidad.",
    body: "Mi camino como {profession} no fue fácil. Pero cada obstáculo me enseñó algo: {differentiator}. Hoy eso es lo que me diferencia.",
    cta: "Si te identificas con esta historia, sígueme para más contenido como este 🙌",
  },
  valor: {
    hook: "3 cosas que desearía haber sabido antes en {industry}:",
    body: "1️⃣ {valueProposition}\n2️⃣ La consistencia le gana al talento\n3️⃣ Tu red de contactos es tu activo más valioso",
    cta: "Guarda este post y compártelo con alguien que lo necesite 📌",
  },
};

export function generateBrandPost(
  type: keyof typeof postTemplates,
  profession: string,
  industry: string,
  valueProposition: string,
  targetAudience: string,
  differentiator: string
): string {
  const template = postTemplates[type];
  const text = `${template.hook}\n\n${template.body}\n\n${template.cta}`;
  return text
    .replace(/{profession}/g, profession.toLowerCase())
    .replace(/{industry}/g, industry.toLowerCase())
    .replace(/{valueProposition}/g, valueProposition.toLowerCase())
    .replace(/{audience}/g, targetAudience.toLowerCase())
    .replace(/{differentiator}/g, differentiator.toLowerCase());
}
