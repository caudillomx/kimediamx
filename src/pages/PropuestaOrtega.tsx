import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Download, Calendar, Scale, Shield, FileText, Search, Users, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropuestaOrtegaPdf, type OrtegaEtapa } from "@/components/propuesta/PropuestaOrtegaPdf";
import { toast } from "sonner";

const STORAGE_KEY = "propuesta_ortega_access";
const VALID_NAME = "ortega";
const VALID_PASS = "ortega2026";

const etapas: OrtegaEtapa[] = [
  {
    n: "01",
    title: "Reunión de validación y recolección de evidencias",
    time: "Días 1–3",
    desc: "Sesión de trabajo con el equipo del despacho para definir alcance, recibir el material disponible (publicaciones, capturas, cronología de hechos, información de la empresa afectada) y acordar los ejes específicos que debe cubrir el análisis.",
    deliverable: "Alcance firmado, cronograma detallado y matriz de evidencias inicial.",
  },
  {
    n: "02",
    title: "Análisis técnico y narrativo",
    time: "Días 4–12",
    desc: "Documentación y análisis de las publicaciones: origen, autoría aparente, alcance, tono, coordinación de mensajes, líneas narrativas, y rastreo del impacto en el ecosistema digital. Incluye contextualización de patrones de daño reputacional observables.",
    deliverable: "Dossier técnico interno con evidencias fechadas, capturas verificables y hallazgos organizados.",
  },
  {
    n: "03",
    title: "Documento ejecutivo y entrega",
    time: "Días 13–15",
    desc: "Redacción del documento final: resumen ejecutivo, hallazgos, cronología de hechos, análisis de narrativas y línea argumentativa sobre el impacto reputacional. Reunión de entrega y aclaración de dudas con el equipo del despacho.",
    deliverable: "Documento ejecutivo en PDF, anexo de evidencias y sesión de cierre.",
  },
];

const includes = [
  "Reunión inicial de validación con el equipo del despacho",
  "Recolección, ordenamiento y verificación del material aportado por el cliente",
  "Análisis técnico de publicaciones: alcance, tono, coordinación y narrativas",
  "Documento ejecutivo en PDF con hallazgos, cronología y línea argumentativa",
  "Anexo de evidencias fechadas y verificables",
  "Reunión de entrega y aclaración de dudas con el equipo legal",
];

