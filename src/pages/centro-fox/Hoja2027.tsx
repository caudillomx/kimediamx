import { useEffect, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoxLogo } from '@/components/centro-fox-2027/Parts';
import { useCf27Teams } from '@/hooks/useCf27Teams';
import { FUNNEL, LAYERS, attackerOf } from '@/data/taller2027';

const V = ({ label, v, lines = 1 }: { label: string; v?: ReactNode; lines?: number }) => <div className="hj-f"><span>{label}</span>{v ? <p>{v}</p> : Array.from({ length: lines }).map((_, i) => <i key={i} />)}</div>;

export default function Hoja2027() {
  const { teamId } = useParams();
  const { teams, loaded } = useCf27Teams();
  const t = teams.find(x => x.id === teamId);
  const atk = t ? attackerOf(teams, t.id) : undefined;
  useEffect(() => { document.title = t ? `Mi plan digital 2027 · ${t.nombre}` : 'Mi plan digital 2027 · hoja en blanco'; }, [t]);
  const segs = [0, 1, 2].map(i => t?.ex2.segmentos?.[i]);
  return <div className="cf-theme theme-light min-h-screen bg-muted/40 py-6 print:min-h-0 print:p-0 print:bg-transparent">
    <style>{`@page{size:letter landscape;margin:8mm}@media print{html,body{background:transparent;-webkit-print-color-adjust:exact;print-color-adjust:exact}.hj{break-inside:avoid}}
.hj{box-sizing:border-box;width:263mm;min-height:195mm;margin:0 auto;background:hsl(var(--background));color:hsl(var(--foreground));padding:4mm;font-size:8.5pt;line-height:1.2;display:flex;flex-direction:column;gap:2mm}
.hj h1{font-family:'Space Grotesk',sans-serif;font-size:18pt;font-weight:700;line-height:1}
.hj-head{display:grid;grid-template-columns:auto 1fr;gap:6mm;align-items:center;border-bottom:1.5px solid hsl(var(--primary));padding-bottom:2mm}
.hj-meta{display:grid;grid-template-columns:1.2fr 1fr 1.2fr;gap:4mm;margin-top:2mm}
.hj-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:1fr 1fr;gap:2mm;flex:1}
.hj-q{border:1px solid hsl(var(--border));border-radius:2mm;padding:2.5mm 3mm;display:flex;flex-direction:column;gap:1mm;min-width:0}
.hj-q h2{font-family:'Space Grotesk',sans-serif;font-size:10pt;font-weight:700;color:hsl(var(--primary))}
.hj-f span{display:block;font-size:6.5pt;letter-spacing:0;text-transform:uppercase;color:hsl(var(--muted-foreground))}
.hj-f p{white-space:pre-wrap;overflow-wrap:anywhere} .hj-f i{display:block;border-bottom:1px solid hsl(var(--border));height:4mm}
.hj-foot{border-top:1px solid hsl(var(--border));padding-top:2mm} .hj-foot .c{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}`}</style>
    <div className="max-w-[263mm] mx-auto mb-4 flex justify-between items-center print:hidden px-2">
      <p className="text-sm text-muted-foreground">{t ? 'Para guardar en PDF: Imprimir → Guardar como PDF.' : loaded && teamId ? 'No encontré ese equipo. Esta es la hoja en blanco.' : 'Hoja en blanco para imprimir (una por asistente), carta horizontal.'}</p>
      <Button onClick={() => window.print()}><Printer />Imprimir o guardar PDF</Button></div>
    <div className="hj">
      <div className="hj-head"><FoxLogo size={46} /><div><h1>Mi plan digital 2027</h1>
        <div className="hj-meta"><V label="Equipo" v={t?.nombre} /><V label="Estado" v={t?.estado} /><V label="Municipio o distrito" v={t?.municipio} /></div></div></div>
      <div className="hj-grid">
        <section className="hj-q"><h2>1 · Escucha: qué se dice</h2>
          <V label="Tema" v={t?.ex1.tema} /><div className="grid grid-cols-2 gap-3"><V label="Tono" v={t?.ex1.tono} /><V label="Quién habla" v={t?.ex1.quien} /></div>
          <V label="El hueco que nadie ocupa" v={t?.ex1.hueco} lines={2} /><V label="Cuenta a seguir" v={t?.ex1.cuenta} /></section>
        <section className="hj-q"><h2>2 · Mensaje: qué digo, a quién y dónde</h2>
          {segs.map((s, i) => <V key={i} label={`Segmento ${i + 1} · territorio · quiénes · dónde se informan · qué les preocupa · a quién le creen`} v={s && LAYERS.some(([k]) => s[k]) ? LAYERS.map(([k]) => s[k]).filter(Boolean).join(' · ') : undefined} />)}
          <V label="Voces locales que no son políticos" v={t?.ex2.voces} />
          <div className="grid grid-cols-[1fr_2fr] gap-3"><V label="Vainilla" v={t?.ex2.vainilla} /><V label="10 palabras clave" v={t?.ex2.palabras} /></div>
          <V label="Soy quien ___ para ___" v={t?.ex2.soy ? `Soy quien ${t.ex2.soy} para ${t.ex2.para ?? ''}` : undefined} /></section>
        <section className="hj-q"><h2>3 · Reinterpretación: qué harán con mi mensaje</h2>
          <V label="Ataque probable" v={atk?.ex3.ataque} lines={2} /><div className="grid grid-cols-2 gap-3"><V label="Tipo de caso" v={t?.ex3.tipo} /><V label="¿Responder, monitorear o corregir?" v={t?.ex3.decision} /></div>
          <V label="Respuesta (máximo 40 palabras)" v={t?.ex3.respuesta} lines={3} /></section>
        <section className="hj-q"><h2>4 · Respuesta: qué haré y cómo lo convierto en acción</h2>
          <div className="grid grid-cols-[2fr_1fr] gap-3"><V label="Acción" v={t?.ex4.accion} /><V label="Fecha (antes del 6 jun 2027)" v={t?.ex4.fecha} /></div>
          <div className="grid grid-cols-5 gap-2">{FUNNEL.map((f, i) => <V key={f} label={f} v={t?.ex4.metas?.[i] != null ? Number(t.ex4.metas[i]).toLocaleString('es-MX') : undefined} />)}</div>
          {[0, 1].map(i => <V key={i} label={`Barrera ${i + 1} y cómo la quito`} v={t?.ex4.barreras?.[i]?.barrera ? `${t.ex4.barreras[i].barrera} → ${t.ex4.barreras[i].solucion ?? ''}` : undefined} />)}
          <V label="Qué voy a medir" v={t?.ex4.indicador} /></section>
      </div>
      <div className="hj-foot"><b>Mis 3 compromisos para los próximos 30 días</b><div className="c">{[1, 2, 3].map(n => <V key={n} label={String(n)} />)}</div></div>
    </div>
  </div>;
}
