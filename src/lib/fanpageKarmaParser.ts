import * as XLSX from "xlsx";

const MONTHS_ES: Record<string, number> = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
};

export type PeriodInfo = { start: string; end: string; label: string };

export type ComparativaRow = {
  profile: string;
  network: string;
  profileExternalId: string | null;
  externalUrl: string | null;
  imageUrl: string | null;
  performanceIndex: number | null;
  followers: number | null;
  followerGrowthRate: number | null;
  engagementRate: number | null;
  postsPerDay: number | null;
  reachPerDay: number | null;
  interactionPerImpression: number | null;
  raw: Record<string, unknown>;
};

export type FollowerDailyRow = {
  profile: string;
  network: string;
  profileExternalId: string | null;
  externalUrl: string | null;
  imageUrl: string | null;
  days: Array<{ date: string; delta: number }>;
};

export type PostRow = {
  profile: string;
  network: string;
  profileExternalId: string | null;
  messageExternalId: string | null;
  postedAt: string | null;
  message: string | null;
  likes: number | null;
  comments: number | null;
  interactions: number | null;
  engagementRate: number | null;
  reach: number | null;
  interactionPerImpression: number | null;
  link: string | null;
  imageLink: string | null;
  raw: Record<string, unknown>;
};

export type ParsedFile<T> = { period: PeriodInfo; rows: T[]; sheetName: string };

