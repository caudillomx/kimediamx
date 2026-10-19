import type { Database } from '@/integrations/supabase/types';

export type Signal = Database['public']['Tables']['observatory_signals']['Row'];
export type Vertical = Database['public']['Tables']['observatory_verticals']['Row'];
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
  return `TÍTULO: ${s.title}\nFUENTE: ${s.source_name}\nENLACE: ${s.source_url}\nFECHA: ${s.published_at?.slice(0,10) || 'Sin fecha verificada'}\nÁMBITO: ${s.geographic_scope}\n${s.is_reference ? 'REFERENCIA HISTÓRICA; no presentar como noticia del día.\n' : ''}\nRESUMEN: ${s.summary}\n\nÁNGULO SUGERIDO: ${s.content_angle}\nGANCHO: ${s.hook}`;
}
export function signalsCsv(signals: Signal[]) {
  const cell = (v: string) => `"${v.replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
  return '\uFEFF' + [['Industria','Titular','Fuente','URL','Fecha','Ámbito','Canal','Relevancia','Resumen','Ángulo','Hook'], ...signals.map(s => [s.vertical_slug,s.title,s.source_name,s.source_url,s.published_at?.slice(0,10) || '',s.geographic_scope,s.channel,String(s.relevance),s.summary,s.content_angle,s.hook])].map(row => row.map(cell).join(',')).join('\r\n');
}
export function parrillaReturnPath(value: string | null) {
  return value && /^\/parrilla(?:\?signal=[a-f0-9-]{36})?$/.test(value) ? value : '/admin/operaciones';
}