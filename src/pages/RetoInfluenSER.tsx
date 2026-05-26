import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Wand2, Calendar, Users, Download, FileText,
  Loader2, Check, Copy, ArrowRight, ArrowLeft, Mic, Lightbulb, Target, Compass,
  Layers, MessageSquare, Megaphone, Map, Anchor, Quote, Rocket, Stethoscope,
} from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import kimediaLogo from "@/assets/kimedia-logo.png";

const STORAGE_KEY = "reto-influenser-registration";
const PROGRESS_KEY = "reto-influenser-progress";

type Registration = { id: string; nombre: string; email: string };

type StrategyOutput = {
  diagnostico?: string;
  posicionamiento?: string;
  pilares?: { nombre: string; descripcion: string }[];
  audiencia?: string;
  tono?: string;
  frameworks?: { nombre: string; cuando_usarlo: string }[];
  ideas?: { formato: string; red: string; pilar: string; hook: string; cta: string }[];
  siguiente_paso?: string;
};

type PosicionamientoOutput = { variantes: { frase: string; porque: string }[] };
type PilaresOutput = { pilares: { nombre: string; descripcion: string; ejemplo_post: string }[] };
type HooksOutput = { hooks: { framework: string; texto: string }[] };

type Progress = {
  step: number;
  diagnostico?: { etapa: string; score: number; respuestas: number[] };
  posicionamiento?: { input: { actividad: string; audiencia: string; diferenciador: string }; result: PosicionamientoOutput; elegida?: string };
  pilares?: { input: { tema: string; audiencia: string; objetivo: string }; result: PilaresOutput };
  hooks?: { input: { idea: string; audiencia: string }; result: HooksOutput };
  estrategia?: { input: any; result: StrategyOutput };
};

const agenda = [
  {
    t: "0:00",
    titulo: "Por qué hablar de estrategia, no solo de contenido",
    desc: "Publicar sin estrategia es ruido. Hoy ordenamos el juego.",
    idea: "La mayoría no tiene un problema de contenido: tiene un problema de estrategia. Publican mucho, pero nada acumula. Una estrategia hace que cada post sume al mismo edificio en vez de ser ladrillos sueltos.",
    puntos: [
      "Diferencia entre 'hacer posts' y construir presencia.",
      "Por qué el algoritmo premia consistencia temática, no frecuencia ciega.",
      "Qué cambia cuando defines a quién le hablas antes de qué dices.",
    ],
    ejemplo: {
      titulo: "Caso real · Candidatura local en Yucatán",
      texto: "Llegó publicando 4 veces por semana sin línea: foto de evento, frase motivacional, video con música. En 6 semanas, tras definir 3 pilares (gestión, vínculo con la comunidad, propuestas concretas) y 1 audiencia (mujeres 30-55 de su distrito), bajó a 3 posts pero el engagement se multiplicó por 3.2x y empezaron a llegarle mensajes directos pidiendo reuniones.",
    },
  },
  {
    t: "0:08",
    titulo: "Diagnóstico: dónde estás parado",
    desc: "El mismo método que usamos con gobierno e iniciativa privada para ver qué ya está funcionando.",
    idea: "Antes de cambiar nada, hay que ver qué ya jala. El diagnóstico te dice cuáles de tus posts ya conectan con tu audiencia real (no la que imaginas) y por qué.",
    puntos: [
      "Top 5 posts de los últimos 90 días: qué tienen en común.",
      "Hora, formato y hook que más retiene en tu cuenta específica.",
      "Brechas: temas que tu audiencia pide y que no estás cubriendo.",
    ],
    ejemplo: {
      titulo: "Caso real · PyME de bienestar",
      texto: "Pensaba que sus mejores posts eran los tutoriales. El diagnóstico mostró que los 3 reels con más conversión a venta eran historias personales de clientas. Pivoteamos el calendario: 60% testimonios narrados, 40% tutoriales. Cierres por DM subieron de 4 a 11 al mes.",
    },
  },
  {
    t: "0:18",
    titulo: "Brief y posicionamiento",
    desc: "Para quién hablas, para qué, y qué te hace distinto en 1 frase.",
    idea: "El brief es el ADN. Sin una frase clara de posicionamiento (a quién, para qué, qué te hace distinto), cada post arranca de cero. Con ella, todo se filtra fácil: '¿esto suma a mi posicionamiento o no?'",
    puntos: [
      "Fórmula: Ayudo a [audiencia] a [resultado] a través de [cómo distinto].",
      "Por qué 'para todos' = para nadie.",
      "El test de la servilleta: si no lo puedes decir en 1 frase, todavía no está.",
    ],
    ejemplo: {
      titulo: "Ejemplo real · Coach de finanzas personales",
      texto: "Antes: 'Te ayudo a tener una mejor relación con el dinero.' (vago, igual que 100 cuentas más). Después: 'Ayudo a profesionistas de 28-40 a salir de deudas de tarjeta sin dejar de tener vida social, con un método de 90 días.' Mismo servicio, otro nivel de claridad y de leads.",
    },
  },
  {
    t: "0:30",
    titulo: "Pilares de contenido",
    desc: "3 categorías estables que sostienen todo lo que publicas durante meses.",
    idea: "Los pilares son 3 temas estables que sostienen tu cuenta por meses. Cada post tiene que caber en uno. Eso elimina el 'no sé qué publicar hoy' y entrena a tu audiencia a saber qué esperar.",
    puntos: [
      "Pilar 1: Autoridad (qué sabes y demuestras).",
      "Pilar 2: Cercanía (quién eres, cómo piensas).",
      "Pilar 3: Conversión (por qué trabajar/votar/seguirte).",
    ],
    ejemplo: {
      titulo: "Caso real · KiMedia (esta cuenta)",
      texto: "Nuestros 3 pilares: (1) Detrás de cámaras de campañas reales, (2) Mini-tutoriales de estrategia digital, (3) Casos de antes/después con clientes. Cualquier idea que se nos ocurre la pasamos por ese filtro. Si no entra en uno, no se publica.",
    },
  },
  {
    t: "0:42",
    titulo: "Frameworks de copy y narrativa",
    desc: "Hook → Problema → Solución → CTA, AIDA, PAS: cuándo usar cada uno.",
    idea: "No escribas desde cero. Los frameworks son moldes probados que ordenan el mensaje. Cada uno sirve para algo distinto: educar, vender, mover a la acción, conectar emocionalmente.",
    puntos: [
      "Hook → Problema → Solución → CTA: para reels educativos cortos.",
      "AIDA (Atención, Interés, Deseo, Acción): para landing y carruseles de venta.",
      "PAS (Problema, Agitación, Solución): para captar audiencia con un dolor claro.",
    ],
    ejemplo: {
      titulo: "Ejemplo real · Reel con framework PAS",
      texto: "Hook (P): '¿Llevas 6 meses publicando y sigues con los mismos seguidores?' Agitación (A): 'No es el algoritmo. Es que no tienes pilares: cada post es una decisión nueva y tu audiencia no sabe qué esperar de ti.' Solución (S): 'Define 3 pilares hoy y úsalos como filtro las próximas 4 semanas.' CTA: 'Te dejo la plantilla en bio.' Resultado típico: 2-3x retención vs. un reel sin estructura.",
    },
  },
  {
    t: "0:50",
    titulo: "Ejercicio en vivo: tu mini-estrategia",
    desc: "Cada quien construye su estrategia con el Estrategia Coach.",
    idea: "El cierre es práctico. Cada quien usa el Estrategia Coach (la herramienta de abajo) para generar su propia mini-estrategia con todo lo visto: posicionamiento, pilares, audiencia, frameworks e ideas accionables para los próximos 7 días.",
    puntos: [
      "Llena los campos con tu tema real.",
      "La IA devuelve diagnóstico + 3 pilares + 3 ideas concretas con hook y CTA.",
      "Te lo llevas listo para ejecutar la próxima semana.",
    ],
    ejemplo: {
      titulo: "Qué saldrá en tu pantalla",
      texto: "Un documento estructurado: tu posicionamiento en 1 frase, tus 3 pilares con descripción, tu audiencia afinada, qué framework conviene para tu caso, 3 ideas de contenido listas (formato + red + hook + CTA) y tu siguiente paso accionable. No es teoría: es tu plan para los siguientes 7 días.",
    },
  },
];

