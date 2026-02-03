export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface QuizResult {
  level: "beginner" | "intermediate" | "advanced";
  title: string;
  description: string;
  recommendations: string[];
  nextSteps: string[];
}

// Preguntas para diagnóstico de Marca Personal
export const personalBrandQuestions: QuizQuestion[] = [
  {
    id: "pb1",
    question: "¿Con qué frecuencia publicas contenido en tus redes sociales profesionales?",
    options: [
      { text: "Casi nunca o no tengo redes profesionales", score: 0 },
      { text: "Una vez al mes o menos", score: 1 },
      { text: "1-2 veces por semana", score: 2 },
      { text: "3-5 veces por semana o más", score: 3 },
    ],
  },
  {
    id: "pb2",
    question: "¿Tienes una propuesta de valor clara que comunicas consistentemente?",
    options: [
      { text: "No sé qué es una propuesta de valor", score: 0 },
      { text: "Tengo una idea pero no la he definido", score: 1 },
      { text: "La tengo definida pero no la comunico consistentemente", score: 2 },
      { text: "Sí, está clara y la comunico en todos mis canales", score: 3 },
    ],
  },
  {
    id: "pb3",
    question: "¿Tienes una identidad visual definida (colores, tipografía, estilo)?",
    options: [
      { text: "No, uso diferentes estilos sin consistencia", score: 0 },
      { text: "Tengo algunos elementos pero no están documentados", score: 1 },
      { text: "Tengo una guía básica que intento seguir", score: 2 },
      { text: "Sí, tengo un manual de marca que sigo fielmente", score: 3 },
    ],
  },
  {
    id: "pb4",
    question: "¿Cómo calificas tu presencia en redes sociales profesionales?",
    options: [
      { text: "No tengo perfiles profesionales o están abandonados", score: 0 },
      { text: "Tengo perfiles pero no los uso activamente", score: 1 },
      { text: "Publico ocasionalmente y tengo una red pequeña", score: 2 },
      { text: "Tengo perfiles optimizados, publico seguido y genero engagement", score: 3 },
    ],
  },
  {
    id: "pb5",
    question: "¿Cuántos leads o clientes potenciales recibes mensualmente a través de tus redes?",
    options: [
      { text: "Ninguno", score: 0 },
      { text: "1-3 al mes", score: 1 },
      { text: "4-10 al mes", score: 2 },
      { text: "Más de 10 al mes", score: 3 },
    ],
  },
  {
    id: "pb6",
    question: "¿Tienes un sitio web o landing page personal/profesional?",
    options: [
      { text: "No", score: 0 },
      { text: "Tengo uno pero está desactualizado", score: 1 },
      { text: "Tengo uno funcional pero básico", score: 2 },
      { text: "Tengo uno profesional, optimizado y actualizado", score: 3 },
    ],
  },
  {
    id: "pb7",
    question: "¿Con qué frecuencia interactúas con contenido de otros profesionales de tu industria?",
    options: [
      { text: "Nunca o casi nunca", score: 0 },
      { text: "Ocasionalmente doy like", score: 1 },
      { text: "Comento y comparto regularmente", score: 2 },
      { text: "Tengo una estrategia activa de networking digital", score: 3 },
    ],
  },
  {
    id: "pb8",
    question: "¿Tienes un sistema para capturar testimonios o casos de éxito?",
    options: [
      { text: "No tengo testimonios", score: 0 },
      { text: "Tengo algunos pero no los uso", score: 1 },
      { text: "Los tengo y los muestro ocasionalmente", score: 2 },
      { text: "Los capturo sistemáticamente y los uso estratégicamente", score: 3 },
    ],
  },
  {
    id: "pb9",
    question: "¿Tienes una estrategia de contenido documentada?",
    options: [
      { text: "No, publico cuando se me ocurre algo", score: 0 },
      { text: "Tengo ideas pero sin plan formal", score: 1 },
      { text: "Tengo un calendario básico", score: 2 },
      { text: "Tengo estrategia documentada con pilares de contenido", score: 3 },
    ],
  },
  {
    id: "pb10",
    question: "¿Mides y analizas el rendimiento de tu contenido?",
    options: [
      { text: "No, nunca reviso métricas", score: 0 },
      { text: "Reviso ocasionalmente los likes", score: 1 },
      { text: "Reviso métricas básicas mensualmente", score: 2 },
      { text: "Analizo métricas semanalmente y ajusto mi estrategia", score: 3 },
    ],
  },
];

