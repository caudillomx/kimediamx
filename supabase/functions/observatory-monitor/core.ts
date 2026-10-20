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

export const topicalCriteria = {
  educacion: 'Asunto central: enseñanza, aprendizaje, estudiantes, docentes, instituciones educativas, currículo o política educativa. Excluir capacitación empresarial genérica y empleo sin vínculo educativo central.',
  pymes: 'Asunto central: micro, pequeñas o medianas empresas, emprendimiento o gestión de negocios pequeños; debe identificar explícitamente a esos negocios como protagonistas o afectados. Excluir noticias corporativas o macroeconómicas generales.',
  finanzas: 'Asunto central: inversión, mercados, instrumentos financieros, ahorro, crédito, pagos, banca, inflación, tasas o política monetaria. Excluir regulación laboral y noticias empresariales donde la inversión solo se menciona como consecuencia secundaria.',
  tendencias: 'Asunto central: un meme, formato cultural de redes, conversación pop o comportamiento de creadores/comunidades digitales documentado. Excluir noticias generales sobre plataformas y publicidad sin un fenómeno cultural concreto.',
  'marketing-ia': 'Asunto central: marketing, publicidad, comunicación de marcas, tecnología digital o inteligencia artificial, con un cambio, lanzamiento, uso o decisión concreta. Excluir una mención incidental de IA o tecnología en otra industria.',
  mujeres: 'Asunto central: derechos, igualdad de género, autonomía, cuidados, participación o liderazgo de mujeres. Excluir noticias que solo mencionen a una mujer como protagonista sin analizar estas cuestiones.',
  liderazgo: 'Asunto central: dirección de equipos, decisiones de líderes, gestión de personas, cultura organizacional o habilidades de management. Excluir política educativa y noticias que solo citen a un directivo o usen la palabra liderazgo.',
} as const;
export type ObservatoryVertical = keyof typeof topicalCriteria;
export type TopicMatch = { vertical: ObservatoryVertical; direct: boolean; reason: string; evidence: string };

export function hasDirectTopicMatch(vertical: string, matches: TopicMatch[], source: string) {
  const match = matches.find(item => item.vertical === vertical);
  return Boolean(match?.direct && match.reason.trim() && match.evidence.trim() && source.includes(match.evidence.trim()));
}
