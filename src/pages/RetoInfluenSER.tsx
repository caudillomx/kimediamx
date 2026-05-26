import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Wand2, Calendar, Users, Trophy, Download, FileText,
  Loader2, Check, Copy, ArrowRight, Mic, Lightbulb, Target, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import kimediaLogo from "@/assets/kimedia-logo.png";

const STORAGE_KEY = "reto-influenser-registration";

type Registration = { id: string; nombre: string; email: string };

type ReelOutput = {
  titulo?: string;
  hook?: string;
  estructura?: { tiempo: string; que_dices: string; que_se_ve: string }[];
  cta?: string;
  caption?: string;
  hashtags?: string[];
  tips?: string[];
};

const agenda = [
  { t: "0:00", titulo: "Bienvenida y por qué estamos aquí", desc: "El creador de hoy compite con todo, no solo con otros creadores." },
  { t: "0:05", titulo: "Estrategia ≠ improvisación", desc: "Framework Hook → Problema → Solución → CTA aplicado a causas sociales." },
  { t: "0:20", titulo: "Anatomía de un reel que conecta", desc: "Primeros 3 segundos, ritmo, beat visual y cierre que mueve a acción." },
  { t: "0:35", titulo: "Ejercicio en vivo con Reel Coach", desc: "Usamos la herramienta para construir tu reel del Business Case." },
  { t: "0:50", titulo: "Q&A y siguientes pasos", desc: "Cómo aterrizar tu propuesta para el Reto." },
];

const fechas = [
  { label: "Webinar 2 · Contenido y estrategia", value: "26 mayo" },
  { label: "Lanzamiento del Business Case", value: "27 mayo" },
  { label: "Entrega de videos", value: "28 may → 14 jun" },
  { label: "Evaluación", value: "17 → 24 jun" },
  { label: "Anuncio de ganadores", value: "26 junio" },
];

