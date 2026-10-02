import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import kimediaLogo from "@/assets/kimedia-logo-full.png";
import imgPregunta from "@/assets/cfl/pregunta.jpg";
import imgPlaza from "@/assets/cfl/plaza.jpg";
import imgAlgoritmo from "@/assets/cfl/algoritmo.jpg";
import imgRiesgo from "@/assets/cfl/riesgo.jpg";
import imgHerramienta from "@/assets/cfl/herramienta.jpg";
import imgCierre from "@/assets/cfl/cierre.jpg";

function Side({ src, className = "" }: { src: string; className?: string }) {
  return <div className={`relative rounded-3xl overflow-hidden border border-border shrink-0 ${className}`}><img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" /></div>;
}
import { useCflVotes, useWikiPhoto } from "@/hooks/useCflVotes";
import {
  POLLS, ERAS, QUOTES, MEXICO, DATA_MX, PRINCIPIOS, RIESGOS, HERRAMIENTAS, PROMPTS, PREGUNTAS, NIVELES, type PollKey,
} from "@/data/cflEstrategiaDigital";

const PARTICIPA = () => (/kimedia\.mx$/.test(window.location.hostname) ? `${window.location.origin}/cfl/participa` : "https://www.kimedia.mx/cfl/participa");

function Photo({ wiki, className = "" }: { wiki: string; className?: string }) {
  const src = useWikiPhoto(wiki);
  return src ? <img src={src} alt="" className={`object-cover object-top ${className}`} referrerPolicy="no-referrer" />
    : <div className={`bg-muted ${className}`} />;
}

function Kicker({ children }: { children: ReactNode }) {
  return <div className="text-[22px] uppercase tracking-[0.18em] text-coral font-semibold mb-6">{children}</div>;
}

function Frame({ children, n, total }: { children: ReactNode; n: number; total: number }) {
  return (
    <div className="absolute inset-0 p-[90px] pb-[110px] flex flex-col">
      {children}
      <div className="absolute left-[90px] right-[90px] bottom-[40px] flex items-center justify-between text-[20px] text-muted-foreground">
        <span>Estrategia digital · Programa de Formación de Líderes Políticos 2026</span>
        <span className="flex items-center gap-6"><span>www.kimedia.mx</span><span className="tabular-nums">{n + 1}/{total}</span></span>
      </div>
    </div>
  );
}

function Poll({ k }: { k: Exclude<PollKey, "diag"> }) {
  const { counts } = useCflVotes();
  const p = POLLS[k]; const c = counts(k);
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(c));
  return (
    <div className="flex gap-16 flex-1 min-h-0">
      <div className="flex-1 flex flex-col">
        <h2 className="font-display text-[72px] leading-[1.05] font-bold tracking-tight mb-10">{p.q}</h2>
        <div className="space-y-4">
          {p.options.map((o) => { const v = c[o] ?? 0; return (
            <div key={o} className="grid grid-cols-[380px_1fr_120px] items-center gap-6 text-[30px]">
              <span>{o}</span>
              <div className="h-10 rounded-full bg-muted/40 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-coral to-magenta transition-all duration-700" style={{ width: `${(v / max) * 100}%` }} /></div>
              <span className="text-right tabular-nums font-semibold">{total ? Math.round((v / total) * 100) : 0}%</span>
            </div>
          ); })}
        </div>
        <div className="mt-8 text-[24px] text-muted-foreground">{total} {total === 1 ? "voto" : "votos"} en vivo</div>
      </div>
      <QrBox />
    </div>
  );
}

