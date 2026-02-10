export const mexicanStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
  "Yucatán", "Zacatecas",
];

export const followerRanges = [
  "Menos de 500",
  "500 – 2,000",
  "2,000 – 10,000",
  "10,000 – 50,000",
  "Más de 50,000",
];

export const channelOptions = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "ninguno", label: "No uso redes activamente" },
];

export const frequencyOptions = [
  { value: "nunca", label: "Nunca o casi nunca" },
  { value: "mensual", label: "Unas pocas veces al mes" },
  { value: "semanal", label: "1-3 veces por semana" },
  { value: "diario", label: "Casi todos los días" },
];

export const perceptionOptions = [
  "Cercana y accesible",
  "Seria y profesional",
  "Comprometida con causas sociales",
  "Poco visible o desconocida",
  "Polémica o polarizante",
];

export const goalOptions = [
  "Aumentar mi visibilidad como lideresa",
  "Posicionarme en una causa específica",
  "Prepararme para una candidatura o reelección",
  "Fortalecer la comunicación de mi organización",
  "Construir comunidad y red de apoyo",
];

export const budgetOptions = [
  { value: "ninguno", label: "Sin presupuesto" },
  { value: "basico", label: "Básico (diseño/fotos)" },
  { value: "medio", label: "Medio (equipo parcial)" },
  { value: "completo", label: "Completo (equipo dedicado)" },
];

export const diagnosticQuestions = [
  {
    id: 1,
    question: "¿Tienes foto profesional en redes?",
    options: [
      { label: "No tengo", value: 0 },
      { label: "Tengo pero no es profesional", value: 1 },
      { label: "Sí, actualizada y profesional", value: 2 },
    ],
  },
  {
    id: 2,
    question: "¿Tu bio explica qué causas defiendes?",
    options: [
      { label: "No tengo bio", value: 0 },
      { label: "Tengo pero es genérica", value: 1 },
      { label: "Sí, es clara y con propósito", value: 2 },
    ],
  },
  {
    id: 3,
    question: "¿Publicaste contenido en el último mes?",
    options: [
      { label: "No publiqué nada", value: 0 },
      { label: "1-2 publicaciones", value: 1 },
      { label: "3 o más publicaciones", value: 2 },
    ],
  },
  {
    id: 4,
    question: "¿Personas fuera de tu municipio te siguen?",
    options: [
      { label: "No creo / no sé", value: 0 },
      { label: "Algunas personas", value: 1 },
      { label: "Sí, tengo alcance estatal o mayor", value: 2 },
    ],
  },
  {
    id: 5,
    question: "¿Respondes mensajes ciudadanos?",
    options: [
      { label: "Casi nunca", value: 0 },
      { label: "A veces", value: 1 },
      { label: "Siempre o casi siempre", value: 2 },
    ],
  },
  {
    id: 6,
    question: "¿Usas redes para informar acciones, no solo eventos?",
    options: [
      { label: "Solo comparto eventos", value: 0 },
      { label: "A veces informo acciones", value: 1 },
      { label: "Mi contenido es estratégico", value: 2 },
    ],
  },
  {
    id: 7,
    question: "¿Tienes una estrategia o calendario de contenidos?",
    options: [
      { label: "No, publico cuando se me ocurre", value: 0 },
      { label: "Tengo ideas pero sin calendario", value: 1 },
      { label: "Sí, planifico mis publicaciones", value: 2 },
    ],
  },
  {
    id: 8,
    question: "¿Tu comunicación diferencia tu voz personal de la institucional?",
    options: [
      { label: "Mezclo todo sin distinción", value: 0 },
      { label: "A veces separo temas", value: 1 },
      { label: "Sí, tengo líneas claras para cada voz", value: 2 },
    ],
  },
  {
    id: 9,
    question: "¿Mides el impacto de lo que publicas? (likes, comentarios, alcance)",
    options: [
      { label: "Nunca reviso estadísticas", value: 0 },
      { label: "A veces veo los likes", value: 1 },
      { label: "Sí, analizo métricas regularmente", value: 2 },
    ],
  },
  {
    id: 10,
    question: "¿Te han buscado medios, organizaciones o ciudadanos por tu presencia digital?",
    options: [
      { label: "Nunca", value: 0 },
      { label: "Alguna vez", value: 1 },
      { label: "Sí, con frecuencia", value: 2 },
    ],
  },
];