const principios = [
  { titulo: "Estrategia antes que herramienta", desc: "Las apps cambian cada mes. La estrategia se sostiene." },
  { titulo: "Pilares antes que posts", desc: "Sin pilares, cada publicación es una decisión nueva. Con pilares, es solo ejecución." },
  { titulo: "Audiencia específica, no genérica", desc: "'Jóvenes' no es audiencia. 'Universitarios de primer empleo en CDMX' sí." },
  { titulo: "Métrica de movimiento, no de vanidad", desc: "Lo que importa es qué hace tu audiencia después de verte." },
];

const STEPS = [
  { key: "intro",          label: "Bienvenida",            icon: Sparkles },
  { key: "diagnostico",    label: "Diagnóstico express",   icon: Stethoscope },
  { key: "posicionamiento",label: "Posicionamiento",       icon: Anchor },
  { key: "pilares",        label: "Pilares",               icon: Layers },
  { key: "hooks",          label: "Hooks",                 icon: Quote },
  { key: "estrategia",     label: "Estrategia completa",   icon: Map },
  { key: "recursos",       label: "Llévate tu plan",       icon: Rocket },
] as const;

export default function RetoInfluenSER() {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", redes: "" });

  useEffect(() => {
    document.title = "Reto InfluenSER · Webinar de Contenido y Estrategia · KiMedia";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Webinar de Contenido y Estrategia para el Reto InfluenSER. Aprende a construir reels con propósito y úsalo en vivo con el Reel Coach de KiMedia.");
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRegistration(JSON.parse(raw));
    } catch {}
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const nombre = form.nombre.trim();
    const email = form.email.trim().toLowerCase();
    if (nombre.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Revisa tus datos", description: "Necesitamos nombre y un email válido.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("webinar_registrations")
      .insert({ nombre, email, redes: form.redes.trim() || null, evento: "reto-influenser-2026", fuente: "landing" })
      .select("id, nombre, email")
      .single();
    setLoading(false);
    if (error || !data) {
      toast({ title: "No pudimos registrarte", description: error?.message || "Intenta de nuevo.", variant: "destructive" });
      return;
    }
    const reg = { id: data.id, nombre: data.nombre, email: data.email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reg));
    setRegistration(reg);
    toast({ title: "¡Listo!", description: "Tu lugar está apartado. Bienvenido al Reto." });
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Mesh gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-coral blur-3xl opacity-30" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src={kimediaLogo} alt="KiMedia" className="h-8 w-auto" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">× Reto InfluenSER</span>
        </a>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          <Calendar className="w-3.5 h-3.5 mr-1.5" /> 26 mayo · En vivo
        </Badge>
      </header>

      <main className="relative z-10 container mx-auto px-6 pb-24">
        {!registration ? (
          <>
            <Hero />
            <RegisterCard form={form} setForm={setForm} loading={loading} onSubmit={handleRegister} />
            <PrincipiosSection />
          </>
        ) : (
          <WebinarRoom registration={registration} />
        )}

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          Hecho por <a href="/" className="text-coral hover:underline">KiMedia</a> para el Reto InfluenSER · Influencer Academy
        </footer>
      </main>
    </div>
  );
}

