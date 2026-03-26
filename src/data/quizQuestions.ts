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
    question: "¿Tienes una estrategia de contenido documentada con pilares temáticos?",
    options: [
      { text: "No, publico cuando se me ocurre algo", score: 0 },
      { text: "Tengo ideas pero sin plan formal", score: 1 },
      { text: "Tengo un calendario básico", score: 2 },
      { text: "Tengo estrategia con pilares de contenido, tono y formatos definidos", score: 3 },
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
  // --- Nuevas preguntas alineadas con el Motor de Contenido ---
  {
    id: "pb11",
    question: "¿Varías los formatos de tu contenido según la plataforma (carruseles, reels, artículos, hilos)?",
    options: [
      { text: "Publico siempre el mismo tipo de contenido", score: 0 },
      { text: "A veces pruebo algo diferente", score: 1 },
      { text: "Uso 2-3 formatos regularmente", score: 2 },
      { text: "Adapto formato y extensión a cada red según las mejores prácticas", score: 3 },
    ],
  },
  {
    id: "pb12",
    question: "¿Tienes definido un tono de voz para tu marca personal?",
    options: [
      { text: "No he pensado en eso", score: 0 },
      { text: "Tengo una idea pero no es consistente", score: 1 },
      { text: "Lo mantengo en la mayoría de mis publicaciones", score: 2 },
      { text: "Sí, es intencional y reconocible en todo mi contenido", score: 3 },
    ],
  },
  {
    id: "pb13",
    question: "¿Investigas tendencias de tu industria para crear contenido relevante?",
    options: [
      { text: "No, creo contenido sin investigar", score: 0 },
      { text: "Reviso ocasionalmente qué publican otros", score: 1 },
      { text: "Consulto fuentes de noticias y redes regularmente", score: 2 },
      { text: "Tengo un proceso de investigación con múltiples fuentes antes de cada ciclo", score: 3 },
    ],
  },
  {
    id: "pb14",
    question: "¿Incluyes llamados a la acción (CTAs) estratégicos en tus publicaciones?",
    options: [
      { text: "No sé qué es un CTA", score: 0 },
      { text: "A veces pido que comenten o compartan", score: 1 },
      { text: "La mayoría de mis posts tienen un CTA", score: 2 },
      { text: "Cada post tiene un CTA alineado a un objetivo específico (engagement, tráfico, leads)", score: 3 },
    ],
  },
  {
    id: "pb15",
    question: "¿Estás presente y activo en más de una plataforma digital?",
    options: [
      { text: "Solo uso una red social o ninguna", score: 0 },
      { text: "Tengo cuentas en varias pero solo uso una activamente", score: 1 },
      { text: "Publico regularmente en 2 plataformas", score: 2 },
      { text: "Tengo presencia estratégica en 3+ plataformas con contenido adaptado", score: 3 },
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
    question: "¿Utilizan Google Business Profile o fichas de negocio locales?",
    options: [
      { text: "No sabemos qué es", score: 0 },
      { text: "Lo tenemos pero no lo administramos", score: 1 },
      { text: "Lo tenemos actualizado con info básica", score: 2 },
      { text: "Lo optimizamos activamente con fotos, reseñas y posts", score: 3 },
    ],
  },
  {
    id: "pyme4",
    question: "¿Tienen estrategia de email marketing o WhatsApp Business?",
    options: [
      { text: "No capturamos datos de contacto de clientes", score: 0 },
      { text: "Tenemos contactos pero no enviamos comunicaciones", score: 1 },
      { text: "Enviamos mensajes o emails ocasionalmente", score: 2 },
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
    question: "¿Tienen estrategia de contenido con pilares temáticos para atraer clientes?",
    options: [
      { text: "No generamos contenido", score: 0 },
      { text: "Publicamos contenido sin estrategia", score: 1 },
      { text: "Tenemos calendario pero sin objetivos claros", score: 2 },
      { text: "Contenido estratégico con pilares, tono y formatos alineados al journey del cliente", score: 3 },
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
      { text: "Presupuesto definido con distribución estratégica por canal", score: 3 },
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
  // --- Nuevas preguntas alineadas con el Motor de Contenido ---
  {
    id: "pyme13",
    question: "¿Varían los formatos de contenido según la plataforma (video, carrusel, stories, artículos)?",
    options: [
      { text: "Solo publicamos fotos con texto", score: 0 },
      { text: "A veces probamos video o stories", score: 1 },
      { text: "Usamos 2-3 formatos regularmente", score: 2 },
      { text: "Adaptamos formatos estratégicamente a cada plataforma", score: 3 },
    ],
  },
  {
    id: "pyme14",
    question: "¿Tienen un tono de comunicación definido y documentado para la marca?",
    options: [
      { text: "No, cada quien escribe como quiere", score: 0 },
      { text: "Hay una idea general pero sin documentar", score: 1 },
      { text: "Tenemos lineamientos básicos de tono", score: 2 },
      { text: "Sí, con guía de voz y tono que todo el equipo sigue", score: 3 },
    ],
  },
  {
    id: "pyme15",
    question: "¿Monitorean tendencias de su industria para alimentar su estrategia de contenido?",
    options: [
      { text: "No monitoreamos tendencias", score: 0 },
      { text: "Vemos lo que publica la competencia ocasionalmente", score: 1 },
      { text: "Revisamos noticias y redes antes de planear contenido", score: 2 },
      { text: "Investigamos múltiples fuentes (noticias, redes, comunidades) de forma sistemática", score: 3 },
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
      "Crea o actualiza tu perfil en redes con foto profesional y bio clara",
      "Establece una identidad visual básica (colores y estilo de comunicación)",
      "Define 3 pilares de contenido que reflejen tu expertise y valores",
      "Comienza a publicar contenido de valor 2-3 veces por semana con un tono consistente",
      "Investiga qué temas son tendencia en tu industria antes de crear contenido",
    ],
    nextSteps: [
      "Usa nuestro Kit de Marca Personal para crear tu identidad digital completa",
      "Agenda una sesión estratégica con KiMedia para diseñar tu plan de contenido",
      "Activa tu Motor de Contenido para generar parrillas semanales con IA",
    ],
  },
  intermediate: {
    level: "intermediate",
    title: "🌿 Etapa de Crecimiento",
    description: "Ya tienes presencia digital y algunos elementos de marca. Es momento de profesionalizar, escalar tu alcance y sistematizar tu estrategia de contenido.",
    recommendations: [
      "Documenta y refina tu estrategia con pilares de contenido y tono de voz definidos",
      "Implementa un sistema de captura de testimonios y casos de éxito",
      "Diversifica tus formatos: combina carruseles, reels, artículos y stories",
      "Establece métricas clave (alcance, guardados, engagement rate) y revísalas semanalmente",
      "Adapta tu contenido a cada plataforma en lugar de replicar lo mismo en todas",
      "Incluye CTAs estratégicos según el objetivo de cada pieza (engagement, tráfico, conversión)",
    ],
    nextSteps: [
      "Activa tu Motor de Contenido con KiMedia para ciclos de publicación profesionales",
      "Implementa investigación de tendencias como parte de tu planificación mensual",
      "Desarrolla tu sitio web o landing page personal con embudo de captación",
    ],
  },
  advanced: {
    level: "advanced",
    title: "🌳 Etapa de Cosecha",
    description: "¡Excelente! Tu marca personal está bien posicionada. El siguiente nivel es optimizar basado en datos, automatizar y multiplicar tu impacto con IA.",
    recommendations: [
      "Implementa ciclos de contenido mensuales con análisis de rendimiento al cierre",
      "Usa analíticas avanzadas para identificar qué pilares, formatos y tonos generan más engagement",
      "Invierte en contenido de alto valor (video profesional, webinars, podcasts)",
      "Desarrolla alianzas estratégicas y co-creación con otras marcas personales",
      "Explora pauta digital para amplificar tu mejor contenido orgánico",
      "Automatiza la investigación de tendencias para estar siempre un paso adelante",
    ],
    nextSteps: [
      "Consulta con KiMedia sobre estrategias de escalamiento con IA y contenido automatizado",
      "Activa el Motor de Contenido avanzado con analíticas, tendencias y pauta integrada",
      "Desarrolla tu ecosistema de productos y servicios digitales",
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
      "Configura y optimiza tu ficha de Google Business Profile",
      "Establece presencia activa en las 2 redes sociales más relevantes para tu audiencia",
      "Define un tono de comunicación para que toda la comunicación sea consistente",
      "Implementa captura de leads (formularios, WhatsApp Business, landing pages)",
      "Define 3-5 pilares de contenido alineados a tus productos y audiencia",
    ],
    nextSteps: [
      "Usa nuestro Kit Digital PyME para crear tu identidad y estrategia desde cero",
      "Agenda una consultoría con KiMedia para diseñar tu estrategia digital integral",
      "Activa tu Motor de Contenido para tener parrillas de publicación profesionales",
    ],
  },
  intermediate: {
    level: "intermediate",
    title: "📈 Fase de Escalamiento",
    description: "Ya tienes bases digitales establecidas. Es momento de profesionalizar tu contenido, medir resultados y escalar lo que funciona.",
    recommendations: [
      "Implementa un CRM para gestionar leads y clientes eficientemente",
      "Desarrolla campañas de publicidad digital con presupuesto y ROI definidos",
      "Diversifica formatos: video, carruseles, stories y contenido adaptado a cada red",
      "Establece KPIs claros: CAC, conversiones, engagement rate, ROI por canal",
      "Investiga tendencias de tu mercado para mantener contenido relevante y actual",
      "Documenta tu tono de marca y lineamientos para que todo el equipo comunique igual",
    ],
    nextSteps: [
      "Activa tu Motor de Contenido con KiMedia para ciclos mensuales estratégicos",
      "Implementa analíticas avanzadas y seguimiento de pauta digital",
      "Desarrolla una estrategia de contenido alineada con tu embudo de ventas",
    ],
  },
  advanced: {
    level: "advanced",
    title: "🏆 Fase de Liderazgo",
    description: "¡Felicidades! Tu empresa tiene una presencia digital sólida. El siguiente paso es optimizar con datos, automatizar y dominar tu mercado.",
    recommendations: [
      "Implementa ciclos de contenido con análisis de rendimiento y aprendizajes al cierre",
      "Usa IA para generar contenido optimizado por plataforma con tendencias en tiempo real",
      "Desarrolla estrategias de retención y upselling con contenido segmentado",
      "Optimiza continuamente basado en datos de engagement, conversión y ROI de pauta",
      "Integra tu contenido orgánico con pauta para maximizar alcance e impacto",
      "Monitorea tendencias de tu industria con múltiples fuentes para innovar en contenido",
    ],
    nextSteps: [
      "Consulta con KiMedia sobre estrategias avanzadas con Motor de Contenido + IA",
      "Activa analíticas avanzadas, investigación de tendencias y gestión de pauta integrada",
      "Desarrolla un programa de referidos y fidelización digital",
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
