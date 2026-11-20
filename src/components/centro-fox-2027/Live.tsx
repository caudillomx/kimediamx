import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { activity, normalizeWord, isClean, verdict, type RevealKind, type Tally } from '@/data/centroFox2027';
import { useCf27Votes } from '@/hooks/useCf27Votes';
import { Cloud, Means, QR } from './Parts';

/* Conteo a mano (modo sin red). Se guarda en este navegador y se sincroniza entre la presentación y /admin. */
const manualKey = (id: string) => `cf27:manual:${id}`;
const EVT = 'cf27-manual';
export const readManual = (id: string): Tally => { try { return JSON.parse(localStorage.getItem(manualKey(id)) ?? '{}'); } catch { return {}; } };
export function bumpManual(id: string, o: string, d: number) {
  const x = readManual(id); localStorage.setItem(manualKey(id), JSON.stringify({ ...x, [o]: Math.max(0, (x[o] ?? 0) + d) })); window.dispatchEvent(new Event(EVT));
}
export function clearManual(id: string) { localStorage.removeItem(manualKey(id)); window.dispatchEvent(new Event(EVT)); }
export function useManualTick() {
  const [, setT] = useState(0);
  useEffect(() => { const h = () => setT(t => t + 1); window.addEventListener('storage', h); window.addEventListener(EVT, h); return () => { window.removeEventListener('storage', h); window.removeEventListener(EVT, h); }; }, []);
}

/** Votos en vivo + conteo a mano. Con `frozen`, los votos en línea se congelan al revelar; lo capturado a mano sigue sumando. */
export function useTally(id: string, options: string[], frozen = false) {
  const { counts, error, loaded } = useCf27Votes(); useManualTick();
  const online = counts(id); const manual = readManual(id);
  const snap = useRef<Tally | null>(null);
  if (!frozen) snap.current = null; else if (!snap.current && loaded) snap.current = online;
  const base = frozen ? snap.current ?? online : online;
  const tally: Tally = Object.fromEntries(options.map(o => [o, (base[o] ?? 0) + (manual[o] ?? 0)]));
  return { tally, error };
}

export function LiveBars({ id, manualMode, labels, correct, options, frozen }: { id: string; manualMode: boolean; labels?: Record<string, string>; correct?: string; options?: string[]; frozen?: boolean }) {
  const opts = options ?? activity(id).options; const { tally, error } = useTally(id, opts, frozen);
  const total = opts.reduce((s, o) => s + tally[o], 0);
  return <div className="cf-live">
    {opts.map(o => <div key={o} className={`cf-bar-row ${correct === o ? 'hl' : ''}`}>
      <span className="cf-bar-label">{labels?.[o] ?? o}</span>
      <div className="cf-bar-track"><div style={{ width: `${total ? (tally[o] / total) * 100 : 0}%` }} /></div>
      <b>{total ? Math.round((tally[o] / total) * 100) : 0}%</b>
      {manualMode && <span className="cf-manual"><button onClick={() => bumpManual(id, o, -1)} aria-label="Restar"><Minus /></button><button onClick={() => bumpManual(id, o, 1)} aria-label="Sumar"><Plus /></button></span>}
    </div>)}
    <p className="cf-live-note">{frozen ? `Votación cerrada · ${total} ${total === 1 ? 'respuesta' : 'respuestas'}` : error ? 'Sin conexión: captura los votos a mano en /admin.' : `${total} ${total === 1 ? 'respuesta' : 'respuestas'}`}{manualMode && ' · conteo a mano activo'}</p>
  </div>;
}

/** Estado PREGUNTA/VOTACIÓN: código QR y barras en vivo. */
export function VoteSide({ id, manual, label = 'Vota aquí', size = 190, options, labels, path }: { id: string; manual: boolean; label?: string; size?: number; options?: string[]; labels?: Record<string, string>; path?: string }) {
  return <div className="flex flex-col gap-6"><QR size={size} label={label} path={path} /><LiveBars id={id} manualMode={manual} options={options} labels={labels} /></div>;
}

/** Estado REVELADO: lo que votó la sala (congelado) contra lo que pasó en realidad, veredicto y lección. */
export function Contrast({ id, options, labels, correct, kind = 'real', realTitle, real, lesson, tpl, cols = '1fr 1fr', after }: {
  id: string; options?: string[]; labels?: Record<string, string>; correct?: string; kind?: RevealKind; realTitle?: string; real?: ReactNode; lesson?: ReactNode; tpl?: (pct: number) => string; cols?: string; after?: ReactNode;
}) {
  const a = activity(id) as ReturnType<typeof activity> | undefined;
  const opts = options ?? a?.options ?? []; const right = correct ?? (kind === 'lectura' ? undefined : a?.correct);
  const { tally } = useTally(id, opts, true);
  const title = realTitle ?? (kind === 'lectura' ? 'Lectura' : kind === 'recomendada' ? 'Respuesta recomendada' : 'Lo que pasó en realidad');
  return <div className="flex flex-col gap-4">
    <div className="grid gap-x-10 gap-y-4 items-start" style={{ gridTemplateColumns: cols }}>
      <div><small className="cf-label">Lo que votó la sala</small><div className="mt-4"><LiveBars id={id} options={opts} labels={labels} manualMode={false} frozen correct={right} /></div></div>
      {real && <div><small className="cf-label">{title}</small><div className="mt-4">{real}</div></div>}
    </div>
    <div className="cf-card" style={{ padding: '14px 28px' }}><p className="cf-body-lg"><b>{verdict(tally, opts, right, kind, tpl)}</b></p></div>
    {lesson && <Means>{lesson}</Means>}
    {after}
  </div>;
}

export function ManualCounter({ id, options, label }: { id: string; options: string[]; label?: string }) {
  useManualTick(); const m = readManual(id);
  return <div className="space-y-2"><p className="text-sm font-semibold">{label ?? id}</p>
    {options.map(o => <div key={o} className="flex items-center gap-2 text-sm"><span className="flex-1">{o}</span>
      <button className="rounded border border-border px-2" onClick={() => bumpManual(id, o, -1)} aria-label={`Restar ${o}`}><Minus className="h-4 w-4" /></button>
      <b className="w-8 text-center">{m[o] ?? 0}</b>
      <button className="rounded border border-border px-2" onClick={() => bumpManual(id, o, 1)} aria-label={`Sumar ${o}`}><Plus className="h-4 w-4" /></button></div>)}
  </div>;
}

export function LiveCloud({ id, path }: { id: string; path?: string }) {
  const { counts } = useCf27Votes(); const c = counts(id);
  const words = Object.entries(c).map(([palabra, frecuencia]) => ({ palabra: normalizeWord(palabra), frecuencia })).filter(w => isClean(w.palabra));
  const merged = Object.values(words.reduce<Record<string, { palabra: string; frecuencia: number }>>((m, w) => { m[w.palabra] = { palabra: w.palabra, frecuencia: (m[w.palabra]?.frecuencia ?? 0) + w.frecuencia }; return m; }, {}));
  return merged.length ? <Cloud words={merged} max={50} /> : <div className="cf-empty"><QR size={220} label="Escanea y escribe una palabra" path={path} /></div>;
}
