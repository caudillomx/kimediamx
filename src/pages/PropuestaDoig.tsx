import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Maximize2, Printer } from "lucide-react";
import kimediaLogo from "@/assets/kimedia-logo-full.png";
import { DOIG as D, mxn } from "@/data/propuestaDoig";

// Color sólido: el texto con degradado recortado se rompe en visores PDF de iPhone.
const Grad = ({ children }: { children: ReactNode }) => (
  <span className="text-coral">{children}</span>
);
const Kicker = ({ children }: { children: ReactNode }) => (
  <div className="text-[22px] uppercase tracking-[0.18em] text-coral font-semibold mb-5">{children}</div>
);
const Title = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display text-[76px] leading-[1.02] font-bold tracking-tight mb-12">{children}</h2>
);
const Source = ({ children }: { children: ReactNode }) => (
  <p className="mt-auto pt-6 text-[20px] text-muted-foreground">{children}</p>
);
const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-3xl border border-border bg-card/60 p-8 ${className}`}>{children}</div>
);

const slides: { title: string; render: () => ReactNode }[] = [
  { title: "Portada", render: () => (
    <div className="flex-1 flex flex-col justify-center">
      <Kicker>{D.portada.kicker}</Kicker>
      <h1 className="font-display text-[150px] leading-[0.95] font-bold tracking-tight"><Grad>{D.portada.titulo}</Grad></h1>
      <p className="font-display text-[48px] mt-8">{D.portada.sub}</p>
      <div className="mt-20 grid grid-cols-3 gap-10 max-w-[1500px] text-[26px]">
        <div className="border-t-2 border-coral pt-4"><div className="text-[18px] uppercase tracking-[0.16em] text-muted-foreground mb-2">Presentado a</div>{D.cliente}</div>
        <div className="border-t-2 border-coral pt-4"><div className="text-[18px] uppercase tracking-[0.16em] text-muted-foreground mb-2">Presenta</div>{D.presenta}</div>
        <div className="border-t-2 border-coral pt-4"><div className="text-[18px] uppercase tracking-[0.16em] text-muted-foreground mb-2">Vigencia del servicio</div>{D.vigencia}</div>
      </div>
    </div>
  ) },
  { title: "Punto de partida", render: () => (
    <>
      <Kicker>Diagnóstico</Kicker>
      <Title>{D.diagnostico.titulo}</Title>
      <div className="grid grid-cols-4 gap-6">
        {D.diagnostico.cifras.map((c) => (
          <Card key={c.t} className="min-h-[400px] flex flex-col">
            <div className={`font-display font-bold text-coral leading-none tabular-nums ${c.n.length > 6 ? "text-[50px]" : "text-[110px]"}`}>{c.n}</div>
            <div className="text-[28px] font-semibold mt-8 leading-tight">{c.t}</div>
            <div className="text-[23px] text-muted-foreground mt-4 leading-snug">{c.d}</div>
          </Card>
        ))}
      </div>
      <p className="font-display text-[42px] mt-12 font-semibold">{D.diagnostico.cierre}</p>
      <Source>{D.diagnostico.fuente}</Source>
    </>
  ) },
  { title: "Objetivo", render: () => (
    <>
      <Kicker>Objetivo del acompañamiento</Kicker>
      <Title>De publicar más a <Grad>comunicar mejor</Grad></Title>
      <div className="grid grid-cols-3 gap-8 mt-6">
        {D.objetivo.resultados.map((r, i) => (
          <Card key={r.t} className="min-h-[380px]">
            <div className="font-display text-[72px] font-bold text-coral leading-none">{String.fromCharCode(97 + i)}</div>
            <div className="font-display text-[40px] font-bold mt-8">{r.t}</div>
            <div className="text-[28px] text-muted-foreground mt-4 leading-snug">{r.d}</div>
          </Card>
        ))}
      </div>
    </>
  ) },
  { title: "Qué incluye", render: () => (
    <>
      <Kicker>Alcance</Kicker>
      <Title>Qué incluye</Title>
      <div className="grid grid-cols-3 gap-6">
        {D.incluye.map((c, i) => (
          <Card key={c.t} className="min-h-[300px] !p-7">
            <div className="font-display text-[26px] font-bold text-coral">{String(i + 1).padStart(2, "0")}</div>
            <div className="font-display text-[34px] font-bold mt-3 leading-tight">{c.t}</div>
            <div className="text-[22px] text-muted-foreground mt-3 leading-snug">{c.d}</div>
          </Card>
        ))}
      </div>
    </>
  ) },
  { title: "Hipersegmentación", render: () => (
    <>
      <Kicker>{D.segmentos.titulo}</Kicker>
      <h2 className="font-display text-[60px] leading-[1.05] font-bold tracking-tight mb-10 max-w-[1500px]">{D.segmentos.intro}</h2>
      <div className="grid grid-cols-3 gap-6">
        {D.segmentos.lista.map((s) => (
          <Card key={s.s} className="!p-7 min-h-[160px] flex items-center">
            <div className="font-display text-[34px] font-bold">{s.s}</div>
          </Card>
        ))}
      </div>
      <Source>{D.segmentos.nota}</Source>
    </>
  ) },
  { title: "Plan de 3 meses", render: () => (
    <>
      <Kicker>Ruta de trabajo</Kicker>
      <Title>Plan de 3 meses</Title>
      <div className="relative grid grid-cols-3 gap-10 mt-4">
        <div className="absolute top-[18px] left-0 right-0 h-[3px] bg-gradient-to-r from-coral to-magenta" />
        {D.plan.map((p) => (
          <div key={p.m} className="relative pt-16">
            <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-background border-[5px] border-coral" />
            <div className="text-[22px] uppercase tracking-[0.16em] text-muted-foreground">{p.m} · {p.f}</div>
            <div className="font-display text-[64px] font-bold mt-3"><Grad>{p.v}</Grad></div>
            <p className="text-[27px] text-muted-foreground mt-4 leading-snug">{p.d}</p>
          </div>
        ))}
      </div>
    </>
  ) },
  { title: "Cómo mediremos", render: () => (
    <>
      <Kicker>Medición</Kicker>
      <Title>{D.medicion.titulo}</Title>
      <div className="rounded-3xl border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_420px] bg-card/80 text-[20px] uppercase tracking-[0.14em] text-muted-foreground px-10 py-5"><span>Indicador</span><span className="text-right">Punto de partida</span></div>
        {D.medicion.kpis.map((k) => (
          <div key={k.k} className="grid grid-cols-[1fr_420px] px-10 py-6 border-t border-border text-[30px] items-center">
            <span>{k.k}</span><span className="text-right font-display font-bold text-coral">{k.hoy}</span>
          </div>
        ))}
      </div>
      <Source>{D.medicion.nota} {D.diagnostico.fuente}</Source>
    </>
  ) },
  { title: "Equipo", render: () => (
    <>
      <Kicker>Quiénes lo hacemos</Kicker>
      <Title>Equipo KiMedia</Title>
      <div className="grid grid-cols-5 gap-6">
        {D.equipo.map((e) => (
          <Card key={e.rol} className="min-h-[300px] flex flex-col justify-between">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-magenta" />
            <div>
              <div className="font-display text-[30px] font-bold leading-tight">{e.rol}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  ) },
  { title: "Inversión", render: () => (
    <>
      <Kicker>Propuesta económica</Kicker>
      <Title>Inversión</Title>
      <Card className="!p-16 max-w-[1400px]">
        <div className="font-display text-[150px] font-bold leading-none tabular-nums"><Grad>$80,000</Grad></div>
        <div className="font-display text-[52px] font-bold mt-6">MXN + IVA mensuales</div>
      </Card>
      <p className="text-[26px] text-muted-foreground mt-8">{D.inversion.nota}</p>
    </>
  ) },
  { title: "Condiciones", render: () => (
    <>
      <Kicker>Condiciones y alcance</Kicker>
      <Title>Para trabajar bien</Title>
      <div className="grid grid-cols-2 gap-10">
        {[["Lo que necesitamos de usted", D.condiciones.necesitamos], ["Límites del servicio", D.condiciones.limites]].map(([t, items]) => (
          <Card key={t as string}>
            <div className="font-display text-[36px] font-bold mb-6">{t as string}</div>
            <ul className="space-y-4">{(items as string[]).map((i) => <li key={i} className="text-[26px] flex gap-4 leading-snug"><span className="text-coral">●</span>{i}</li>)}</ul>
          </Card>
        ))}
      </div>
      <p className="text-[26px] mt-8 font-semibold">{D.condiciones.vigencia}</p>
    </>
  ) },
  { title: "Siguientes pasos", render: () => (
    <>
      <Kicker>Arranque</Kicker>
      <Title>Siguientes pasos</Title>
      <div className="grid grid-cols-4 gap-6">
        {D.pasos.map((p, i) => (
          <Card key={p} className="min-h-[300px] flex flex-col justify-between">
            <div className="font-display text-[110px] font-bold text-coral leading-none">{i + 1}</div>
            <div className="font-display text-[34px] font-bold leading-tight">{p}</div>
          </Card>
        ))}
      </div>
    </>
  ) },
  { title: "Cierre", render: () => (
    <div className="flex-1 flex flex-col justify-center">
      <h2 className="font-display text-[104px] leading-[1.02] font-bold tracking-tight max-w-[1600px]">{D.cierre.frase}<br /><Grad>{D.cierre.acento}</Grad></h2>
      <div className="mt-20 text-[32px]"><b>{D.presenta}</b></div>
      <div className="mt-3 text-[28px] text-muted-foreground">{D.contacto.email} · {D.contacto.whatsapp} · {D.contacto.web}</div>
    </div>
  ) },
];

function Slide({ i }: { i: number }) {
  return (
    <div className="relative w-[1920px] h-[1080px] overflow-hidden text-foreground"
      style={{ background: "radial-gradient(1200px 700px at 85% 10%, hsl(var(--coral) / 0.16), transparent 60%), radial-gradient(900px 600px at 5% 95%, hsl(var(--magenta) / 0.14), transparent 60%), hsl(var(--background))" }}>
      <div className="absolute top-0 left-0 right-0 h-[110px] px-[90px] flex items-center justify-between border-b border-border/60">
        <img src={kimediaLogo} alt="KiMedia" className="h-[46px]" />
        <span className="text-[19px] uppercase tracking-[0.18em] text-muted-foreground">Propuesta confidencial · {D.cliente}</span>
      </div>
      <div className="absolute top-[110px] bottom-[90px] left-0 right-0 px-[90px] pt-[60px] pb-[30px] flex flex-col">{slides[i].render()}</div>
      <div className="absolute bottom-0 left-0 right-0 h-[90px] px-[90px] flex items-center justify-between border-t border-border/60 text-[20px] text-muted-foreground">
        <span>{D.emisor} · {D.contacto.web}</span>
        <span className="tabular-nums">{i + 1} / {slides.length}</span>
      </div>
    </div>
  );
}

export default function PropuestaDoig() {
  const [sp, setSp] = useSearchParams();
  const print = sp.has("print");
  const idx = Math.min(slides.length - 1, Math.max(0, Number(sp.get("slide") ?? 1) - 1));
  const go = useCallback((d: number) => {
    setSp({ slide: String(Math.min(slides.length, Math.max(1, idx + 1 + d))) }, { replace: true });
  }, [idx, setSp]);

  useEffect(() => { document.title = print ? `Propuesta · ${D.cliente}` : `${idx + 1}/${slides.length} — ${slides[idx].title} · ${D.cliente}`; }, [idx, print]);
  useEffect(() => {
    if (print) { const t = setTimeout(() => window.print(), 1200); return () => clearTimeout(t); }
    const h = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
      if (e.key === "f") document.documentElement.requestFullscreen?.();
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [go, print]);

  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const f = () => { const el = box.current; if (el) setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080)); };
    f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f);
  }, [print]);
  const touch = useRef<number | null>(null);

  if (print) {
    return (
      <div className="dark bg-background">
        <style>{`@page{size:1920px 1080px;margin:0}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pp{break-after:page}`}</style>
        {slides.map((_, i) => <div key={i} className="pp"><Slide i={i} /></div>)}
      </div>
    );
  }

  return (
    <div className="dark">
      <div ref={box} className="fixed inset-0 overflow-hidden bg-background"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
        <div className="absolute left-1/2 top-1/2 -ml-[960px] -mt-[540px] origin-center" style={{ transform: `scale(${scale})` }}>
          <Slide i={idx} />
        </div>
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-30 hover:opacity-100 transition-opacity text-foreground">
          <button onClick={() => go(-1)} className="p-2 rounded-lg bg-card border border-border" aria-label="Lámina anterior"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => go(1)} className="p-2 rounded-lg bg-card border border-border" aria-label="Lámina siguiente"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="p-2 rounded-lg bg-card border border-border" aria-label="Pantalla completa"><Maximize2 className="w-4 h-4" /></button>
          <button onClick={() => window.open(`${window.location.pathname}?print`, "_blank")} className="p-2 rounded-lg bg-card border border-border" aria-label="Exportar a PDF"><Printer className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
