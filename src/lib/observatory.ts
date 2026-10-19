import type { Database } from '@/integrations/supabase/types';

export type Signal = Database['public']['Tables']['observatory_signals']['Row'];
export type Vertical = Database['public']['Tables']['observatory_verticals']['Row'];
export type ContentPlan = { audience: string; objective: string; format: string; outline: string[]; brand_application: string; alternative_hooks: string[]; cta: string; caution: string };
export function contentPlan(s: Signal): ContentPlan {
  const raw = s.content_plan && typeof s.content_plan === 'object' && !Array.isArray(s.content_plan) ? s.content_plan : {};
  const text = (key: string, fallback: string) => typeof raw[key] === 'string' && raw[key] ? String(raw[key]) : fallback;
  const list = (key: string, fallback: string[]) => Array.isArray(raw[key]) ? raw[key].filter((v): v is string => typeof v === 'string') : fallback;
  return { audience: text('audience', `Personas interesadas en ${verticalLabels[s.vertical_slug] || s.vertical_slug} que necesitan entender cómo les afecta este tema.`), objective: text('objective', s.content_angle), format: text('format', 'Carrusel explicativo · LinkedIn / Instagram'), outline: list('outline', [s.hook, `Explicar el hallazgo sin salir de la fuente: ${s.summary}`, s.content_angle, 'Cerrar con una pregunta sobre la experiencia de la audiencia.']), brand_application: text('brand_application', 'Conectar el hallazgo con una decisión de la audiencia; añadir un ejemplo propio verificable, sin atribuir a la marca resultados que la fuente no demuestra.'), alternative_hooks: list('alternative_hooks', []), cta: text('cta', '¿Cómo cambia esto una decisión en tu trabajo?'), caution: text('caution', s.is_reference ? 'Es una referencia histórica: mencionar el año, no presentarla como novedad y comprobar si hay una actualización.' : 'Citar la fuente, verificar las cifras y separar los hechos de la interpretación; no afirmar que es viral sin evidencia.') };
}
export const verticalLabels: Record<string, string> = { educacion: 'Educación', pymes: 'Empresarios & PyMEs', finanzas: 'Finanzas & Inversiones', tendencias: 'Pop & Memes', 'marketing-ia': 'Marketing, Tech & IA', mujeres: 'Mujeres & Equidad', liderazgo: 'Liderazgo & Management' };
export const verticalAccents: Record<string, string> = { educacion: 'text-cyan', pymes: 'text-electric', finanzas: 'text-lime', tendencias: 'text-magenta', 'marketing-ia': 'text-coral', mujeres: 'text-magenta', liderazgo: 'text-cyan' };
export function balancedSignals(signals: Signal[]) {
  const sorted = [...signals].sort((a,b) => b.relevance - a.relevance);
  const local = sorted.filter(s => s.geographic_scope === 'México/LatAm');
  const global = sorted.filter(s => s.geographic_scope === 'Global');
  // Only matched pairs enter the mixed edition; scope views retain all their records.
  return local.slice(0, Math.min(local.length, global.length)).flatMap((s,i) => [s, global[i]]);
}
export function dailyMilestone(signals: Signal[], now = Date.now()) {
  return signals.filter(s => !s.is_reference && s.is_milestone && s.published_at && now - Date.parse(s.published_at) >= 0 && now - Date.parse(s.published_at) <= 86400000).sort((a,b) => b.relevance - a.relevance)[0];
}
export function signalBrief(s: Signal) {
  const p = contentPlan(s);
  return `TÍTULO: ${s.title}\nFUENTE: ${s.source_name}\nENLACE: ${s.source_url}\nFECHA: ${s.published_at?.slice(0,10) || 'Sin fecha verificada'}\nÁMBITO: ${s.geographic_scope}\n${s.is_reference ? 'REFERENCIA HISTÓRICA; no presentar como noticia del día.\n' : ''}\nRESUMEN: ${s.summary}\n\nÁNGULO SUGERIDO: ${s.content_angle}\nGANCHO: ${s.hook}\nAUDIENCIA: ${p.audience}\nOBJETIVO: ${p.objective}\nFORMATO: ${p.format}\nGUION:\n${p.outline.map((v,i) => `${i+1}. ${v}`).join('\n')}\nAPLICACIÓN PARA MARCA: ${p.brand_application}\nOTROS GANCHOS: ${p.alternative_hooks.join(' / ')}\nCIERRE: ${p.cta}\nCUIDADOS: ${p.caution}`;
}
export function signalsCsv(signals: Signal[]) {
  const cell = (v: string) => `"${v.replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
  return '\uFEFF' + [['Industria','Titular','Fuente','URL','Fecha','Ámbito','Canal','Relevancia','Resumen','Ángulo','Hook'], ...signals.map(s => [s.vertical_slug,s.title,s.source_name,s.source_url,s.published_at?.slice(0,10) || '',s.geographic_scope,s.channel,String(s.relevance),s.summary,s.content_angle,s.hook])].map(row => row.map(cell).join(',')).join('\r\n');
}