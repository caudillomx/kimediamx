// Datos de la sesión interna de reorganización por líneas de negocio (uso interno KiMedia).

export type LineaKey = "analytics" | "estrategia" | "ads" | "audiovisual";

export const LINEAS: { key: LineaKey; label: string; color: string; desc: string }[] = [
  { key: "analytics",   label: "Analytics",             color: "hsl(185 95% 50%)", desc: "Qué está pasando y qué decisión cambia." },
  { key: "estrategia",  label: "Estrategia digital",    color: "hsl(15 95% 55%)",  desc: "Qué conversación abrimos y en qué etapa del embudo." },
  { key: "ads",         label: "Ads",                   color: "hsl(45 100% 55%)", desc: "A quién le hablamos con dinero y hacia dónde lo llevamos." },
  { key: "audiovisual", label: "Producción Audiovisual", color: "hsl(320 90% 55%)", desc: "La pieza que mueve a alguien de una etapa a la siguiente." },
];

export const LINEA_COLOR: Record<LineaKey, string> = LINEAS.reduce(
  (acc, l) => ({ ...acc, [l.key]: l.color }),
  {} as Record<LineaKey, string>
);

export const CLIENTES_MATRIZ = [
  "Falcon", "El Diluvio", "Padre Sada", "Mario Doria", "Lidérate", "Ricardo Robles",
  "IPS", "Strategos", "20 Rostros 20 Años", "KiMedia (propio)", "FIMEME (propio)", "Nimo (propio)",
];

export const CLIENTES_PENDIENTES = [
  "IPS", "Ricardo Robles", "Lidérate", "Strategos", "20 Rostros 20 Años",
  "KiMedia (propio)", "FIMEME (propio)", "Nimo (propio)",
];

/** nivel: 2 = fuerte, 1 = parcial/bloqueado, 0 = vacío */
export type Celda = { nivel: 0 | 1 | 2; texto: string };

export const MATRIZ_LLENA: { cliente: string; celdas: Record<LineaKey, Celda>; tagline?: string }[] = [
  {
    cliente: "Falcon",
    celdas: {
      analytics:   { nivel: 0, texto: "—" },
      estrategia:  { nivel: 2, texto: "Reconocimiento" },
      ads:         { nivel: 0, texto: "Sin arrancar" },
      audiovisual: { nivel: 2, texto: "Fuerte" },
    },
    tagline: "Mucho contenido, cero destino.",
  },
  {
    cliente: "El Diluvio",
    celdas: {
      analytics:   { nivel: 0, texto: "—" },
      estrategia:  { nivel: 2, texto: "Tráfico / Interacción (PDF bloquea)" },
      ads:         { nivel: 1, texto: "Bloqueada por pago" },
      audiovisual: { nivel: 2, texto: "Fuerte, reels constantes" },
    },
  },
  {
    cliente: "Padre Sada",
    celdas: {
      analytics:   { nivel: 0, texto: "—" },
      estrategia:  { nivel: 2, texto: "Fuerte, embudo claro" },
      ads:         { nivel: 2, texto: "Activa, dirige a WhatsApp" },
      audiovisual: { nivel: 1, texto: "Ligera pero efectiva" },
    },
    tagline: "La prueba de que sí sabemos hacerlo.",
  },
  {
    cliente: "Mario Doria",
    celdas: {
      analytics:   { nivel: 0, texto: "—" },
      estrategia:  { nivel: 0, texto: "Vacío, sin parrilla" },
      ads:         { nivel: 2, texto: "Fuerte, cuenta central" },
      audiovisual: { nivel: 0, texto: "Mínimo o nulo" },
    },
    tagline: "Mucho anuncio, cero contenido propio.",
  },
];

export const CLIENTE_COLOR: Record<string, string> = {
  "Padre Sada": "hsl(15 95% 55%)",
  "El Diluvio": "hsl(185 95% 50%)",
  "Strategos": "hsl(45 100% 55%)",
  "KiMedia": "hsl(320 90% 55%)",
};

