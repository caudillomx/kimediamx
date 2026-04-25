import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Download, Calendar, MapPin, Clock, Users, Target, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "propuesta_pan_yucatan_access";
const VALID_NAME = "pilar santos";
const VALID_PASS = "pan2026";

const PropuestaPanYucatan = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    const prevTitle = document.title;
    document.title = "KiMedia — Propuesta Confidencial · PAN Yucatán";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().toLowerCase() === VALID_NAME && pass === VALID_PASS) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("Credenciales incorrectas. Contacta a Jesús Caudillo.");
    }
  };

  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto bg-background px-6 py-10">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-glow opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 my-auto w-full max-w-[760px]"
        >
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-[28px] border border-border/80 bg-card px-7 py-7 shadow-glow-lg backdrop-blur-xl md:px-10 md:py-9"
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/10 to-transparent" />
            <div className="relative z-10 grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-end">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-coral shadow-glow">
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">
                    KiMedia · Propuesta Confidencial
                  </div>
                </div>

                <h1 className="mb-4 font-display text-4xl font-bold leading-[0.95] tracking-tight text-foreground md:text-5xl">
                  Acceso restringido <span className="text-gradient-sunset">a destinataria</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Este documento es de uso exclusivo. Ingresa tu nombre y clave de acceso para continuar.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/70 bg-secondary/35 p-4 md:p-5">
                <div>
                  <Label htmlFor="name" className="mb-2 block text-[11px] font-medium uppercase tracking-[1.2px] text-muted-foreground">
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    placeholder="Pilar Santos"
                    className="h-14 rounded-xl border-border bg-background/80 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="pass" className="mb-2 block text-[11px] font-medium uppercase tracking-[1.2px] text-muted-foreground">
                    Clave de acceso
                  </Label>
                  <Input
                    id="pass"
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 rounded-xl border-border bg-background/80 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-14 w-full rounded-xl bg-gradient-coral text-base font-semibold shadow-glow transition-opacity hover:opacity-90"
                >
                  Ingresar al documento
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  const logistics = [
    { icon: Calendar, label: "Fecha", value: "Por confirmar" },
    { icon: MapPin, label: "Sede", value: "Mérida, Yucatán" },
    { icon: Clock, label: "Horario", value: "10:00 – 12:00 hrs" },
    { icon: Clock, label: "Duración", value: "2 horas" },
    { icon: Users, label: "Asistentes", value: "Hasta 25 personas" },
    { icon: Target, label: "Modalidad", value: "Presencial · interactiva" },
  ];

  const moments = [
    {
      n: "01",
      title: "Quiz diagnóstico",
      time: "15 min",
      desc: "Cada asistente identifica su nivel de madurez digital y comunicación política.",
    },
    {
      n: "02",
      title: "Tablero estratégico",
      time: "30 min",
      desc: "Mapeo de audiencia, mensaje y canales con marco metodológico KiMedia.",
    },
    {
      n: "03",
      title: "Generador con perspectiva de género",
      time: "35 min",
      desc: "Uso de IA para crear contenido alineado al lenguaje incluyente y agenda PAN.",
    },
    {
      n: "04",
      title: "Simulador de campaña",
      time: "30 min",
      desc: "Ensayo en vivo de escenarios reales con retroalimentación inmediata.",
    },
  ];

  const skills = [
    "Estrategia política",
    "IA aplicada",
    "Vocería digital",
    "Contenido editorial",
    "Producción visual",
    "Análisis de datos",
  ];

  const includes = [
    "Diseño y facilitación del taller (2 horas)",
    "Acceso al tablero digital con 4 módulos para cada asistente",
    "Material editorial y guía de vocería personalizada",
    "Sesión de seguimiento remota a los 15 días",
    "Reporte ejecutivo de aprendizajes y recomendaciones",
  ];

  return (
    <div className="min-h-screen bg-background bg-mesh text-foreground">
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-wrap items-start justify-between gap-6 border-b border-border pb-10"
        >
          <div className="flex-1 min-w-[320px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-[1.8px] text-primary">
                KiMedia · Propuesta de Taller
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Comunicación Política
              <br />
              <span className="text-gradient-sunset">e Inteligencia Artificial</span>{" "}
              <span className="text-foreground">Vol. 1</span>
            </h1>
          </div>
          <div className="min-w-[200px] text-right text-xs leading-loose text-muted-foreground">
            <div>Por confirmar</div>
            <div>Mérida, Yucatán</div>
            <div>10:00 – 12:00 hrs</div>
            <div>Duración: 2 hrs</div>
            <div>Hasta 25 asistentes</div>
            <Badge variant="outline" className="mt-2 border-electric/40 bg-electric/10 text-[10px] uppercase tracking-widest text-electric">
              Confidencial
            </Badge>
          </div>
        </motion.header>

        {/* ATTN */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 overflow-hidden rounded-r-xl border-l-4 border-primary glass px-6 py-5"
        >
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Presentado a
          </div>
          <div className="font-display text-2xl font-bold">Pilar Santos</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Secretaria de Mujeres · PAN Yucatán
          </div>
        </motion.div>

        {/* INTRO */}
        <p className="mb-14 text-lg leading-relaxed text-foreground/90">
          Esta propuesta presenta un taller intensivo diseñado específicamente para el equipo de la Secretaría
          de Mujeres del PAN Yucatán. Su objetivo es <strong className="text-primary">fortalecer las capacidades de comunicación política</strong> a través
          del uso aplicado de inteligencia artificial, con un enfoque editorial, ético y con perspectiva de
          género. El resultado: vocerías más claras, contenido más estratégico y herramientas listas para
          operar en campaña.
        </p>

        {/* LOGISTICS GRID */}
        <SectionTitle eyebrow="Operación">Logística</SectionTitle>
        <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logistics.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full border-border bg-card/60 p-5 backdrop-blur transition-all hover:border-primary/40 hover:shadow-glow">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                  {item.label}
                </div>
                <div className="text-base font-semibold">{item.value}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* STRUCTURE */}
        <SectionTitle eyebrow="Programa">Estructura del taller</SectionTitle>
        <div className="mb-6 space-y-3">
          {moments.map((m, i) => (
            <motion.div
              key={m.n}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="group flex gap-5 border-border bg-card/60 p-6 transition-all hover:border-primary/40">
                <div className="font-display text-4xl font-bold leading-none text-gradient">
                  {m.n}
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-bold">{m.title}</h3>
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                      {m.time}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mb-16 rounded-xl border border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Cierre · 10 min</strong> — Síntesis colectiva, plan de acción
          individual y entrega de credenciales al tablero digital.
        </div>

        {/* DIGITAL TOOL */}
        <SectionTitle eyebrow="Plataforma">Herramienta digital del taller</SectionTitle>
        <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Cada asistente recibe acceso a un tablero web con cuatro módulos diseñados para acompañar el taller
          y permitir uso continuo después de la sesión.
        </p>
        <div className="mb-16 grid gap-4 md:grid-cols-2">
          {moments.map((m) => (
            <Card
              key={m.n}
              className="group relative overflow-hidden border-border bg-card/60 p-6 transition-all hover:border-primary/40 hover:shadow-glow"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-coral opacity-10 transition-opacity group-hover:opacity-20" />
              <div className="relative">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
                  Módulo {m.n}
                </div>
                <h3 className="mb-2 font-display text-lg font-bold">{m.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* ABOUT KIMEDIA */}
        <SectionTitle eyebrow="Quiénes somos">Sobre KiMedia</SectionTitle>
        <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Casa de comunicación estratégica que combina narrativa editorial, inteligencia artificial y
          producción de contenido para liderazgos políticos, marcas e instituciones.
        </p>
        <div className="mb-16 flex flex-wrap gap-2.5">
          {skills.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="border-border bg-secondary/60 px-4 py-2 text-sm font-medium hover:border-primary/40"
            >
              {s}
            </Badge>
          ))}
        </div>

        {/* ANTECEDENTES */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 overflow-hidden rounded-r-xl border-l-4 border-electric glass px-6 py-5"
        >
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
            Antecedentes
          </div>
          <p className="text-base leading-relaxed text-foreground/90">
            KiMedia ha desarrollado talleres similares para liderazgos del PAN en distintos estados. La
            edición más reciente se llevó a cabo en{" "}
            <strong className="text-foreground">Tequila, Jalisco el 18 de febrero de 2026</strong>, con
            resultados de alta satisfacción y aplicación inmediata por parte de las y los asistentes.
          </p>
        </motion.div>

        {/* INVESTMENT */}
        <SectionTitle eyebrow="Propuesta económica">Inversión</SectionTitle>
        <Card className="mb-8 overflow-hidden border-border bg-gradient-to-br from-card via-card to-secondary/40 p-8">
          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <div className="font-display text-5xl font-bold leading-none text-gradient-sunset md:text-6xl">
              $50,000
            </div>
            <div className="text-base font-semibold text-muted-foreground">MXN + IVA</div>
          </div>
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
            Incluye
          </div>
          <ul className="space-y-3">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* VIGENCIA */}
        <div className="mb-14 rounded-xl border border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Vigencia:</strong> Esta propuesta tiene una validez de 10 días
          naturales a partir de su recepción.
        </div>

        {/* SIGNATURE */}
        <div className="border-t border-border pt-8">
          <div className="font-display text-xl font-bold">Jesús Caudillo</div>
          <div className="text-sm text-muted-foreground">Director Ejecutivo · KiMedia</div>
          <div className="mt-1.5 text-sm text-muted-foreground">
            hola@kimedia.mx · kimediamx.com
          </div>
        </div>
      </div>

      {/* PRINT BUTTON */}
      <Button
        onClick={() => window.print()}
        className="no-print fixed bottom-6 right-6 z-50 h-12 rounded-full bg-gradient-coral px-6 font-semibold shadow-glow-lg hover:opacity-90"
      >
        <Download className="mr-1 h-4 w-4" />
        Descargar PDF
      </Button>
    </div>
  );
};

const SectionTitle = ({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) => (
  <div className="mb-6">
    {eyebrow && (
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.8px] text-primary">
        {eyebrow}
      </div>
    )}
    <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{children}</h2>
  </div>
);

export default PropuestaPanYucatan;