const criterios = [
  "Autenticidad del creador",
  "Claridad del mensaje",
  "Conexión emocional (storytelling)",
  "Creatividad y originalidad",
  "Impacto social y llamado a la acción",
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

        <section className="mt-24 grid md:grid-cols-2 gap-6">
          <Card className="glass-strong border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-coral" /> Fechas clave</h3>
              <ul className="space-y-3 text-sm">
                {fechas.map((f) => (
                  <li key={f.label} className="flex justify-between gap-4 border-b border-border/30 pb-2 last:border-0">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-semibold">{f.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="glass-strong border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-coral" /> Cómo evalúan</h3>
              <ul className="space-y-2 text-sm">
                {criterios.map((c, i) => (
                  <li key={c} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex w-6 h-6 rounded-full bg-coral/15 text-coral text-xs font-bold items-center justify-center shrink-0">{i + 1}</span>
                    <span>{c}</span>
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
          Cómo construir un reel <br />
          <span className="bg-gradient-coral bg-clip-text text-transparent">con propósito</span> que la gente quiera ver.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          En 60 minutos vamos del concepto al guion. Aprendes el framework que usamos en KiMedia para que tu Business Case del Reto InfluenSER salga publicable, no solo bonito.
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
      <ReelCoach registration={registration} />
      <Recursos />
    </motion.div>
  );
}

function Agenda() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-1">Agenda</h2>
      <p className="text-sm text-muted-foreground mb-6">Una hora, sin relleno.</p>
      <div className="grid md:grid-cols-2 gap-3">
        {agenda.map((a, i) => (
          <Card key={a.titulo} className="border-border/50 hover:border-coral/40 transition-colors">
            <CardContent className="p-5 flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-mono text-xs font-bold">
                {a.t}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{i + 1}. {a.titulo}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{a.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ReelCoach({ registration }: { registration: Registration }) {
  const [causa, setCausa] = useState("");
  const [estilo, setEstilo] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReelOutput | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  async function generate() {
    if (causa.trim().length < 3) {
      toast({ title: "Cuéntanos tu causa", description: "Describe brevemente la causa social que te mueve.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("reto-reel-coach", {
      body: {
        nombre: registration.nombre,
        registration_id: registration.id,
        causa_social: causa,
        estilo, audiencia, mensaje_clave: mensaje,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "No pudimos generar tu reel", description: error.message, variant: "destructive" });
      return;
    }
    if ((data as any)?.error) {
      toast({ title: "Algo salió mal", description: (data as any).error, variant: "destructive" });
      return;
    }
    setResult((data as any).result as ReelOutput);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <Badge variant="outline" className="mb-2 border-coral/40 text-coral text-[10px]">EN VIVO</Badge>
          <h2 className="text-2xl font-bold">Reel Coach</h2>
          <p className="text-sm text-muted-foreground">Construye el primer borrador de tu reel del Reto en menos de un minuto.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-border/60">
          <CardContent className="p-6 space-y-4">
            <Field label="Tu causa social" icon={<Heart className="w-3.5 h-3.5" />} hint="¿Qué problema o tema te mueve?">
              <Textarea value={causa} onChange={(e) => setCausa(e.target.value)} placeholder="Ej. Salud mental en adolescentes" rows={2} />
            </Field>
            <Field label="Tu estilo como creador" icon={<Sparkles className="w-3.5 h-3.5" />} hint="¿Cómo te comunicas naturalmente?">
              <Input value={estilo} onChange={(e) => setEstilo(e.target.value)} placeholder="Ej. Conversacional, irónico, didáctico" />
            </Field>
            <Field label="Audiencia" icon={<Users className="w-3.5 h-3.5" />} hint="¿A quién le hablas?">
              <Input value={audiencia} onChange={(e) => setAudiencia(e.target.value)} placeholder="Ej. Jóvenes universitarios 18-24" />
            </Field>
            <Field label="Mensaje clave" icon={<Target className="w-3.5 h-3.5" />} hint="Si solo se llevaran una idea, ¿cuál?">
              <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Ej. Pedir ayuda no te hace débil." rows={2} />
            </Field>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-coral text-primary-foreground hover:shadow-glow">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</> : <><Wand2 className="w-4 h-4" /> Generar mi reel</>}
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
                      Aquí verás tu hook, estructura del reel, caption y hashtags. <br /> Lo trabajamos juntos en vivo.
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

function ResultCard({ r }: { r: ReelOutput }) {
  const fullText = useMemo(() => {
    const lines: string[] = [];
    if (r.titulo) lines.push(`📌 ${r.titulo}`);
    if (r.hook) lines.push(`\nHOOK\n${r.hook}`);
    if (r.estructura?.length) {
      lines.push("\nESTRUCTURA");
      r.estructura.forEach((b) => lines.push(`[${b.tiempo}] ${b.que_dices}\n  📷 ${b.que_se_ve}`));
    }
    if (r.cta) lines.push(`\nCTA\n${r.cta}`);
    if (r.caption) lines.push(`\nCAPTION\n${r.caption}`);
    if (r.hashtags?.length) lines.push(`\n${r.hashtags.join(" ")}`);
    if (r.tips?.length) lines.push(`\nTIPS\n- ${r.tips.join("\n- ")}`);
    return lines.join("\n");
  }, [r]);

  async function copy() {
    await navigator.clipboard.writeText(fullText);
    toast({ title: "Copiado", description: "Listo para pegar en tu nota o guion." });
  }

  return (
    <Card className="glass-strong border-coral/30">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{r.titulo || "Tu reel"}</h3>
          <Button size="sm" variant="ghost" onClick={copy}><Copy className="w-3.5 h-3.5" /> Copiar</Button>
        </div>

        {r.hook && <Block label="Hook (0-3s)">{r.hook}</Block>}

        {r.estructura?.length ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Estructura</p>
            <ol className="space-y-3">
              {r.estructura.map((b, i) => (
                <li key={i} className="border-l-2 border-coral/40 pl-3">
                  <div className="text-[11px] font-mono text-coral">{b.tiempo}</div>
                  <div className="text-sm font-medium">{b.que_dices}</div>
                  <div className="text-xs text-muted-foreground">📷 {b.que_se_ve}</div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {r.cta && <Block label="CTA">{r.cta}</Block>}
        {r.caption && <Block label="Caption">{r.caption}</Block>}

        {r.hashtags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {r.hashtags.map((h) => <span key={h} className="text-xs text-coral bg-coral/10 px-2 py-0.5 rounded-full">{h}</span>)}
          </div>
        ) : null}

        {r.tips?.length ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tips</p>
            <ul className="space-y-1.5 text-sm">
              {r.tips.map((t) => <li key={t} className="flex gap-2"><Check className="w-3.5 h-3.5 text-coral mt-0.5 shrink-0" />{t}</li>)}
            </ul>
          </div>
        ) : null}
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