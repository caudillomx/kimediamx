// Contenido de la sesión "Estrategia digital" — Programa de Formación de Líderes Políticos 2026
// (Centro de Formación de Liderazgos). Expositor: Jesús Caudillo, KiMedia.
// Citas y datos: solo fuentes verificables; cada uno lleva su referencia.

export const POLLS = {
  fuente: {
    q: "¿Dónde se entera usted primero de una noticia?",
    options: ["WhatsApp", "Facebook", "X / Twitter", "TikTok o Instagram", "YouTube o pódcast", "Radio o TV", "Periódico o portal"],
  },
  reto: {
    q: "¿Cuál es hoy su mayor freno para tener presencia digital?",
    options: ["Falta de tiempo", "No sé qué publicar", "Miedo a exponerme o a la crítica", "No tengo equipo", "No veo resultados", "No sé por dónde empezar"],
  },
  compromiso: {
    q: "¿Qué va a hacer en los próximos 7 días?",
    options: ["Ordenar mi perfil y mi biografía", "Definir mi causa en una frase", "Armar mis 3 pilares de contenido", "Publicar 3 veces esta semana", "Activar alertas y escucha", "Abrir mi canal de WhatsApp"],
  },
} as const;
export type PollKey = keyof typeof POLLS | "diag";

/** Personajes con foto de Wikipedia (se carga por título del artículo en inglés). */
export const ERAS = [
  { year: "1440", era: "Imprenta", who: "Johannes Gutenberg", wiki: "Johannes_Gutenberg", lesson: "Quien controla el medio, amplía su voz: la Reforma se difundió en panfletos." },
  { year: "1933", era: "Radio", who: "Franklin D. Roosevelt", wiki: "Franklin_D._Roosevelt", lesson: "Sus «charlas junto a la chimenea» hablaron directo a cada hogar, sin intermediarios." },
  { year: "1960", era: "Televisión", who: "John F. Kennedy", wiki: "John_F._Kennedy", lesson: "El primer debate televisado: la imagen pesó tanto como el argumento." },
  { year: "2008", era: "Redes sociales", who: "Barack Obama", wiki: "Barack_Obama", lesson: "Primera gran campaña construida en redes: comunidad, voluntarios y donativos pequeños." },
  { year: "2022", era: "Inteligencia artificial", who: "Sam Altman (OpenAI)", wiki: "Sam_Altman", lesson: "ChatGPT llegó a 100 millones de usuarios en dos meses. Hoy cualquiera produce contenido." },
] as const;

export const QUOTES = [
  { who: "Marshall McLuhan", wiki: "Marshall_McLuhan", role: "Teórico de la comunicación", text: "El medio es el mensaje.", src: "Understanding Media, 1964" },
  { who: "Papa Francisco", wiki: "Pope_Francis", role: "Mensaje para la Jornada Mundial de las Comunicaciones Sociales", text: "Internet puede ofrecer mayores posibilidades de encuentro y de solidaridad entre todos; y esto es bueno, es un don de Dios.", src: "Vaticano, 2014" },
  { who: "Sundar Pichai", wiki: "Sundar_Pichai", role: "CEO de Google", text: "La IA es una de las cosas más importantes en las que trabaja la humanidad. Es más profunda que la electricidad o el fuego.", src: "Entrevista con MSNBC y Recode, 2018" },
  { who: "Yuval Noah Harari", wiki: "Yuval_Noah_Harari", role: "Historiador", text: "Los humanos pensamos en historias, más que en hechos, números o ecuaciones.", src: "21 lecciones para el siglo XXI, 2018" },
] as const;

export const MEXICO = [
  { who: "Andrés Manuel López Obrador", wiki: "Andrés_Manuel_López_Obrador", label: "La mañanera", lesson: "Fijar la agenda todos los días: quien habla primero, define la conversación." },
  { who: "Samuel García", wiki: "Samuel_García_(politician)", label: "Nuevo León, 2021", lesson: "Lenguaje de redes y una aliada creadora de contenido (Mariana Rodríguez) acercaron la campaña a públicos que no veían política." },
  { who: "Xóchitl Gálvez", wiki: "Xóchitl_Gálvez", label: "De un amparo a candidata, 2023", lesson: "Un momento auténtico y viral puede abrir una candidatura, pero sin estructura no alcanza para ganar." },
  { who: "Claudia Sheinbaum", wiki: "Claudia_Sheinbaum", label: "Campaña 2024", lesson: "Disciplina de mensaje: pocas ideas, repetidas en todos los formatos y con estructura territorial detrás." },
] as const;

export const DATA_MX = [
  { n: "97 millones", t: "de personas usan internet en México", s: "INEGI · ENDUTIH 2023" },
  { n: "81%", t: "de la población de 6 años o más está conectada", s: "INEGI · ENDUTIH 2023" },
  { n: "2 meses", t: "tardó ChatGPT en llegar a 100 millones de usuarios", s: "Reuters, feb 2023 (estimación de UBS)" },
] as const;

export const PRINCIPIOS = [
  { t: "De difundir a conversar", d: "Ya no basta con comunicar: hay que escuchar, responder y sumar a otros." },
  { t: "La atención es el recurso escaso", d: "Usted no compite contra otros políticos: compite contra todo lo que hay en el celular." },
  { t: "Confianza antes que alcance", d: "Mil personas que le creen valen más que cien mil que le vieron pasar." },
  { t: "Constancia vence a viralidad", d: "Un viral se olvida en días. Una voz constante construye reputación en años." },
  { t: "Lo digital se vuelve territorio", d: "Cada seguidor útil es un voluntario, un donante o un vocero potencial." },
] as const;

