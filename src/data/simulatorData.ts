export type SimMode = "personal" | "pyme";

export interface SimChallenge {
  id: string;
  round: number;
  scenario: string;
  objective: string;
  platform: "instagram" | "linkedin" | "twitter" | "tiktok";
  tips: string[];
  mode: SimMode;
}

export interface SimMetrics {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement: number; // 0-100
  feedback: string;
  suggestions: string[];
  tone: "positive" | "neutral" | "negative";
}

export interface SimRoundResult {
  challenge: SimChallenge;
  userPost: string;
  metrics: SimMetrics;
}

export const platformIcons: Record<string, string> = {
  instagram: "📸",
  linkedin: "💼",
  twitter: "🐦",
  tiktok: "🎵",
};

export const platformNames: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  tiktok: "TikTok",
};

export const personalChallenges: SimChallenge[] = [
  {
    id: "p1",
    round: 1,
    scenario: "Acabas de terminar un proyecto importante y quieres compartirlo con tu audiencia para posicionarte como experto.",
    objective: "Crea un post que muestre tu logro sin sonar presuntuoso, pero que genere autoridad.",
    platform: "linkedin",
    tips: ["Cuenta la historia del proyecto, no solo el resultado", "Menciona qué aprendiste", "Incluye un dato concreto"],
    mode: "personal",
  },
  {
    id: "p2",
    round: 2,
    scenario: "Un seguidor te hizo una pregunta interesante sobre tu campo de expertise. Quieres responder públicamente para educar a toda tu audiencia.",
    objective: "Escribe un post educativo que responda la pregunta y te posicione como referente.",
    platform: "instagram",
    tips: ["Empieza con la pregunta como gancho", "Usa un lenguaje simple y directo", "Termina con un CTA que invite a más preguntas"],
    mode: "personal",
  },
  {
    id: "p3",
    round: 3,
    scenario: "Es lunes por la mañana y quieres motivar a tu comunidad con una reflexión personal sobre tu trayectoria profesional.",
    objective: "Crea un post vulnerable y auténtico que genere conexión emocional.",
    platform: "twitter",
    tips: ["La vulnerabilidad genera engagement", "Comparte un fracaso y cómo lo superaste", "Sé breve y contundente"],
    mode: "personal",
  },
  {
    id: "p4",
    round: 4,
    scenario: "Lanzas un nuevo servicio/producto y necesitas generar expectativa sin hacer un pitch de ventas directo.",
    objective: "Crea contenido que genere curiosidad y anticipe tu lanzamiento.",
    platform: "instagram",
    tips: ["No vendas, cuenta una historia", "Usa el formato 'antes vs después'", "Genera urgencia sutil"],
    mode: "personal",
  },
  {
    id: "p5",
    round: 5,
    scenario: "Quieres hacer un post tipo 'detrás de cámaras' mostrando tu proceso de trabajo para humanizar tu marca personal.",
    objective: "Muestra tu proceso real de trabajo de forma interesante y relatable.",
    platform: "tiktok",
    tips: ["Lo imperfecto vende autenticidad", "Muestra el caos creativo real", "Conecta el proceso con el valor que entregas"],
    mode: "personal",
  },
];

export const pymeChallenges: SimChallenge[] = [
  {
    id: "e1",
    round: 1,
    scenario: "Tu negocio acaba de cumplir un año. Quieres celebrar con tu comunidad y agradecer a tus clientes.",
    objective: "Crea un post de aniversario que sea emotivo y refuerce los valores de tu marca.",
    platform: "instagram",
    tips: ["Comparte números reales (clientes, productos, etc.)", "Agradece de forma genuina", "Invita a la comunidad a celebrar contigo"],
    mode: "pyme",
  },
  {
    id: "e2",
    round: 2,
    scenario: "Un cliente te dejó una reseña increíble. Quieres compartirla como prueba social sin que parezca un anuncio.",
    objective: "Transforma un testimonio en contenido orgánico y creíble.",
    platform: "linkedin",
    tips: ["Cuenta la historia del cliente, no solo la reseña", "Humaniza con detalles reales", "Conecta con el problema que resolviste"],
    mode: "pyme",
  },
  {
    id: "e3",
    round: 3,
    scenario: "Quieres educar a tu audiencia sobre un error común que cometen al usar tu tipo de producto/servicio.",
    objective: "Crea contenido educativo que posicione a tu marca como autoridad en el tema.",
    platform: "twitter",
    tips: ["Usa el formato 'mito vs realidad'", "Sé directo y práctico", "Ofrece la solución, no solo señales el problema"],
    mode: "pyme",
  },
  {
    id: "e4",
    round: 4,
    scenario: "Es temporada baja y necesitas reactivar las ventas sin hacer descuentos agresivos que devalúen tu marca.",
    objective: "Crea una campaña de contenido que genere deseo y urgencia de forma elegante.",
    platform: "instagram",
    tips: ["Usa escasez real, no artificial", "Resalta el valor, no el precio", "Cuenta historias de transformación de clientes"],
    mode: "pyme",
  },
  {
    id: "e5",
    round: 5,
    scenario: "Quieres presentar a tu equipo de trabajo para humanizar tu marca y generar confianza.",
    objective: "Muestra el lado humano de tu empresa de forma divertida y auténtica.",
    platform: "tiktok",
    tips: ["Deja que tu equipo muestre su personalidad", "Usa humor ligero", "Conecta cada persona con su impacto en el cliente"],
    mode: "pyme",
  },
];

export function shuffleChallenges(challenges: SimChallenge[]): SimChallenge[] {
  const shuffled = [...challenges].sort(() => Math.random() - 0.5);
  return shuffled.map((c, i) => ({ ...c, round: i + 1 }));
}

export interface SimLevel {
  title: string;
  emoji: string;
  message: string;
  color: string;
}

export function getSimLevel(avgEngagement: number): SimLevel {
  if (avgEngagement >= 75) {
    return {
      title: "Social Media Pro",
      emoji: "🏆",
      message: "¡Tienes instinto de comunicador nato! Tu contenido genera conexión real con la audiencia. Estás listo para escalar tu presencia digital.",
      color: "from-amber-400 to-yellow-600",
    };
  }
  if (avgEngagement >= 50) {
    return {
      title: "Estratega Digital",
      emoji: "⚡",
      message: "Buen ojo para el contenido. Entiendes qué funciona en redes, pero puedes refinar tu tono y estrategia para maximizar resultados.",
      color: "from-coral to-coral-light",
    };
  }
  return {
    title: "Explorador Digital",
    emoji: "🌱",
    message: "Estás aprendiendo los fundamentos del contenido digital. Con práctica y las estrategias correctas, tu marca puede despegar.",
    color: "from-cyan to-blue-400",
  };
}
