/** Taller del sábado "Mi plan digital 2027" (sesión 2). Claves en cfl_votes con prefijo cf27:s… */
export const HABITS = [
  'Reviso qué se dice de mi municipio al menos una vez por semana',
  'Verifico fuente y fecha antes de compartir',
  'Sé qué red usa cada grupo que me interesa',
  'Mido algo más que "me gusta"',
];
export const habitKey = (i: number) => `s02-${i}`;
export const FIRE = ['Lo apaga', 'Lo aviva'];
export const PRACTICES = ['Escuchar mi municipio cada semana', 'Verificar antes de compartir', 'Segmentar por red y formato', 'Medir más que "me gusta"', 'Dejar de usar mis redes como megáfono'];
export const FUNNEL = ['Ven la convocatoria', 'Preguntan detalles', 'Se registran', 'Llegan', 'Seguimiento hasta la jornada electoral'];
export const CASE_TYPES = ['Falso con riesgo alto', 'Rumor sin evidencia', 'Error propio'];
export const DECISIONS = ['Responder', 'Monitorear', 'Corregir'];
export const PROTOCOL = ['Detener', 'Precisar', 'Rastrear', 'Contrastar', 'Documentar'];
export const PROMPTS = [
  'Con esta información de mi municipio: [pega lo del ejercicio 1]. Propón 3 segmentos de audiencia con al menos tres capas cada uno (territorio, quiénes son, dónde se informan, qué les preocupa y a quién le creen), sin estereotipos ni datos sensibles.',
  'Escribe una publicación de Facebook de 60 palabras para [segmento] sobre [tema], tono cercano, con un dato verificable y una pregunta al final. No inventes cifras: marca con [DATO] donde falte.',
  'Reescribe este texto para Instagram en formato carrusel de 5 láminas: [texto].',
];

export const ELECTION = '2027-06-06';
export const ROUTES = ['Si aspiras a una candidatura', 'Si eres red local (militante, comité, voluntario)'] as const;
export type Route = typeof ROUTES[number];
export const isCandidate = (r?: string) => r !== ROUTES[1];
/** Puente con el viernes: la lección del caso INE que abre cada ejercicio. */
export const BRIDGES = [
  'Recuerden el futbolista: busquen bien o se les cuela el ruido.',
  'Recuerden a Anaya: el mismo mensaje rindió 4 veces más publicado a tiempo. Y el 86%: ¿quién habla en su municipio que no es político?',
  'Recuerden a la Presidenta: lo que quisieron decir no es lo que van a leer.',
  'Recuerden el embudo: “me gusta” no es voto.',
];
/** Preguntas que cambian según la ruta (índice 0: aspirante, 1: red local). */
export const ROUTE_Q = {
  hueco: ['¿Qué hueco nadie está ocupando y podrías ocupar tú?', '¿Qué preguntan los vecinos que nadie responde?'],
  soy: ['Soy quien…', 'Somos el comité que…'],
  pieza: ['La pieza para tu perfil (revisada por el equipo)', 'La pieza para el grupo de WhatsApp o la página de la colonia'],
  ataque: ['Cómo sacaría de contexto el adversario la pieza del aspirante', 'Cómo llega el ataque al grupo de WhatsApp de la colonia'],
  accion: ['La acción del aspirante (recorrido, consulta, reunión)', 'La acción de la red (reunión vecinal, jornada, brigada)'],
};
export const LAYERS = [
  ['territorio', 'Territorio (colonia o zona)'],
  ['quienes', 'Quiénes son (edad, momento de vida, ocupación)'],
  ['donde', 'Dónde se informan (red principal y si usan WhatsApp)'],
  ['preocupa', 'Qué les preocupa y con qué palabras lo dicen (sale del ejercicio 1)'],
  ['creen', 'A quién le creen (vecina, líder local, creador, medio)'],
] as const;
export const CONSENT = 'Confirmo que este segmento no se basa en datos sensibles ni en bases sin consentimiento.';
export const ATTACKS = [
  'La “verificación de integridad del INE”: sembrar la duda de que no pasarías, sin decir por qué.',
  'Culpar al pasado: si su partido gobierna ahí, “siempre le echan la culpa al anterior”.',
  'Sacar de contexto una frase de la pieza.',
  'El comentario burlón que tendría más “me gusta”.',
];
export const CRITERIA = ['¿Verificó?', '¿Amplifica al atacante?', '¿Aporta evidencia?'];
export const LEGAL = 'Antes de publicar como aspirante, revisen con el jurídico de su comité las reglas de actos anticipados de precampaña y campaña.';

/** Un segmento cuenta si tiene al menos tres capas y la casilla de consentimiento marcada. */
export function segReady(s: Seg = {}) {
  const layers = LAYERS.filter(([k]) => (s[k] ?? '').trim()).length;
  return layers >= 3 && s.ok === true;
}
export const segStarted = (s: Seg = {}) => LAYERS.some(([k]) => (s[k] ?? '').trim());
/** La acción de movilización debe tener fecha anterior a la jornada del 6 de junio de 2027. */
export const beforeElection = (d?: string) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d < ELECTION;
/** Cierre del sábado: práctica menos común al empezar contra el compromiso más votado. */
export function closingLine(habitYes: number[], commits: Record<string, number>) {
  const anyHabit = habitYes.some(v => v > 0); const anyCommit = Object.values(commits).some(v => v > 0);
  if (!anyHabit || !anyCommit) return null;
  const least = HABITS[habitYes.indexOf(Math.min(...habitYes))];
  const top = PRACTICES.reduce((a, b) => ((commits[b] ?? 0) > (commits[a] ?? 0) ? b : a), PRACTICES[0]);
  return { least, top };
}

export type Ex1 = { ruta?: string; tema?: string; tono?: string; quien?: string; hueco?: string; cuenta?: string };
export type Seg = { territorio?: string; quienes?: string; donde?: string; preocupa?: string; creen?: string; ok?: boolean };
export type Ex2 = { ruta?: string; voces?: string; cuando?: string; detener?: string; segmentos?: Seg[]; vainilla?: string; palabras?: string; soy?: string; para?: string; pieza?: string };
export type Ex3 = { ruta?: string; ataque?: string; tipo?: string; decision?: string; respuesta?: string };
export type Ex4 = { ruta?: string; fecha?: string; accion?: string; metas?: (number | null)[]; barreras?: { barrera?: string; solucion?: string }[]; indicador?: string };
export type Team = { id: string; nombre: string; estado: string; municipio: string; integrantes: number; ex1: Ex1; ex2: Ex2; ex3: Ex3; ex4: Ex4; created_at: string };

/** Ronda: cada equipo hace la lectura hostil de la pieza del siguiente (por orden de registro). Todos reciben exactamente un ataque. */
export function targetOf<T extends { id: string }>(teams: T[], id: string): T | undefined {
  const i = teams.findIndex(t => t.id === id); if (i < 0 || !teams.length) return undefined;
  return teams[(i + 1) % teams.length];
}
export function attackerOf<T extends { id: string }>(teams: T[], id: string): T | undefined {
  const i = teams.findIndex(t => t.id === id); if (i < 0 || !teams.length) return undefined;
  return teams[(i - 1 + teams.length) % teams.length];
}
export const words40 = (s = '') => s.trim().split(/\s+/).filter(Boolean).length;
