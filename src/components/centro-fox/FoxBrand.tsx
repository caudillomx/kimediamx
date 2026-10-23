import logo from '@/assets/centro-fox/logo.png.asset.json';
export default function FoxBrand() {
  return <div className="fox-brand"><img src={`https://www.kimedia.mx${logo.url}`} alt="Capacitación Profesional Centro Fox" /><div><strong>Centro Fox</strong><span>Capacitación Profesional</span></div><div className="fox-signature">Paulina<br /><strong>Amozurrutia</strong></div></div>;
}