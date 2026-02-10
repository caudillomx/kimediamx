export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "estrategia" | "contenido" | "identidad" | "audiencia" | "metricas";
}

export const personalBrandQuestions: TriviaQuestion[] = [
  {
    id: 1,
    question: "¿Cuál es el primer paso para construir una marca personal sólida?",
    options: ["Comprar seguidores", "Definir tu propuesta de valor", "Publicar todos los días", "Copiar a influencers exitosos"],
    correctIndex: 1,
    explanation: "Tu propuesta de valor es la base: define qué ofreces, a quién y por qué eres diferente.",
    category: "identidad",
  },
  {
    id: 2,
    question: "¿Qué elemento es MÁS importante en tu bio de redes sociales?",
    options: ["Muchos emojis", "Tu título universitario", "Claridad sobre qué haces y a quién ayudas", "Tu ubicación geográfica"],
    correctIndex: 2,
    explanation: "Una bio efectiva comunica rápidamente tu expertise y el valor que aportas a tu audiencia.",
    category: "identidad",
  },
  {
    id: 3,
    question: "¿Cada cuánto deberías publicar contenido como mínimo para mantener relevancia?",
    options: ["Una vez al mes", "3-5 veces por semana", "10 veces al día", "Solo cuando tengas inspiración"],
    correctIndex: 1,
    explanation: "La consistencia es clave. 3-5 publicaciones semanales mantienen tu visibilidad sin saturar.",
    category: "estrategia",
  },
  {
    id: 4,
    question: "¿Qué tipo de contenido genera MÁS confianza en tu audiencia?",
    options: ["Memes virales", "Testimonios y casos de éxito reales", "Fotos personales diarias", "Repostear noticias"],
    correctIndex: 1,
    explanation: "Los testimonios y casos de éxito son prueba social: demuestran resultados concretos.",
    category: "contenido",
  },
  {
    id: 5,
    question: "¿Qué significa 'engagement' en redes sociales?",
    options: ["Número de seguidores", "Nivel de interacción de tu audiencia", "Cantidad de publicaciones", "Dinero invertido en ads"],
    correctIndex: 1,
    explanation: "El engagement mide cuánto interactúa tu audiencia contigo: likes, comentarios, shares, guardados.",
    category: "metricas",
  },
  {
    id: 6,
    question: "¿Cuál es la mejor hora para publicar en redes sociales?",
    options: ["Siempre a las 9am", "A medianoche", "Cuando tu audiencia específica está más activa", "No importa la hora"],
    correctIndex: 2,
    explanation: "No hay hora universal. Revisa tus analytics para saber cuándo TU audiencia está conectada.",
    category: "metricas",
  },
  {
    id: 7,
    question: "¿Qué es un 'call to action' (CTA) en un post?",
    options: ["Un hashtag popular", "Una invitación clara a que tu audiencia haga algo", "El nombre de tu marca", "Una imagen llamativa"],
    correctIndex: 1,
    explanation: "Un CTA guía a tu audiencia: 'Comenta tu opinión', 'Guarda este post', 'Agenda una llamada'.",
    category: "contenido",
  },
  {
    id: 8,
    question: "¿Por qué es importante definir tu audiencia objetivo?",
    options: ["Para presumir cuántos seguidores tienes", "Para crear contenido que resuene con las personas correctas", "No es importante, habla para todos", "Solo sirve para Facebook Ads"],
    correctIndex: 1,
    explanation: "Conocer a tu audiencia te permite crear mensajes que conecten y generen acción.",
    category: "audiencia",
  },
  {
    id: 9,
    question: "¿Qué es más valioso: 10,000 seguidores desinteresados o 500 seguidores comprometidos?",
    options: ["10,000 siempre gana", "500 comprometidos", "Da igual, es lo mismo", "Depende de la plataforma"],
    correctIndex: 1,
    explanation: "La calidad supera a la cantidad. 500 seguidores activos generan más negocio que 10K pasivos.",
    category: "audiencia",
  },
  {
    id: 10,
    question: "¿Qué elemento visual debe ser consistente en TODAS tus redes?",
    options: ["El filtro de tus fotos", "Tu foto de perfil profesional", "El color de tu ropa", "El fondo de tus fotos"],
    correctIndex: 1,
    explanation: "Tu foto de perfil es tu 'logo personal'. Debe ser profesional y reconocible en todas las plataformas.",
    category: "identidad",
  },
  {
    id: 11,
    question: "¿Cuál es el error más común al crear contenido de marca personal?",
    options: ["Hablar solo de ti sin aportar valor", "Publicar demasiado contenido educativo", "Usar demasiados hashtags", "Publicar en horarios diferentes"],
    correctIndex: 0,
    explanation: "El contenido debe aportar valor a tu audiencia, no solo hablar de ti. La regla 80/20: 80% valor, 20% promoción.",
    category: "contenido",
  },
  {
    id: 12,
    question: "¿Qué métrica indica mejor que tu contenido está funcionando?",
    options: ["Número de likes", "Guardados y compartidos", "Número de seguidores nuevos", "Vistas del perfil"],
    correctIndex: 1,
    explanation: "Los guardados y compartidos indican que tu contenido es tan valioso que la gente quiere conservarlo.",
    category: "metricas",
  },
  {
    id: 13,
    question: "¿Qué son los 'pilares de contenido'?",
    options: ["Los hashtags más populares", "Los temas principales sobre los que publicas consistentemente", "Las horas de publicación", "Los tipos de formato (reel, carrusel, etc.)"],
    correctIndex: 1,
    explanation: "Los pilares son tus 3-5 temas clave que definen de qué habla tu marca. Dan estructura a tu estrategia.",
    category: "estrategia",
  },
  {
    id: 14,
    question: "¿Cómo puedes diferenciarte de otros profesionales en tu industria?",
    options: ["Bajando tus precios", "Compartiendo tu historia y perspectiva única", "Copiando lo que funciona para otros", "Usando las mismas plantillas que todos"],
    correctIndex: 1,
    explanation: "Tu historia, experiencia y punto de vista son únicos. Eso es lo que te hace memorable.",
    category: "identidad",
  },
  {
    id: 15,
    question: "¿Qué formato de contenido tiene mayor alcance orgánico actualmente?",
    options: ["Texto largo sin imagen", "Video corto (Reels/TikTok/Shorts)", "Solo fotos estáticas", "Enlaces a tu sitio web"],
    correctIndex: 1,
    explanation: "El video corto es el formato que más alcance orgánico genera en la mayoría de plataformas actualmente.",
    category: "estrategia",
  },
];