const PropuestaOrtega = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    const prev = document.title;
    document.title = "KiMedia — Propuesta Confidencial · Ortega y Asociados";
    return () => { document.title = prev; };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().toLowerCase().includes(VALID_NAME) && pass === VALID_PASS) {
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
                  Acceso restringido <span className="text-gradient-sunset">al despacho</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Este documento es de uso exclusivo. Ingresa tu nombre y clave de acceso para continuar.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/70 bg-secondary/35 p-4 md:p-5">
                <div>
                  <Label htmlFor="name" className="mb-2 block text-[11px] font-medium uppercase tracking-[1.2px] text-muted-foreground">Despacho</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" placeholder="Ortega y Asociados" className="h-14 rounded-xl border-border bg-background/80 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary" />
                </div>
                <div>
                  <Label htmlFor="pass" className="mb-2 block text-[11px] font-medium uppercase tracking-[1.2px] text-muted-foreground">Clave de acceso</Label>
                  <Input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" className="h-14 rounded-xl border-border bg-background/80 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary" />
                </div>
                {error && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="h-14 w-full rounded-xl bg-gradient-coral text-base font-semibold shadow-glow transition-opacity hover:opacity-90">
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

  const metaTiles = [
    { icon: Calendar, label: "Duración", value: "15 días naturales" },
    { icon: FileText, label: "Entregable", value: "Documento ejecutivo en PDF" },
    { icon: Users, label: "Modalidad", value: "Reunión + trabajo remoto" },
    { icon: Shield, label: "Confidencialidad", value: "Uso exclusivo del despacho" },
  ];

  return (
    <div className="min-h-screen bg-background bg-mesh text-foreground">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

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
                KiMedia · Propuesta de Análisis
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Análisis de impacto reputacional
              <br />
              <span className="text-gradient-sunset">por publicaciones en redes sociales</span>
            </h1>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-3 py-1.5">
              <Scale className="h-3.5 w-3.5 text-electric" />
              <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-electric">
                Insumo técnico para estrategia legal
              </span>
            </div>
          </div>
          <div className="min-w-[220px] text-right text-xs leading-loose text-muted-foreground">
            <div>Duración: 15 días naturales</div>
            <div>Inversión: $30,000 MXN + IVA</div>
            <div>Pago: 50% inicio · 50% fin</div>
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
          <div className="font-display text-2xl font-bold">Ortega y Asociados</div>
          <div className="mt-1 text-sm text-muted-foreground">Despacho jurídico</div>
        </motion.div>

        {/* INTRO */}
        <p className="mb-14 text-lg leading-relaxed text-foreground/90">
          Esta propuesta describe un{" "}
          <strong className="text-primary">análisis técnico y narrativo</strong> de un conjunto de
          publicaciones en redes sociales y su efecto documentable sobre la reputación y operación
          comercial de una empresa. El trabajo se entrega como insumo especializado para apoyar la
          estrategia legal del despacho —no constituye un dictamen pericial, sino un análisis de
          comunicación digital con evidencia fechada y verificable.
        </p>

        {/* META TILES */}
        <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metaTiles.map((item, i) => (
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

        {/* ETAPAS */}
        <SectionTitle eyebrow="Metodología">Etapas del trabajo</SectionTitle>
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Tres fases secuenciales en 15 días naturales, con puntos de contacto claros con el equipo
          del despacho para validar alcance, evidencias y hallazgos.
        </p>

        <div className="mb-16 space-y-4">
          {etapas.map((e, i) => (
            <motion.div
              key={e.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Card className="border-border bg-card/60 p-6 backdrop-blur">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl font-bold leading-none text-gradient-sunset">
                      {e.n}
                    </span>
                    <h3 className="font-display text-xl font-bold">{e.title}</h3>
                  </div>
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] uppercase tracking-widest text-primary">
                    {e.time}
                  </Badge>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                <div className="rounded-xl border border-electric/30 bg-electric/5 px-4 py-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
                    Entregable de la etapa
                  </div>
                  <div className="text-sm leading-relaxed text-foreground">{e.deliverable}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ALCANCE / METODOLOGÍA */}
        <SectionTitle eyebrow="Qué analizamos">Alcance técnico</SectionTitle>
        <div className="mb-16 grid gap-4 md:grid-cols-2">
          {[
            { icon: Search, title: "Origen y autoría aparente", desc: "Identificación de cuentas emisoras, patrones de comportamiento y posibles indicios de coordinación." },
            { icon: FileText, title: "Contenido y tono", desc: "Análisis de mensajes, líneas narrativas repetidas, elementos difamatorios o de daño reputacional." },
            { icon: Users, title: "Alcance e interacción", desc: "Estimación de exposición, interacción y propagación en cada plataforma donde se registró el contenido." },
            { icon: Shield, title: "Impacto reputacional", desc: "Documentación del efecto observable sobre la percepción pública de la empresa y su operación comercial." },
          ].map((item) => (
            <Card key={item.title} className="border-border bg-card/60 p-5 backdrop-blur">
              <item.icon className="mb-3 h-5 w-5 text-primary" />
              <h4 className="mb-1.5 font-display text-base font-bold">{item.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>

        {/* NOTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 overflow-hidden rounded-r-xl border-l-4 border-electric glass px-6 py-5"
        >
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
            Nota metodológica
          </div>
          <p className="text-base leading-relaxed text-foreground/90">
            Este trabajo constituye un{" "}
            <strong className="text-foreground">análisis técnico de comunicación digital</strong>, no
            un dictamen pericial. Su objetivo es documentar hallazgos, narrativas y evidencia
            observable en el ecosistema digital, ordenados y contextualizados como insumo para el
            trabajo jurídico del despacho.
          </p>
        </motion.div>

        {/* INVERSIÓN */}
        <SectionTitle eyebrow="Propuesta económica">Inversión</SectionTitle>
        <Card className="mb-8 overflow-hidden border-border bg-gradient-to-br from-card via-card to-secondary/40 p-8">
          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <div className="font-display text-5xl font-bold leading-none text-gradient-sunset md:text-6xl">
              $30,000
            </div>
            <div className="text-base font-semibold text-muted-foreground">MXN + IVA</div>
          </div>
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
            El trabajo incluye
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

        {/* CONDICIONES */}
        <div className="mb-14 grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-secondary/40 p-5">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-primary">Forma de pago</div>
            <p className="text-sm leading-relaxed text-foreground/90">
              <strong>50% al inicio</strong> del proyecto y <strong>50% al finalizar</strong> a satisfacción del cliente. Transferencia electrónica con factura.
            </p>
          </Card>
          <Card className="border-border bg-secondary/40 p-5">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-electric">Vigencia</div>
            <p className="text-sm leading-relaxed text-foreground/90">
              Esta propuesta tiene una validez de <strong>10 días naturales</strong> a partir de su recepción.
            </p>
          </Card>
        </div>

        {/* SIGNATURE */}
        <div className="border-t border-border pt-8">
          <div className="font-display text-xl font-bold">Jesús Caudillo</div>
          <div className="text-sm text-muted-foreground">Director Ejecutivo · KiMedia</div>
          <div className="mt-1.5 text-sm text-muted-foreground">
            hola@kimedia.mx · kimedia.mx
          </div>
        </div>
      </div>

      {/* PDF BUTTON */}
      <Button
        onClick={async () => {
          if (generatingPdf || !pdfRef.current) return;
          setGeneratingPdf(true);
          const loadingId = toast.loading("Generando PDF…");
          try {
            const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
              import("html2canvas"),
              import("jspdf"),
            ]);
            const { jsPDF } = jsPDFModule as any;

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

            const pageNodes = Array.from(
              pdfRef.current.querySelectorAll<HTMLElement>("[data-pdf-page]"),
            );

            const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
            const pageWpt = pdf.internal.pageSize.getWidth();
            const pageHpt = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pageNodes.length; i++) {
              const canvas = await html2canvas(pageNodes[i], {
                scale: 2,
                backgroundColor: "#0B0F1A",
                useCORS: true,
                windowWidth: 794,
                width: 794,
                height: 1123,
              });
              const imgData = canvas.toDataURL("image/jpeg", 0.95);
              if (i > 0) pdf.addPage();
              pdf.addImage(imgData, "JPEG", 0, 0, pageWpt, pageHpt);
            }

            pdf.save("KiMedia_Propuesta_Ortega_Asociados_2026.pdf");
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

      {/* Hidden PDF template */}
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
        <PropuestaOrtegaPdf ref={pdfRef} etapas={etapas} includes={includes} />
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

export default PropuestaOrtega;