// Preguntas para diagnóstico PyME
export const pymeQuestions: QuizQuestion[] = [
  {
    id: "pyme1",
    question: "¿Tu empresa tiene presencia en redes sociales relevantes para tu industria?",
    options: [
      { text: "No tenemos redes sociales empresariales", score: 0 },
      { text: "Tenemos perfiles pero están inactivos", score: 1 },
      { text: "Publicamos ocasionalmente", score: 2 },
      { text: "Tenemos presencia activa y estratégica", score: 3 },
    ],
  },
  {
    id: "pyme2",
    question: "¿Tu sitio web está optimizado para generar leads o ventas?",
    options: [
      { text: "No tenemos sitio web", score: 0 },
      { text: "Tenemos sitio pero es solo informativo", score: 1 },
      { text: "Tenemos formularios de contacto básicos", score: 2 },
      { text: "Tenemos landing pages optimizadas con CTAs claros", score: 3 },
    ],
  },
  {
    id: "pyme3",
    question: "¿Utilizan Google My Business o fichas de negocio locales?",
    options: [
      { text: "No sabemos qué es", score: 0 },
      { text: "Lo tenemos pero no lo administramos", score: 1 },
      { text: "Lo tenemos actualizado con info básica", score: 2 },
      { text: "Lo optimizamos activamente con fotos, reseñas y posts", score: 3 },
    ],
  },
  {
    id: "pyme4",
    question: "¿Tienen estrategia de email marketing?",
    options: [
      { text: "No capturamos emails de clientes", score: 0 },
      { text: "Tenemos lista pero no enviamos emails", score: 1 },
      { text: "Enviamos emails ocasionalmente", score: 2 },
      { text: "Tenemos secuencias automatizadas y campañas regulares", score: 3 },
    ],
  },
  {
    id: "pyme5",
    question: "¿Invierten en publicidad digital (Google Ads, Facebook Ads, etc.)?",
    options: [
      { text: "No invertimos en publicidad digital", score: 0 },
      { text: "Hemos probado pero sin resultados claros", score: 1 },
      { text: "Invertimos ocasionalmente con resultados mixtos", score: 2 },
      { text: "Tenemos campañas optimizadas con ROI positivo", score: 3 },
    ],
  },
  {
    id: "pyme6",
    question: "¿Tienen un CRM o sistema para gestionar clientes potenciales?",
    options: [
      { text: "No, usamos Excel o nada", score: 0 },
      { text: "Tenemos uno pero no lo usamos bien", score: 1 },
      { text: "Lo usamos pero no está integrado con marketing", score: 2 },
      { text: "CRM integrado con automatizaciones y seguimiento", score: 3 },
    ],
  },
  {
    id: "pyme7",
    question: "¿Conocen el costo de adquisición de cliente (CAC) de sus canales digitales?",
    options: [
      { text: "No sabemos qué es el CAC", score: 0 },
      { text: "Tenemos idea general pero no lo calculamos", score: 1 },
      { text: "Lo calculamos pero no por canal", score: 2 },
      { text: "Conocemos el CAC por canal y lo optimizamos", score: 3 },
    ],
  },
  {
    id: "pyme8",
    question: "¿Tienen testimonios, casos de éxito o reseñas de clientes?",
    options: [
      { text: "No tenemos testimonios documentados", score: 0 },
      { text: "Tenemos algunos pero no los usamos", score: 1 },
      { text: "Los mostramos en nuestro sitio/redes", score: 2 },
      { text: "Los capturamos sistemáticamente y los usamos en marketing", score: 3 },
    ],
  },
  {
    id: "pyme9",
    question: "¿Tienen estrategia de contenido para atraer clientes potenciales?",
    options: [
      { text: "No generamos contenido", score: 0 },
      { text: "Publicamos contenido sin estrategia", score: 1 },
      { text: "Tenemos calendario pero sin objetivos claros", score: 2 },
      { text: "Contenido estratégico alineado con el journey del cliente", score: 3 },
    ],
  },
  {
    id: "pyme10",
    question: "¿Miden el tráfico web y las conversiones?",
    options: [
      { text: "No tenemos analytics instalado", score: 0 },
      { text: "Tenemos pero no lo revisamos", score: 1 },
      { text: "Revisamos tráfico pero no conversiones", score: 2 },
      { text: "Medimos y optimizamos basados en datos", score: 3 },
    ],
  },
  {
    id: "pyme11",
    question: "¿Tienen presupuesto mensual asignado para marketing digital?",
    options: [
      { text: "No hay presupuesto definido", score: 0 },
      { text: "Gastamos cuando podemos, sin plan", score: 1 },
      { text: "Tenemos presupuesto básico mensual", score: 2 },
      { text: "Presupuesto definido con distribución estratégica", score: 3 },
    ],
  },
  {
    id: "pyme12",
    question: "¿Tienen una persona o equipo dedicado a marketing digital?",
    options: [
      { text: "Nadie se encarga específicamente", score: 0 },
      { text: "Alguien lo hace además de otras funciones", score: 1 },
      { text: "Tenemos persona o agencia básica", score: 2 },
      { text: "Equipo interno o agencia especializada con estrategia", score: 3 },
    ],
  },
];