function PrincipiosSection() {
  return (
    <section className="mt-24">
      <Card className="glass-strong border-border/50 max-w-3xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Compass className="w-4 h-4 text-coral" /> Principios que vamos a usar hoy</h3>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {principios.map((p) => (
              <li key={p.titulo}>
                <div className="font-semibold">{p.titulo}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

function Hero() {
  return (
    <section className="pt-12 pb-16 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      >
        <Badge variant="outline" className="mb-5 border-coral/40 text-coral">
          <Sparkles className="w-3 h-3 mr-1.5" /> Webinar 2 · Contenido y Estrategia
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          Contenido con <br />
          <span className="bg-gradient-coral bg-clip-text text-transparent">estrategia detrás</span>, no contenido por publicar.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          En 60 minutos vemos el mismo método con el que trabajamos a gobiernos, PyMEs y marcas personales en KiMedia: cómo pasar de publicar suelto a tener una estrategia de contenido con pilares, narrativa y resultados. Al final, cada quien sale con su mini-estrategia hecha.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> +2,000 invitados · Influencer Academy</span>
          <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Sesión en vivo + grabación</span>
        </div>
      </motion.div>
    </section>
  );
}

function RegisterCard({
  form, setForm, loading, onSubmit,
}: {
  form: { nombre: string; email: string; redes: string };
  setForm: (f: any) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
      <Card className="glass-strong border-border/60 max-w-2xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-1">Aparta tu lugar</h2>
          <p className="text-sm text-muted-foreground mb-6">Te damos acceso a la sala con la agenda, los recursos y el <span className="text-coral font-semibold">Reel Coach</span> que vamos a usar en vivo.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" autoComplete="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" autoComplete="email" required />
            </div>
            <div>
              <Label htmlFor="redes">Tu red principal <span className="text-muted-foreground">(opcional)</span></Label>
              <Input id="redes" value={form.redes} onChange={(e) => setForm({ ...form, redes: e.target.value })} placeholder="@usuario en IG o TikTok" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar a la sala <ArrowRight className="w-4 h-4" /></>}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Al registrarte aceptas recibir el material del webinar por correo.</p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WebinarRoom({ registration }: { registration: Registration }) {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { step: 0 };
  });

  useEffect(() => {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch {}
  }, [progress]);

  const update = (patch: Partial<Progress>) => setProgress((p) => ({ ...p, ...patch }));
  const goTo = (step: number) => setProgress((p) => ({ ...p, step: Math.max(0, Math.min(STEPS.length - 1, step)) }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <header className="pt-6 pb-4 flex items-center gap-3 text-sm">
        <Badge className="bg-coral/15 text-coral border-coral/30"><Check className="w-3 h-3 mr-1" /> En sala</Badge>
        <span className="text-muted-foreground">Hola, <span className="text-foreground font-semibold">{registration.nombre.split(" ")[0]}</span>. Vamos paso a paso, al ritmo del webinar.</span>
      </header>

      <Stepper current={progress.step} onJump={goTo} progress={progress} />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={progress.step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {progress.step === 0 && <StepIntro onNext={() => goTo(1)} />}
            {progress.step === 1 && <StepDiagnostico progress={progress} update={update} onNext={() => goTo(2)} />}
            {progress.step === 2 && <StepPosicionamiento progress={progress} update={update} onNext={() => goTo(3)} />}
            {progress.step === 3 && <StepPilares progress={progress} update={update} onNext={() => goTo(4)} />}
            {progress.step === 4 && <StepHooks progress={progress} update={update} onNext={() => goTo(5)} />}
            {progress.step === 5 && <StepEstrategia registration={registration} progress={progress} update={update} onNext={() => goTo(6)} />}
            {progress.step === 6 && <StepRecursos registration={registration} progress={progress} onBack={() => goTo(5)} onReset={() => { setProgress({ step: 0 }); try { localStorage.removeItem(PROGRESS_KEY); } catch {} }} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <NavButtons step={progress.step} onPrev={() => goTo(progress.step - 1)} onNext={() => goTo(progress.step + 1)} />
    </motion.div>
  );
}

function Stepper({ current, onJump, progress }: { current: number; onJump: (n: number) => void; progress: Progress }) {
  const completed = (idx: number) => {
    if (idx === 0) return true;
    if (idx === 1) return !!progress.diagnostico;
    if (idx === 2) return !!progress.posicionamiento;
    if (idx === 3) return !!progress.pilares;
    if (idx === 4) return !!progress.hooks;
    if (idx === 5) return !!progress.estrategia;
    return false;
  };
  return (
    <div className="relative">
      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <ol className="flex items-center gap-2 min-w-max">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === current;
            const isDone = completed(i) && i !== current;
            return (
              <li key={s.key} className="flex items-center gap-2">
                <button
                  onClick={() => onJump(i)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-full border text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? "border-coral bg-coral/10 text-coral font-semibold"
                      : isDone
                      ? "border-coral/30 bg-coral/5 text-coral/80 hover:bg-coral/10"
                      : "border-border/60 text-muted-foreground hover:border-coral/40 hover:text-foreground"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isActive ? "bg-coral text-primary-foreground" : isDone ? "bg-coral/20 text-coral" : "bg-muted text-muted-foreground"
                  }`}>{isDone ? <Check className="w-3 h-3" /> : i + 1}</span>
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <span className="w-4 h-px bg-border" />}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function NavButtons({ step, onPrev, onNext }: { step: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-3 pt-6 border-t border-border/40">
      <Button variant="ghost" onClick={onPrev} disabled={step === 0} className="text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Anterior
      </Button>
      <div className="text-xs text-muted-foreground">Paso {step + 1} de {STEPS.length}</div>
      <Button variant="ghost" onClick={onNext} disabled={step === STEPS.length - 1} className="text-muted-foreground">
        Saltar <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

/* ───────── STEP 0: Intro / Agenda ───────── */
function StepIntro({ onNext }: { onNext: () => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const active = openIdx !== null ? agenda[openIdx] : null;
  return (
    <section>
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 border-coral/40 text-coral text-[10px]">PASO 1 · CALENTAMIENTO</Badge>
        <h2 className="text-3xl font-bold tracking-tight">Así vamos a recorrer la hora</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">6 paradas. Cada una con un mini-ejercicio interactivo. Al terminar, te llevas tu Brief personalizado y tu Business Case en PDF.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {agenda.map((a, i) => (
          <Card
            key={a.titulo}
            onClick={() => setOpenIdx(i)}
            className="border-border/50 hover:border-coral/50 hover:bg-coral/[0.03] transition-all cursor-pointer group"
          >
            <CardContent className="p-5 flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-mono text-xs font-bold">
                {a.t}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 group-hover:text-coral transition-colors">{i + 1}. {a.titulo}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{a.desc}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-coral/70 group-hover:text-coral">
                  Ver detalle + ejemplo real <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button onClick={onNext} className="bg-gradient-coral text-primary-foreground hover:shadow-glow">
          Empezar el recorrido <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-muted-foreground">~ 8-10 min de ejercicios + tu PDF al final.</p>
      </div>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-mono text-xs font-bold">{active.t}</div>
                  <Badge variant="outline" className="border-coral/40 text-coral text-[10px]">Bloque {(openIdx ?? 0) + 1} de {agenda.length}</Badge>
                </div>
                <DialogTitle className="text-2xl leading-tight text-left">{active.titulo}</DialogTitle>
                <DialogDescription className="text-left">{active.desc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-coral font-bold mb-2 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> La idea central</h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{active.idea}</p>
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-coral font-bold mb-2 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Qué vamos a ver</h4>
                  <ul className="space-y-2">
                    {active.puntos.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-coral/30 bg-coral/[0.04] p-4">
                  <h4 className="text-[11px] uppercase tracking-widest text-coral font-bold mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> {active.ejemplo.titulo}</h4>
                  <p className="text-sm leading-relaxed text-foreground/85">{active.ejemplo.texto}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ───────── STEP 1: Diagnóstico express (local, sin IA) ───────── */
const DIAG_QUESTIONS = [
  {
    q: "¿Cuántas veces a la semana publicas con un plan claro detrás?",
    options: [
      { label: "Casi nunca. Publico cuando se me ocurre.", score: 0 },
      { label: "A veces sigo un calendario, pero se rompe seguido.", score: 1 },
      { label: "Siempre publico bajo un plan semanal o mensual.", score: 2 },
    ],
  },
  {
    q: "Si te pregunto en 1 frase a quién le hablas, ¿qué dices?",
    options: [
      { label: "A todos los que quieran escucharme.", score: 0 },
      { label: "Tengo una idea general (ej. 'jóvenes', 'mujeres').", score: 1 },
      { label: "Tengo una audiencia muy específica con nombre y dolor.", score: 2 },
    ],
  },
  {
    q: "¿Mides qué pasa después de que la gente te ve?",
    options: [
      { label: "Solo veo likes y views.", score: 0 },
      { label: "Reviso guardados, comparticiones y comentarios.", score: 1 },
      { label: "Sí: mido DMs, clics, conversaciones, agendas o ventas.", score: 2 },
    ],
  },
];

function etapaFor(score: number): { etapa: string; desc: string; color: string } {
  if (score <= 1) return { etapa: "Publica sin plan", desc: "Tu contenido es esfuerzo aislado. Lo bueno: cualquier estructura mínima va a multiplicar tu impacto rápido.", color: "text-amber-500" };
  if (score <= 3) return { etapa: "Tiene intuición, falta sistema", desc: "Ya hay chispazos buenos. Falta convertirlos en un sistema repetible con pilares claros.", color: "text-coral" };
  if (score <= 5) return { etapa: "Plan en marcha", desc: "Vas bien. Toca afinar audiencia, medir mejor y subir la apuesta narrativa.", color: "text-emerald-500" };
  return { etapa: "Estrategia madura", desc: "Tienes método. Hoy te llevas frameworks para escalar, no para empezar.", color: "text-emerald-500" };
}

function StepDiagnostico({ progress, update, onNext }: { progress: Progress; update: (p: Partial<Progress>) => void; onNext: () => void }) {
  const [respuestas, setRespuestas] = useState<number[]>(progress.diagnostico?.respuestas ?? []);
  const score = respuestas.reduce((a, b) => a + b, 0);
  const done = respuestas.length === DIAG_QUESTIONS.length;
  const etapa = done ? etapaFor(score) : null;

  const select = (qi: number, value: number) => {
    const next = [...respuestas];
    next[qi] = value;
    setRespuestas(next);
  };

  const guardar = () => {
    if (!done) return;
    update({ diagnostico: { etapa: etapa!.etapa, score, respuestas } });
    onNext();
  };

  return (
    <section>
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 border-coral/40 text-coral text-[10px]">PASO 2 · 90 SEGUNDOS</Badge>
        <h2 className="text-3xl font-bold">¿En qué etapa de contenido estás hoy?</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">3 preguntas honestas. Esto nos dice si hoy hay que empezar desde cero, ordenar lo que ya hay, o subirle al siguiente nivel.</p>
      </div>

      <div className="space-y-4">
        {DIAG_QUESTIONS.map((q, qi) => (
          <Card key={qi} className="border-border/50">
            <CardContent className="p-5">
              <p className="font-semibold mb-3 text-sm">{qi + 1}. {q.q}</p>
              <div className="grid gap-2">
                {q.options.map((o, oi) => {
                  const selected = respuestas[qi] === o.score;
                  return (
                    <button
                      key={oi}
                      onClick={() => select(qi, o.score)}
                      className={`text-left text-sm px-4 py-3 rounded-lg border transition-all ${
                        selected
                          ? "border-coral bg-coral/10 text-foreground"
                          : "border-border/60 hover:border-coral/40 hover:bg-coral/[0.03] text-muted-foreground"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full border ${selected ? "border-coral bg-coral" : "border-border"}`}>
                          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </span>
                        {o.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {done && etapa && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mt-6 glass-strong border-coral/40">
              <CardContent className="p-6">
                <p className="text-[11px] uppercase tracking-widest text-coral font-bold mb-2">Tu etapa hoy</p>
                <h3 className={`text-2xl font-bold ${etapa.color}`}>{etapa.etapa}</h3>
                <p className="text-sm text-muted-foreground mt-2">{etapa.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-coral" style={{ width: `${(score / 6) * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{score}/6</span>
                </div>
                <Button onClick={guardar} className="mt-5 bg-gradient-coral text-primary-foreground hover:shadow-glow">
                  Guardar y seguir <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────── Helper: invoke ───────── */
async function callCoach(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("reto-coach", { body: payload });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).result;
}

/* ───────── STEP 2: Posicionamiento ───────── */
function StepPosicionamiento({ progress, update, onNext }: { progress: Progress; update: (p: Partial<Progress>) => void; onNext: () => void }) {
  const [actividad, setActividad] = useState(progress.posicionamiento?.input.actividad ?? "");
  const [audiencia, setAudiencia] = useState(progress.posicionamiento?.input.audiencia ?? "");
  const [diferenciador, setDiferenciador] = useState(progress.posicionamiento?.input.diferenciador ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PosicionamientoOutput | null>(progress.posicionamiento?.result ?? null);
  const [elegida, setElegida] = useState<string | undefined>(progress.posicionamiento?.elegida);

  async function generar() {
    if (actividad.trim().length < 3) {
      toast({ title: "Cuéntanos qué haces", description: "Necesitamos saber tu actividad o servicio.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const r = await callCoach({ mode: "posicionamiento", actividad, audiencia, diferenciador });
      setResult(r);
    } catch (e: any) {
      toast({ title: "No pudimos generar", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  const guardar = () => {
    if (!result) return;
    update({ posicionamiento: { input: { actividad, audiencia, diferenciador }, result, elegida } });
    onNext();
  };

  return (
    <section>
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 border-coral/40 text-coral text-[10px]">PASO 3 · POSICIONAMIENTO</Badge>
        <h2 className="text-3xl font-bold">Tu frase de posicionamiento, pulida</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Llena 3 campos. La IA te devuelve 3 versiones afinadas de tu posicionamiento. Eliges la que mejor suena y nos la llevamos al PDF final.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-border/60">
          <CardContent className="p-6 space-y-4">
            <Field label="A qué te dedicas / qué servicio das" icon={<Target className="w-3.5 h-3.5" />}>
              <Textarea rows={2} value={actividad} onChange={(e) => setActividad(e.target.value)} placeholder="Ej. Doy asesoría de finanzas personales a empleados que recién entraron al mundo formal." />
            </Field>
            <Field label="A quién le sirves" icon={<Users className="w-3.5 h-3.5" />}>
              <Input value={audiencia} onChange={(e) => setAudiencia(e.target.value)} placeholder="Ej. Profesionistas 28-40 con deudas de tarjeta" />
            </Field>
            <Field label="Qué te hace distinto" icon={<Sparkles className="w-3.5 h-3.5" />}>
              <Input value={diferenciador} onChange={(e) => setDiferenciador(e.target.value)} placeholder="Ej. Método de 90 días sin renunciar a tu vida social" />
            </Field>
            <Button onClick={generar} disabled={loading} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando 3 variantes…</> : <><Wand2 className="w-4 h-4" /> Generar 3 variantes</>}
            </Button>
          </CardContent>
        </Card>

        <div>
          {result ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Elige la que mejor te representa</p>
              {result.variantes?.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setElegida(v.frase)}
                  className={`text-left w-full rounded-lg border p-4 transition-all ${
                    elegida === v.frase ? "border-coral bg-coral/10" : "border-border/50 hover:border-coral/50 hover:bg-coral/[0.03]"
                  }`}
                >
                  <p className="text-sm font-semibold leading-snug">{v.frase}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{v.porque}</p>
                </button>
              ))}
              {elegida && (
                <Button onClick={guardar} className="bg-gradient-coral text-primary-foreground hover:shadow-glow">
                  Guardar elegida y seguir <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <Card className="border-dashed border-border/40 bg-transparent h-full min-h-[320px]">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <Anchor className="w-10 h-10 text-coral/50 mb-4" />
                <p className="text-sm text-muted-foreground max-w-xs">Tus 3 variantes aparecen aquí. Eliges una sola.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── STEP 3: Pilares ───────── */
function StepPilares({ progress, update, onNext }: { progress: Progress; update: (p: Partial<Progress>) => void; onNext: () => void }) {
  const [tema, setTema] = useState(progress.pilares?.input.tema ?? progress.posicionamiento?.input.actividad ?? "");
  const [audiencia, setAudiencia] = useState(progress.pilares?.input.audiencia ?? progress.posicionamiento?.input.audiencia ?? "");
  const [objetivo, setObjetivo] = useState(progress.pilares?.input.objetivo ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PilaresOutput | null>(progress.pilares?.result ?? null);

  async function generar() {
    if (tema.trim().length < 3) {
      toast({ title: "Falta el tema", description: "Dinos sobre qué quieres construir tus pilares.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const r = await callCoach({ mode: "pilares", tema, audiencia, objetivo });
      setResult(r);
    } catch (e: any) {
      toast({ title: "No pudimos generar", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  const guardar = () => {
    if (!result) return;
    update({ pilares: { input: { tema, audiencia, objetivo }, result } });
    onNext();
  };

  return (
    <section>
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 border-coral/40 text-coral text-[10px]">PASO 4 · PILARES</Badge>
        <h2 className="text-3xl font-bold">Tus 3 pilares de contenido</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">3 categorías estables que vas a sostener por meses. Cada post tiene que caber en una. Esto mata el "no sé qué publicar hoy".</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-border/60">
          <CardContent className="p-6 space-y-4">
            <Field label="Tema, nicho o industria" icon={<Target className="w-3.5 h-3.5" />}>
              <Textarea rows={2} value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ej. Bienestar emocional para padres primerizos" />
            </Field>
            <Field label="Audiencia" icon={<Users className="w-3.5 h-3.5" />}>
              <Input value={audiencia} onChange={(e) => setAudiencia(e.target.value)} placeholder="Ej. Papás de 30-40 con hijos menores de 3 años" />
            </Field>
            <Field label="Objetivo principal" icon={<Compass className="w-3.5 h-3.5" />}>
              <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Ej. Construir autoridad y agendar consultas" />
            </Field>
            <Button onClick={generar} disabled={loading} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando pilares…</> : <><Wand2 className="w-4 h-4" /> Generar mis 3 pilares</>}
            </Button>
          </CardContent>
        </Card>

        <div>
          {result ? (
            <div className="space-y-3">
              {result.pilares?.map((p, i) => (
                <Card key={i} className="border-coral/30 bg-coral/[0.04]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-coral text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <h4 className="font-semibold text-coral">{p.nombre}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{p.descripcion}</p>
                    <p className="text-xs italic text-foreground/80 border-l-2 border-coral/40 pl-3">Ejemplo de post: {p.ejemplo_post}</p>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={guardar} className="bg-gradient-coral text-primary-foreground hover:shadow-glow">
                Guardar pilares y seguir <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Card className="border-dashed border-border/40 bg-transparent h-full min-h-[320px]">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <Layers className="w-10 h-10 text-coral/50 mb-4" />
                <p className="text-sm text-muted-foreground max-w-xs">Aquí aparecen tus 3 pilares con descripción y un ejemplo de post para cada uno.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── STEP 4: Hooks ───────── */
function StepHooks({ progress, update, onNext }: { progress: Progress; update: (p: Partial<Progress>) => void; onNext: () => void }) {
  const [idea, setIdea] = useState(progress.hooks?.input.idea ?? "");
  const [audiencia, setAudiencia] = useState(progress.hooks?.input.audiencia ?? progress.posicionamiento?.input.audiencia ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HooksOutput | null>(progress.hooks?.result ?? null);

  async function generar() {
    if (idea.trim().length < 4) {
      toast({ title: "Falta tu idea", description: "Cuéntanos el tema del post.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const r = await callCoach({ mode: "hooks", idea, audiencia });
      setResult(r);
    } catch (e: any) {
      toast({ title: "No pudimos generar", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  const guardar = () => {
    if (!result) return;
    update({ hooks: { input: { idea, audiencia }, result } });
    onNext();
  };

  const copy = async (t: string) => {
    await navigator.clipboard.writeText(t);
    toast({ title: "Copiado", description: "Pegalo en tu guion." });
  };

  return (
    <section>
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 border-coral/40 text-coral text-[10px]">PASO 5 · HOOKS</Badge>
        <h2 className="text-3xl font-bold">5 hooks listos para abrir tu próximo reel</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Dale a la IA el tema y te regresa 5 ganchos en 5 frameworks distintos. Eliges el que más te late.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-border/60">
          <CardContent className="p-6 space-y-4">
            <Field label="Tema o idea del post" icon={<Lightbulb className="w-3.5 h-3.5" />}>
              <Textarea rows={3} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Ej. Por qué tu calendario de contenido se rompe en la 3ra semana." />
            </Field>
            <Field label="Audiencia" icon={<Users className="w-3.5 h-3.5" />}>
              <Input value={audiencia} onChange={(e) => setAudiencia(e.target.value)} placeholder="Ej. Marcas personales que recién empiezan" />
            </Field>
            <Button onClick={generar} disabled={loading} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Escribiendo 5 hooks…</> : <><Wand2 className="w-4 h-4" /> Generar 5 hooks</>}
            </Button>
          </CardContent>
        </Card>

        <div>
          {result ? (
            <div className="space-y-2">
              {result.hooks?.map((h, i) => (
                <div key={i} className="rounded-lg border border-border/50 hover:border-coral/50 p-3 group">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-coral">{h.framework}</span>
                    <button onClick={() => copy(h.texto)} className="opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground hover:text-coral inline-flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</button>
                  </div>
                  <p className="text-sm leading-snug">{h.texto}</p>
                </div>
              ))}
              <Button onClick={guardar} className="mt-2 bg-gradient-coral text-primary-foreground hover:shadow-glow">
                Guardar y seguir <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Card className="border-dashed border-border/40 bg-transparent h-full min-h-[320px]">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <Quote className="w-10 h-10 text-coral/50 mb-4" />
                <p className="text-sm text-muted-foreground max-w-xs">Aquí salen 5 hooks en 5 frameworks: pregunta, dato, PAS, promesa y confesión.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── STEP 5: Estrategia completa ───────── */
function StepEstrategia({ registration, progress, update, onNext }: { registration: Registration; progress: Progress; update: (p: Partial<Progress>) => void; onNext: () => void }) {
  const seed = progress.estrategia?.input ?? {};
  const [tema, setTema] = useState<string>(seed.tema ?? progress.posicionamiento?.input.actividad ?? "");
  const [objetivo, setObjetivo] = useState<string>(seed.objetivo ?? "");
  const [audiencia, setAudiencia] = useState<string>(seed.audiencia ?? progress.posicionamiento?.input.audiencia ?? "");
  const [tono, setTono] = useState<string>(seed.tono ?? "");
  const [redes, setRedes] = useState<string>(seed.redes ?? "");
  const [contexto, setContexto] = useState<string>(seed.contexto ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyOutput | null>(progress.estrategia?.result ?? null);

  async function generar() {
    if (tema.trim().length < 3) {
      toast({ title: "Falta tu tema", description: "¿Sobre qué quieres crear contenido?", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const r = await callCoach({ mode: "estrategia", nombre: registration.nombre, tema, objetivo, audiencia, tono, redes, contexto });
      setResult(r);
      update({ estrategia: { input: { tema, objetivo, audiencia, tono, redes, contexto }, result: r } });
    } catch (e: any) {
      toast({ title: "No pudimos generar", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  return (
    <section>
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 border-coral/40 text-coral text-[10px]">PASO 6 · ESTRATEGIA</Badge>
        <h2 className="text-3xl font-bold">Tu mini-estrategia completa</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Esto junta todo: diagnóstico, posicionamiento, audiencia, pilares, frameworks y 3 ideas listas para producir esta semana.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-border/60">
          <CardContent className="p-6 space-y-4">
            <Field label="Tema o nicho" icon={<Target className="w-3.5 h-3.5" />}>
              <Textarea rows={2} value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ej. Educación financiera para jóvenes" />
            </Field>
            <Field label="Objetivo" icon={<Compass className="w-3.5 h-3.5" />}>
              <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Ej. Construir autoridad y atraer clientes" />
            </Field>
            <Field label="Audiencia" icon={<Users className="w-3.5 h-3.5" />}>
              <Input value={audiencia} onChange={(e) => setAudiencia(e.target.value)} placeholder="Lo más concreta posible" />
            </Field>
            <Field label="Tono" icon={<MessageSquare className="w-3.5 h-3.5" />}>
              <Input value={tono} onChange={(e) => setTono(e.target.value)} placeholder="Ej. Cercano, directo, con humor seco" />
            </Field>
            <Field label="Redes" icon={<Megaphone className="w-3.5 h-3.5" />}>
              <Input value={redes} onChange={(e) => setRedes(e.target.value)} placeholder="Ej. Instagram, TikTok, LinkedIn" />
            </Field>
            <Field label="Contexto actual" icon={<Layers className="w-3.5 h-3.5" />} hint="Qué ya haces, de dónde partes">
              <Textarea rows={2} value={contexto} onChange={(e) => setContexto(e.target.value)} placeholder="Ej. Publico 1 reel a la semana sin plan, tengo 800 seguidores." />
            </Field>
            <Button onClick={generar} disabled={loading} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Construyendo tu estrategia…</> : <><Wand2 className="w-4 h-4" /> Generar mi estrategia</>}
            </Button>
          </CardContent>
        </Card>

        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ResultCard r={result} />
                <Button onClick={onNext} className="mt-4 w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
                  Ir a mis recursos descargables <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-dashed border-border/40 bg-transparent h-full min-h-[420px]">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                    <Map className="w-10 h-10 text-coral/60 mb-4" />
                    <p className="text-sm text-muted-foreground max-w-xs">Aquí verás tu plan completo: diagnóstico, posicionamiento, pilares, frameworks e ideas concretas.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ───────── STEP 6: Recursos descargables (PDFs al vuelo) ───────── */
function StepRecursos({ registration, progress, onBack, onReset }: { registration: Registration; progress: Progress; onBack: () => void; onReset: () => void }) {
  const hasAll = !!progress.diagnostico && !!progress.posicionamiento && !!progress.pilares && !!progress.hooks && !!progress.estrategia;

  const downloadBrief = () => generateBriefPdf(registration, progress);
  const downloadBusinessCase = () => generateBusinessCasePdf(registration, progress);

  return (
    <section>
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 border-coral/40 text-coral text-[10px]">PASO 7 · LLÉVATE TU PLAN</Badge>
        <h2 className="text-3xl font-bold">Tus PDFs personalizados</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Estos archivos se arman al vuelo con todo lo que respondiste hoy. Llevan tu nombre, tu posicionamiento, tus pilares y tu plan de 7 días.</p>
      </div>

      {!hasAll && (
        <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Te faltan algunos pasos para personalizar tus PDFs.</p>
              <p className="text-xs text-muted-foreground mt-1">Puedes descargarlos igual, pero salen con secciones vacías. Mejor regresa y completa los ejercicios.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-coral/30 bg-coral/[0.03]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-coral/15 text-coral flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold">Brief de Contenido</h3>
                <p className="text-xs text-muted-foreground">Tu posicionamiento, audiencia, pilares y hooks.</p>
              </div>
            </div>
            <Button onClick={downloadBrief} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              <Download className="w-4 h-4" /> Descargar Brief
            </Button>
          </CardContent>
        </Card>

        <Card className="border-coral/30 bg-coral/[0.03]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-coral/15 text-coral flex items-center justify-center"><Rocket className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold">Business Case</h3>
                <p className="text-xs text-muted-foreground">Plan accionable de 7 días con tus 3 ideas listas.</p>
              </div>
            </div>
            <Button onClick={downloadBusinessCase} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              <Download className="w-4 h-4" /> Descargar Business Case
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Volver a mi estrategia</Button>
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground">Empezar de nuevo</Button>
      </div>

      <Card className="mt-10 glass-strong border-border/50">
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-widest text-coral font-bold mb-2">¿Qué sigue?</p>
          <p className="text-sm">Esta semana publica una idea por día siguiendo tus pilares. Si te trabas, regresa a esta página: tu plan se queda guardado en tu navegador.</p>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, icon, hint, children }: { label: string; icon: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function ResultCard({ r }: { r: StrategyOutput }) {
  const fullText = useMemo(() => {
    const L: string[] = [];
    if (r.diagnostico) L.push(`DIAGNÓSTICO\n${r.diagnostico}`);
    if (r.posicionamiento) L.push(`\nPOSICIONAMIENTO\n${r.posicionamiento}`);
    if (r.audiencia) L.push(`\nAUDIENCIA\n${r.audiencia}`);
    if (r.tono) L.push(`\nTONO\n${r.tono}`);
    if (r.pilares?.length) {
      L.push("\nPILARES");
      r.pilares.forEach((p, i) => L.push(`${i + 1}. ${p.nombre} — ${p.descripcion}`));
    }
    if (r.frameworks?.length) {
      L.push("\nFRAMEWORKS");
      r.frameworks.forEach((f) => L.push(`• ${f.nombre} — ${f.cuando_usarlo}`));
    }
    if (r.ideas?.length) {
      L.push("\nIDEAS DE CONTENIDO");
      r.ideas.forEach((i, k) => L.push(`${k + 1}. [${i.formato} · ${i.red} · ${i.pilar}]\n   Hook: ${i.hook}\n   CTA: ${i.cta}`));
    }
    if (r.siguiente_paso) L.push(`\nSIGUIENTE PASO\n${r.siguiente_paso}`);
    return L.join("\n");
  }, [r]);

  async function copy() {
    await navigator.clipboard.writeText(fullText);
    toast({ title: "Copiado", description: "Listo para pegar en tu nota o doc." });
  }

  return (
    <Card className="glass-strong border-coral/30">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">Tu mini-estrategia</h3>
          <Button size="sm" variant="ghost" onClick={copy}><Copy className="w-3.5 h-3.5" /> Copiar</Button>
        </div>

        {r.diagnostico && <Block label="Diagnóstico">{r.diagnostico}</Block>}
        {r.posicionamiento && <Block label="Posicionamiento">{r.posicionamiento}</Block>}

        {r.pilares?.length ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pilares de contenido</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {r.pilares.map((p, i) => (
                <div key={i} className="rounded-lg border border-coral/20 bg-coral/5 p-3">
                  <div className="text-sm font-semibold text-coral">{p.nombre}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.descripcion}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {r.audiencia && <Block label="Audiencia">{r.audiencia}</Block>}
        {r.tono && <Block label="Tono">{r.tono}</Block>}

        {r.frameworks?.length ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Frameworks sugeridos</p>
            <ul className="space-y-1.5 text-sm">
              {r.frameworks.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-coral font-semibold shrink-0">{f.nombre}</span>
                  <span className="text-muted-foreground">— {f.cuando_usarlo}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {r.ideas?.length ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Ideas listas para producir</p>
            <ol className="space-y-3">
              {r.ideas.map((i, k) => (
                <li key={k} className="border-l-2 border-coral/40 pl-3">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    <span className="text-[10px] uppercase font-mono bg-coral/10 text-coral px-1.5 py-0.5 rounded">{i.formato}</span>
                    <span className="text-[10px] uppercase font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{i.red}</span>
                    <span className="text-[10px] uppercase font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{i.pilar}</span>
                  </div>
                  <div className="text-sm"><span className="font-semibold">Hook:</span> {i.hook}</div>
                  <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">CTA:</span> {i.cta}</div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {r.siguiente_paso && (
          <div className="rounded-lg bg-coral/10 border border-coral/30 p-4">
            <p className="text-xs uppercase tracking-wider text-coral mb-1 font-semibold">Siguiente paso (48h)</p>
            <p className="text-sm">{r.siguiente_paso}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

/* ───────── PDF Generation ───────── */
function pdfBase(registration: Registration, title: string) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  let y = M;

  const coral: [number, number, number] = [233, 78, 96];
  const dim: [number, number, number] = [110, 110, 120];
  const dark: [number, number, number] = [25, 25, 30];

  // Cover band
  doc.setFillColor(...coral);
  doc.rect(0, 0, W, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...coral);
  doc.text("KIMEDIA × RETO INFLUENSER", M, y);
  y += 14;
  doc.setTextColor(...dim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Webinar 2 · Contenido y Estrategia · 26 mayo`, M, y);
  y += 28;
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const titleLines = doc.splitTextToSize(title, W - M * 2);
  doc.text(titleLines, M, y);
  y += titleLines.length * 28 + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...dim);
  doc.text(`Personalizado para ${registration.nombre}`, M, y);
  y += 14;
  doc.text(new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }), M, y);
  y += 26;

  const ensureSpace = (need: number) => {
    if (y + need > H - M) {
      doc.addPage();
      y = M;
    }
  };

  const heading = (label: string) => {
    ensureSpace(38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...coral);
    doc.text(label.toUpperCase(), M, y);
    y += 6;
    doc.setDrawColor(...coral);
    doc.setLineWidth(1.2);
    doc.line(M, y, M + 32, y);
    y += 14;
  };

  const paragraph = (text: string, opts: { bold?: boolean; size?: number } = {}) => {
    if (!text) return;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 11);
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(text, W - M * 2);
    ensureSpace(lines.length * 14 + 6);
    doc.text(lines, M, y);
    y += lines.length * 14 + 8;
  };

  const bullet = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(text, W - M * 2 - 14);
    ensureSpace(lines.length * 13 + 4);
    doc.setTextColor(...coral);
    doc.text("•", M, y);
    doc.setTextColor(...dark);
    doc.text(lines, M + 14, y);
    y += lines.length * 13 + 4;
  };

  const spacer = (n = 8) => { y += n; };

  const footer = (label: string) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...dim);
      doc.text(`${label} · KiMedia · kimedia.mx`, M, H - 24);
      doc.text(`${i} / ${pageCount}`, W - M, H - 24, { align: "right" });
    }
  };

  return { doc, heading, paragraph, bullet, spacer, footer };
}

function generateBriefPdf(registration: Registration, p: Progress) {
  const { doc, heading, paragraph, bullet, spacer, footer } = pdfBase(registration, "Brief de Contenido");

  if (p.diagnostico) {
    heading("Diagnóstico inicial");
    paragraph(`Etapa hoy: ${p.diagnostico.etapa} (${p.diagnostico.score}/6).`, { bold: true });
    spacer(4);
  }

  if (p.posicionamiento?.elegida || p.posicionamiento?.result) {
    heading("Posicionamiento");
    const elegida = p.posicionamiento.elegida ?? p.posicionamiento.result?.variantes?.[0]?.frase;
    if (elegida) paragraph(elegida, { bold: true, size: 13 });
    if (p.posicionamiento.result?.variantes?.length) {
      paragraph("Variantes generadas:", { bold: true });
      p.posicionamiento.result.variantes.forEach((v) => bullet(v.frase));
    }
    spacer(4);
  }

  if (p.pilares?.result?.pilares?.length) {
    heading("Pilares de contenido");
    p.pilares.result.pilares.forEach((pl, i) => {
      paragraph(`${i + 1}. ${pl.nombre}`, { bold: true, size: 12 });
      paragraph(pl.descripcion);
      if (pl.ejemplo_post) paragraph(`Ejemplo de post: ${pl.ejemplo_post}`);
      spacer(2);
    });
  }

  if (p.hooks?.result?.hooks?.length) {
    heading("Hooks generados");
    paragraph(`Tema base: ${p.hooks.input.idea}`);
    p.hooks.result.hooks.forEach((h) => bullet(`[${h.framework}] ${h.texto}`));
  }

  if (p.estrategia?.result) {
    const r = p.estrategia.result;
    if (r.audiencia) { heading("Audiencia"); paragraph(r.audiencia); }
    if (r.tono) { heading("Tono y voz"); paragraph(r.tono); }
    if (r.frameworks?.length) {
      heading("Frameworks sugeridos");
      r.frameworks.forEach((f) => bullet(`${f.nombre} — ${f.cuando_usarlo}`));
    }
  }

  footer("Brief de Contenido");
  doc.save(`brief-contenido-${slug(registration.nombre)}.pdf`);
}

function generateBusinessCasePdf(registration: Registration, p: Progress) {
  const { doc, heading, paragraph, bullet, spacer, footer } = pdfBase(registration, "Business Case · Reto InfluenSER");

  if (p.posicionamiento?.elegida || p.posicionamiento?.result) {
    heading("Posicionamiento elegido");
    paragraph(p.posicionamiento.elegida ?? p.posicionamiento.result?.variantes?.[0]?.frase ?? "", { bold: true, size: 13 });
  }

  if (p.estrategia?.result) {
    const r = p.estrategia.result;
    if (r.diagnostico) { heading("Diagnóstico"); paragraph(r.diagnostico); }
    if (r.posicionamiento && !p.posicionamiento?.elegida) { heading("Posicionamiento (estrategia)"); paragraph(r.posicionamiento); }
    if (r.pilares?.length) {
      heading("Pilares");
      r.pilares.forEach((pl, i) => {
        paragraph(`${i + 1}. ${pl.nombre}`, { bold: true, size: 12 });
        paragraph(pl.descripcion);
        spacer(2);
      });
    }
    if (r.ideas?.length) {
      heading("Plan de 7 días · 3 piezas para producir");
      r.ideas.forEach((idea, i) => {
        paragraph(`Pieza ${i + 1}: ${idea.formato} en ${idea.red} (pilar: ${idea.pilar})`, { bold: true, size: 12 });
        paragraph(`Hook: ${idea.hook}`);
        paragraph(`CTA: ${idea.cta}`);
        spacer(4);
      });
    }
    if (r.siguiente_paso) { heading("Siguiente paso (48h)"); paragraph(r.siguiente_paso, { bold: true }); }
  } else {
    paragraph("Aún no has generado tu estrategia completa. Regresa al paso 6 para construirla y este Business Case quedará completo.", { bold: true });
  }

  heading("Cómo presentar tu Business Case");
  bullet("Contexto: a quién le hablas y por qué importa hoy.");
  bullet("Propuesta: tu posicionamiento en 1 frase.");
  bullet("Plan editorial: tus 3 pilares + ritmo semanal.");
  bullet("Métricas: qué vas a medir (DMs, agendas, clics, no solo likes).");
  bullet("Riesgos: qué puede fallar y cómo lo manejas.");

  footer("Business Case · Reto InfluenSER");
  doc.save(`business-case-${slug(registration.nombre)}.pdf`);
}

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "asistente";
}