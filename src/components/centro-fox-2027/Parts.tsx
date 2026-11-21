import type { ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import foxLogo from '@/assets/centro-fox/logo.png.asset.json';
import kimediaLogo from '@/assets/kimedia-logo-dark.png';
import { MOMENTS, type Moment } from '@/data/centroFox2027';

export const participaUrl = (path = 'participa') => `${/^(localhost|127\.)/.test(window.location.hostname) ? 'https://www.kimedia.mx' : window.location.origin}/centro-fox/2027/${path}`;

export const Kicker = ({ children }: { children: ReactNode }) => <div className="cf-kicker">{children}</div>;
export const Title = ({ children, lg }: { children: ReactNode; lg?: boolean }) => <h2 className={lg ? 'cf-title-lg' : 'cf-title'}>{children}</h2>;
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`cf-card ${className}`}>{children}</div>;
export const Means = ({ children }: { children: ReactNode }) => <div className="cf-means"><span>Qué significa</span><p>{children}</p></div>;

export function FoxLogo({ size = 76 }: { size?: number }) {
  return <img src={`https://www.kimedia.mx${foxLogo.url}`} alt="Capacitación Profesional Centro Fox" style={{ height: size }} className="w-auto object-contain mix-blend-multiply" />;
}
export function KiLogo({ size = 44 }: { size?: number }) {
  return <img src={kimediaLogo} alt="KiMedia" style={{ height: size }} className="w-auto object-contain" />;
}
export function QR({ size = 300, label = 'Participa desde tu teléfono', path }: { size?: number; label?: string; path?: string }) {
  const url = participaUrl(path);
  return <div className="cf-qr"><div className="cf-qr-box"><QRCodeSVG value={url} size={size} bgColor="transparent" fgColor="currentColor" /></div><strong>{label}</strong><small>{url.replace(/^https?:\/\//, '')}</small></div>;
}

export function MomentBar({ moment, order = MOMENTS }: { moment?: Moment; order?: readonly Moment[] }) {
  if (!moment) return null;
  return <div className="cf-moments">{order.map((m, i) => <span key={m} className={m === moment ? 'on' : ''}>{i + 1} · {m}</span>)}</div>;
}

export function Shell({ children, n, total, moment, momentOrder, source, bare }: { children: ReactNode; n: number; total: number; moment?: Moment; momentOrder?: readonly Moment[]; source?: string; bare?: boolean }) {
  return (
    <div className="cf-slide">
      {!bare && <header className="cf-head"><FoxLogo size={84} /><MomentBar moment={moment} order={momentOrder} /><div className="cf-speaker">Jesús Caudillo</div></header>}
      <main className="cf-body">{children}</main>
      <footer className="cf-foot"><span>{source ?? ''}</span><span className="flex items-center gap-6"><KiLogo size={34} /><b>{n} / {total}</b></span></footer>
      <div className="cf-progress" style={{ width: `${(n / total) * 100}%` }} />
    </div>
  );
}

export function Bars({ rows, max, unit = '', highlight = [] }: { rows: { label: string; value: number }[]; max?: number; unit?: string; highlight?: string[] }) {
  const m = max ?? Math.max(...rows.map(r => r.value), 1);
  return <div className="cf-bars">{rows.map(r => <div key={r.label} className={`cf-bar-row ${highlight.includes(r.label) ? 'hl' : ''}`}><span className="cf-bar-label">{r.label}</span><div className="cf-bar-track"><div style={{ width: `${(r.value / m) * 100}%` }} /></div><b>{r.value.toLocaleString('es-MX')}{unit}</b></div>)}</div>;
}

export function Cloud({ words, max = 40, scale = 90 }: { words: { palabra: string; frecuencia: number }[]; max?: number; scale?: number }) {
  const list = [...words].sort((a, b) => b.frecuencia - a.frecuencia).slice(0, max);
  const top = list[0]?.frecuencia ?? 1;
  const order = list.map((w, i) => ({ ...w, i })).sort((a, b) => (a.i % 2) - (b.i % 2) || a.palabra.localeCompare(b.palabra));
  return <div className="cf-cloud">{order.map(w => <span key={w.palabra} style={{ fontSize: 22 + scale * Math.sqrt(w.frecuencia / top), opacity: 0.45 + 0.55 * (w.frecuencia / top) }} className={w.i === 0 ? 'top' : ''}>{w.palabra}</span>)}</div>;
}

export function Photo({ src, className = '', alt = '' }: { src: string; className?: string; alt?: string }) {
  return <img src={src} alt={alt} className={`cf-photo ${className}`} />;
}