export const pymeQuestions: TriviaQuestion[] = [
  {
    id: 101,
    question: "¿Cuál es el primer paso para digitalizar tu PyME?",
    options: ["Invertir en publicidad pagada", "Definir tu identidad de marca y presencia básica", "Contratar un community manager", "Crear una app móvil"],
    correctIndex: 1,
    explanation: "Antes de invertir, necesitas tener clara tu identidad, perfiles optimizados y presencia básica.",
    category: "estrategia",
  },
  {
    id: 102,
    question: "¿Qué plataforma es esencial para un negocio local?",
    options: ["LinkedIn", "Google Business Profile", "Twitter/X", "Pinterest"],
    correctIndex: 1,
    explanation: "Google Business Profile te hace visible en búsquedas locales y Google Maps. Es gratis y esencial.",
    category: "estrategia",
  },
  {
    id: 103,
    question: "¿Qué debe incluir la bio de tu empresa en redes?",
    options: ["Solo el logo", "Qué vendes, a quién y cómo contactarte", "Tu historia completa desde la fundación", "Solo ofertas y descuentos"],
    correctIndex: 1,
    explanation: "La bio empresarial debe ser clara: qué ofreces, quién es tu cliente ideal y cómo pueden contactarte.",
    category: "identidad",
  },
  {
    id: 104,
    question: "¿Cuál es el error más grave de una PyME en redes sociales?",
    options: ["Publicar solo fotos de productos sin contexto", "Publicar contenido educativo", "Responder rápido a mensajes", "Usar hashtags locales"],
    correctIndex: 0,
    explanation: "Solo mostrar productos sin contexto ni valor aburre. Combina con tips, detrás de escena y testimonios.",
    category: "contenido",
  },
  {
    id: 105,
    question: "¿Cómo puede una PyME competir con marcas grandes en digital?",
    options: ["Igualando su presupuesto de ads", "Creando contenido auténtico y cercano a su comunidad", "Copiando exactamente su estrategia", "No puede, es imposible"],
    correctIndex: 1,
    explanation: "La autenticidad y cercanía son ventajas únicas de las PyMEs. Los clientes valoran lo genuino.",
    category: "estrategia",
  },
  {
    id: 106,
    question: "¿Qué porcentaje de consumidores buscan negocios en línea antes de comprar?",
    options: ["Menos del 20%", "Alrededor del 50%", "Más del 80%", "Solo el 10%"],
    correctIndex: 2,
    explanation: "Más del 80% de consumidores investigan en línea antes de comprar. Si no estás visible, pierdes ventas.",
    category: "metricas",
  },
  {
    id: 107,
    question: "¿Qué tipo de contenido genera más ventas para una PyME?",
    options: ["Solo descuentos agresivos", "Contenido que educa sobre el problema que resuelves", "Publicar el menú o catálogo repetidamente", "Solo repostear memes"],
    correctIndex: 1,
    explanation: "Educar sobre el problema crea confianza. Cuando el cliente entiende su necesidad, te elige naturalmente.",
    category: "contenido",
  },
  {
    id: 108,
    question: "¿Por qué es importante responder rápido los mensajes en redes?",
    options: ["No es importante, pueden esperar", "Porque el 90% de clientes espera respuesta en menos de 24 horas", "Solo importa si vendes en línea", "Solo afecta a empresas grandes"],
    correctIndex: 1,
    explanation: "La velocidad de respuesta es clave. Un cliente que no recibe respuesta rápida se va con la competencia.",
    category: "audiencia",
  },
  {
    id: 109,
    question: "¿Qué es más importante para una PyME: muchos seguidores o buenas reseñas?",
    options: ["Seguidores, siempre", "Reseñas y testimonios positivos", "Ninguno importa", "Solo importa el sitio web"],
    correctIndex: 1,
    explanation: "Las reseñas son la prueba social más poderosa para un negocio. Generan más confianza que cualquier número de seguidores.",
    category: "audiencia",
  },
  {
    id: 110,
    question: "¿Qué herramienta gratuita puede usar una PyME para planificar contenido?",
    options: ["Solo se puede con herramientas de pago", "Un calendario editorial simple (Google Calendar/Notion)", "No necesitas planificar, improvisa", "Solo las agencias pueden planificar"],
    correctIndex: 1,
    explanation: "Un simple calendario editorial te ayuda a ser consistente sin gastar dinero extra.",
    category: "estrategia",
  },
  {
    id: 111,
    question: "¿Qué red social es mejor para una PyME que vende a otras empresas (B2B)?",
    options: ["TikTok", "LinkedIn", "Snapchat", "Pinterest"],
    correctIndex: 1,
    explanation: "LinkedIn es la plataforma líder para relaciones B2B y networking profesional.",
    category: "estrategia",
  },
  {
    id: 112,
    question: "¿Cuánto debería invertir una PyME pequeña en publicidad digital al inicio?",
    options: ["Todo su presupuesto de marketing", "Un monto pequeño para probar qué funciona, luego escalar", "Nada, nunca inviertas en ads", "Mínimo $10,000 mensuales"],
    correctIndex: 1,
    explanation: "Empieza con un presupuesto pequeño para testear, aprende qué funciona y luego escala gradualmente.",
    category: "estrategia",
  },
  {
    id: 113,
    question: "¿Qué es el 'branding' de una empresa?",
    options: ["Solo el logo y los colores", "La percepción total que los clientes tienen de tu negocio", "El nombre de la empresa", "La publicidad que haces"],
    correctIndex: 1,
    explanation: "El branding es todo: cómo te perciben, tu reputación, experiencia del cliente, valores y comunicación visual.",
    category: "identidad",
  },
  {
    id: 114,
    question: "¿Cuál es la ventaja #1 de WhatsApp Business para una PyME?",
    options: ["Es gratis para siempre", "Permite catálogos, respuestas rápidas y etiquetas de clientes", "Tiene más usuarios que Instagram", "Se puede usar sin internet"],
    correctIndex: 1,
    explanation: "WhatsApp Business ofrece herramientas diseñadas para negocios: catálogo, mensajes automáticos y organización de clientes.",
    category: "estrategia",
  },
  {
    id: 115,
    question: "¿Qué debe hacer una PyME cuando recibe una reseña negativa?",
    options: ["Borrarla inmediatamente", "Ignorarla, no responder", "Responder profesionalmente y buscar solución", "Atacar al cliente públicamente"],
    correctIndex: 2,
    explanation: "Una respuesta profesional a una reseña negativa demuestra compromiso con el cliente y puede convertir una mala experiencia en fidelidad.",
    category: "audiencia",
  },
];

