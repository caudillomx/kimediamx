import * as XLSX from "xlsx";

export type ParsedRow = {
  brandName: string;
  handle: string | null;
  platform: string;
  fans: number | null;
  fanChange: number | null;
  followers: number | null;
  posts: number | null;
  interactions: number | null;
  engagementRate: number | null;
  reach: number | null;
  videoViews: number | null;
  raw: Record<string, unknown>;
};

// Detecta columnas por sinónimos (ES/EN). Devuelve el valor del primer alias que exista.
const ALIASES: Record<keyof Omit<ParsedRow, "brandName" | "handle" | "platform" | "raw">, string[]> = {
  fans: ["fans", "likes", "seguidores totales", "followers total", "total fans", "page likes"],
  fanChange: ["fan change", "cambio de fans", "growth", "crecimiento", "new fans", "fans netos"],
  followers: ["followers", "seguidores", "audience"],
  posts: ["number of posts", "posts", "publicaciones", "n de publicaciones", "cantidad de posts"],
  interactions: ["post interactions", "interactions", "interacciones", "engagement (absolute)", "total interactions"],
  engagementRate: ["engagement rate", "tasa de engagement", "engagement %", "engagement rate (page)", "engagement"],
  reach: ["reach", "alcance", "impressions", "impresiones"],
  videoViews: ["video views", "reproducciones", "views", "reproducciones de video"],
};

const BRAND_KEYS = ["page", "profile", "brand", "marca", "nombre", "name", "página", "cuenta", "account"];
const HANDLE_KEYS = ["handle", "username", "usuario", "@", "url", "link"];
const PLATFORM_KEYS = ["network", "platform", "red social", "plataforma", "channel", "canal"];

const norm = (s: string) => s.toLowerCase().trim().replace(/[_\-\s]+/g, " ");

function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[%\s]/g, "").replace(/,/g, ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickField(row: Record<string, unknown>, aliases: string[]): unknown {
  const keys = Object.keys(row).map(k => [k, norm(k)] as const);
  for (const alias of aliases) {
    const target = norm(alias);
    const hit = keys.find(([, nk]) => nk === target) ?? keys.find(([, nk]) => nk.includes(target));
    if (hit) return row[hit[0]];
  }
  return undefined;
}

function detectPlatform(raw: Record<string, unknown>): string {
  const val = pickField(raw, PLATFORM_KEYS);
  const s = val ? String(val).toLowerCase() : "";
  if (s.includes("facebook") || s === "fb") return "facebook";
  if (s === "x" || s.includes("twitter")) return "x";
  if (s.includes("instagram") || s === "ig") return "instagram";
  if (s.includes("youtube")) return "youtube";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("linkedin")) return "linkedin";
  return "multi";
}

export async function parseFanpageKarma(file: File): Promise<ParsedRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const rows: ParsedRow[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
    for (const r of json) {
      const brandRaw = pickField(r, BRAND_KEYS);
      const brandName = brandRaw != null ? String(brandRaw).trim() : "";
      if (!brandName) continue;
      const handleRaw = pickField(r, HANDLE_KEYS);
      const parsed: ParsedRow = {
        brandName,
        handle: handleRaw ? String(handleRaw).replace(/^@/, "").trim() || null : null,
        platform: detectPlatform(r),
        fans: toNumber(pickField(r, ALIASES.fans)),
        fanChange: toNumber(pickField(r, ALIASES.fanChange)),
        followers: toNumber(pickField(r, ALIASES.followers)),
        posts: toNumber(pickField(r, ALIASES.posts)),
        interactions: toNumber(pickField(r, ALIASES.interactions)),
        engagementRate: toNumber(pickField(r, ALIASES.engagementRate)),
        reach: toNumber(pickField(r, ALIASES.reach)),
        videoViews: toNumber(pickField(r, ALIASES.videoViews)),
        raw: r as Record<string, unknown>,
      };
      rows.push(parsed);
    }
  }
  return rows;
}

// Fuzzy match: 1) exact lowercased name, 2) exact handle, 3) substring en cualquiera de los dos
export function matchCompetitor<T extends { id: string; name: string; handle: string | null }>(
  row: ParsedRow,
  candidates: T[],
  clientName: string,
  clientHandles: string[] = []
): { competitor: T | null; isSelf: boolean } {
  const brand = row.brandName.toLowerCase();
  const handle = (row.handle ?? "").toLowerCase();
  const clientLower = clientName.toLowerCase();
  const clientHandlesLower = clientHandles.map(h => h.toLowerCase().replace(/^@/, ""));

  const isSelf =
    brand === clientLower ||
    brand.includes(clientLower) ||
    (handle && clientHandlesLower.includes(handle));
  if (isSelf) return { competitor: null, isSelf: true };

  const exact = candidates.find(c => c.name.toLowerCase() === brand);
  if (exact) return { competitor: exact, isSelf: false };
  const byHandle = handle ? candidates.find(c => (c.handle ?? "").toLowerCase().replace(/^@/, "") === handle) : null;
  if (byHandle) return { competitor: byHandle, isSelf: false };
  const partial = candidates.find(c => brand.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(brand));
  return { competitor: partial ?? null, isSelf: false };
}