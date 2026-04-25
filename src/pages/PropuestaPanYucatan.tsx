import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Download, Calendar, MapPin, Clock, Users, Target, Sparkles, CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiLiveDemo } from "@/components/propuesta/AiLiveDemo";
import { InteractiveTimeline, type TimelineItem } from "@/components/propuesta/InteractiveTimeline";
import { AiToolsStack } from "@/components/propuesta/AiToolsStack";
import { AnimatedCounter } from "@/components/propuesta/AnimatedCounter";
import { PropuestaPdfTemplate } from "@/components/propuesta/PropuestaPdfTemplate";
import { toast } from "sonner";

const STORAGE_KEY = "propuesta_pan_yucatan_access";
const VALID_NAME = "pilar santos";
const VALID_PASS = "pan2026";

const PropuestaPanYucatan = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

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
    { icon: Calendar, label: "Fecha", value: "Viernes 29 de mayo de 2026" },
    { icon: Clock, label: "Horario", value: "18:00 hrs" },
    { icon: MapPin, label: "Sede", value: "Motul, Yucatán" },
    { icon: Clock, label: "Duración", value: "2 horas" },
    { icon: Users, label: "Asistentes", value: "≈ 150 personas" },
    { icon: Target, label: "Modalidad", value: "Presencial · interactiva" },
  ];

  const moments: TimelineItem[] = [
    {
      n: "01",
      title: "Diagnóstico colectivo",
      time: "15 min",
      desc: "Cada asistente identifica su nivel de madurez digital y los retos de comunicación política que enfrenta de cara a una campaña.",
      tools: ["Quiz interactivo", "Tablero KiMedia"],
      deliverable: "Su nivel de madurez digital y un plan de 3 acciones inmediatas.",
    },
    {
      n: "02",
      title: "IA aplicada a campaña",
      time: "35 min",
      desc: "Demostración práctica de las herramientas de inteligencia artificial que hoy potencian el trabajo de candidatos, candidatas y equipos: investigación, redacción, diseño y video.",
      tools: ["ChatGPT", "Claude", "Midjourney", "Perplexity"],
      deliverable: "Una pieza generada en vivo (post + imagen) con su propio tema.",
    },
    {
      n: "03",
      title: "Vocería con perspectiva de género",
      time: "35 min",
      desc: "Construcción de mensaje, vocería y narrativa con perspectiva de género, fortaleciendo el empoderamiento político de la mujer dentro de la estrategia de campaña.",
      tools: ["Claude", "ElevenLabs", "Wizr"],
      deliverable: "Un guion de vocería listo para entrevista o mitin.",
    },
    {
      n: "04",
      title: "Laboratorio en vivo",
      time: "30 min",
      desc: "Cada asistente crea, con apoyo de IA, una pieza real de campaña (post, guion o discurso) y recibe retroalimentación inmediata del equipo KiMedia.",
      tools: ["ChatGPT", "Nano Banana", "Runway"],
      deliverable: "Una pieza de campaña terminada y aprobada por el equipo KiMedia.",
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
    "Diseño y facilitación del taller (2 horas) para ~150 asistentes",
    "Acceso al tablero digital con 4 módulos para cada asistente",
    "Material editorial y guía de vocería con perspectiva de género",
    "Una sesión de asesoría personalizada posterior al taller",
    "Reporte ejecutivo de aprendizajes y recomendaciones para la Secretaría",
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
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-3 py-1.5">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-2 w-2 rounded-full bg-electric"
              />
              <Zap className="h-3.5 w-3.5 text-electric" />
              <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-electric">
                100% práctico · IA en vivo
              </span>
            </div>
          </div>
          <div className="min-w-[200px] text-right text-xs leading-loose text-muted-foreground">
            <div>Viernes 29 de mayo de 2026</div>
            <div>18:00 hrs · Motul, Yucatán</div>
            <div>Duración: 2 hrs</div>
            <div>≈ 150 asistentes</div>
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
          Esta propuesta presenta un curso de dos horas diseñado para{" "}
          <strong className="text-primary">futuros candidatos, futuras candidatas y sus equipos de campaña</strong>.
          Su objetivo es enseñar las herramientas que hoy ofrece la inteligencia artificial aplicada a la
          comunicación política. El resultado: vocerías más claras, contenido más estratégico y herramientas
          listas para operar en precampaña y campaña.
        </p>

        {/* IMPACT COUNTERS */}
        <div className="mb-16 grid gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-electric/5 p-6 sm:grid-cols-4 md:p-8">
          <CounterTile value={150} suffix="" label="Asistentes en sala" />
          <CounterTile value={2} suffix=" hrs" label="De inmersión" />
          <CounterTile value={8} suffix="+" label="Herramientas de IA" />
          <CounterTile value={1} label="Pieza real por persona" />
        </div>

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
        <SectionTitle eyebrow="Programa interactivo">Estructura del taller</SectionTitle>
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Toca cada módulo para ver qué herramientas de IA se utilizan y qué entregable se lleva cada
          asistente. Todo es <strong className="text-foreground">100% práctico</strong>: nada de teoría suelta.
        </p>
        <div className="mb-6">
          <InteractiveTimeline items={moments} />
        </div>
        <div className="mb-16 rounded-xl border border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Cierre · 10 min</strong> — Síntesis colectiva, plan de acción
          individual y entrega de credenciales al tablero digital.
        </div>

        {/* AI LIVE DEMO */}
        <SectionTitle eyebrow="Pruébalo ahora">Demo en vivo de IA</SectionTitle>
        <div className="mb-16 no-print">
          <AiLiveDemo />
        </div>

        {/* AI STACK */}
        <SectionTitle eyebrow="Stack del taller">Herramientas de IA que enseñamos</SectionTitle>
        <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Estas son las herramientas reales que cada asistente aprenderá a usar. Todas comerciales, todas
          accesibles y todas demostradas en vivo durante el taller.
        </p>
        <div className="mb-16">
          <AiToolsStack />
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
        onClick={async () => {
          if (generatingPdf || !pdfRef.current) return;
          setGeneratingPdf(true);
          const loadingId = toast.loading("Generando PDF…");
          try {
            const html2pdf = (await import("html2pdf.js")).default;
              // Wait for any embedded images (logo) to be ready
              const imgs = pdfRef.current.querySelectorAll("img");
              await Promise.all(
                Array.from(imgs).map((img) =>
                  img.complete && img.naturalWidth > 0
                    ? Promise.resolve()
                    : new Promise<void>((resolve) => {
                        img.addEventListener("load", () => resolve(), { once: true });
                        img.addEventListener("error", () => resolve(), { once: true });
                      }),
                ),
              );
            const opts: any = {
              margin: 0,
              filename: "KiMedia_Propuesta_PAN_Yucatan_Motul_2026.pdf",
              image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                  scale: 2,
                  backgroundColor: "#0B0F1A",
                  useCORS: true,
                  windowWidth: 794,
                },
              jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"], avoid: [".pdf-no-break"] },
            };
            await html2pdf()
              .set(opts)
              .from(pdfRef.current)
              .save();
            toast.success("PDF descargado", { id: loadingId });
          } catch (e) {
            console.error(e);
            toast.error("No se pudo generar el PDF", { id: loadingId });
          } finally {
            setGeneratingPdf(false);
          }
        }}
        disabled={generatingPdf}
        className="no-print fixed bottom-6 right-6 z-50 h-12 rounded-full bg-gradient-coral px-6 font-semibold shadow-glow-lg hover:opacity-90"
      >
        <Download className="mr-1 h-4 w-4" />
        {generatingPdf ? "Generando…" : "Descargar PDF"}
      </Button>

      {/* Hidden printable template */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "794px",
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <PropuestaPdfTemplate ref={pdfRef} moments={moments} includes={includes} />
      </div>
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

const CounterTile = ({ value, suffix, label }: { value: number; suffix?: string; label: string }) => (
  <div className="text-center">
    <div className="font-display text-4xl font-bold leading-none text-gradient-sunset md:text-5xl">
      <AnimatedCounter value={value} suffix={suffix ?? ""} />
    </div>
    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
      {label}
    </div>
  </div>
);

export default PropuestaPanYucatan;