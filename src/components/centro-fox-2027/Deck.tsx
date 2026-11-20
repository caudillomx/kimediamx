import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, Maximize2, NotebookPen, Printer } from 'lucide-react';
import type { Moment } from '@/data/centroFox2027';
import { Shell } from './Parts';

export type Ctx = { revealed: boolean; manual: boolean; step: number; setStep: (n: number) => void };
export type Slide = { id: string; title: string; moment?: Moment; source?: string; optional?: boolean; bare?: boolean; notes: string; render: (c: Ctx) => ReactNode };

export function Deck({ slides: SLIDES, label }: { slides: Slide[]; label: string }) {
  const [sp, setSp] = useSearchParams();
  const print = sp.has('print');
  const total = SLIDES.length;
  const idx = Math.min(total - 1, Math.max(0, Number(sp.get('slide') ?? 1) - 1));
  const [notes, setNotes] = useState(false);
  const [manual, setManual] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [steps, setSteps] = useState<Record<number, number>>({});
  const go = useCallback((d: number) => setSp({ slide: String(Math.min(total, Math.max(1, idx + 1 + d))) }, { replace: true }), [idx, setSp, total]);
  const slide = SLIDES[idx];
  useEffect(() => { document.title = `${idx + 1}/${total} — ${slide.title} · ${label}`; }, [idx, total, slide]);
  useEffect(() => {
    if (print) { const t = setTimeout(() => window.print(), 1500); return () => clearTimeout(t); }
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
      const k = e.key.toLowerCase();
      if (k === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
      if (k === 'n') setNotes(v => !v);
      if (k === 'm') setManual(v => !v);
      if (k === 'r') setRevealed(r => ({ ...r, [idx]: !r[idx] }));
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [go, print, idx]);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const f = () => { const el = box.current; if (el) setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080)); };
    f(); const ro = new ResizeObserver(f); if (box.current) ro.observe(box.current); return () => ro.disconnect();
  }, [print, notes]);
  const touch = useRef<number | null>(null);
  const ctx = (i: number): Ctx => ({ revealed: print || !!revealed[i], manual, step: steps[i] ?? 0, setStep: n => setSteps(s => ({ ...s, [i]: n })) });
  const render = (i: number) => <Shell n={i + 1} total={total} moment={SLIDES[i].moment} source={SLIDES[i].source} bare={SLIDES[i].bare}>{SLIDES[i].render(ctx(i))}</Shell>;

  if (print) return <div className="cf-theme theme-light"><style>{'@page{size:1920px 1080px;margin:0}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pp{break-after:page}'}</style>{SLIDES.map((_, i) => <div key={i} className="pp">{render(i)}</div>)}</div>;

  return (
    <div className="cf-theme theme-light fixed inset-0 flex bg-background">
      <div ref={box} className="relative flex-1 overflow-hidden"
        onTouchStart={e => (touch.current = e.touches[0].clientX)}
        onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
        <div className="absolute left-1/2 top-1/2 -ml-[960px] -mt-[540px] origin-center" style={{ transform: `scale(${scale})` }}>{render(idx)}</div>
        <div className="cf-controls">
          <button onClick={() => go(-1)} aria-label="Lámina anterior"><ChevronLeft /></button>
          <button onClick={() => go(1)} aria-label="Lámina siguiente"><ChevronRight /></button>
          <button onClick={() => setRevealed(r => ({ ...r, [idx]: !r[idx] }))} aria-label="Revelar (R)"><Eye /></button>
          <button onClick={() => setNotes(v => !v)} aria-label="Notas del orador (N)"><NotebookPen /></button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Pantalla completa (F)"><Maximize2 /></button>
          <button onClick={() => window.open(`${window.location.pathname}?print`, '_blank')} aria-label="Exportar a PDF"><Printer /></button>
        </div>
      </div>
      {notes && <aside className="cf-notes">
        <p className="cf-notes-meta">{slide.id} · {idx + 1}/{total}{slide.optional ? ' · opcional, recortable' : ''}</p>
        <h3>{slide.title}</h3><p>{slide.notes}</p>
        <p className="cf-notes-meta mt-6">Siguiente: {SLIDES[idx + 1]?.title ?? '—'}</p>
        <p className="cf-notes-keys">← → avanzar · R revelar · N notas · M conteo a mano (sin red){manual ? ' · ACTIVO' : ''} · F pantalla completa</p>
      </aside>}
    </div>
  );
}
