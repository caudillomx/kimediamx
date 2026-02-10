// XP rewards per step completion
export const STEP_XP: Record<string, number> = {
  welcome: 50,
  diagnostic: 120,
  competitive: 100,
  identity: 150,
  bio: 130,
  post: 160,
  closing: 200,
  // Liderazgos-specific
  message: 140,
  institutional: 150,
  spokesperson: 160,
  institutional_post: 150,
  kit: 100,
};

// Level thresholds
export interface Level {
  name: string;
  emoji: string;
  minXP: number;
  color: string; // tailwind class suffix
}

export const LEVELS: Level[] = [
  { name: "Novato Digital", emoji: "🌱", minXP: 0, color: "emerald" },
  { name: "Aprendiz de Marca", emoji: "📘", minXP: 200, color: "blue" },
  { name: "Estratega en Formación", emoji: "⚡", minXP: 400, color: "amber" },
  { name: "Héroe de Marca", emoji: "🦸", minXP: 650, color: "purple" },
  { name: "Leyenda Digital", emoji: "👑", minXP: 850, color: "coral" },
];

export function getLevel(xp: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
  }
  return current;
}

export function getNextLevel(xp: number): Level | null {
  for (const level of LEVELS) {
    if (xp < level.minXP) return level;
  }
  return null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}

// Badges
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocksAtStep: string;
}

export const BRAND_BADGES: Badge[] = [
  { id: "explorer", name: "Explorador", emoji: "🧭", description: "Iniciaste tu kit digital", unlocksAtStep: "welcome" },
  { id: "analyst", name: "Analista", emoji: "🔍", description: "Completaste el diagnóstico", unlocksAtStep: "diagnostic" },
  { id: "architect", name: "Arquitecto", emoji: "🏗️", description: "Definiste tu identidad de marca", unlocksAtStep: "identity" },
  { id: "writer", name: "Escritor", emoji: "✍️", description: "Creaste tu bio profesional", unlocksAtStep: "bio" },
  { id: "creator", name: "Creador", emoji: "🎨", description: "Publicaste tu primer post", unlocksAtStep: "post" },
  { id: "champion", name: "Campeón", emoji: "🏆", description: "Completaste tu Kit Digital", unlocksAtStep: "closing" },
];

export const PYME_BADGES: Badge[] = [
  { id: "pioneer", name: "Pionero", emoji: "🚀", description: "Iniciaste tu kit empresarial", unlocksAtStep: "welcome" },
  { id: "detective", name: "Detective", emoji: "🕵️", description: "Completaste el diagnóstico", unlocksAtStep: "diagnostic" },
  { id: "strategist", name: "Estratega", emoji: "♟️", description: "Analizaste tu competencia", unlocksAtStep: "competitive" },
  { id: "builder", name: "Constructor", emoji: "🏗️", description: "Definiste tu identidad empresarial", unlocksAtStep: "identity" },
  { id: "narrator", name: "Narrador", emoji: "📝", description: "Creaste la descripción de tu empresa", unlocksAtStep: "bio" },
  { id: "publisher", name: "Publicista", emoji: "📣", description: "Creaste tu primer post empresarial", unlocksAtStep: "post" },
  { id: "master", name: "Maestro PyME", emoji: "👑", description: "Completaste tu Kit Digital PyME", unlocksAtStep: "closing" },
];

export const LIDERAZGO_BADGES: Badge[] = [
  { id: "access", name: "Acceso VIP", emoji: "🔑", description: "Ingresaste con código de acceso", unlocksAtStep: "welcome" },
  { id: "analyst", name: "Analista", emoji: "🔍", description: "Completaste el diagnóstico", unlocksAtStep: "diagnostic" },
  { id: "messenger", name: "Mensajero", emoji: "📢", description: "Construiste tu mensaje político", unlocksAtStep: "message" },
  { id: "institution", name: "Institucional", emoji: "🏛️", description: "Definiste tu identidad institucional", unlocksAtStep: "institutional" },
  { id: "spokesperson", name: "Vocero", emoji: "🎙️", description: "Completaste tu guía de vocería", unlocksAtStep: "spokesperson" },
  { id: "biographer", name: "Biógrafo", emoji: "✍️", description: "Creaste tus bios profesionales", unlocksAtStep: "bio" },
  { id: "creator", name: "Creador", emoji: "🎨", description: "Publicaste tu post personal", unlocksAtStep: "post" },
  { id: "strategist", name: "Estratega", emoji: "♟️", description: "Creaste tu post institucional", unlocksAtStep: "institutional_post" },
  { id: "leader", name: "Líder Digital", emoji: "🏆", description: "Completaste tu perfil de liderazgo", unlocksAtStep: "closing" },
  { id: "equipped", name: "Equipado", emoji: "🚀", description: "Recibiste tu kit completo", unlocksAtStep: "kit" },
];
