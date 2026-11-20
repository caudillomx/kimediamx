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

export type Activity = { id: string; kind: 'poll' | 'prediction' | 'classify' | 'word'; q: string; options: string[]; context?: string; correct?: string; optional?: boolean };

const R = INE.juego_cual_funciono;
const winner = (i: number) => (R[i].B.interacciones >= R[i].A.interacciones ? 'B' : 'A');
const DECIDE = ['Responder', 'Monitorear', 'Corregir'];

/** Actividades del viernes en el orden en que aparecen en la presentación. */
export const ACTIVITIES: Activity[] = [
  { id: 'a01', kind: 'poll', q: 'Sé honesto: ¿para qué usas hoy tus redes?', options: ['Para que me conozcan', 'Para informar lo que hago', 'Para escuchar a la gente', 'Para pedir el voto', 'No tengo claro para qué'] },
  { id: 'v02', kind: 'poll', q: '¿Dónde te enteras primero de una noticia?', options: ['WhatsApp', 'Redes sociales', 'Medios digitales', 'Radio o televisión'] },
  { id: 'v03', kind: 'poll', q: '¿Sabes qué se dijo esta semana en redes sobre tu municipio?', options: ['Sí, con detalle', 'Más o menos', 'No'] },
  { id: 'v07', kind: 'poll', q: '¿Quién creen que se llevó más interacciones?', options: ['Políticos y partidos', 'Medios, periodistas e influencers', 'Empresarios', 'La cuenta del INE'], correct: 'Medios, periodistas e influencers' },
  ...R.slice(0, 2).map((r, i) => ({
    id: `v${String(9 + i).padStart(2, '0')}`, kind: 'prediction' as const,
    q: `Ronda ${r.ronda}: ¿cuál tuvo más interacción?`, options: ['A', 'B'], context: r.A.perfil, correct: winner(i),
  })),
  { id: 'e01', kind: 'poll', q: 'Hoy, ¿cómo segmentas tu comunicación?', options: ['No segmento: le hablo a todos', 'Por sexo y edad', 'Por colonia o zona', 'Por temas e intereses', 'Combino varias capas'] },
  { id: 'v12', kind: 'poll', q: '¿En qué red rindió más cada publicación de este caso?', options: ['Facebook', 'Instagram'], correct: [...INE.facebook_vs_instagram].sort((a, b) => b.mediana_tasa_interaccion_pct - a.mediana_tasa_interaccion_pct)[0].red },
  { id: 'v17', kind: 'poll', q: '¿Cuál de estas cuatro publicaciones tuvo más comentarios en contra de quien publicó?', options: ['Latinus', 'Ricardo Salinas', 'Verónica Camino', 'Claudia Sheinbaum'], correct: 'Claudia Sheinbaum' },
  { id: 'v19', kind: 'poll', q: 'Este comentario, ¿es elogio o burla?', options: ['Elogio sincero', 'Burla o sarcasmo', 'No se puede saber'], correct: 'No se puede saber', optional: true },
  { id: 'v21a', kind: 'classify', q: 'Caso 1 · El audio falso', options: DECIDE, correct: 'Responder' },
  { id: 'v21d', kind: 'classify', q: 'Caso 4 · La verificación de integridad', options: DECIDE, correct: 'Monitorear' },
  { id: 'v21b', kind: 'classify', q: 'Caso 2 · La página anónima (opcional)', options: DECIDE, correct: 'Monitorear', optional: true },
  { id: 'v21c', kind: 'classify', q: 'Caso 3 · La cifra equivocada (opcional)', options: DECIDE, correct: 'Corregir', optional: true },
  { id: 'v22', kind: 'poll', q: 'En una reunión vecinal convocada en redes, de cada 200 “me gusta”, ¿cuántos creen que llegan?', options: ['Más de 100', 'Entre 50 y 100', 'Entre 15 y 50', 'Menos de 15'], correct: 'Entre 15 y 50' },
  { id: 'v24', kind: 'word', q: 'En una palabra: ¿qué te llevas de hoy?', options: [] },
];
export const activity = (id: string) => ACTIVITIES.find(a => a.id === id)!;

export type Tally = Record<string, number>;
export type RevealKind = 'real' | 'lectura' | 'recomendada';
/** Veredicto de una línea: lo que votó la sala contra el dato real (o la lectura, si no hay respuesta correcta). */
export function verdict(t: Tally, options: string[], correct?: string, kind: RevealKind = 'real', tpl?: (pct: number) => string): string {
  const total = options.reduce((s, o) => s + (t[o] ?? 0), 0);
  if (!total) return 'Todavía no hay votos de la sala.';
  const pct = (o: string) => Math.round(((t[o] ?? 0) / total) * 100);
  const top = [...options].sort((a, b) => (t[b] ?? 0) - (t[a] ?? 0))[0];
  if (!correct) return `La mayoría de la sala respondió “${top}” (${pct(top)}%).`;
  if (tpl) return tpl(pct(correct));
  if (kind === 'recomendada') return `La sala votó “${top}” (${pct(top)}%); la respuesta recomendada es “${correct}”.`;
  if ((t[top] ?? 0) === (t[correct] ?? 0)) return `El ${pct(correct)}% de la sala acertó.`;
  return `La sala votó por “${top}”; en realidad ganó “${correct}”.`;
}

export const CASES = [
  { id: 'v21a', title: 'El audio falso', text: 'En grupos de WhatsApp de tu municipio circula un audio, atribuido a ti, donde ofreces despensas a cambio de votos. No es tu voz.', answer: 'Responder', label: 'Responder', why: 'Riesgo alto y posible tema legal. Verifica, coordina con jurídico y publica la evidencia.' },
  { id: 'v21d', title: 'La verificación de integridad', text: 'Una página local publica que “no pasarías la verificación de integridad del INE”, sin decir por qué. Ya la compartieron 300 personas y un regidor contrario.', answer: 'Monitorear', label: 'Monitorear y preparar', why: 'No amplificar con una respuesta pública inmediata; reunir evidencia de tu trayectoria; responder solo si escala o si lo retoma un medio, con documento en mano.' },
  { id: 'v21b', title: 'La página anónima', optional: true, text: 'Una página anónima con 800 seguidores dice que tu suplente tiene propiedades no declaradas. No hay pruebas y ningún otro medio lo ha retomado.', answer: 'Monitorear', label: 'Monitorear', why: 'Si respondes, lo amplificas. Revisa de dónde salió y ten lista una respuesta por si crece.' },
  { id: 'v21c', title: 'La cifra equivocada', optional: true, text: 'Tu equipo publicó una cifra equivocada de obras del municipio y un regidor contrario la exhibió.', answer: 'Corregir', label: 'Corregir', why: 'Corrige a la vista de todos, explica el dato correcto y actualiza la publicación.' },
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
