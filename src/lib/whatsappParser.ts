// Parses a WhatsApp .txt export into per-day entries.
// Message header format examples:
//   [2/1/26, 07:17:09] Author Name: content...
//   [12/03/25, 22:05:11 p. m.] @user: content
// Continuation lines belong to the previous message.

export type ParsedEntry = {
  entry_date: string; // YYYY-MM-DD
  content_md: string;
};

const HEADER_RE = /^\[(\d{1,2})[\/](\d{1,2})[\/](\d{2,4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*[ap]\.?\s*m\.?)?\]\s*([^:]+?):\s?(.*)$/i;

function toIsoDate(d: string, m: string, y: string): string {
  const yy = y.length === 2 ? `20${y}` : y;
  return `${yy}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function parseWhatsappTxt(text: string): ParsedEntry[] {
  const lines = text.replace(/\u200e/g, "").split(/\r?\n/);
  const byDate = new Map<string, string[]>();
  let currentDate: string | null = null;
  let currentAuthor: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentDate || buffer.length === 0) return;
    const block = `**${currentAuthor ?? ""}**\n\n${buffer.join("\n").trim()}`;
    const arr = byDate.get(currentDate) ?? [];
    arr.push(block);
    byDate.set(currentDate, arr);
    buffer = [];
  };

  for (const raw of lines) {
    const m = raw.match(HEADER_RE);
    if (m) {
      flush();
      const [, d, mo, y, , , , author, first] = m;
      currentDate = toIsoDate(d, mo, y);
      currentAuthor = author.trim();
      buffer = first ? [first] : [];
    } else if (currentDate) {
      buffer.push(raw);
    }
  }
  flush();

  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([entry_date, blocks]) => ({
      entry_date,
      content_md: blocks.join("\n\n---\n\n"),
    }));
}