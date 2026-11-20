import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { activity, normalizeWord, isClean } from '@/data/centroFox2027';
import { useCf27Votes } from '@/hooks/useCf27Votes';
import { Cloud, QR } from './Parts';

const manualKey = (id: string) => `cf27:manual:${id}`;
function useManual(id: string) {
  const [m, setM] = useState<Record<string, number>>(() => { try { return JSON.parse(localStorage.getItem(manualKey(id)) ?? '{}'); } catch { return {}; } });
  useEffect(() => { localStorage.setItem(manualKey(id), JSON.stringify(m)); }, [id, m]);
  return [m, (o: string, d: number) => setM(x => ({ ...x, [o]: Math.max(0, (x[o] ?? 0) + d) }))] as const;
}

/** Barras con votos en vivo + conteo manual (modo sin red, tecla M). */
export function LiveBars({ id, manualMode, labels, correct }: { id: string; manualMode: boolean; labels?: Record<string, string>; correct?: string }) {
  const a = activity(id); const { counts, error } = useCf27Votes(); const c = counts(id); const [manual, bump] = useManual(id);
  const val = (o: string) => (c[o] ?? 0) + (manual[o] ?? 0);
  const total = a.options.reduce((s, o) => s + val(o), 0);
  return <div className="cf-live">
    {a.options.map(o => <div key={o} className={`cf-bar-row ${correct === o ? 'hl' : ''}`}>
      <span className="cf-bar-label">{labels?.[o] ?? o}</span>
      <div className="cf-bar-track"><div style={{ width: `${total ? (val(o) / total) * 100 : 0}%` }} /></div>
      <b>{total ? Math.round((val(o) / total) * 100) : 0}%</b>
      {manualMode && <span className="cf-manual"><button onClick={() => bump(o, -1)} aria-label="Restar"><Minus /></button><button onClick={() => bump(o, 1)} aria-label="Sumar"><Plus /></button></span>}
    </div>)}
    <p className="cf-live-note">{error ? 'Sin conexión: usa el conteo a mano (tecla M).' : `${total} ${total === 1 ? 'respuesta' : 'respuestas'}`}{manualMode && ' · modo sin red activo'}</p>
  </div>;
}

export function LiveCloud({ id }: { id: string }) {
  const { counts } = useCf27Votes(); const c = counts(id);
  const words = Object.entries(c).map(([palabra, frecuencia]) => ({ palabra: normalizeWord(palabra), frecuencia })).filter(w => isClean(w.palabra));
  const merged = Object.values(words.reduce<Record<string, { palabra: string; frecuencia: number }>>((m, w) => { m[w.palabra] = { palabra: w.palabra, frecuencia: (m[w.palabra]?.frecuencia ?? 0) + w.frecuencia }; return m; }, {}));
  return merged.length ? <Cloud words={merged} max={50} /> : <div className="cf-empty"><QR size={220} label="Escanea y escribe una palabra" /></div>;
}
