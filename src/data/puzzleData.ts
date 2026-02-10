// Brand Puzzle Arcade - Data & Configuration

export interface PuzzlePiece {
  id: string;
  label: string;
  emoji: string;
  category: "foundation" | "identity" | "content" | "growth";
  description: string;
}

export interface PuzzleLevel {
  id: number;
  name: string;
  emoji: string;
  description: string;
  timeLimit: number; // seconds
  pieces: PuzzlePiece[];
  slots: { id: string; category: PuzzlePiece["category"]; hint: string }[];
}

export const PUZZLE_CATEGORIES = {
  foundation: { label: "Fundamentos", color: "coral", emoji: "🏗️" },
  identity: { label: "Identidad", color: "cyan", emoji: "🎨" },
  content: { label: "Contenido", color: "lime", emoji: "📝" },
  growth: { label: "Crecimiento", color: "magenta", emoji: "🚀" },
} as const;

export const PUZZLE_LEVELS: PuzzleLevel[] = [
  {
    id: 1,
    name: "Los cimientos",
    emoji: "🏗️",
    description: "Coloca las bases de tu marca digital",
    timeLimit: 30,
    pieces: [
      { id: "p1", label: "Propuesta de valor", emoji: "💎", category: "foundation", description: "Lo que te hace único" },
      { id: "p2", label: "Audiencia objetivo", emoji: "🎯", category: "foundation", description: "A quién le hablas" },
      { id: "p3", label: "Tono de voz", emoji: "🗣️", category: "identity", description: "Cómo comunicas" },
      { id: "p4", label: "Bio profesional", emoji: "✍️", category: "identity", description: "Tu carta de presentación" },
    ],
    slots: [
      { id: "s1", category: "foundation", hint: "¿Qué ofreces que nadie más puede?" },
      { id: "s2", category: "foundation", hint: "¿Quién necesita tu solución?" },
      { id: "s3", category: "identity", hint: "¿Formal, cercano, experto?" },
      { id: "s4", category: "identity", hint: "Primera impresión en redes" },
    ],
  },
  {
    id: 2,
    name: "Tu identidad",
    emoji: "🎨",
    description: "Define los elementos visuales y narrativos",
    timeLimit: 25,
    pieces: [
      { id: "p5", label: "Diferenciador", emoji: "⚡", category: "identity", description: "Tu ventaja competitiva" },
      { id: "p6", label: "Historia de origen", emoji: "📖", category: "content", description: "Por qué haces lo que haces" },
      { id: "p7", label: "Paleta visual", emoji: "🌈", category: "identity", description: "Colores y estilo" },
      { id: "p8", label: "Hashtags clave", emoji: "#️⃣", category: "content", description: "Tu firma digital" },
      { id: "p9", label: "Foto de perfil", emoji: "📸", category: "identity", description: "Imagen profesional" },
    ],
    slots: [
      { id: "s5", category: "identity", hint: "Lo que te separa del resto" },
      { id: "s6", category: "content", hint: "Tu narrativa personal" },
      { id: "s7", category: "identity", hint: "Coherencia visual" },
      { id: "s8", category: "content", hint: "Descubrimiento orgánico" },
      { id: "s9", category: "identity", hint: "La cara de tu marca" },
    ],
  },
  {
    id: 3,
    name: "Motor de contenido",
    emoji: "📝",
    description: "Arma tu estrategia de publicaciones",
    timeLimit: 22,
    pieces: [
      { id: "p10", label: "Calendario editorial", emoji: "📅", category: "content", description: "Planifica tus publicaciones" },
      { id: "p11", label: "Post educativo", emoji: "🎓", category: "content", description: "Comparte conocimiento" },
      { id: "p12", label: "Post de engagement", emoji: "💬", category: "growth", description: "Genera conversación" },
      { id: "p13", label: "Caso de éxito", emoji: "🏆", category: "content", description: "Prueba social" },
      { id: "p14", label: "CTA estratégico", emoji: "👆", category: "growth", description: "Llama a la acción" },
      { id: "p15", label: "Reels/Video", emoji: "🎬", category: "content", description: "Formato rey del algoritmo" },
    ],
    slots: [
      { id: "s10", category: "content", hint: "Organización semanal" },
      { id: "s11", category: "content", hint: "Posicionarte como experto" },
      { id: "s12", category: "growth", hint: "Preguntas y debates" },
      { id: "s13", category: "content", hint: "Demuestra resultados" },
      { id: "s14", category: "growth", hint: "Convierte seguidores en clientes" },
      { id: "s15", category: "content", hint: "Alcance orgánico masivo" },
    ],
  },
  {
    id: 4,
    name: "Escala tu marca",
    emoji: "🚀",
    description: "Desbloquea el crecimiento exponencial",
    timeLimit: 20,
    pieces: [
      { id: "p16", label: "Colaboraciones", emoji: "🤝", category: "growth", description: "Alianzas estratégicas" },
      { id: "p17", label: "Email list", emoji: "📧", category: "growth", description: "Tu audiencia propia" },
      { id: "p18", label: "Analíticas", emoji: "📊", category: "growth", description: "Mide para mejorar" },
      { id: "p19", label: "Comunidad", emoji: "👥", category: "growth", description: "Tribu de seguidores" },
      { id: "p20", label: "Monetización", emoji: "💰", category: "growth", description: "Convierte valor en ingresos" },
      { id: "p21", label: "Automatización", emoji: "⚙️", category: "growth", description: "Escala sin quemarte" },
      { id: "p22", label: "Marca personal 360°", emoji: "👑", category: "foundation", description: "Presencia omnipresente" },
    ],
    slots: [
      { id: "s16", category: "growth", hint: "Crecer juntos" },
      { id: "s17", category: "growth", hint: "Independencia de algoritmos" },
      { id: "s18", category: "growth", hint: "Datos = decisiones" },
      { id: "s19", category: "growth", hint: "Lealtad y advocacy" },
      { id: "s20", category: "growth", hint: "Sostenibilidad financiera" },
      { id: "s21", category: "growth", hint: "Trabaja inteligente" },
      { id: "s22", category: "foundation", hint: "El objetivo final" },
    ],
  },
];

export function calculatePuzzleScore(
  correctPlacements: number,
  totalSlots: number,
  timeRemaining: number,
  timeLimit: number
): number {
  const accuracyScore = (correctPlacements / totalSlots) * 70;
  const timeScore = (timeRemaining / timeLimit) * 30;
  return Math.round(accuracyScore + timeScore);
}

export const PUZZLE_RANKS = [
  { minScore: 0, name: "Novato", emoji: "🌱", message: "¡Buen intento! Tu marca tiene mucho potencial por descubrir." },
  { minScore: 40, name: "Constructor", emoji: "🔨", message: "¡Vas por buen camino! Ya conoces los fundamentos." },
  { minScore: 65, name: "Arquitecto", emoji: "🏛️", message: "¡Impresionante! Dominas la estructura de una marca sólida." },
  { minScore: 85, name: "Maestro", emoji: "👑", message: "¡Eres un experto! Tu marca está lista para conquistar." },
];

export function getPuzzleRank(score: number) {
  let rank = PUZZLE_RANKS[0];
  for (const r of PUZZLE_RANKS) {
    if (score >= r.minScore) rank = r;
  }
  return rank;
}