export const causes = [
  "Violencia contra las mujeres",
  "Autonomía económica",
  "Participación política",
  "Juventud",
  "Comunidad local",
];

export const convictions = [
  "creo que la política debe ser cercana y transparente",
  "estoy convencida de que el cambio empieza desde lo local",
  "sé que las mujeres transformamos la realidad cuando participamos",
  "defiendo que la ciudadanía merece representantes comprometidas",
  "lucho porque las nuevas generaciones tengan voz y oportunidades",
];

export const populations = [
  "mujeres",
  "jóvenes",
  "familias",
  "comunidades indígenas",
  "personas en situación vulnerable",
  "emprendedoras",
  "adultas mayores",
];

export const responsibilityLevels = [
  { value: "municipal", label: "Municipal" },
  { value: "estatal", label: "Estatal" },
  { value: "nacional", label: "Nacional" },
];

export const spokespersonTones = [
  { value: "cercano", label: "Cercano", desc: "Lenguaje cotidiano y empático" },
  { value: "tecnico", label: "Técnico", desc: "Datos, cifras y precisión" },
  { value: "combativo", label: "Combativo", desc: "Firme y directo" },
  { value: "esperanzador", label: "Esperanzador", desc: "Optimista y motivador" },
];

export const institutionalPostTypes = [
  { value: "rendicion", label: "Rendición de cuentas", desc: "Transparencia de gestión" },
  { value: "convocatoria", label: "Convocatoria ciudadana", desc: "Llama a la acción" },
  { value: "posicionamiento", label: "Posicionamiento político", desc: "Marca tu postura" },
  { value: "coyuntura", label: "Respuesta ante coyuntura", desc: "Reacciona al momento" },
  { value: "logro", label: "Logro de gestión", desc: "Muestra resultados" },
];

export const postTemplates = {
  territorio: {
    hook: "Mi territorio me necesita y yo respondo.",
    body: "Caminar las calles de {territory} me recuerda por qué hago lo que hago. Cada persona que me comparte su historia me confirma que {cause} no puede esperar.",
    cta: "¿Tú también crees que podemos transformar {territory}? Cuéntame tu historia. 👇",
  },
  causa: {
    hook: "Hay causas que no pueden esperar.",
    body: "{cause} es una realidad que enfrentan {population} todos los días. Desde {territory}, trabajo para que esto cambie.",
    cta: "Si esta causa también es tuya, hagamos red. 🤝 Sígueme para más.",
  },
  accion: {
    hook: "Hoy di un paso más.",
    body: "Activé mi presencia digital para llevar mi mensaje más lejos. Porque {cause} necesita voces comprometidas en cada espacio, también en el digital.",
    cta: "¿Y tú, ya activaste tu liderazgo digital? Te comparto cómo empezar. 💬",
  },
};

export const institutionalPostTemplates: Record<string, { hook: string; body: string; cta: string }> = {
  rendicion: {
    hook: "Rendir cuentas no es una opción, es una obligación.",
    body: "Desde {organization}, hemos trabajado en {causes} para {audience} en {territory}. Los resultados hablan: transparencia y compromiso real.",
    cta: "¿Quieres conocer más sobre nuestra gestión? Te comparto los detalles. 📋",
  },
  convocatoria: {
    hook: "Tu participación transforma {territory}.",
    body: "Desde {organization} abrimos espacios para que {audience} se sumen a la conversación sobre {causes}. Porque las decisiones que nos afectan deben incluirnos.",
    cta: "¿Te sumas? Comparte esta convocatoria y hagamos comunidad. 🤝",
  },
  posicionamiento: {
    hook: "Hay temas que exigen una postura clara.",
    body: "{causes} no puede seguir esperando. Desde {organization}, afirmamos nuestro compromiso con {audience} en {territory}. La política debe servir a la gente.",
    cta: "Si compartes esta visión, sígueme. Juntas somos más fuertes. 💪",
  },
  coyuntura: {
    hook: "Ante lo que pasa, no podemos quedarnos en silencio.",
    body: "Como {role} en {organization}, mi responsabilidad es responder. {causes} necesita atención urgente para proteger a {audience} en {territory}.",
    cta: "¿Qué opinas? Cuéntame en los comentarios. 👇",
  },
  logro: {
    hook: "Los hechos hablan más que las promesas.",
    body: "Desde {organization} logramos avances concretos en {causes} para {audience} en {territory}. Esto es lo que se puede hacer cuando hay voluntad política real.",
    cta: "Comparte este logro para que más personas sepan que sí se puede. ✅",
  },
};