export const RIESGOS = [
  { t: "Cambridge Analytica (2018)", d: "Datos de hasta 87 millones de usuarios de Facebook usados para perfilar votantes. Lección: la confianza y los datos se cuidan.", s: "The Guardian / The New York Times" },
  { t: "Desinformación y deepfakes", d: "Audios y videos falsos ya circulan en campañas. Tenga un protocolo de respuesta antes de necesitarlo." },
  { t: "Su pasado también es público", d: "Lo que publicó hace 10 años se puede encontrar hoy. Haga una auditoría personal." },
  { t: "Crisis en minutos", d: "Una frase fuera de contexto puede volverse tendencia en una hora. Responda rápido, con hechos y sin pelear." },
] as const;

export const DIAG = [
  "Si alguien me busca en Google, lo primero que aparece habla bien de mí y está actualizado.",
  "Puedo explicar en una sola frase qué causa defiendo y por qué.",
  "Mi foto y mi biografía son iguales y profesionales en todas mis redes.",
  "Publico al menos una vez por semana sobre mi causa o mi trabajo.",
  "Sé cuál de mis publicaciones funcionó mejor el último mes y por qué.",
  "Respondo comentarios y mensajes de manera constante.",
  "Tengo una lista propia de contactos (WhatsApp, correo) a la que puedo convocar.",
  "Me entero rápido cuando alguien habla de mí o de mi tema.",
  "Tengo claro qué haría si mañana circula algo falso o negativo sobre mí.",
  "Uso alguna herramienta de IA para preparar textos, ideas o análisis.",
] as const;

export const NIVELES = [
  { min: 0, k: "Invisible", d: "Hoy casi nadie le encuentra en digital. La buena noticia: todo lo que haga ya suma. Empiece por su perfil y su frase de causa." },
  { min: 8, k: "Presente", d: "Tiene base, pero sin sistema. Defina 3 pilares de contenido y un calendario semanal." },
  { min: 14, k: "Activo", d: "Ya publica con constancia. Lo siguiente: medir, escuchar y convertir seguidores en comunidad." },
  { min: 18, k: "Influyente", d: "Su presencia trabaja para usted. Ahora sume a otros: voceros, aliados y equipo." },
] as const;

export const nivelDe = (score: number) => [...NIVELES].reverse().find((n) => score >= n.min)!;

export const HERRAMIENTAS = [
  {
    n: "01", t: "Su frase de causa", sub: "Antes de publicar, sepa qué quiere que recuerden de usted.",
    formula: "Yo trabajo para que [a quién] logre [qué cambio] porque [por qué me importa / qué he hecho].",
    ejemplo: "Trabajo para que los pequeños negocios de mi municipio dejen de perder clientes por trámites, porque llevo 15 años emprendiendo aquí.",
  },
  {
    n: "02", t: "Su mapa de presencia", sub: "Lo mínimo que debe existir y estar en orden.",
    items: ["Resultado de Google (búsquese hoy)", "Foto profesional igual en todas las redes", "Biografía con su causa en una línea", "Una red principal donde está su público", "Canal o lista de WhatsApp propia", "Página o enlace con quién es y cómo contactarle"],
  },
  {
    n: "03", t: "3 pilares de contenido", sub: "Para no improvisar: tres temas fijos que se alternan.",
    items: ["Causa: el problema que quiere resolver y sus propuestas", "Prueba: lo que hace, resultados, territorio, personas", "Persona: quién es, valores, historia, detrás de cámaras"],
  },
  {
    n: "04", t: "La estructura de cada pieza", sub: "Gancho → Problema → Solución → Llamado a la acción.",
    ejemplo: "«¿Sabía que abrir un negocio aquí tarda 3 meses? (gancho) Eso deja a cientos de familias sin ingreso (problema). Propongo una ventanilla única digital (solución). ¿Usted cuánto tardó? Cuéntemelo (llamado).»",
  },
  {
    n: "05", t: "Su semana digital", sub: "Un ritmo que sí se puede sostener.",
    items: ["Lunes: una idea o postura sobre su causa", "Miércoles: evidencia (algo que hizo o vio en territorio)", "Viernes: algo personal o de equipo", "Diario: 15 minutos para responder comentarios", "Domingo: revisar qué funcionó"],
  },
  {
    n: "06", t: "Escucha y medición", sub: "Herramientas gratuitas para saber qué pasa.",
    items: ["Alertas de Google con su nombre y su tema", "Google Trends para saber qué busca la gente", "Meta Business Suite para medir Facebook e Instagram", "Mida: comentarios, compartidos y mensajes, no solo «likes»"],
  },
] as const;

export const PROMPTS = [
  "Actúa como mi asesor de comunicación. Mi causa es [frase]. Propón 10 ideas de publicaciones para un mes, repartidas en tres pilares: causa, prueba y persona.",
  "Reescribe este texto con la estructura gancho, problema, solución y llamado a la acción. Máximo 80 palabras, lenguaje cercano y sin frases hechas: [texto].",
  "Resume en 5 puntos lo que se dice en estas noticias sobre [tema] y dime qué postura toma cada fuente: [enlaces o textos].",
  "Imagina las 5 críticas más duras que me podrían hacer sobre [propuesta] y ayúdame a responder cada una con hechos y en tono respetuoso.",
] as const;

export const PREGUNTAS = [
  "Si hoy alguien le googlea, ¿qué encuentra? ¿Le representa?",
  "¿Qué le gustaría que dijeran de usted cuando no está en la sala?",
  "Si mañana desaparecieran sus redes, ¿cuántas personas podría convocar por su cuenta?",
] as const;
