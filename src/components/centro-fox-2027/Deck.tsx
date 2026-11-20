import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, Maximize2, NotebookPen, Printer, SlidersHorizontal } from 'lucide-react';
import type { Moment } from '@/data/centroFox2027';
import { Shell } from './Parts';
import { ManualCounter, clearManual } from './Live';

export type Poll = { id: string; options: string[]; label?: string };
export type Flags = Record<string, boolean | undefined>;
export type Ctx = { revealed: boolean; manual: boolean; step: number; setStep: (n: number) => void; flag: (k: string) => boolean | undefined; print: boolean };
export type Slide = {
  id: string; title: string; moment?: Moment; source?: string; optional?: boolean; bare?: boolean; notes: string; render: (c: Ctx) => ReactNode;
  /** Votaciones de la lámina, para capturar conteos a mano en /admin. */
  polls?: Poll[] | ((c: Ctx) => Poll[]);
  /** Interruptores propios de la lámina (p. ej. casos opcionales). */
  toggles?: { key: string; label: string }[];
  /** Controles extra en /admin (p. ej. criterios sí/no). */
  admin?: (c: Ctx, set: (k: string, v: boolean | undefined) => void) => ReactNode;
};
export type Late = { minute: number; slideId: string };

function useSynced<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; } });
  useEffect(() => { const h = (e: StorageEvent) => { if (e.key === key) setV(e.newValue ? JSON.parse(e.newValue) : init); }; window.addEventListener('storage', h); return () => window.removeEventListener('storage', h); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = useCallback((f: T | ((x: T) => T)) => setV(prev => { const n = typeof f === 'function' ? (f as (x: T) => T)(prev) : f; localStorage.setItem(key, JSON.stringify(n)); return n; }), [key]);
  return [v, set] as const;
}
const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function Deck({ slides: ALL, label, admin = false, late }: { slides: Slide[]; label: string; admin?: boolean; late?: Late }) {
  const [sp, setSp] = useSearchParams();
  const print = sp.has('print');
  const ns = `cf27:deck:${label}`;
  const [flags, setFlags] = useSynced<Flags>(`${ns}:flags`, {});
  const SLIDES = print ? ALL : ALL.filter(s => !(s.optional && flags[`hide:${s.id}`]));
  const total = SLIDES.length;
  const [pos, setPos] = useSynced<string>(`${ns}:pos`, ALL[0].id);
  const [rev, setRev] = useSynced<Record<string, boolean>>(`${ns}:rev`, {});
  const [steps, setSteps] = useSynced<Record<string, number>>(`${ns}:steps`, {});
  const [manual, setManual] = useSynced<boolean>(`${ns}:manual`, false);
  const [started, setStarted] = useSynced<number | null>(`${ns}:start`, null);
  const [notes, setNotes] = useState(false);
  const found = SLIDES.findIndex(s => s.id === pos);
  const idx = found < 0 ? 0 : found;
  const slide = SLIDES[idx];
  // La liga ?slide=N manda al abrir; después, la posición se comparte con /admin.
  useEffect(() => { const n = Number(sp.get('slide')); if (!admin && n >= 1 && SLIDES[n - 1]) setPos(SLIDES[n - 1].id); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!admin && !print && Number(sp.get('slide')) !== idx + 1) setSp({ slide: String(idx + 1) }, { replace: true }); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const go = useCallback((d: number) => setPos(SLIDES[Math.min(total - 1, Math.max(0, idx + d))].id), [SLIDES, idx, setPos, total]);
  const revKey = (s: Slide) => `${s.id}:${steps[s.id] ?? 0}`;
  const toggleReveal = useCallback(() => setRev(r => ({ ...r, [revKey(slide)]: !r[revKey(slide)] })), [slide, steps]); // eslint-disable-line react-hooks/exhaustive-deps
  const setFlag = (k: string, v: boolean | undefined) => setFlags(f => ({ ...f, [k]: v }));
  useEffect(() => { document.title = `${admin ? 'Admin · ' : ''}${idx + 1}/${total} — ${slide.title} · ${label}`; }, [idx, total, slide, admin, label]);
  const openAdmin = () => window.open(`${window.location.pathname.replace(/\/admin$/, '')}/admin`, 'cf27-admin', 'width=1100,height=900');
  useEffect(() => {
    if (print) { const t = setTimeout(() => window.print(), 1500); return () => clearTimeout(t); }
    const h = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
      const k = e.key.toLowerCase();
      if (k === 'f' && !admin) document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
      if (k === 'n') setNotes(v => !v);
      if (k === 'm') setManual(v => !v);
      if (k === 'r') toggleReveal();
      if (k === 'a' && !admin) openAdmin();
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [go, print, toggleReveal, admin]); // eslint-disable-line react-hooks/exhaustive-deps
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const f = () => { const el = box.current; if (el) setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080)); };
    f(); const ro = new ResizeObserver(f); if (box.current) ro.observe(box.current); return () => ro.disconnect();
  }, [print, notes, admin]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (!admin) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [admin]);
  const touch = useRef<number | null>(null);
  const ctx = (s: Slide): Ctx => ({ revealed: print || !!rev[revKey(s)], manual, step: steps[s.id] ?? 0, setStep: n => setSteps(x => ({ ...x, [s.id]: n })), flag: k => flags[k], print });
  const render = (i: number) => <Shell n={i + 1} total={total} moment={SLIDES[i].moment} source={SLIDES[i].source} bare={SLIDES[i].bare}>{SLIDES[i].render(ctx(SLIDES[i]))}</Shell>;
  const stage = <div className="absolute left-1/2 top-1/2 -ml-[960px] -mt-[540px] origin-center" style={{ transform: `scale(${scale})` }}>{render(idx)}</div>;

  if (print) return <div className="cf-theme theme-light"><style>{'@page{size:1920px 1080px;margin:0}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pp{break-after:page}'}</style>{SLIDES.map((_, i) => <div key={i} className="pp">{render(i)}</div>)}</div>;

  if (admin) {
    const c = ctx(slide); const polls = typeof slide.polls === 'function' ? slide.polls(c) : slide.polls ?? [];
    const elapsed = started ? Math.max(0, Math.floor((now - started) / 1000)) : 0;
    const lateIdx = late ? SLIDES.findIndex(s => s.id === late.slideId) : -1;
    const isLate = !!late && !!started && elapsed >= late.minute * 60 && lateIdx >= 0 && idx < lateIdx;
    const optional = ALL.filter(s => s.optional);
    return <div className="cf-theme theme-light min-h-screen bg-background text-foreground p-5 grid grid-cols-[1fr_420px] gap-5">
      <div className="space-y-4 min-w-0">
        <div ref={box} className="relative w-full aspect-video overflow-hidden rounded-xl border border-border">{stage}</div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{slide.id} · {idx + 1}/{total}{slide.optional ? ' · opcional' : ''}</p><h2 className="font-display text-xl font-bold">{slide.title}</h2><p className="mt-2 whitespace-pre-line">{slide.notes}</p><p className="mt-3 text-sm text-muted-foreground">Siguiente: {SLIDES[idx + 1]?.title ?? '—'}</p></div>
      </div>
      <aside className="space-y-4 text-sm">
        <section className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tiempo transcurrido</p>
          <p className="font-display text-5xl font-bold tabular-nums">{clock(elapsed)}</p>
          {isLate && <p className="mt-1 rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">Vas tarde: minuto {late!.minute} y aún no llegas a «{SLIDES[lateIdx].title}».</p>}
          <div className="mt-2 flex gap-2"><button className="rounded-md border border-border px-3 py-1" onClick={() => setStarted(Date.now())}>{started ? 'Reiniciar reloj' : 'Iniciar reloj'}</button>{started && <button className="rounded-md border border-border px-3 py-1" onClick={() => setStarted(null)}>Detener</button>}</div>
        </section>
        <section className="rounded-xl border border-border bg-card p-4 flex flex-wrap gap-2">
          <button className="rounded-md border border-border px-3 py-2" onClick={() => go(-1)}>← Anterior</button>
          <button className="rounded-md border border-border px-3 py-2" onClick={() => go(1)}>Siguiente →</button>
          <button className="rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground" onClick={toggleReveal}>{c.revealed ? 'Ocultar revelado' : 'Revelar'}</button>
        </section>
        {polls.length > 0 && <section className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Conteo a mano (si no hay red)</p>
          {polls.map(p => <div key={p.id}><ManualCounter id={p.id} options={p.options} label={p.label} /><button className="mt-1 text-xs underline text-muted-foreground" onClick={() => clearManual(p.id)}>Borrar conteo</button></div>)}
        </section>}
        {(slide.admin || slide.toggles) && <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          {slide.toggles?.map(t => <label key={t.key} className="flex items-center gap-2"><input type="checkbox" checked={!!flags[t.key]} onChange={e => setFlag(t.key, e.target.checked)} />{t.label}</label>)}
          {slide.admin?.(c, setFlag)}
        </section>}
        {optional.length > 0 && <section className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Láminas opcionales</p>
          {optional.map(s => <label key={s.id} className="flex items-center gap-2"><input type="checkbox" checked={!flags[`hide:${s.id}`]} onChange={e => setFlag(`hide:${s.id}`, !e.target.checked)} />{s.title}</label>)}
        </section>}
        <section className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Ir a</p>
          <select className="w-full rounded-md border border-input bg-background p-2" value={slide.id} onChange={e => setPos(e.target.value)}>{SLIDES.map((s, i) => <option key={s.id} value={s.id}>{i + 1}. {s.title}</option>)}</select>
          <button className="text-xs underline text-muted-foreground" onClick={() => { if (confirm('¿Volver a ocultar todas las respuestas?')) setRev({}); }}>Ocultar todos los revelados (antes de empezar)</button>
        </section>
      </aside>
    </div>;
  }

  return (
    <div className="cf-theme theme-light fixed inset-0 flex bg-background">
      <div ref={box} className="relative flex-1 overflow-hidden"
        onTouchStart={e => (touch.current = e.touches[0].clientX)}
        onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
        {stage}
        <div className="cf-controls">
          <button onClick={() => go(-1)} aria-label="Lámina anterior"><ChevronLeft /></button>
          <button onClick={() => go(1)} aria-label="Lámina siguiente"><ChevronRight /></button>
          <button onClick={toggleReveal} aria-label="Revelar (R)" className="flex items-center gap-2 !bg-primary px-4 font-semibold text-primary-foreground"><Eye /> {ctx(slide).revealed ? 'Ocultar' : 'Revelar'}</button>
          <button onClick={() => setNotes(v => !v)} aria-label="Notas del orador (N)"><NotebookPen /></button>
          <button onClick={openAdmin} aria-label="Abrir /admin (A)"><SlidersHorizontal /></button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Pantalla completa (F)"><Maximize2 /></button>
          <button onClick={() => window.open(`${window.location.pathname}?print`, '_blank')} aria-label="Exportar a PDF"><Printer /></button>
        </div>
      </div>
      {notes && <aside className="cf-notes">
        <p className="cf-notes-meta">{slide.id} · {idx + 1}/{total}{slide.optional ? ' · opcional, recortable' : ''}</p>
        <h3>{slide.title}</h3><p>{slide.notes}</p>
        <p className="cf-notes-meta mt-6">Siguiente: {SLIDES[idx + 1]?.title ?? '—'}</p>
        <p className="cf-notes-keys">← → avanzar · R revelar · A abrir /admin · N notas · M conteo a mano (sin red){manual ? ' · ACTIVO' : ''} · F pantalla completa</p>
      </aside>}
    </div>
  );
}
