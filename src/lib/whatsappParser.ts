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

// Ruido: adjuntos omitidos, mensajes de sistema, reacciones sueltas.
const NOISE_RE = [
  /\b(sticker|imagen|audio|video|v[ií]deo|documento|GIF|contacto|ubicaci[oó]n|archivo|adjunto)\s+omitid[oa]s?\b/i,
  /se\s+elimin[oó]\s+este\s+mensaje/i,
  /mensaje\s+eliminado/i,
  /los\s+mensajes\s+y\s+las\s+llamadas\s+est[aá]n\s+cifrad/i,
  /^\s*(a[ñn]adi[oó]|elimin[oó]|sali[oó]|cambi[oó]|cre[oó]|uni[oó])\b/i,
  /cambi[oó]\s+(el\s+asunto|la\s+descripci[oó]n|el\s+icono|su\s+n[uú]mero)/i,
];

// Bloques que sí interesan: síntesis de prensa diaria.
const PRIORITY_RE =
  /(RESUMEN\s+EJECUTIVO|S[IÍ]NTESIS\s+(ESTATAL|INFORMATIVA|NACIONAL)?|OCHO\s+COLUMNAS|PRIMERAS\s+PLANAS|MONITOREO\s+DE\s+MEDIOS|CLIPPING)/i;

const MIN_SUBSTANTIVE_CHARS = 180;

function stripDecoration(s: string): string {
  return s
    .replace(/<Se edit[oó] este mensaje>/gi, "")
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]/gu, "")
    .replace(/[*_~`>#\-–—•·.,!?¡¿:;()\[\]"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isNoise(body: string): boolean {
  const clean = stripDecoration(body);
  if (clean.length === 0) return true; // solo emojis/reacciones
  if (NOISE_RE.some((re) => re.test(body))) return true;
  if (clean.length < 15) return true; // "ok", "gracias", 👍🏽, etc.
  if (/^https?:\/\/\S+$/i.test(body.trim())) return true;
  return false;
}

function toIsoDate(d: string, m: string, y: string): string {
  const yy = y.length === 2 ? `20${y}` : y;
  return `${yy}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

type Msg = { author: string; body: string; priority: boolean };

export function parseWhatsappTxt(text: string): ParsedEntry[] {
  const lines = text.replace(/\u200e/g, "").split(/\r?\n/);
  const byDate = new Map<string, Msg[]>();
  let currentDate: string | null = null;
  let currentAuthor: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentDate || buffer.length === 0) return;
    const body = buffer.join("\n").replace(/<Se edit[oó] este mensaje>/gi, "").trim();
    buffer = [];
    if (!body || isNoise(body)) return;
    const arr = byDate.get(currentDate) ?? [];
    arr.push({ author: currentAuthor ?? "", body, priority: PRIORITY_RE.test(body) });
    byDate.set(currentDate, arr);
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
    .map(([entry_date, msgs]) => {
      const hasPriority = msgs.some((m) => m.priority);
      // Si el día trae síntesis de prensa, conservamos esos bloques y solo el
      // resto que sea sustantivo (análisis largos), descartando la plática.
      const kept = hasPriority
        ? msgs.filter((m) => m.priority || m.body.length >= MIN_SUBSTANTIVE_CHARS)
        : msgs.filter((m) => m.body.length >= 60);
      const ordered = [
        ...kept.filter((m) => m.priority),
        ...kept.filter((m) => !m.priority),
      ];
      return { entry_date, msgs: ordered };
    })
    .filter(({ msgs }) => msgs.length > 0)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(({ entry_date, msgs }) => ({
      entry_date,
      content_md: msgs
        .map((m) => `**${m.author}**\n\n${m.body}`)
        .join("\n\n---\n\n"),
    }));
}