export const categoryIcons: Record<string, string> = {
  estrategia: "🎯",
  contenido: "✍️",
  identidad: "🪪",
  audiencia: "👥",
  metricas: "📊",
};

export const categoryLabels: Record<string, string> = {
  estrategia: "Estrategia",
  contenido: "Contenido",
  identidad: "Identidad",
  audiencia: "Audiencia",
  metricas: "Métricas",
};

export function getLevelFromScore(score: number, total: number): {
  level: string;
  emoji: string;
  title: string;
  message: string;
  color: string;
} {
  const pct = (score / total) * 100;
  if (pct >= 80) return {
    level: "maestro",
    emoji: "👑",
    title: "Maestro de Marca",
    message: "¡Impresionante! Dominas los fundamentos del branding digital. Estás listo para llevar tu marca al siguiente nivel.",
    color: "from-yellow-400 to-amber-500",
  };
  if (pct >= 50) return {
    level: "estratega",
    emoji: "⚡",
    title: "Estratega Digital",
    message: "¡Bien hecho! Tienes buenos conocimientos pero hay áreas donde puedes mejorar. Sigue aprendiendo.",
    color: "from-blue-400 to-cyan-500",
  };
  return {
    level: "aprendiz",
    emoji: "🌱",
    title: "Aprendiz de Marca",
    message: "¡Buen inicio! El branding digital tiene mucho que ofrecer. Este es tu punto de partida para crecer.",
    color: "from-green-400 to-emerald-500",
  };
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
