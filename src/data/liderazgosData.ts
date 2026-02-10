export const mexicanStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
  "Yucatán", "Zacatecas",
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

export function getDiagnosticLevel(score: number): { level: string; color: string; label: string; message: string } {
  if (score <= 4) {
    return {
      level: "rojo",
      color: "bg-red-500",
      label: "Presencia inicial",
      message: "Tu presencia digital está en fase inicial. ¡Hoy es el día perfecto para activarla! Sigue adelante con este proceso.",
    };
  }
  if (score <= 8) {
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
