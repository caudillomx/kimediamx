import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useCf27Votes } from '@/hooks/useCf27Votes';
import { FUNNEL, type Team } from '@/data/taller2027';
import { QR } from './Parts';

export const TALLER_PATH = 'taller';

/** Cronómetro de cuenta regresiva para la pantalla. */
export function Timer({ minutes, label }: { minutes: number; label?: string }) {
  const [left, setLeft] = useState(minutes * 60);
  const [run, setRun] = useState(false);
  useEffect(() => { setLeft(minutes * 60); setRun(false); }, [minutes]);
  useEffect(() => { if (!run) return; const t = setInterval(() => setLeft(l => { if (l <= 1) { setRun(false); return 0; } return l - 1; }), 1000); return () => clearInterval(t); }, [run]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  return <div className={`cf-timer ${left === 0 ? 'done' : ''}`}>
    {label && <small>{label}</small>}
    <strong>{mm}:{ss}</strong>
    <div className="cf-timer-ctl">
      <button onClick={() => setRun(r => !r)} aria-label={run ? 'Pausar' : 'Iniciar'}>{run ? <Pause /> : <Play />}</button>
      <button onClick={() => { setRun(false); setLeft(minutes * 60); }} aria-label="Reiniciar"><RotateCcw /></button>
    </div>
  </div>;
}

/** Votación de opción múltiple: cada opción es una pregunta sí/no; se muestra % de participantes. */
export function MultiBars({ keys, labels }: { keys: string[]; labels: string[] }) {
  const { counts } = useCf27Votes();
  const yes = keys.map(k => counts(k)['sí'] ?? 0);
  const people = Math.max(...keys.map(k => Object.values(counts(k)).reduce((a, b) => a + b, 0)), 0);
  const min = Math.min(...yes);
  return <div className="cf-live">
    {labels.map((l, i) => <div key={l} className={`cf-bar-row ${people && yes[i] === min ? 'hl' : ''}`}>
      <span className="cf-bar-label">{l}</span>
      <div className="cf-bar-track"><div style={{ width: `${people ? (yes[i] / people) * 100 : 0}%` }} /></div>
      <b>{people ? Math.round((yes[i] / people) * 100) : 0}%</b>
    </div>)}
    <p className="cf-live-note">{people} {people === 1 ? 'persona' : 'personas'}{people ? ' · resaltado: lo menos marcado' : ''}</p>
  </div>;
}

export function TeamList({ teams }: { teams: Team[] }) {
  if (!teams.length) return <p className="cf-body text-muted-foreground">Aún no hay equipos registrados.</p>;
  return <div className="cf-teamlist">{teams.map((t, i) => <div key={t.id} className="cf-card"><b>{i + 1}. {t.nombre}</b><small>{t.municipio}, {t.estado} · {t.integrantes} personas</small></div>)}</div>;
}

export function TeamBoard({ teams, render, empty = 'Esperando lo que capturen los equipos…' }: { teams: Team[]; render: (t: Team) => React.ReactNode | null; empty?: string }) {
  const cards = teams.map(t => ({ t, c: render(t) })).filter(x => x.c);
  if (!cards.length) return <div className="cf-empty"><QR size={200} path={TALLER_PATH} label={empty} /></div>;
  return <div className="cf-board">{cards.map(({ t, c }) => <div key={t.id} className="cf-card"><div className="cf-board-team">{t.nombre} · {t.municipio}</div>{c}</div>)}</div>;
}

export function FunnelMini({ metas }: { metas?: (number | null)[] }) {
  const v = FUNNEL.map((_, i) => Number(metas?.[i] ?? 0) || 0); const m = Math.max(...v, 1);
  return <div className="cf-funnel-mini">{FUNNEL.map((f, i) => <div key={f}><span>{f}</span><i style={{ width: `${(v[i] / m) * 100}%` }} /><b>{v[i].toLocaleString('es-MX')}</b></div>)}</div>;
}

export function FunnelGuide() {
  return <div className="cf-funnel">{FUNNEL.map((f, i) => <div key={f} style={{ width: `${100 - i * 13}%` }}><b>{i + 1}</b>{f}</div>)}</div>;
}