export const route30DaysContent = [
  {
    week: 1,
    title: "Historia personal política",
    subtitle: "Conecta con tu audiencia desde lo personal",
    guide: "Esta semana comparte tu historia: ¿por qué decidiste participar en la vida pública? ¿Qué momento te marcó? Las personas conectan con historias reales, no con discursos.",
    postExample: "Hace [tiempo] tomé una decisión que cambió mi vida: involucrarme en [causa]. No fue fácil, pero cada día me confirma que [convicción]. Hoy te cuento por qué. 🧵👇",
  },
  {
    week: 2,
    title: "Profundización en causa",
    subtitle: "Posiciónate como referente en tu tema",
    guide: "Comparte datos, reflexiones o propuestas sobre tu causa principal. Demuestra conocimiento y compromiso. Usa cifras cuando sea posible.",
    postExample: "¿Sabías que [dato sobre causa]? Desde [territorio] trabajamos para cambiar esta realidad. Aquí te comparto 3 acciones concretas que estamos impulsando. 📊",
  },
  {
    week: 3,
    title: "Acción concreta en territorio",
    subtitle: "Muestra lo que haces, no solo lo que dices",
    guide: "Documenta una acción real: una visita, una reunión, un evento. Las fotos y videos de terreno generan más confianza que cualquier texto.",
    postExample: "Hoy estuve en [lugar] escuchando a [población]. Sus necesidades son claras: [necesidad]. Desde [organización] nos comprometemos a [acción]. 📍",
  },
  {
    week: 4,
    title: "Convocatoria ciudadana",
    subtitle: "Invita a la acción colectiva",
    guide: "Cierra el mes invitando a tu comunidad a sumarse. Puede ser a un evento, a una causa o simplemente a seguirte para más contenido con propósito.",
    postExample: "Este mes di los primeros pasos para llevar mi liderazgo al mundo digital. Pero esto no se hace solo/a. ¿Te sumas a construir un [territorio] más [adjetivo]? 🤝",
  },
];

export function getDiagnosticLevel(score: number): { level: string; color: string; label: string; message: string } {
  if (score <= 6) {
    return {
      level: "rojo",
      color: "bg-red-500",
      label: "Presencia inicial",
      message: "Tu presencia digital está en fase inicial. ¡Hoy es el día perfecto para activarla! Sigue adelante con este proceso.",
    };
  }
  if (score <= 13) {
    return {
      level: "amarillo",
      color: "bg-yellow-500",
      label: "Presencia en desarrollo",
      message: "Ya tienes bases, pero puedes potenciar tu visibilidad. Este ejercicio te ayudará a dar el siguiente paso.",
    };
  }
  return {
    level: "verde",
    color: "bg-green-500",
    label: "Presencia activa",
    message: "¡Excelente! Tu presencia es sólida. Vamos a afinar tu mensaje para que sea aún más estratégico.",
  };
}

export function generateMessage(cause: string, conviction: string, population: string[], territory: string): string {
  const pop = population.length > 1
    ? population.slice(0, -1).join(", ") + " y " + population[population.length - 1]
    : population[0] || "la ciudadanía";
  return `Trabajo por ${cause.toLowerCase()} porque ${conviction}, para que ${pop} en ${territory} vivan con más libertad y oportunidades.`;
}

export function generateBio(name: string, role: string, state: string, cause: string, message: string): string {
  const shortMsg = message.length > 80 ? message.substring(0, 77) + "..." : message;
  return `${name}\n${role} | ${state}\nEnfocada en ${cause.toLowerCase()}\n${shortMsg}\n📩 Contacto`;
}

