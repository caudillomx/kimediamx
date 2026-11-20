/** Taller del sábado "Mi plan digital 2027" (sesión 2). Claves en cfl_votes con prefijo cf27:s… */
export const HABITS = [
  'Reviso qué se dice de mi municipio al menos una vez por semana',
  'Verifico fuente y fecha antes de compartir',
  'Sé qué red usa cada grupo que me interesa',
  'Mido algo más que "me gusta"',
];
export const habitKey = (i: number) => `s02-${i}`;
export const FIRE = ['Lo apaga', 'Lo aviva'];
export const PRACTICES = ['Escuchar mi municipio cada semana', 'Verificar antes de compartir', 'Segmentar por red y formato', 'Medir más que "me gusta"'];
export const FUNNEL = ['Ven la convocatoria', 'Preguntan detalles', 'Se registran', 'Llegan', 'Siguen en contacto'];
export const CASE_TYPES = ['Falso con riesgo alto', 'Rumor sin evidencia', 'Error propio'];
export const DECISIONS = ['Responder', 'Monitorear', 'Corregir'];
export const PROTOCOL = ['Detener', 'Precisar', 'Rastrear', 'Contrastar', 'Documentar'];
export const PROMPTS = [
  'Con esta información de mi municipio: [pega lo del ejercicio 1]. Propón 3 segmentos de audiencia por necesidad y situación, sin estereotipos ni datos sensibles.',
  'Escribe una publicación de Facebook de 60 palabras para [segmento] sobre [tema], tono cercano, con un dato verificable y una pregunta al final. No inventes cifras: marca con [DATO] donde falte.',
  'Reescribe este texto para Instagram en formato carrusel de 5 láminas: [texto].',
];

export type Ex1 = { tema?: string; tono?: string; quien?: string; hueco?: string; cuenta?: string };
export type Seg = { nombre?: string; necesidad?: string; red?: string; formato?: string };
export type Ex2 = { segmentos?: Seg[]; vainilla?: string; palabras?: string; soy?: string; para?: string; pieza?: string };
export type Ex3 = { ataque?: string; tipo?: string; decision?: string; respuesta?: string };
export type Ex4 = { accion?: string; metas?: (number | null)[]; barreras?: { barrera?: string; solucion?: string }[]; indicador?: string };
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
