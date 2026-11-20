import raw from './centroFox2027.json';

export const CF27 = 'cf27';
export const cf27Key = (id: string) => `${CF27}:${id}`;
export const D = raw;
export const INE = raw.caso_ine;
export const COM = raw.comentarios;

export const MOMENTS = ['Emisión', 'Circulación', 'Reinterpretación', 'Respuesta'] as const;
export type Moment = typeof MOMENTS[number];

/** Veces que B superó a A, con un decimal (lo que se muestra al revelar). */
export const multiplier = (a: number, b: number) => Math.round((b / a) * 10) / 10;

export const fmt = (n: number) => n.toLocaleString('es-MX');
export const millions = (n: number) => `${(n / 1_000_000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} millones`;

export type Activity = { id: string; slide: number; kind: 'poll' | 'prediction' | 'classify' | 'word'; q: string; options: string[]; context?: string };

export const ACTIVITIES: Activity[] = [
  { id: 'v02', slide: 2, kind: 'poll', q: '¿Dónde te enteras primero de una noticia?', options: ['WhatsApp', 'Redes sociales', 'Medios digitales', 'Radio o televisión'] },
  { id: 'v03', slide: 3, kind: 'poll', q: '¿Sabes qué se dijo esta semana en redes sobre tu municipio?', options: ['Sí, con detalle', 'Más o menos', 'No'] },
  ...INE.juego_cual_funciono.slice(0, 3).map((r, i) => ({
    id: `v${String(9 + i).padStart(2, '0')}`, slide: 9 + i, kind: 'prediction' as const,
    q: `Ronda ${r.ronda}: ¿cuál tuvo más interacción?`, options: ['A', 'B'], context: r.A.perfil,
  })),
  { id: 'v19', slide: 19, kind: 'poll', q: 'Este comentario, ¿es elogio o burla?', options: ['Elogio sincero', 'Burla o sarcasmo', 'No se puede saber'] },
  { id: 'v21a', slide: 21, kind: 'classify', q: 'Caso 1 · El audio falso', options: ['Responder', 'Monitorear', 'Corregir'] },
  { id: 'v21b', slide: 21, kind: 'classify', q: 'Caso 2 · La página anónima', options: ['Responder', 'Monitorear', 'Corregir'] },
  { id: 'v21c', slide: 21, kind: 'classify', q: 'Caso 3 · La cifra equivocada', options: ['Responder', 'Monitorear', 'Corregir'] },
  { id: 'v24', slide: 24, kind: 'word', q: 'En una palabra: ¿qué te llevas de hoy?', options: [] },
];
export const activity = (id: string) => ACTIVITIES.find(a => a.id === id)!;

export const CASES = [
  { id: 'v21a', title: 'El audio falso', text: 'En grupos de WhatsApp de tu municipio circula un audio, atribuido a ti, donde ofreces despensas a cambio de votos. No es tu voz.', answer: 'Responder', why: 'Riesgo alto y posible tema legal. Verifica, coordina con jurídico y publica la evidencia.' },
  { id: 'v21b', title: 'La página anónima', text: 'Una página anónima con 800 seguidores dice que tu suplente tiene propiedades no declaradas. No hay pruebas y ningún otro medio lo ha retomado.', answer: 'Monitorear', why: 'Si respondes, lo amplificas. Revisa de dónde salió y ten lista una respuesta por si crece.' },
  { id: 'v21c', title: 'La cifra equivocada', text: 'Tu equipo publicó una cifra equivocada de obras del municipio y un regidor contrario la exhibió.', answer: 'Corregir', why: 'Corrige a la vista de todos, explica el dato correcto y actualiza la publicación.' },
];

export const MATRIX = [
  { tipo: 'Falso con riesgo alto', accion: 'Responder', como: 'Verificar, coordinar con jurídico y publicar evidencia.' },
  { tipo: 'Rumor sin evidencia ni eco', accion: 'Monitorear', como: 'No amplificar; revisar fuentes y preparar respuesta por si escala.' },
  { tipo: 'Error propio', accion: 'Corregir', como: 'Reconocerlo de forma visible, dar el dato correcto y actualizar.' },
];

/** Normaliza una palabra para la nube: minúsculas, sin acentos ni signos. */
export function normalizeWord(input: string) {
  return input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zñ0-9 ]/g, '').replace(/\s+/g, ' ').slice(0, 30);
}
const BLOCK = ['puto', 'puta', 'pendejo', 'pendeja', 'verga', 'chinga', 'mierda', 'cabron', 'culero', 'pinche', 'joto', 'idiota', 'estupido'];
export const isClean = (w: string) => w.length >= 2 && !BLOCK.some(b => w.includes(b));
