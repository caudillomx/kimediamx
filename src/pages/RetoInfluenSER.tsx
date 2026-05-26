import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Wand2, Calendar, Users, Download, FileText,
  Loader2, Check, Copy, ArrowRight, Mic, Lightbulb, Target, Compass,
  Layers, MessageSquare, Megaphone,
} from "lucide-react";
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
        <Hero />

        {!registration ? (
          <RegisterCard form={form} setForm={setForm} loading={loading} onSubmit={handleRegister} />
        ) : (
          <WebinarRoom registration={registration} />
        )}

        <section className="mt-24">
          <Card className="glass-strong border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Compass className="w-4 h-4 text-coral" /> Principios que vamos a usar hoy</h3>
              <ul className="space-y-3 text-sm">
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

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          Hecho por <a href="/" className="text-coral hover:underline">KiMedia</a> para el Reto InfluenSER · Influencer Academy
        </footer>
      </main>
    </div>
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
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-12">
      <div className="flex items-center gap-3 text-sm">
        <Badge className="bg-coral/15 text-coral border-coral/30"><Check className="w-3 h-3 mr-1" /> Registrado</Badge>
        <span className="text-muted-foreground">Bienvenido, <span className="text-foreground font-semibold">{registration.nombre.split(" ")[0]}</span>.</span>
      </div>

      <Agenda />
      <StrategyCoach registration={registration} />
      <Recursos />
    </motion.div>
  );
}

function Agenda() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const active = openIdx !== null ? agenda[openIdx] : null;
  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Agenda</h2>
      <p className="text-sm text-muted-foreground mb-6">Una hora, sin relleno. <span className="text-coral">Toca cualquier bloque para ver el detalle y un ejemplo real.</span></p>
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

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-mono text-xs font-bold">
                    {active.t}
                  </div>
                  <Badge variant="outline" className="border-coral/40 text-coral text-[10px]">
                    Bloque {(openIdx ?? 0) + 1} de {agenda.length}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl leading-tight text-left">{active.titulo}</DialogTitle>
                <DialogDescription className="text-left">{active.desc}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-coral font-bold mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> La idea central
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{active.idea}</p>
                </div>

                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-coral font-bold mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Qué vamos a ver
                  </h4>
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
                  <h4 className="text-[11px] uppercase tracking-widest text-coral font-bold mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> {active.ejemplo.titulo}
                  </h4>
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

function StrategyCoach({ registration }: { registration: Registration }) {
  const [tema, setTema] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [tono, setTono] = useState("");
  const [redes, setRedes] = useState("");
  const [contexto, setContexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyOutput | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  async function generate() {
    if (tema.trim().length < 3) {
      toast({ title: "Cuéntanos tu tema", description: "¿Sobre qué quieres crear contenido?", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("reto-reel-coach", {
      body: {
        nombre: registration.nombre,
        registration_id: registration.id,
        tema, objetivo, audiencia, tono, redes, contexto,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "No pudimos generar tu estrategia", description: error.message, variant: "destructive" });
      return;
    }
    if ((data as any)?.error) {
      toast({ title: "Algo salió mal", description: (data as any).error, variant: "destructive" });
      return;
    }
    setResult((data as any).result as StrategyOutput);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <Badge variant="outline" className="mb-2 border-coral/40 text-coral text-[10px]">EN VIVO</Badge>
          <h2 className="text-2xl font-bold">Estrategia Coach</h2>
          <p className="text-sm text-muted-foreground">Tu mini-estrategia de contenido: diagnóstico, pilares, audiencia, frameworks e ideas accionables.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-border/60">
          <CardContent className="p-6 space-y-4">
            <Field label="¿Sobre qué quieres crear contenido?" icon={<Target className="w-3.5 h-3.5" />} hint="Tema, nicho, causa o industria">
              <Textarea value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ej. Educación financiera para jóvenes que recién empiezan a trabajar." rows={2} />
            </Field>
            <Field label="Objetivo" icon={<Compass className="w-3.5 h-3.5" />} hint="¿Para qué publicas? Comunidad, clientes, agenda…">
              <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Ej. Construir autoridad y atraer clientes de asesoría" />
            </Field>
            <Field label="Audiencia" icon={<Users className="w-3.5 h-3.5" />} hint="Lo más concreta posible">
              <Input value={audiencia} onChange={(e) => setAudiencia(e.target.value)} placeholder="Ej. Mujeres 25-35, primer empleo formal en CDMX" />
            </Field>
            <Field label="Tono / personalidad" icon={<MessageSquare className="w-3.5 h-3.5" />} hint="Cómo suenas cuando hablas natural">
              <Input value={tono} onChange={(e) => setTono(e.target.value)} placeholder="Ej. Cercano, directo, con humor seco" />
            </Field>
            <Field label="Redes donde estás o quieres estar" icon={<Megaphone className="w-3.5 h-3.5" />}>
              <Input value={redes} onChange={(e) => setRedes(e.target.value)} placeholder="Ej. Instagram, TikTok, LinkedIn" />
            </Field>
            <Field label="Contexto actual" icon={<Layers className="w-3.5 h-3.5" />} hint="Qué ya haces, de dónde partes (opcional)">
              <Textarea value={contexto} onChange={(e) => setContexto(e.target.value)} placeholder="Ej. Publico 1 reel a la semana, sin plan claro. Tengo 800 seguidores." rows={2} />
            </Field>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Construyendo tu estrategia...</> : <><Wand2 className="w-4 h-4" /> Generar mi estrategia</>}
            </Button>
          </CardContent>
        </Card>

        <div ref={resultRef}>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ResultCard r={result} />
              </motion.div>
            ) : (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-dashed border-border/40 bg-transparent h-full min-h-[420px]">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                    <Lightbulb className="w-10 h-10 text-coral/60 mb-4" />
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Aquí verás tu diagnóstico, posicionamiento, pilares, frameworks e ideas concretas. <br /> Lo construimos juntos en vivo.
                    </p>
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

function Recursos() {
  const items = [
    { titulo: "Brief del Reto InfluenSER", desc: "PDF con etapas, criterios y fechas oficiales.", href: "/recursos/reto-influenser.pdf", icon: <FileText className="w-4 h-4" /> },
    { titulo: "Slides del webinar", desc: "Se suben al cierre de la sesión.", href: "#", icon: <FileText className="w-4 h-4" />, disabled: true },
    { titulo: "Plantilla Business Case", desc: "Disponible al cerrar el webinar.", href: "#", icon: <FileText className="w-4 h-4" />, disabled: true },
  ];
  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Recursos</h2>
      <p className="text-sm text-muted-foreground mb-6">Todo lo que necesitas para arrancar tu Business Case.</p>
      <div className="grid md:grid-cols-3 gap-3">
        {items.map((i) => (
          <a
            key={i.titulo}
            href={i.disabled ? undefined : i.href}
            target={i.disabled ? undefined : "_blank"}
            rel="noreferrer"
            className={`block ${i.disabled ? "pointer-events-none opacity-50" : "hover:border-coral/50"}`}
          >
            <Card className="border-border/50 h-full transition-colors hover:border-coral/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-lg bg-coral/10 text-coral flex items-center justify-center">{i.icon}</span>
                  {i.disabled ? <Badge variant="secondary" className="text-[10px]">Próximamente</Badge> : <Download className="w-4 h-4 text-muted-foreground" />}
                </div>
                <h3 className="font-semibold text-sm mb-1">{i.titulo}</h3>
                <p className="text-xs text-muted-foreground">{i.desc}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}