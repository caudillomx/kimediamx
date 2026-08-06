import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Sparkles, Video, BookOpen, MessageSquareQuote } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const monthly = [
  { mes: "Ene", valor: 5.5, peak: false },
  { mes: "Feb", valor: 1.0, peak: false },
  { mes: "Mar", valor: 3.0, peak: false },
  { mes: "Abr", valor: 11.8, peak: true },
  { mes: "Ago 26", valor: 10.3, peak: true },
];

const timeline = [
  { n: "01", title: "Diagnóstico", desc: "Lectura de cuentas, formatos y desempeño histórico por red." },
  { n: "02", title: "Estrategia activa", desc: "Líneas narrativas, calendario y producción constante de contenido." },
  { n: "03", title: "Resultados", desc: "200 interacciones totales en Instagram · tasa de interacción en Facebook creció 3.6x en el período." },
];

const topPosts = [
  {
    n: 1,
    value: 38,
    title: "Georgetown Panamá",
    desc: "Diane en evento presencial, registro real de su participación.",
  },
  { n: 2, value: 26, title: "HACE Entrepreneur Program", desc: "Presencia institucional con contexto y rostro visible." },
  {
    n: 3,
    value: 23,
    title: "“El liderazgo no es un deporte individual”",
    desc: "Mensaje de autoría propia con voz reconocible.",
  },
];

const learnings = [
  {
    icon: Video,
    title: "Diane en cámara = máximo alcance",
    desc: "Los contenidos donde aparece en situaciones reales concentran el mejor rendimiento del período.",
  },
  {
    icon: MessageSquareQuote,
    title: "Narrativa real > framework teórico",
    desc: "Las historias y contextos concretos superan a las piezas conceptuales o de plantilla.",
  },
  {
    icon: BookOpen,
    title: "El libro como idea, no como producto",
    desc: "Funciona mejor como eje de conversación y punto de vista que como anuncio de venta.",
  },
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold text-primary">{payload[0].value} interacciones/post</div>
    </div>
  );
};

const ResultadosICatalyze = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-glow" />
        <div className="container relative mx-auto max-w-5xl px-6 py-14 md:py-20">
          <motion.div {...fadeUp}>
            <Badge className="mb-6 bg-gradient-coral text-primary-foreground">Reporte de resultados</Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              KiMedia para <span className="text-gradient">iCatalyze</span>
              <span className="block text-foreground/70">Mayo – Agosto 2026</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Un resumen ejecutivo del trabajo realizado con Diane Garza: qué se construyó, cómo respondió la
              audiencia y qué aprendizajes quedan instalados.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Contexto */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Contexto del período</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {timeline.map((t) => (
                <div key={t.n} className="relative rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-coral font-display text-sm font-bold text-primary-foreground">
                    {t.n}
                  </div>
                  <h3 className="font-display text-lg font-bold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Métricas globales */}
      <section className="border-b border-border bg-surface-elevated/40">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Métricas globales</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="border-border bg-card p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">Instagram</span>
                </div>
                <div className="font-display text-5xl font-bold text-gradient">8.3</div>
                <p className="mt-2 text-sm text-muted-foreground">interacciones promedio por publicación</p>
                <div className="mt-6 border-t border-border pt-5">
                  <div className="font-display text-2xl font-bold">38</div>
                  <p className="text-sm text-muted-foreground">interacciones en el mejor post</p>
                </div>
              </Card>

              <Card className="border-border bg-card p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Facebook className="h-5 w-5 text-cyan" />
                  <span className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">Facebook</span>
                </div>
                <div className="font-display text-5xl font-bold text-gradient-electric">1.73%</div>
                <p className="mt-2 text-sm text-muted-foreground">tasa de interacción</p>
                <div className="mt-6 border-t border-border pt-5">
                  <div className="font-display text-2xl font-bold">3.6x</div>
                  <p className="text-sm text-muted-foreground">crecimiento en el período</p>
                </div>
              </Card>
            </div>

            <Card className="mt-6 border-primary/30 bg-primary/5 p-8">
              <div className="flex items-start gap-4">
                <Sparkles className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">Dato destacado</div>
                  <p className="mt-2 font-display text-xl font-bold leading-snug md:text-2xl">
                    Instagram supera a Facebook en rendimiento por post en 144%
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 4. Evolución mensual */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Evolución mensual</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Interacciones promedio por publicación en Instagram. Abril y agosto marcan los picos del ciclo de
              estrategia activa.
            </p>
            <Card className="mt-8 border-border bg-card/60 p-6 backdrop-blur">
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      stroke="hsl(var(--muted-foreground))"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.3)" }} content={<ChartTooltip />} />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                      <LabelList
                        dataKey="valor"
                        position="top"
                        fill="hsl(var(--foreground))"
                        fontSize={13}
                        fontWeight={700}
                      />
                      {monthly.map((d) => (
                        <Cell
                          key={d.mes}
                          fill={d.peak ? "hsl(var(--coral))" : "hsl(var(--muted))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-coral" /> Picos de rendimiento
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-muted" /> Meses base
                </span>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 5. Contenido de mayor impacto */}
      <section className="border-b border-border bg-surface-elevated/40">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Contenido de mayor impacto</h2>
            <p className="mt-2 text-sm text-muted-foreground">Top 3 publicaciones de Instagram del período.</p>

            <div className="mt-8 space-y-4">
              {topPosts.map((p) => (
                <Card
                  key={p.n}
                  className="flex flex-col gap-4 border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-8"
                >
                  <div className="flex items-baseline gap-3 sm:w-40 sm:shrink-0">
                    <span className="font-display text-4xl font-bold text-gradient">{p.value}</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">interacciones</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-electric/30 bg-electric/10 p-6">
              <p className="font-display text-base font-semibold leading-snug md:text-lg">
                El contenido con Diane en situaciones reales genera hasta 4x más que el contenido gráfico.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Lo que instalamos */}
      <section>
        <div className="container mx-auto max-w-5xl px-6 py-10 pb-16">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Lo que instalamos</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {learnings.map((l) => (
                <Card key={l.title} className="border-border bg-card/60 p-6 backdrop-blur">
                  <l.icon className="mb-4 h-6 w-6 text-primary" />
                  <h3 className="font-display text-lg font-bold leading-tight">{l.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.desc}</p>
                </Card>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center">
              <p className="mx-auto max-w-2xl font-display text-xl font-bold leading-snug md:text-2xl">
                Esta base está instalada y lista para escalar con producción de video propio.
              </p>
            </div>

            <p className="mt-12 text-center text-xs uppercase tracking-[2px] text-muted-foreground">
              KiMedia · iCatalyze · Mayo – Agosto 2026
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ResultadosICatalyze;