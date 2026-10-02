import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import kimediaLogo from "@/assets/kimedia-logo-full.png";
import { castVote, useCflVotes } from "@/hooks/useCflVotes";
import { POLLS, DIAG, HERRAMIENTAS, PROMPTS, nivelDe } from "@/data/cflEstrategiaDigital";

type Tab = "votar" | "diag" | "kit";

export default function Participa() {
  const [tab, setTab] = useState<Tab>("votar");
  useEffect(() => { document.title = "Participa · Estrategia digital · KiMedia"; }, []);
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto px-4 pb-16" style={{ background: "radial-gradient(500px 300px at 90% 0%, hsl(var(--coral) / 0.18), transparent 60%)" }}>
        <header className="pt-6 pb-4">
          <img src={kimediaLogo} alt="KiMedia" className="h-7 mb-4" />
          <div className="text-xs uppercase tracking-widest text-coral">Programa de Formación de Líderes Políticos 2026</div>
          <h1 className="font-display text-3xl font-bold leading-tight">Estrategia digital</h1>
        </header>
        <nav className="sticky top-0 z-10 bg-background/90 backdrop-blur py-2 grid grid-cols-3 gap-1 rounded-xl">
          {([["votar", "Votar"], ["diag", "Diagnóstico"], ["kit", "Mi kit"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`py-2.5 rounded-lg text-sm font-semibold ${tab === k ? "bg-coral text-primary-foreground" : "bg-card text-muted-foreground"}`}>{l}</button>
          ))}
        </nav>
        <main className="pt-4">{tab === "votar" ? <Votar /> : tab === "diag" ? <Diag onKit={() => setTab("kit")} /> : <Kit />}</main>
        <footer className="pt-10 text-xs text-muted-foreground text-center">www.kimedia.mx · hola@kimedia.mx</footer>
      </div>
    </div>
  );
}

function Votar() {
  const { mine, reload } = useCflVotes();
  return (
    <div className="space-y-6">
      {(Object.keys(POLLS) as (keyof typeof POLLS)[]).map((k) => (
        <section key={k} className="rounded-2xl border border-border bg-card/60 p-4">
          <h2 className="font-semibold mb-3">{POLLS[k].q}</h2>
          <div className="grid gap-2">
            {POLLS[k].options.map((o) => { const sel = mine(k) === o; return (
              <button key={o} onClick={async () => { if (await castVote(k, o)) { reload(); toast.success("Voto registrado"); } else toast.error("No se pudo registrar"); }}
                className={`text-left px-4 py-3 rounded-xl border text-sm flex items-center justify-between ${sel ? "border-coral bg-coral/15" : "border-border"}`}>
                {o}{sel && <Check className="w-4 h-4 text-coral" />}
              </button>
            ); })}
          </div>
        </section>
      ))}
      <p className="text-xs text-muted-foreground">Su voto es anónimo y puede cambiarlo cuando quiera.</p>
    </div>
  );
}

function Diag({ onKit }: { onKit: () => void }) {
  const [ans, setAns] = useState<(number | null)[]>(() => DIAG.map(() => null));
  const [done, setDone] = useState(false);
  const score = ans.reduce<number>((a, b) => a + (b ?? 0), 0);
  const complete = ans.every((x) => x !== null);
  const n = nivelDe(score);
  const finish = async () => { setDone(true); await castVote("diag", n.k); };
  if (done) return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-coral bg-coral/10 p-5">
        <div className="text-xs uppercase tracking-widest text-coral">Su nivel</div>
        <div className="font-display text-4xl font-bold">{n.k}</div>
        <div className="text-sm text-muted-foreground mb-3">{score} de 20 puntos</div>
        <p className="text-sm">{n.d}</p>
      </div>
      <div className="rounded-2xl border border-border p-4">
        <div className="font-semibold mb-2 text-sm">Por dónde empezar</div>
        <ul className="text-sm space-y-1.5 list-disc pl-5">
          {DIAG.map((q, i) => ans[i] !== 2 ? <li key={i}>{q}</li> : null).filter(Boolean).slice(0, 3)}
        </ul>
      </div>
      <button onClick={onKit} className="w-full py-3 rounded-xl bg-coral text-primary-foreground font-semibold">Ver mis herramientas</button>
      <button onClick={() => { setDone(false); setAns(DIAG.map(() => null)); }} className="w-full py-2 text-sm text-muted-foreground">Repetir</button>
    </div>
  );
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Responda con honestidad. Nadie ve sus respuestas; solo se suma su nivel al resultado del grupo.</p>
      {DIAG.map((q, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card/60 p-4">
          <p className="text-sm mb-3"><span className="text-coral font-semibold">{i + 1}.</span> {q}</p>
          <div className="grid grid-cols-3 gap-2">
            {[["No", 0], ["A medias", 1], ["Sí", 2]].map(([l, v]) => (
              <button key={l} onClick={() => setAns((a) => a.map((x, j) => (j === i ? (v as number) : x)))}
                className={`py-2 rounded-lg text-sm border ${ans[i] === v ? "border-coral bg-coral/15 font-semibold" : "border-border"}`}>{l}</button>
            ))}
          </div>
        </div>
      ))}
      <button disabled={!complete} onClick={finish} className="w-full py-3 rounded-xl bg-coral text-primary-foreground font-semibold disabled:opacity-40">Ver mi resultado</button>
    </div>
  );
}

function Kit() {
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copiado"); };
  return (
    <div className="space-y-4">
      {HERRAMIENTAS.map((h) => (
        <section key={h.n} className="rounded-2xl border border-border bg-card/60 p-4">
          <div className="text-xs text-coral font-semibold">HERRAMIENTA {h.n}</div>
          <h2 className="font-display text-xl font-bold">{h.t}</h2>
          <p className="text-sm text-muted-foreground mb-2">{h.sub}</p>
          {"formula" in h && <p className="text-sm rounded-lg bg-coral/10 border border-coral/40 p-3 mb-2">{h.formula}</p>}
          {"items" in h && <ul className="text-sm space-y-1 list-disc pl-5">{h.items.map((i) => <li key={i}>{i}</li>)}</ul>}
          {"ejemplo" in h && <p className="text-sm italic text-muted-foreground mt-2">{h.ejemplo}</p>}
        </section>
      ))}
      <section className="rounded-2xl border border-border bg-card/60 p-4">
        <div className="text-xs text-coral font-semibold">HERRAMIENTA 07</div>
        <h2 className="font-display text-xl font-bold mb-2">Instrucciones para su IA</h2>
        <div className="space-y-2">
          {PROMPTS.map((p, i) => (
            <button key={i} onClick={() => copy(p)} className="w-full text-left text-sm rounded-lg border border-border p-3 flex gap-2">
              <span className="flex-1">{p}</span><Copy className="w-4 h-4 text-coral shrink-0" />
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-coral bg-coral/10 p-4 text-sm">
        <b>Su reto de 7 días:</b> búsquese en Google, escriba su frase de causa, ordene su foto y biografía, y publique 3 piezas con gancho, problema, solución y llamado.
      </section>
    </div>
  );
}
