export function canonicalUrl(value: string) {
  try { const u = new URL(value); if (u.protocol !== 'https:' || u.username || u.password) return null; u.hash = ''; for (const key of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/.test(key)) u.searchParams.delete(key); return u.href.replace(/\/$/, ''); } catch { return null; }
}
export function verifiedDate(value: string | null, evidence: string, source: string, now = Date.now()) {
  if (!value || !evidence.trim() || !source.includes(evidence.trim())) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp > now) return null;
  const date = new Date(timestamp);
  // Both year and day must exist in the quoted publication evidence; crawl timestamps are excluded by the caller.
  if (!evidence.includes(String(date.getUTCFullYear()))) return null;
  const day = String(date.getUTCDate());
  if (!new RegExp(`(^|\\D)0?${day}(\\D|$)`).test(evidence)) return null;
  return date.toISOString();
}
export function isRecent(value: string | null, now = Date.now()) {
  if (!value) return false;
  const age = now - Date.parse(value);
  return age >= 0 && age <= 86400000;
}
export function monitorSchedule() { return '0 13 * * *'; }