function QrBox({ label = "Vote desde su celular" }: { label?: string }) {
  return (
    <div className="w-[380px] shrink-0 flex flex-col items-center justify-center gap-6">
      <div className="rounded-3xl bg-card p-6 border border-border"><QRCodeSVG value={PARTICIPA()} size={300} bgColor="transparent" fgColor="currentColor" className="text-foreground" /></div>
      <div className="text-[26px] text-center font-semibold">{label}</div>
      <div className="text-[20px] text-muted-foreground text-center">{PARTICIPA().replace(/^https?:\/\//, "")}</div>
    </div>
  );
}

function DiagResults() {
  const { counts } = useCflVotes();
  const c = counts("diag"); const total = Object.values(c).reduce((a, b) => a + b, 0);
  return (
    <div className="flex gap-16 flex-1 min-h-0">
      <div className="flex-1">
        <Kicker>Autodiagnóstico · 3 minutos</Kicker>
        <h2 className="font-display text-[80px] leading-none font-bold tracking-tight mb-6">¿Qué tan visible es usted hoy?</h2>
        <p className="text-[30px] text-muted-foreground mb-10 max-w-[1000px]">Diez preguntas honestas. Al final recibe su nivel y su primer paso. Así se distribuye el grupo:</p>
        <div className="grid grid-cols-4 gap-6">
          {NIVELES.map((n) => { const v = c[n.k] ?? 0; return (
            <div key={n.k} className="rounded-3xl border border-border bg-card/60 p-8 min-h-[260px] flex flex-col justify-between">
              <div className="text-[30px] font-semibold">{n.k}</div>
              <div className="font-display text-[96px] font-bold text-coral leading-none tabular-nums">{v}</div>
              <div className="text-[22px] text-muted-foreground">{total ? Math.round((v / total) * 100) : 0}% del grupo</div>
            </div>
          ); })}
        </div>
      </div>
      <QrBox label="Haga su diagnóstico" />
    </div>
  );
}

const slides: { title: string; render: () => ReactNode }[] = [
  { title: "Portada", render: () => (
    <div className="flex flex-1 gap-16 items-center">
      <div className="flex-1">
        <img src={kimediaLogo} alt="KiMedia" className="h-[70px] mb-16 dark:invert-0" />
        <Kicker>Sesión 11 · Estrategia digital</Kicker>
        <h1 className="font-display text-[132px] leading-[0.95] font-bold tracking-tight">Incidir en la era<br /><span className="bg-gradient-to-r from-coral to-magenta bg-clip-text text-transparent">del algoritmo</span></h1>
        <p className="text-[36px] text-muted-foreground mt-10 max-w-[1000px]">Cómo usar lo digital para que su liderazgo llegue más lejos y pese más en la vida pública.</p>
        <div className="mt-14 text-[28px]"><b>Jesús Caudillo</b> <span className="text-muted-foreground">· Socio fundador de KiMedia · Sigma Awards 2020</span></div>
      </div>
      <QrBox label="Escanee y participe" />
    </div>
  ) },
  { title: "Votación: fuentes", render: () => <><Kicker>Votación en vivo</Kicker><Poll k="fuente" /></> },
  { title: "Pregunta", render: () => (
    <div className="flex-1 flex gap-16 items-center min-h-0">
      <div className="flex-1">
        <Kicker>Para pensar</Kicker>
        <h2 className="font-display text-[100px] leading-[1.02] font-bold tracking-tight">{PREGUNTAS[0]}</h2>
        <p className="text-[34px] text-muted-foreground mt-10">Saque su celular y búsquese. Tiene 60 segundos.</p>
      </div>
      <Side src={imgPregunta} className="w-[620px] h-full" />
    </div>
  ) },
  { title: "Cada era tiene su medio", render: () => (
    <>
      <Kicker>El momento histórico</Kicker>
      <h2 className="font-display text-[76px] leading-none font-bold tracking-tight mb-12">Cada época premia a quien domina su medio</h2>
      <div className="grid grid-cols-5 gap-6 flex-1 min-h-0">
        {ERAS.map((e, i) => (
          <div key={e.year} className={`rounded-3xl overflow-hidden border flex flex-col ${i === ERAS.length - 1 ? "border-coral" : "border-border"} bg-card/60`}>
            <Photo wiki={e.wiki} className="h-[300px] w-full grayscale" />
            <div className="p-7 flex flex-col gap-3 flex-1">
              <div className="font-display text-[56px] font-bold text-coral leading-none">{e.year}</div>
              <div className="text-[28px] font-semibold">{e.era}</div>
              <div className="text-[20px] text-muted-foreground">{e.who}</div>
              <div className="text-[23px] leading-snug mt-auto">{e.lesson}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  ) },
  { title: "Lo que dicen", render: () => (
    <>
      <Kicker>Lo que dicen quienes lo ven desde dentro</Kicker>
      <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">
        {QUOTES.map((q) => (
          <div key={q.who} className="rounded-3xl border border-border bg-card/60 p-8 flex gap-8">
            <Photo wiki={q.wiki} className="w-[170px] h-[170px] rounded-2xl shrink-0" />
            <div className="flex flex-col">
              <p className="text-[32px] leading-snug font-medium">«{q.text}»</p>
              <div className="mt-auto pt-4 text-[22px]"><b>{q.who}</b> <span className="text-muted-foreground">· {q.role} · {q.src}</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  ) },
  { title: "México conectado", render: () => (
    <>
      <Kicker>México hoy</Kicker>
      <h2 className="font-display text-[80px] leading-none font-bold tracking-tight mb-8">La plaza pública ya está en el celular</h2>
      <Side src={imgPlaza} className="h-[230px] w-full mb-8" />
      <div className="grid grid-cols-3 gap-8">
        {DATA_MX.map((d) => (
          <div key={d.n} className="rounded-3xl border border-border bg-card/60 p-8 min-h-[250px] flex flex-col">
            <div className="font-display text-[90px] font-bold leading-none bg-gradient-to-r from-coral to-magenta bg-clip-text text-transparent">{d.n}</div>
            <div className="text-[34px] mt-6 leading-tight">{d.t}</div>
            <div className="text-[20px] text-muted-foreground mt-auto">{d.s}</div>
          </div>
        ))}
      </div>
      <p className="text-[30px] mt-6 max-w-[1500px]">La pregunta ya no es <i>si</i> estar en digital, sino <b>con qué propósito</b> y <b>con qué sistema</b>.</p>
    </>
  ) },
  { title: "Casos México", render: () => (
    <>
      <Kicker>Casos mexicanos · distintos partidos, lecciones útiles</Kicker>
      <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
        {MEXICO.map((m) => (
          <div key={m.who} className="rounded-3xl overflow-hidden border border-border bg-card/60 flex flex-col">
            <Photo wiki={m.wiki} className="h-[340px] w-full" />
            <div className="p-7 flex flex-col gap-3 flex-1">
              <div className="text-[22px] uppercase tracking-wider text-coral">{m.label}</div>
              <div className="text-[30px] font-semibold leading-tight">{m.who}</div>
              <div className="text-[25px] leading-snug mt-auto">{m.lesson}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  ) },
  { title: "Nuevas reglas", render: () => (
    <>
      <Kicker>Lo que cambió</Kicker>
      <h2 className="font-display text-[80px] leading-none font-bold tracking-tight mb-12">Cinco reglas del nuevo juego</h2>
      <div className="flex gap-12 flex-1 min-h-0">
      <div className="space-y-5 flex-1">
        {PRINCIPIOS.map((p, i) => (
          <div key={p.t} className="grid grid-cols-[100px_420px_1fr] items-baseline gap-6 border-b border-border/60 pb-5">
            <span className="font-display text-[56px] font-bold text-coral leading-none">0{i + 1}</span>
            <span className="text-[40px] font-semibold">{p.t}</span>
            <span className="text-[26px] text-muted-foreground">{p.d}</span>
          </div>
        ))}
      </div>
      <Side src={imgAlgoritmo} className="w-[420px] h-full" />
      </div>
    </>
  ) },
  { title: "Riesgos", render: () => (
    <>
      <Kicker>El lado oscuro</Kicker>
      <div className="flex gap-10 items-end mb-8"><h2 className="font-display text-[80px] leading-none font-bold tracking-tight flex-1">Lo que puede tirar una carrera</h2><Side src={imgRiesgo} className="w-[700px] h-[200px]" /></div>
      <div className="grid grid-cols-2 gap-8">
        {RIESGOS.map((r) => (
          <div key={r.t} className="rounded-3xl border border-border bg-card/60 p-7 min-h-[200px]">
            <div className="text-[38px] font-semibold mb-3">{r.t}</div>
            <div className="text-[28px] text-muted-foreground leading-snug">{r.d}</div>
            {"s" in r && r.s && <div className="text-[20px] text-muted-foreground mt-4">Fuente: {r.s}</div>}
          </div>
        ))}
      </div>
    </>
  ) },
  { title: "Votación: frenos", render: () => <><Kicker>Votación en vivo</Kicker><Poll k="reto" /></> },
  { title: "Autodiagnóstico", render: () => <DiagResults /> },
  { title: "Herramienta 01", render: () => { const h = HERRAMIENTAS[0]; return (
    <div className="flex-1 flex gap-14 items-center min-h-0"><div className="flex-1">
      <Kicker>Herramienta {h.n}</Kicker>
      <h2 className="font-display text-[96px] leading-none font-bold tracking-tight">{h.t}</h2>
      <p className="text-[34px] text-muted-foreground mt-6">{h.sub}</p>
      <div className="mt-12 rounded-3xl border-2 border-coral bg-coral/10 p-10 text-[40px] leading-snug font-medium">{"formula" in h && h.formula}</div>
      <p className="mt-10 text-[30px] max-w-[1500px]"><span className="text-coral font-semibold">Ejemplo: </span>{"ejemplo" in h && h.ejemplo}</p>
    </div><Side src={imgHerramienta} className="w-[480px] h-full" /></div>
  ); } },
  { title: "Herramientas 02 y 03", render: () => <TwoTools a={1} b={2} /> },
  { title: "Herramientas 04 y 05", render: () => <TwoTools a={3} b={4} /> },
  { title: "Escucha e IA", render: () => (
    <div className="grid grid-cols-2 gap-14 flex-1 min-h-0">
      <ToolCard i={5} />
      <div>
        <Kicker>Herramienta 07 · IA como asistente</Kicker>
        <h3 className="font-display text-[56px] font-bold leading-none mb-8">Cuatro instrucciones para copiar</h3>
        <div className="space-y-4">
          {PROMPTS.map((p, i) => <div key={i} className="rounded-2xl border border-border bg-card/60 p-5 text-[23px] leading-snug">{p}</div>)}
        </div>
        <p className="text-[20px] text-muted-foreground mt-4">Nunca publique sin revisar: la IA se equivoca y la responsabilidad es suya.</p>
      </div>
    </div>
  ) },
  { title: "Votación: compromiso", render: () => <><Kicker>Su compromiso</Kicker><Poll k="compromiso" /></> },
  { title: "Cierre", render: () => (
    <div className="flex flex-1 gap-16 items-center">
      <div className="flex-1">
        <Kicker>Para llevarse</Kicker>
        <h2 className="font-display text-[96px] leading-[1.02] font-bold tracking-tight">Lo digital no sustituye al liderazgo.<br /><span className="bg-gradient-to-r from-coral to-magenta bg-clip-text text-transparent">Lo multiplica.</span></h2>
        <div className="mt-12 space-y-4 text-[32px]">
          {PREGUNTAS.slice(1).map((q) => <p key={q} className="text-muted-foreground">— {q}</p>)}
        </div>
        <div className="mt-12 text-[28px]"><b>Jesús Caudillo</b> · hola@kimedia.mx · www.kimedia.mx</div>
      </div>
      <div className="relative w-[560px] h-full shrink-0"><Side src={imgCierre} className="absolute inset-0" /><div className="absolute bottom-6 right-6 rounded-2xl bg-card p-4 border border-border text-center"><QRCodeSVG value={PARTICIPA()} size={170} bgColor="transparent" fgColor="currentColor" className="text-foreground" /><div className="text-[20px] font-semibold mt-2">Su kit</div></div></div>
    </div>
  ) },
];

function ToolCard({ i }: { i: number }) {
  const h = HERRAMIENTAS[i];
  return (
    <div>
      <Kicker>Herramienta {h.n}</Kicker>
      <h3 className="font-display text-[56px] font-bold leading-none mb-4">{h.t}</h3>
      <p className="text-[28px] text-muted-foreground mb-8">{h.sub}</p>
      {"items" in h && <ul className="space-y-4">{h.items.map((it) => <li key={it} className="text-[28px] flex gap-4"><span className="text-coral">●</span>{it}</li>)}</ul>}
      {"ejemplo" in h && !("formula" in h) && <div className="rounded-3xl border border-coral/60 bg-coral/10 p-8 text-[28px] leading-snug">{h.ejemplo}</div>}
    </div>
  );
}
function TwoTools({ a, b }: { a: number; b: number }) {
  return <div className="grid grid-cols-2 gap-14 flex-1 min-h-0"><ToolCard i={a} /><ToolCard i={b} /></div>;
}

export default function EstrategiaDigitalSlides() {
  const [sp, setSp] = useSearchParams();
  const idx = Math.min(slides.length - 1, Math.max(0, Number(sp.get("slide") ?? 1) - 1));
  const go = useCallback((d: number) => {
    const n = Math.min(slides.length - 1, Math.max(0, idx + d));
    setSp({ slide: String(n + 1) }, { replace: true });
  }, [idx, setSp]);

  useEffect(() => { document.title = `${idx + 1}/${slides.length} — ${slides[idx].title}`; }, [idx]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
      if (e.key === "f" || e.key === "F5") { e.preventDefault(); document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [go]);

  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const f = () => { const el = box.current; if (el) setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080)); };
    f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f);
  }, []);
  const touch = useRef<number | null>(null);

  return (
    <div className="dark">
      <div ref={box} className="fixed inset-0 overflow-hidden bg-background text-foreground font-sans"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
        <div className="absolute left-1/2 top-1/2 w-[1920px] h-[1080px] -ml-[960px] -mt-[540px] origin-center overflow-hidden"
          style={{ transform: `scale(${scale})`, background: "radial-gradient(1200px 700px at 85% 10%, hsl(var(--coral) / 0.18), transparent 60%), radial-gradient(900px 600px at 5% 95%, hsl(var(--magenta) / 0.16), transparent 60%), hsl(var(--background))" }}>
          <Frame n={idx} total={slides.length}>{slides[idx].render()}</Frame>
        </div>
        <div className="fixed top-3 right-3 flex gap-1 opacity-20 hover:opacity-100 transition-opacity">
          <button onClick={() => go(-1)} className="p-2 rounded-lg bg-card border border-border" aria-label="Anterior"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => go(1)} className="p-2 rounded-lg bg-card border border-border" aria-label="Siguiente"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="p-2 rounded-lg bg-card border border-border" aria-label="Pantalla completa"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
