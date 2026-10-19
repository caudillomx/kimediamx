import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Copy, Check, ArrowRight, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signalBrief, type Signal } from '@/lib/observatory';
export function SignalCard({ signal: s }: { signal: Signal }) {
  const [copied, setCopied] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);
  let iconUrl = '';
  try { iconUrl = new URL('/favicon.ico', s.source_url).href; } catch { /* Fallback icon */ }
  async function copy() {
    try { await navigator.clipboard.writeText(signalBrief(s)); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error('No se pudo copiar el brief. Intenta de nuevo.'); }
  }
  return <article className="rounded-lg border border-border bg-card flex flex-col overflow-hidden">
    <div className="p-5 md:p-6 flex-1">
      <div className="flex justify-between gap-3 text-xs text-muted-foreground mb-5"><span className="flex items-center gap-2">{iconUrl && !faviconFailed ? <img src={iconUrl} alt="" className="w-4 h-4" loading="lazy" onError={() => setFaviconFailed(true)} /> : <Globe2 className="w-4 h-4" />}{s.source_name}</span><span className="shrink-0 text-primary">{s.geographic_scope}</span></div>
      <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="group"><h3 className="text-xl font-display font-semibold leading-snug group-hover:text-primary">{s.title} <ArrowUpRight className="inline w-4 h-4 text-primary" /></h3></a>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground"><span>{s.published_at ? new Date(s.published_at).toLocaleDateString('es-MX', {timeZone:'UTC'}) : 'Sin fecha verificada'}</span><span>{s.channel}</span><span>{s.is_reference ? 'Referencia' : 'Señal'} · {s.relevance}/100</span></div>
      <p className="text-sm text-muted-foreground leading-relaxed mt-5">{s.summary}</p>
    </div>
    <div className="border-t border-border bg-primary/5 p-5 md:p-6">
      <p className="text-xs uppercase tracking-wider text-primary mb-2 font-semibold">Ángulo para tu contenido</p><p className="text-sm leading-relaxed">{s.content_angle}</p>
      <p className="mt-4 text-sm font-display font-medium border-l-2 border-primary pl-3">“{s.hook}”</p>
      <div className="flex flex-wrap gap-2 mt-5"><Button variant="secondary" size="sm" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? 'Copiado' : 'Copiar brief'}</Button><Button asChild variant="ghost" size="sm"><Link to={`/parrilla?signal=${s.id}`}>Llevar a Parrilla <ArrowRight /></Link></Button></div>
    </div>
  </article>;
}