function parseSpanishDate(s: string): string | null {
  // "1 ene 2026" -> 2026-01-01
  const m = s.trim().toLowerCase().match(/^(\d{1,2})\s+([a-záéíóú]+)\.?\s+(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1]);
  const monKey = m[2].slice(0, 3);
  const mon = MONTHS_ES[monKey];
  if (!mon) return null;
  return `${m[3]}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeNetwork(v: unknown): string {
  const s = String(v ?? "").toLowerCase().trim();
  if (!s) return "unknown";
  if (s.includes("facebook") || s === "fb") return "facebook";
  if (s.includes("instagram") || s === "ig") return "instagram";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("youtube")) return "youtube";
  if (s === "x" || s.includes("twitter")) return "x";
  if (s.includes("linkedin")) return "linkedin";
  return s;
}

function toNum(v: unknown): number | null {
  if (v == null || v === "" || v === "-") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[%\s]/g, "").replace(/,/g, ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toStr(v: unknown): string | null {
  if (v == null || v === "") return null;
  return String(v).trim() || null;
}

async function readWorkbook(file: File) {
  const buf = await file.arrayBuffer();
  return XLSX.read(buf, { type: "array", cellDates: true });
}

// FanpageKarma sheets: row index 1 col F contains "1 ene 2026 - 31 ene 2026",
// row index 4 is the header, data starts row 5.
function extractPeriod(matrix: unknown[][]): PeriodInfo {
  const row = matrix[1] ?? [];
  for (const cell of row) {
    const s = cell == null ? "" : String(cell);
    const m = s.match(/(\d{1,2}\s+\w+\.?\s+\d{4})\s*[-–—]\s*(\d{1,2}\s+\w+\.?\s+\d{4})/);
    if (m) {
      const start = parseSpanishDate(m[1]);
      const end = parseSpanishDate(m[2]);
      if (start && end) return { start, end, label: `${m[1]} – ${m[2]}` };
    }
  }
  // fallback: today
  const today = new Date().toISOString().slice(0, 10);
  return { start: today, end: today, label: today };
}

function extractHeaderAndRows(matrix: unknown[][]) {
  // Header at row index 4 (5th row); skip empty leading col
  const header = (matrix[4] ?? []).map((c) => (c == null ? "" : String(c).trim()));
  const dataRows = matrix.slice(5).filter((r) => r.some((c) => c != null && c !== ""));
  return { header, dataRows };
}

function rowToObject(header: string[], row: unknown[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < header.length; i++) {
    const key = header[i];
    if (key) obj[key] = row[i];
  }
  return obj;
}

function loadMatrix(file: File): Promise<{ matrix: unknown[][]; sheetName: string }> {
  return readWorkbook(file).then((wb) => {
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, raw: true, blankrows: true });
    return { matrix, sheetName };
  });
}

// ---------- Comparativa ----------
export async function parseComparativa(file: File): Promise<ParsedFile<ComparativaRow>> {
  const { matrix, sheetName } = await loadMatrix(file);
  const period = extractPeriod(matrix);
  const { header, dataRows } = extractHeaderAndRows(matrix);
  const rows: ComparativaRow[] = [];
  for (const raw of dataRows) {
    const r = rowToObject(header, raw);
    const profile = toStr(r["Profile"]);
    if (!profile) continue;
    rows.push({
      profile,
      network: normalizeNetwork(r["Network"]),
      profileExternalId: toStr(r["Profile-ID"]),
      externalUrl: toStr(r["External Links"]),
      imageUrl: toStr(r["Image Link"]),
      performanceIndex: toNum(r["Índice de Rendimiento de la Página"] ?? r["Índice de Rendimiento de la página"] ?? r["Índice de Rendimiento"] ?? r["Performance Index"]),
      followers: toNum(r["Seguidor"] ?? r["Seguidores"] ?? r["Followers"]),
      followerGrowthRate: toNum(r["Crecimiento de seguidores (en %)"] ?? r["Crecimiento de seguidores por día en %"] ?? r["Crecimiento de seguidores"]),
      engagementRate: toNum(r["Tasa de interacción de las publicaciones"] ?? r["Engagement Rate"]),
      postsPerDay: toNum(r["Publicaciones por día"] ?? r["Posts per day"]),
      reachPerDay: toNum(r["Alcance por día"] ?? r["Reach per day"]),
      interactionPerImpression: toNum(r["Interacción por impresión/visualizacion"] ?? r["Interacción por impresión/visualización"]),
      raw: r,
    });
  }
  return { period, rows, sheetName };
}

// ---------- Seguidores (daily deltas) ----------
export async function parseSeguidores(file: File): Promise<ParsedFile<FollowerDailyRow>> {
  const { matrix, sheetName } = await loadMatrix(file);
  const period = extractPeriod(matrix);
  const header = (matrix[4] ?? []).map((c) => (c == null ? "" : String(c).trim()));
  const dateColumns: Array<{ idx: number; date: string }> = [];
  header.forEach((h, i) => {
    const d = parseSpanishDate(h);
    if (d) dateColumns.push({ idx: i, date: d });
  });
  const profileIdx = header.indexOf("Profile");
  const networkIdx = header.indexOf("Network");
  const profileIdIdx = header.indexOf("Profile-ID");
  const extIdx = header.indexOf("External Links");
  const imgIdx = header.indexOf("Image Link");
  const rows: FollowerDailyRow[] = [];
  for (const r of matrix.slice(5)) {
    const profile = toStr(r?.[profileIdx]);
    if (!profile) continue;
    const days = dateColumns
      .map(({ idx, date }) => ({ date, delta: toNum(r?.[idx]) ?? 0 }))
      .filter((_, i) => true);
    rows.push({
      profile,
      network: normalizeNetwork(r?.[networkIdx]),
      profileExternalId: toStr(r?.[profileIdIdx]),
      externalUrl: toStr(r?.[extIdx]),
      imageUrl: toStr(r?.[imgIdx]),
      days,
    });
  }
  return { period, rows, sheetName };
}

// ---------- Posts ----------
export async function parsePosts(file: File): Promise<ParsedFile<PostRow>> {
  const { matrix, sheetName } = await loadMatrix(file);
  const period = extractPeriod(matrix);
  const { header, dataRows } = extractHeaderAndRows(matrix);
  const rows: PostRow[] = [];
  for (const raw of dataRows) {
    const r = rowToObject(header, raw);
    const profile = toStr(r["Profile"]);
    if (!profile) continue;
    let postedAt: string | null = null;
    const d = r["Date"];
    if (d instanceof Date) postedAt = d.toISOString();
    else if (typeof d === "string" && d) postedAt = new Date(d.replace(" ", "T")).toISOString();
    rows.push({
      profile,
      network: normalizeNetwork(r["Network"]),
      profileExternalId: toStr(r["Profile-ID"]),
      messageExternalId: toStr(r["Message-ID"]),
      postedAt,
      message: toStr(r["Message"]),
      likes: toNum(r["Número de Me gusta"] ?? r["Likes"]),
      comments: toNum(r["Número de comentarios"] ?? r["Comments"]),
      interactions: toNum(r["Reacciones, Comentarios y Compartidos"] ?? r["Interactions"]),
      engagementRate: toNum(r["Tasa de interacción de las publicaciones"] ?? r["Engagement Rate"]),
      reach: toNum(r["Alcance por publicación"] ?? r["Reach"]),
      interactionPerImpression: toNum(r["Interacción por impresión/visualizacion"] ?? r["Interacción por impresión/visualización"]),
      link: toStr(r["Link"]),
      imageLink: toStr(r["Image Link"]),
      raw: r,
    });
  }
  return { period, rows, sheetName };
}

// Auto-detect file type by inspecting the header row
export function detectFileType(header: string[]): "comparativa" | "seguidores" | "posts" | null {
  const H = header.map((h) => h.toLowerCase());
  if (H.includes("message") && H.includes("date")) return "posts";
  if (H.some((h) => parseSpanishDate(h))) return "seguidores";
  if (H.some((h) => h.includes("índice de rendimiento") || h.includes("indice de rendimiento") || h.includes("performance index"))) return "comparativa";
  return null;
}

export async function detectType(file: File): Promise<"comparativa" | "seguidores" | "posts" | null> {
  const { matrix } = await loadMatrix(file);
  const header = (matrix[4] ?? []).map((c) => (c == null ? "" : String(c).trim()));
  return detectFileType(header);
}
