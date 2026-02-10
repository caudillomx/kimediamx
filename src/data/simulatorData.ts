export type SimMode = "personal" | "pyme";

export interface SimUserProfile {
  industry: string;
  audience: string;
  tone: string;
  experience: "beginner" | "intermediate" | "advanced";
}

export interface SimChallenge {
  id: string;
  round: number;
  scenario: string;
  objective: string;
  platform: "instagram" | "linkedin" | "twitter" | "tiktok";
  tips: string[];
  mode: SimMode;
  requiresVisual?: boolean;
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
  visualFeedback?: string;
}

export interface SimRoundResult {
  challenge: SimChallenge;
  userPost: string;
  visualDescription?: string;
  metrics: SimMetrics;
}

export function isVisualPlatform(platform: string): boolean {
  return platform === "instagram" || platform === "tiktok";
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
    requiresVisual: true,
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
    requiresVisual: true,
  },
  {
    id: "p5",
    round: 5,
    scenario: "Quieres hacer un post tipo 'detrás de cámaras' mostrando tu proceso de trabajo para humanizar tu marca personal.",
    objective: "Muestra tu proceso real de trabajo de forma interesante y relatable.",
    platform: "tiktok",
    tips: ["Lo imperfecto vende autenticidad", "Muestra el caos creativo real", "Conecta el proceso con el valor que entregas"],
    mode: "personal",
    requiresVisual: true,
  },
  // Expanded bank
  {
    id: "p6",
    round: 6,
    scenario: "Viste una tendencia viral en tu industria y quieres dar tu opinión profesional con un take caliente.",
    objective: "Crea un post de opinión que genere debate y posicione tu criterio.",
    platform: "twitter",
    tips: ["Abre con una afirmación atrevida", "Respalda con tu experiencia", "Invita a la conversación"],
    mode: "personal",
  },
  {
    id: "p7",
    round: 7,
    scenario: "Es viernes y quieres compartir 3 herramientas o recursos gratuitos que usas en tu trabajo diario.",
    objective: "Genera valor tangible para tu audiencia con contenido práctico.",
    platform: "linkedin",
    tips: ["Listas funcionan muy bien en LinkedIn", "Explica brevemente por qué cada herramienta", "Pide que compartan las suyas"],
    mode: "personal",
  },
  {
    id: "p8",
    round: 8,
    scenario: "Un cliente te envió un mensaje de agradecimiento por el impacto de tu trabajo. Quieres compartirlo.",
    objective: "Transforma un testimonio en prueba social sin que parezca autopromoción.",
    platform: "instagram",
    tips: ["Cuenta la historia del cliente", "Muestra el antes y después", "Agradece genuinamente"],
    mode: "personal",
    requiresVisual: true,
  },
  {
    id: "p9",
    round: 9,
    scenario: "Quieres hacer un reel/TikTok educativo tipo 'cosas que nadie te dice sobre [tu industria]'.",
    objective: "Crea un guion corto que enganche en los primeros 3 segundos.",
    platform: "tiktok",
    tips: ["El hook de los primeros 3 segundos es todo", "Usa formato lista", "Cierra con un plot twist o dato sorprendente"],
    mode: "personal",
    requiresVisual: true,
  },
  {
    id: "p10",
    round: 10,
    scenario: "Quieres crear un hilo (thread) contando la historia de cómo empezaste en tu carrera profesional.",
    objective: "Escribe el primer tweet de un hilo que haga que la gente quiera leer todo.",
    platform: "twitter",
    tips: ["El primer tweet debe funcionar solo", "Promete valor concreto", "Usa números: '5 lecciones...'"],
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
    requiresVisual: true,
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
    requiresVisual: true,
  },
  {
    id: "e5",
    round: 5,
    scenario: "Quieres presentar a tu equipo de trabajo para humanizar tu marca y generar confianza.",
    objective: "Muestra el lado humano de tu empresa de forma divertida y auténtica.",
    platform: "tiktok",
    tips: ["Deja que tu equipo muestre su personalidad", "Usa humor ligero", "Conecta cada persona con su impacto en el cliente"],
    mode: "pyme",
    requiresVisual: true,
  },
  // Expanded bank
  {
    id: "e6",
    round: 6,
    scenario: "Recibiste una queja pública de un cliente en redes. Quieres responder de forma profesional y convertirlo en una oportunidad.",
    objective: "Responde a la queja con empatía y transforma la situación en prueba de buen servicio.",
    platform: "twitter",
    tips: ["Nunca borres la queja", "Responde rápido y con empatía", "Ofrece una solución concreta"],
    mode: "pyme",
  },
  {
    id: "e7",
    round: 7,
    scenario: "Vas a lanzar un nuevo producto/servicio la próxima semana y quieres crear expectativa.",
    objective: "Crea un teaser que genere curiosidad sin revelar todo.",
    platform: "instagram",
    tips: ["Muestra sin mostrar", "Usa cuenta regresiva", "Pide que adivinen qué viene"],
    mode: "pyme",
    requiresVisual: true,
  },
  {
    id: "e8",
    round: 8,
    scenario: "Quieres mostrar el proceso de fabricación/creación de tu producto estrella.",
    objective: "Haz un behind the scenes que genere confianza y percepción de calidad.",
    platform: "tiktok",
    tips: ["Los procesos satisfactorios son virales", "Muestra los detalles artesanales", "Termina con el producto final"],
    mode: "pyme",
    requiresVisual: true,
  },
  {
    id: "e9",
    round: 9,
    scenario: "Quieres hacer una colaboración con otra marca/negocio complementario al tuyo.",
    objective: "Publica un post que presente la colaboración de forma que ambas marcas se beneficien.",
    platform: "linkedin",
    tips: ["Destaca qué gana cada audiencia", "Etiqueta al partner", "Cuenta cómo nació la idea"],
    mode: "pyme",
  },
  {
    id: "e10",
    round: 10,
    scenario: "Es Black Friday y todos publican ofertas. Tú quieres diferenciarte del ruido genérico.",
    objective: "Crea un post de campaña que destaque entre miles de ofertas similares.",
    platform: "instagram",
    tips: ["No compitas por precio, compite por historia", "Agrega valor extra", "Limita la oferta a algo exclusivo"],
    mode: "pyme",
    requiresVisual: true,
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
