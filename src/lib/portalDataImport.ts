import * as XLSX from "xlsx";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const AD_PLATFORMS = [
  { key: "meta", label: "Meta Ads" },
  { key: "google", label: "Google Ads" },
  { key: "tiktok", label: "TikTok Ads" },
  { key: "x", label: "X Ads" },
  { key: "linkedin", label: "LinkedIn Ads" },
  { key: "other", label: "Otra" },
] as const;

export type AdPlatform = (typeof AD_PLATFORMS)[number]["key"];

export const NETWORK_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

export function normalizeKey(s: string): string {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Accepts "1.234,56", "1,234.56", "12%", "$1,200", "-" */
export function num(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).trim();
  if (!s || s === "-" || s === "—" || s.toLowerCase() === "n/a") return null;
  s = s.replace(/[%$€\s]/g, "").replace(/[A-Za-z]/g, "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (lastComma > -1) {
    // comma is decimal if it has 1-2 trailing digits, else thousands
    s = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Returns a rate as a percentage number (3.4 for 3.4%). */
export function rate(v: unknown): number | null {
  if (v == null) return null;
  const raw = String(v);
  const n = num(v);
  if (n == null) return null;
  // Fractional values coming from spreadsheets (0.034) become 3.4
  if (!raw.includes("%") && Math.abs(n) > 0 && Math.abs(n) < 1) return n * 100;
  return n;
}

export function str(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

export function normalizeNetwork(v: unknown): string {
  const k = normalizeKey(String(v ?? ""));
  if (!k) return "other";
  if (k.includes("insta")) return "instagram";
  if (k.includes("face")) return "facebook";
  if (k.includes("tiktok") || k.includes("tik tok")) return "tiktok";
  if (k.includes("youtube") || k.includes("you tube")) return "youtube";
  if (k.includes("linkedin") || k.includes("linked in")) return "linkedin";
  if (k === "x" || k.includes("twitter")) return "twitter";
  return k.replace(/\s+/g, "_");
}

export function accountKeyOf(name: string, handle?: string | null): string {
  return normalizeKey(handle || name).replace(/\s+/g, "");
}

/* ------------------------------------------------------------------ */
/* Generic table loading                                               */
/* ------------------------------------------------------------------ */

export type Table = { header: string[]; rows: Record<string, unknown>[]; sheetName: string };

async function readWorkbook(file: File) {
  const buf = await file.arrayBuffer();
  return XLSX.read(buf, { type: "array", cellDates: false, raw: false });
}

/** Picks the header row: the first row (within the first 12) with the most non-empty text cells. */
function findHeaderIndex(matrix: unknown[][]): number {
  let best = 0;
  let bestScore = 0;
  const limit = Math.min(matrix.length, 12);
  for (let i = 0; i < limit; i++) {
    const row = matrix[i] ?? [];
    const score = row.filter((c) => c != null && String(c).trim() !== "").length;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

export async function loadTable(file: File): Promise<Table> {
  const wb = await readWorkbook(file);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, raw: false, blankrows: false });
  // Drop GA4 comment lines ("# ----")
  const clean = matrix.filter((r) => !(r?.length === 1 && String(r[0] ?? "").startsWith("#")));
  const hi = findHeaderIndex(clean);
  const header = (clean[hi] ?? []).map((c) => (c == null ? "" : String(c).trim()));
  const rows = clean.slice(hi + 1).map((r) => {
    const o: Record<string, unknown> = {};
    header.forEach((h, i) => {
      if (h) o[h] = r?.[i] ?? null;
    });
    return o;
  });
  return { header, rows, sheetName };
}

/** Reads a value by fuzzy header alias (substring match on normalized keys). */
export function pick(row: Record<string, unknown>, aliases: string[]): unknown {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const a = normalizeKey(alias);
    const exact = entries.find(([k]) => normalizeKey(k) === a);
    if (exact && exact[1] != null && String(exact[1]).trim() !== "") return exact[1];
  }
  for (const alias of aliases) {
    const a = normalizeKey(alias);
    const partial = entries.find(([k]) => normalizeKey(k).includes(a));
    if (partial && partial[1] != null && String(partial[1]).trim() !== "") return partial[1];
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Social (FanpageKarma comparativa + LinkedIn exports)                */
/* ------------------------------------------------------------------ */

export type SocialRow = {
  network: string;
  account_name: string;
  account_handle: string | null;
  followers: number | null;
  follower_growth: number | null;
  follower_growth_rate: number | null;
  posts: number | null;
  interactions: number | null;
  engagement_rate: number | null;
  impressions: number | null;
  reach: number | null;
  performance_index: number | null;
  raw: Record<string, unknown>;
};

export async function parseSocialFile(
  file: File,
  fallbackNetwork?: string,
  fallbackAccount?: string
): Promise<SocialRow[]> {
  const { rows } = await loadTable(file);
  const out: SocialRow[] = [];
  for (const r of rows) {
    const name =
      str(pick(r, ["Profile", "Perfil", "Página", "Page", "Cuenta", "Account", "Nombre"])) ??
      fallbackAccount ??
      null;
    if (!name) continue;
    const netRaw = pick(r, ["Network", "Red", "Plataforma", "Platform"]);
    const network = netRaw ? normalizeNetwork(netRaw) : normalizeNetwork(fallbackNetwork ?? "linkedin");
    out.push({
      network,
      account_name: name,
      account_handle: str(pick(r, ["Handle", "Usuario", "Username", "External Links", "URL"])),
      followers: num(pick(r, ["Seguidores", "Seguidor", "Followers", "Total de seguidores", "Total followers"])),
      follower_growth: num(pick(r, ["Nuevos seguidores", "New followers", "Crecimiento de seguidores absoluto"])),
      follower_growth_rate: rate(pick(r, ["Crecimiento de seguidores (en %)", "Crecimiento de seguidores", "Follower growth"])),
      posts: num(pick(r, ["Publicaciones", "Posts", "Número de publicaciones", "Publicaciones por día"])),
      interactions: num(pick(r, ["Interacciones", "Interactions", "Reacciones, Comentarios y Compartidos", "Reacciones"])),
      engagement_rate: rate(pick(r, ["Tasa de interacción", "Engagement Rate", "Tasa de participación", "Engagement rate"])),
      impressions: num(pick(r, ["Impresiones", "Impressions"])),
      reach: num(pick(r, ["Alcance", "Reach", "Alcance por día"])),
      performance_index: num(pick(r, ["Índice de Rendimiento", "Performance Index"])),
      raw: r,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Web analytics (GA4)                                                 */
/* ------------------------------------------------------------------ */

export type WebChannel = { channel: string; sessions: number | null; users: number | null };
export type WebTotals = {
  users: number | null;
  new_users: number | null;
  sessions: number | null;
  pageviews: number | null;
  avg_session_seconds: number | null;
  bounce_rate: number | null;
  conversions: number | null;
  channels: WebChannel[];
};

const CHANNEL_ALIASES = [
  "Canal predeterminado",
  "Default channel group",
  "Grupo de canales",
  "Canal",
  "Session default channel group",
  "Source / medium",
  "Origen / medio",
];

export async function parseWebFile(file: File): Promise<WebTotals> {
  const { rows } = await loadTable(file);
  const channels: WebChannel[] = [];
  const totals: WebTotals = {
    users: null,
    new_users: null,
    sessions: null,
    pageviews: null,
    avg_session_seconds: null,
    bounce_rate: null,
    conversions: null,
    channels: [],
  };

  let sumSessions = 0;
  let sumUsers = 0;
  let sumNew = 0;
  let sumViews = 0;
  let sumConv = 0;
  let weightedDur = 0;
  let weightedBounce = 0;
  let n = 0;

  for (const r of rows) {
    const channel = str(pick(r, CHANNEL_ALIASES));
    const sessions = num(pick(r, ["Sesiones", "Sessions"]));
    const users = num(pick(r, ["Usuarios activos", "Usuarios totales", "Usuarios", "Active users", "Total users", "Users"]));
    const newUsers = num(pick(r, ["Usuarios nuevos", "New users"]));
    const views = num(pick(r, ["Vistas", "Vistas de página", "Views", "Page views", "Pageviews"]));
    const conv = num(pick(r, ["Conversiones", "Conversions", "Eventos clave", "Key events"]));
    const dur = num(pick(r, ["Duración media", "Duración media de la interacción", "Average session duration", "Tiempo de interacción"]));
    const bounce = rate(pick(r, ["Tasa de rebote", "Bounce rate", "Porcentaje de rebote"]));
    if (sessions == null && users == null) continue;

    n++;
    sumSessions += sessions ?? 0;
    sumUsers += users ?? 0;
    sumNew += newUsers ?? 0;
    sumViews += views ?? 0;
    sumConv += conv ?? 0;
    const w = sessions ?? users ?? 1;
    if (dur != null) weightedDur += dur * w;
    if (bounce != null) weightedBounce += bounce * w;

    if (channel) channels.push({ channel, sessions, users });
  }

  if (!n) return totals;
  const weight = sumSessions || sumUsers || n;
  totals.users = sumUsers || null;
  totals.new_users = sumNew || null;
  totals.sessions = sumSessions || null;
  totals.pageviews = sumViews || null;
  totals.conversions = sumConv || null;
  totals.avg_session_seconds = weightedDur ? Math.round(weightedDur / weight) : null;
  totals.bounce_rate = weightedBounce ? Number((weightedBounce / weight).toFixed(2)) : null;
  totals.channels = channels.sort((a, b) => (b.sessions ?? 0) - (a.sessions ?? 0)).slice(0, 12);
  return totals;
}

/* ------------------------------------------------------------------ */
/* Ads                                                                 */
/* ------------------------------------------------------------------ */

export type AdsRow = {
  campaign_name: string;
  objective: string | null;
  spend: number | null;
  impressions: number | null;
  reach: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  results: number | null;
  result_type: string | null;
  cost_per_result: number | null;
  conversions: number | null;
  raw: Record<string, unknown>;
};

export function detectAdPlatform(header: string[]): AdPlatform | null {
  const h = header.map(normalizeKey).join(" | ");
  if (h.includes("nombre del conjunto de anuncios") || h.includes("ad set name") || h.includes("entrega de la campana")) return "meta";
  if (h.includes("grupo de anuncios") || h.includes("ad group") || h.includes("nivel de optimizacion")) return "google";
  if (h.includes("nombre del grupo de anuncios tiktok") || h.includes("adgroup name")) return "tiktok";
  if (h.includes("tweet") || h.includes("engagements")) return "x";
  return null;
}

export async function parseAdsFile(file: File): Promise<{ platform: AdPlatform | null; rows: AdsRow[] }> {
  const { header, rows } = await loadTable(file);
  const platform = detectAdPlatform(header);
  const out: AdsRow[] = [];
  for (const r of rows) {
    const name = str(pick(r, ["Nombre de la campaña", "Campaign name", "Campaña", "Campaign", "Nombre"]));
    if (!name) continue;
    const spend = num(pick(r, ["Importe gastado", "Inversión", "Costo", "Cost", "Amount spent", "Gasto", "Spend"]));
    const impressions = num(pick(r, ["Impresiones", "Impressions", "Impr."]));
    const clicks = num(pick(r, ["Clics", "Clicks", "Clics en el enlace", "Link clicks"]));
    const results = num(pick(r, ["Resultados", "Results", "Conversiones", "Conversions"]));
    out.push({
      campaign_name: name,
      objective: str(pick(r, ["Objetivo", "Objective", "Tipo de campaña", "Campaign type"])),
      spend,
      impressions,
      reach: num(pick(r, ["Alcance", "Reach"])),
      clicks,
      ctr: rate(pick(r, ["CTR", "Porcentaje de clics", "Click-through rate"])),
      cpc: num(pick(r, ["CPC", "Costo por clic", "Cost per click", "Avg. CPC"])),
      cpm: num(pick(r, ["CPM", "Costo por mil impresiones"])),
      results,
      result_type: str(pick(r, ["Tipo de resultado", "Indicador de resultados", "Result type"])),
      cost_per_result: num(pick(r, ["Costo por resultado", "Cost per result"])),
      conversions: num(pick(r, ["Conversiones", "Conversions"])),
      raw: r,
    });
  }
  return { platform, rows: out };
}

/* ------------------------------------------------------------------ */
/* Period helpers                                                      */
/* ------------------------------------------------------------------ */

export function monthBounds(ym: string): { start: string; end: string; label: string } {
  const [y, m] = ym.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const label = start.toLocaleDateString("es-MX", { month: "long", year: "numeric", timeZone: "UTC" });
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

export function periodLabel(start: string, end: string): string {
  const f = (d: string) =>
    new Date(d + "T12:00:00Z").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${f(start)} – ${f(end)}`;
}