export const CRECIMIENTO = [
  { perfil: "Padre Sada · Instagram", cliente: "Padre Sada", inicio: 105, fin: 3004 },
  { perfil: "El Diluvio · Instagram", cliente: "El Diluvio", inicio: 0, fin: 2771 },
  { perfil: "Padre Sada · TikTok", cliente: "Padre Sada", inicio: 15, fin: 1746 },
  { perfil: "Padre Sada · Facebook", cliente: "Padre Sada", inicio: 0, fin: 1617 },
  { perfil: "El Diluvio · Facebook", cliente: "El Diluvio", inicio: 0, fin: 1264 },
  { perfil: "El Diluvio · TikTok", cliente: "El Diluvio", inicio: 0, fin: 1201 },
  { perfil: "El Diluvio · YouTube", cliente: "El Diluvio", inicio: 0, fin: 353 },
  { perfil: "El Diluvio · Twitter/X", cliente: "El Diluvio", inicio: 0, fin: 251 },
  { perfil: "Strategos · Instagram", cliente: "Strategos", inicio: 0, fin: 180 },
  { perfil: "KiMedia · Instagram", cliente: "KiMedia", inicio: 0, fin: 16 },
  { perfil: "KiMedia · TikTok", cliente: "KiMedia", inicio: 0, fin: 3 },
]
  .map(d => ({ ...d, crecimiento: d.fin - d.inicio }))
  .sort((a, b) => b.crecimiento - a.crecimiento);

export const CONTENIDO_CARDS = [
  {
    cliente: "El Diluvio",
    posts: "2,949 posts",
    color: "hsl(185 95% 50%)",
    lineas: ["Temas sensibles y sociales (religión, eutanasia, ley de muerte digna).", "Cero contenido promocional."],
    tagline: "Interacción pura.",
  },
  {
    cliente: "Padre Sada",
    posts: "249 posts",
    color: "hsl(15 95% 55%)",
    lineas: ["Vidas de santos, no venta de libros."],
    tagline: "Lo que más pega no es lo que vende.",
  },
  {
    cliente: "Strategos",
    posts: "48 posts",
    color: "hsl(45 100% 55%)",
    lineas: ["Thought leadership puro: gestión de crisis y reputación."],
    tagline: "Reconocimiento sin conversión todavía.",
  },
  {
    cliente: "KiMedia (propio)",
    posts: "50 posts",
    color: "hsl(320 90% 55%)",
    lineas: ["El volumen más bajo de las cuatro cuentas."],
    tagline: "La cuenta menos alimentada.",
  },
];

export const LEADS_DORIA = [
  { mes: "jun 25", leads: 56 }, { mes: "jul 25", leads: 79 }, { mes: "ago 25", leads: 81 },
  { mes: "sep 25", leads: 62 }, { mes: "oct 25", leads: 77 }, { mes: "nov 25", leads: 34 },
  { mes: "dic 25", leads: 48 }, { mes: "ene 26", leads: 40 }, { mes: "feb 26", leads: 55 },
  { mes: "mar 26", leads: 98 }, { mes: "abr 26", leads: 70 }, { mes: "may 26", leads: 120 },
  { mes: "jun 26", leads: 129 }, { mes: "jul 26", leads: 157 }, { mes: "ago 26", leads: 102 },
  { mes: "sep 26", leads: 54 },
];

export const PROPOSITO_TABLA: { cliente: string; objetivo: string; espera: string; medimos: string }[] = [
  { cliente: "Falcon", objetivo: "(cliente nuevo, jul 2026 — no aplica)", espera: "???", medimos: "???" },
  { cliente: "El Diluvio", objetivo: "Crear comunidad participativa; crecer seguidores; mantener relación con audiencias", espera: "???", medimos: "Crecimiento de seguidores (sí) — ¿conversión a algo? Sin definir" },
  { cliente: "Padre Sada", objetivo: "Crecer seguidores; mantener comunidad; venta de libros", espera: "???", medimos: "Crecimiento (sí) — ¿cierre de venta real? Sin dato" },
  { cliente: "Mario Doria", objetivo: "Crecer seguidores; captación de pacientes", espera: "???", medimos: "55.3% de leads agendados — único con métrica de cierre real" },
  { cliente: "Lidérate", objetivo: "(nunca definido)", espera: "???", medimos: "???" },
  { cliente: "Ricardo Robles", objetivo: "(nunca definido)", espera: "???", medimos: "???" },
  { cliente: "IPS", objetivo: "(nunca definido)", espera: "???", medimos: "???" },
  { cliente: "Strategos", objetivo: "(nunca definido)", espera: "???", medimos: "???" },
];

export const PREGUNTAS: { linea: LineaKey; texto: string }[] = [
  { linea: "audiovisual", texto: "Si no piensas la estrategia, ¿cómo puede una pieza tuya mover a alguien de Reconocimiento a Conversión?" },
  { linea: "ads", texto: "¿Qué campaña falta porque no hay nada más abajo del embudo a qué apuntarle?" },
  { linea: "estrategia", texto: "De lo que se publica hoy, ¿cuánto abre conversación y cuánto es porque “toca publicar”?" },
  { linea: "analytics", texto: "Un insight que no cambia una decisión es solo un reporte." },
];