export function generateInstitutionalBio(name: string, instRole: string, organization: string, orgCauses: string[], audience: string): string {
  const causesText = orgCauses.length > 1
    ? orgCauses.slice(0, -1).join(", ") + " y " + orgCauses[orgCauses.length - 1]
    : orgCauses[0] || "";
  return `${name}\n${instRole} en ${organization}\nImpulsando: ${causesText.toLowerCase()}\nPor ${audience.toLowerCase()}\n🏛️ Servicio público con propósito`;
}

export function generateHybridBio(name: string, role: string, instRole: string, organization: string, cause: string, state: string): string {
  return `${name}\n${role} | ${instRole} en ${organization}\n${state} · Enfocada en ${cause.toLowerCase()}\nLiderazgo con convicción y servicio público\n📩 Contacto`;
}

export function generateInstitutionalCard(organization: string, causes: string[], audience: string, territory: string): string {
  const causesText = causes.length > 1
    ? causes.slice(0, -1).join(", ") + " y " + causes[causes.length - 1]
    : causes[0] || "";
  return `Desde mi responsabilidad en ${organization}, trabajo para impulsar ${causesText.toLowerCase()} en beneficio de ${audience.toLowerCase()} en ${territory}.`;
}

export function generateSpokespersonGuide(phrase: string, tone: string, topics: string[], sensitive: string[]) {
  const toneMap: Record<string, string[]> = {
    cercano: ["empatía", "escucha", "comunidad", "compromiso", "cercanía"],
    tecnico: ["evidencia", "resultados", "indicadores", "gestión", "eficiencia"],
    combativo: ["justicia", "transformación", "dignidad", "exigencia", "firmeza"],
    esperanzador: ["futuro", "posibilidad", "cambio", "esperanza", "construcción"],
  };
  const keywords = toneMap[tone] || toneMap.cercano;
  const narratives = [
    `Desde la perspectiva de ${tone === "cercano" ? "cercanía" : tone === "tecnico" ? "los datos" : tone === "combativo" ? "la exigencia" : "la esperanza"}: enfatizar logros concretos y compromisos medibles.`,
    `Narrativa territorial: vincular siempre el mensaje con el impacto local y las personas beneficiadas.`,
    `Narrativa de causa: posicionar los temas prioritarios como urgentes y con soluciones claras.`,
  ];
  const consistency = [
    "Mantener coherencia entre mensaje personal e institucional.",
    "Usar las palabras clave en al menos 3 de cada 5 publicaciones.",
    `Evitar temas sensibles: ${sensitive.length > 0 ? sensitive.join(", ") : "ninguno definido"}.`,
    "Revisar tono antes de publicar: ¿suena como mi marca política?",
  ];
  return { phrase, keywords, narratives, consistency, topics };
}

export function generatePost(type: keyof typeof postTemplates, cause: string, population: string[], territory: string): string {
  const template = postTemplates[type];
  const pop = population.length > 1
    ? population.slice(0, -1).join(", ") + " y " + population[population.length - 1]
    : population[0] || "la ciudadanía";

  const text = `${template.hook}\n\n${template.body}\n\n${template.cta}`;
  return text
    .replace(/{cause}/g, cause.toLowerCase())
    .replace(/{territory}/g, territory)
    .replace(/{population}/g, pop);
}

export function generateInstitutionalPost(
  type: string,
  cause: string,
  organization: string,
  audience: string,
  territory: string,
  role: string,
  orgCauses: string[]
): string {
  const template = institutionalPostTemplates[type] || institutionalPostTemplates.rendicion;
  const causesText = orgCauses.length > 0
    ? orgCauses.slice(0, 2).join(" y ").toLowerCase()
    : cause.toLowerCase();

  const text = `${template.hook}\n\n${template.body}\n\n${template.cta}`;
  return text
    .replace(/{causes}/g, causesText)
    .replace(/{territory}/g, territory)
    .replace(/{audience}/g, audience.toLowerCase())
    .replace(/{organization}/g, organization)
    .replace(/{role}/g, role);
}