// Resultados para Marca Personal
export const personalBrandResults: Record<string, QuizResult> = {
  beginner: {
    level: "beginner",
    title: "🌱 Etapa de Siembra",
    description: "Tu marca personal está en sus primeros pasos. Tienes un gran potencial por desarrollar y es el momento perfecto para construir bases sólidas.",
    recommendations: [
      "Define tu propuesta de valor única: ¿Qué problema resuelves y para quién?",
      "Crea o actualiza tu perfil de LinkedIn con foto profesional y headline claro",
      "Establece una identidad visual básica (colores y estilo de comunicación)",
      "Comienza a publicar contenido de valor 2-3 veces por semana",
      "Construye tu red conectando con profesionales de tu industria",
    ],
    nextSteps: [
      "Agenda una sesión estratégica con KiMedia para crear tu plan de marca personal",
      "Desarrolla tu manual de marca básico",
      "Crea tu primer calendario de contenido mensual",
    ],
  },
  intermediate: {
    level: "intermediate",
    title: "🌿 Etapa de Crecimiento",
    description: "Ya tienes presencia digital y algunos elementos de marca. Es momento de profesionalizar y escalar tu alcance e impacto.",
    recommendations: [
      "Documenta y refina tu estrategia de contenido con pilares claros",
      "Implementa un sistema de captura de testimonios y casos de éxito",
      "Optimiza tu perfil de LinkedIn para aparecer en búsquedas relevantes",
      "Establece métricas clave y revísalas semanalmente",
      "Expande tu presencia a una red adicional relevante para tu audiencia",
    ],
    nextSteps: [
      "Trabaja con KiMedia para crear una estrategia de contenido profesional",
      "Desarrolla tu sitio web o landing page personal",
      "Implementa automatizaciones para captura de leads",
    ],
  },
  advanced: {
    level: "advanced",
    title: "🌳 Etapa de Cosecha",
    description: "¡Excelente! Tu marca personal está bien posicionada. El siguiente nivel es optimizar, automatizar y multiplicar tu impacto.",
    recommendations: [
      "Implementa embudos de conversión automatizados",
      "Considera crear productos digitales (cursos, ebooks, membresías)",
      "Desarrolla alianzas estratégicas con otras marcas personales",
      "Invierte en contenido de alto valor (video, podcast, webinars)",
      "Explora speaking y participación en eventos de tu industria",
    ],
    nextSteps: [
      "Consulta con KiMedia sobre estrategias de escalamiento",
      "Desarrolla tu ecosistema de productos y servicios digitales",
      "Crea un programa de referidos para amplificar tu alcance",
    ],
  },
};

// Resultados para PyME
export const pymeResults: Record<string, QuizResult> = {
  beginner: {
    level: "beginner",
    title: "🚀 Fase de Despegue",
    description: "Tu empresa está comenzando su transformación digital. Hay oportunidades enormes para crecer y captar más clientes a través de canales digitales.",
    recommendations: [
      "Crea o actualiza tu sitio web con información clara y llamados a la acción",
      "Configura y optimiza tu ficha de Google My Business",
      "Establece presencia activa en las 2 redes sociales más relevantes para tu audiencia",
      "Implementa un sistema básico de captura de leads (formularios, WhatsApp)",
      "Comienza a documentar testimonios y casos de éxito de clientes",
    ],
    nextSteps: [
      "Agenda una consultoría gratuita con KiMedia para diseñar tu estrategia digital",
      "Desarrolla tu presencia digital básica con nuestro paquete de arranque",
      "Implementa tu primer embudo de captación de leads",
    ],
  },
  intermediate: {
    level: "intermediate",
    title: "📈 Fase de Escalamiento",
    description: "Ya tienes bases digitales establecidas. Es momento de profesionalizar, medir resultados y escalar lo que funciona.",
    recommendations: [
      "Implementa un CRM para gestionar leads y clientes eficientemente",
      "Desarrolla campañas de publicidad digital con objetivos claros",
      "Crea estrategia de email marketing con automatizaciones básicas",
      "Establece KPIs claros: CAC, conversiones, ROI por canal",
      "Desarrolla contenido estratégico que atraiga a tu cliente ideal",
    ],
    nextSteps: [
      "Trabaja con KiMedia para optimizar tus campañas de publicidad",
      "Implementa automatizaciones de marketing",
      "Desarrolla una estrategia de contenido alineada con tu embudo de ventas",
    ],
  },
  advanced: {
    level: "advanced",
    title: "🏆 Fase de Liderazgo",
    description: "¡Felicidades! Tu empresa tiene una presencia digital sólida. El siguiente paso es optimizar, automatizar y dominar tu mercado.",
    recommendations: [
      "Implementa inteligencia artificial en tu estrategia de marketing",
      "Desarrolla estrategias de retención y upselling automatizadas",
      "Expande a nuevos canales o mercados de forma estratégica",
      "Optimiza continuamente basado en datos y A/B testing",
      "Considera desarrollar comunidad o programa de lealtad digital",
    ],
    nextSteps: [
      "Consulta con KiMedia sobre estrategias avanzadas de growth",
      "Explora integraciones de IA para marketing y atención al cliente",
      "Desarrolla un programa de referidos y afiliados",
    ],
  },
};

export function calculateResult(answers: Record<string, number>, totalQuestions: number): { level: string; score: number; percentage: number } {
  const maxScore = totalQuestions * 3;
  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  let level: string;
  if (percentage < 40) {
    level = "beginner";
  } else if (percentage < 70) {
    level = "intermediate";
  } else {
    level = "advanced";
  }

  return { level, score: totalScore, percentage };
}
