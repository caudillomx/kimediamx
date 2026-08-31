import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Facebook,
  Youtube,
  Music2,
  Twitter,
  Users,
  FileText,
  Zap,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const engagementByPlatform = [
  { plataforma: "Instagram", tasa: 4.6, top: true },
  { plataforma: "TikTok", tasa: 1.61, top: false },
  { plataforma: "Facebook", tasa: 0.086, top: false },
  { plataforma: "X (Twitter)", tasa: 0.029, top: false },
  { plataforma: "YouTube", tasa: 0.029, top: false },
];

const platformTable = [
  {
    plataforma: "Instagram",
    icon: Instagram,
    seguidores: "9,554",
    publicaciones: "738",
    postsDia: "1.9",
    interacciones: "178,477",
    intPost: "241.8",
    intSeguidor: "18.68",
    tasa: "4.60%",
    destacada: true,
  },
  {
    plataforma: "TikTok",
    icon: Music2,
    seguidores: "2,587",
    publicaciones: "85",
    postsDia: "0.2",
    interacciones: "8,612",
    intPost: "101.3",
    intSeguidor: "3.33",
    tasa: "1.61%",
    destacada: false,
  },
  {
    plataforma: "Facebook",
    icon: Facebook,
    seguidores: "181,139",
    publicaciones: "1,394",
    postsDia: "3.5",
    interacciones: "209,566",
    intPost: "150.3",
    intSeguidor: "1.16",
    tasa: "0.086%",
    destacada: false,
  },
  {
    plataforma: "X (Twitter)",
    icon: Twitter,
    seguidores: "24,285",
    publicaciones: "852",
    postsDia: "2.2",
    interacciones: "6,024",
    intPost: "7.1",
    intSeguidor: "0.25",
    tasa: "0.029%",
    destacada: false,
  },
  {
    plataforma: "YouTube",
    icon: Youtube,
    seguidores: "4,370",
    publicaciones: "102",
    postsDia: "0.3",
    interacciones: "299",
    intPost: "2.9",
    intSeguidor: "0.07",
    tasa: "0.029%",
    destacada: false,
  },
];

const monthlyVolume = [
  { mes: "ago-25", posts: 343 },
  { mes: "sep-25", posts: 392 },
  { mes: "oct-25", posts: 463 },
  { mes: "nov-25", posts: 418 },
  { mes: "dic-25", posts: 246 },
  { mes: "ene-26", posts: 164 },
  { mes: "feb-26", posts: 381 },
  { mes: "mar-26", posts: 69 },
  { mes: "abr-26", posts: 39 },
  { mes: "may-26", posts: 130 },
  { mes: "jun-26", posts: 153 },
  { mes: "jul-26", posts: 174 },
  { mes: "ago-26", posts: 195 },
];

const peopleVsInstitutional = [
  { tipo: "Contenido con personas", tasa: 5.8, top: true },
  { tipo: "Contenido institucional genérico", tasa: 2.21, top: false },
];

const formatData = [
  { formato: "Video", tasa: 0.157, top: true },
  { formato: "Reel", tasa: 0.137, top: false },
  { formato: "Post estático", tasa: 0.078, top: false },
];

const examples = [
  {
    plataforma: "Instagram",
    icon: Instagram,
    formato: "Reel",
    fecha: "17 ago 2026",
    porque: "Contenido informativo útil para estudiantes, entregado en formato corto y directo",
    liga: "https://www.instagram.com/reel/DcJ-08ijKNf/",
  },
  {
    plataforma: "Instagram",
    icon: Instagram,
    formato: "Carrusel",
    fecha: "17 ago 2026",
    porque:
      "Momento humano y masivo (regreso a clases de +40 mil estudiantes) narrado con cercanía, no en tono institucional",
    liga: "https://www.instagram.com/p/DcJi2P7G-7s/",
  },
  {
    plataforma: "Instagram",
    icon: Instagram,
    formato: "Carrusel",
    fecha: "10 ago 2026",
    porque: "Cobertura de evento en tiempo real (inauguración Copa Panamericana de Voleibol) con energía y contexto",
    liga: "https://www.instagram.com/p/Db2PTcGFi5W/",
  },
  {
    plataforma: "Instagram",
    icon: Instagram,
    formato: "Carrusel",
    fecha: "7 ago 2026",
    porque: "Autoridad universitaria (rectora) en un recorrido físico, mostrando rostro y cercanía en vez de solo comunicado",
    liga: "https://www.instagram.com/p/DbwWCskm9GV/",
  },
  {
    plataforma: "TikTok",
    icon: Music2,
    formato: "Video",
    fecha: "9 feb 2026",
    porque: 'Contenido educativo tipo "paso a paso" (cómo inscribirte), formato tutorial que funciona bien en la plataforma',
    liga: "https://www.tiktok.com/@uaem_morelos/video/7604933227521789204",
  },
  {
    plataforma: "TikTok",
    icon: Music2,
    formato: "Video",
    fecha: "31 ene 2026",
    porque: "Pieza de reclutamiento/informativa (Prepa UAEM) con tono directo y cercano al estudiante prospecto",
    liga: "https://www.tiktok.com/@uaem_morelos/video/7601295090371398933",
  },
  {
    plataforma: "Facebook",
    icon: Facebook,
    formato: "Reel",
    fecha: "6 nov 2025",
    porque: "Contenido de temporada/cultural (Nochebuenas) con historia y producto tangible, formato video en vez de foto estática",
    liga: "https://www.facebook.com/reel/816346071101323/",
  },
  {
    plataforma: "Facebook",
    icon: Facebook,
    formato: "Reel",
    fecha: "17 oct 2025",
    porque: "Contenido cultural con gancho de temporada (flores de Día de Muertos), buen ejemplo de reel superando al post estático",
    liga: "https://www.facebook.com/reel/843640601679185/",
  },
];

const stats = [
  { icon: Users, value: "221,935", label: "seguidores combinados en 5 plataformas" },
  { icon: FileText, value: "3,171", label: "publicaciones analizadas" },
  { icon: Zap, value: "4.60%", label: "tasa de interacción en el canal top (Instagram) vs. 0.086% en Facebook" },
  { icon: Instagram, value: "18.7x", label: "más interacción por seguidor en Instagram que en Facebook" },
];

const RateTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold text-primary">{payload[0].value}%</div>
    </div>
  );
};

const PostsTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold text-primary">{payload[0].value} publicaciones</div>
    </div>
  );
};

/* ---------------- PDF template (inline styles, light) ---------------- */

const pdfCell: React.CSSProperties = {
  padding: "6px 8px",
  fontSize: 10,
  borderBottom: "1px solid #e5e7eb",
  color: "#111827",
};

const UaemPdf = () => (
  <div
    style={{
      width: 794,
      padding: "32px 40px",
      background: "#ffffff",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#111827",
    }}
  >
    <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#F26A4B", fontWeight: 700 }}>
      Auditoría de redes sociales
    </div>
    <h1 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0 4px" }}>UAEM · Universidad Autónoma del Estado de Morelos</h1>
    <div style={{ fontSize: 12, color: "#6b7280" }}>
      Periodo analizado: agosto 2025 – agosto 2026 (13 meses) · 5 plataformas · 3,171 publicaciones
    </div>

    <h2 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>Cifras destacadas</h2>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {stats.map((s) => (
          <tr key={s.value}>
            <td style={{ ...pdfCell, width: 110, fontWeight: 800, fontSize: 13 }}>{s.value}</td>
            <td style={{ ...pdfCell, color: "#4b5563" }}>{s.label}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>Panorama por plataforma (13 meses)</h2>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f3f4f6" }}>
          {[
            "Plataforma",
            "Seguidores",
            "Publicaciones",
            "Posts/día",
            "Interacciones",
            "Int./post",
            "Int./seguidor",
            "Tasa",
          ].map((h) => (
            <th key={h} style={{ ...pdfCell, fontWeight: 700, textAlign: "left", fontSize: 9 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {platformTable.map((r) => (
          <tr key={r.plataforma}>
            <td style={{ ...pdfCell, fontWeight: 700 }}>{r.plataforma}</td>
            <td style={pdfCell}>{r.seguidores}</td>
            <td style={pdfCell}>{r.publicaciones}</td>
            <td style={pdfCell}>{r.postsDia}</td>
            <td style={pdfCell}>{r.interacciones}</td>
            <td style={pdfCell}>{r.intPost}</td>
            <td style={pdfCell}>{r.intSeguidor}</td>
            <td style={{ ...pdfCell, fontWeight: 700 }}>{r.tasa}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>Volumen mensual de publicaciones</h2>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          {monthlyVolume.map((m) => (
            <td key={m.mes} style={{ ...pdfCell, fontSize: 8, textAlign: "center", color: "#6b7280" }}>
              {m.mes}
            </td>
          ))}
        </tr>
        <tr>
          {monthlyVolume.map((m) => (
            <td key={m.mes} style={{ ...pdfCell, fontSize: 10, textAlign: "center", fontWeight: 700 }}>
              {m.posts}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
    <p style={{ fontSize: 10, color: "#4b5563", marginTop: 8, lineHeight: 1.5 }}>
      La caída pronunciada de marzo a julio 2026 coincide con una coyuntura institucional interna que redujo la
      capacidad de producción de contenido del equipo; agosto 2026 muestra recuperación clara de cadencia.
    </p>

    <div className="pdf-page-break" style={{ pageBreakBefore: "always" }} />

    <h2 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>El contenido con personas gana</h2>
    <p style={{ fontSize: 10.5, color: "#4b5563", lineHeight: 1.6 }}>
      Dentro de la muestra con datos comparables, el contenido que muestra personas reales — estudiantes, autoridades,
      comunidad universitaria — genera 2.6 veces más interacción que el contenido institucional genérico.
    </p>
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <tbody>
        {peopleVsInstitutional.map((p) => (
          <tr key={p.tipo}>
            <td style={pdfCell}>{p.tipo}</td>
            <td style={{ ...pdfCell, fontWeight: 800, width: 80 }}>{p.tasa}%</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>
      Formato de contenido (Facebook, año completo)
    </h2>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {formatData.map((f) => (
          <tr key={f.formato}>
            <td style={pdfCell}>{f.formato}</td>
            <td style={{ ...pdfCell, fontWeight: 800, width: 80 }}>{f.tasa}%</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ fontSize: 10, color: "#4b5563", marginTop: 8, lineHeight: 1.5 }}>
      Reel y video casi duplican la tasa de interacción del post estático, y aun así representan solo el 11% del volumen
      total publicado.
    </p>

    <h2 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>Ejemplos reales</h2>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {examples.map((e) => (
          <tr key={e.liga}>
            <td style={{ ...pdfCell, width: 80, fontWeight: 700 }}>{e.plataforma}</td>
            <td style={{ ...pdfCell, width: 60 }}>{e.formato}</td>
            <td style={{ ...pdfCell, width: 70, color: "#6b7280" }}>{e.fecha}</td>
            <td style={{ ...pdfCell, color: "#4b5563" }}>
              {e.porque}
              <div style={{ fontSize: 8, color: "#F26A4B", wordBreak: "break-all" }}>{e.liga}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <p style={{ fontSize: 11, color: "#111827", marginTop: 20, lineHeight: 1.6, fontWeight: 600 }}>
      Los datos no mienten: el tamaño de audiencia no siempre indica el canal correcto. Auditamos, medimos y priorizamos
      dónde de verdad está la conversación.
    </p>
  </div>
);

/* ---------------- Page ---------------- */

const AuditoriaUAEM = () => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      await html2pdf()
        .set({
          margin: [8, 0, 8, 0],
          filename: "Auditoria_Redes_UAEM_2025-2026.pdf",
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: 794 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], before: [".pdf-page-break"], avoid: ["tr"] },
        } as any)
        .from(pdfRef.current)
        .save();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hidden PDF source */}
      <div style={{ position: "fixed", left: -10000, top: 0, opacity: 0, pointerEvents: "none" }} aria-hidden>
        <div ref={pdfRef}>
          <UaemPdf />
        </div>
      </div>

      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-glow" />
        <div className="container relative mx-auto max-w-5xl px-6 py-14 md:py-20">
          <motion.div {...fadeUp}>
            <div className="mb-6 flex flex-wrap gap-2">
              {["Social Listening", "Auditoría de Redes", "Estrategia de Contenido"].map((t) => (
                <Badge key={t} className="bg-gradient-coral text-primary-foreground">
                  {t}
                </Badge>
              ))}
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Auditoría de Redes Sociales: <span className="text-gradient">UAEM</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              13 meses de datos, 5 plataformas, un hallazgo que cambia la estrategia.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Periodo analizado: agosto 2025 – agosto 2026</p>
          </motion.div>
        </div>
      </section>

      {/* 2. Stat cards */}
      <section className="border-b border-border bg-surface-elevated/40">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.value} className="border-border bg-card p-6">
                <s.icon className="mb-4 h-5 w-5 text-primary" />
                <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Engagement por plataforma */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Tasa de interacción por plataforma</h2>
            <Card className="mt-8 border-border bg-card p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementByPlatform} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="plataforma" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.3)" }} content={<RateTooltip />} />
                    <Bar dataKey="tasa" radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="tasa" position="top" fill="hsl(var(--foreground))" fontSize={11} fontWeight={700} formatter={(v: any) => `${v}%`} />
                      {engagementByPlatform.map((d) => (
                        <Cell key={d.plataforma} fill={d.top ? "hsl(var(--coral))" : "hsl(var(--muted))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 4. Tabla comparativa */}
      <section className="border-b border-border bg-surface-elevated/40">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Panorama por plataforma (13 meses)</h2>
            <Card className="mt-8 overflow-x-auto border-border bg-card">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Plataforma</th>
                    <th className="px-4 py-3 font-semibold">Seguidores</th>
                    <th className="px-4 py-3 font-semibold">Publicaciones</th>
                    <th className="px-4 py-3 font-semibold">Posts/día</th>
                    <th className="px-4 py-3 font-semibold">Interacciones</th>
                    <th className="px-4 py-3 font-semibold">Int./post</th>
                    <th className="px-4 py-3 font-semibold">Int./seguidor</th>
                    <th className="px-4 py-3 font-semibold">Tasa</th>
                  </tr>
                </thead>
                <tbody>
                  {platformTable.map((r) => (
                    <tr key={r.plataforma} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-semibold">
                          <r.icon className="h-4 w-4 text-primary" />
                          {r.plataforma}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.seguidores}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.publicaciones}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.postsDia}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.interacciones}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.intPost}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.intSeguidor}</td>
                      <td className={`px-4 py-3 font-display font-bold ${r.destacada ? "text-gradient" : ""}`}>{r.tasa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 5. Volumen mensual */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Volumen mensual de publicaciones</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="border-border bg-card p-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyVolume} margin={{ top: 16, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip content={<PostsTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="posts"
                        stroke="hsl(var(--coral))"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "hsl(var(--coral))" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="border-border bg-card p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  La caída pronunciada de <span className="font-semibold text-foreground">marzo a julio 2026</span>{" "}
                  coincide con una coyuntura institucional interna que redujo la capacidad de producción de contenido
                  del equipo.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Agosto 2026</span> muestra recuperación clara de
                  cadencia.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Hallazgo */}
      <section className="border-b border-border bg-surface-elevated/40">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">El contenido con personas gana</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card className="border-primary/30 bg-primary/5 p-8">
                <p className="font-display text-xl leading-snug font-bold md:text-2xl">
                  El contenido que muestra personas reales genera 2.6 veces más interacción
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Dentro de la muestra con datos comparables, el contenido que muestra personas reales — estudiantes,
                  autoridades, comunidad universitaria — genera 2.6 veces más interacción que el contenido institucional
                  genérico.
                </p>
              </Card>
              <Card className="border-border bg-card p-6">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peopleVsInstitutional} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="tipo" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.3)" }} content={<RateTooltip />} />
                      <Bar dataKey="tasa" radius={[6, 6, 0, 0]}>
                        <LabelList dataKey="tasa" position="top" fill="hsl(var(--foreground))" fontSize={11} fontWeight={700} formatter={(v: any) => `${v}%`} />
                        {peopleVsInstitutional.map((d) => (
                          <Cell key={d.tipo} fill={d.top ? "hsl(var(--coral))" : "hsl(var(--muted))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. Formato */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Formato de contenido: Reel/Video vs. post estático
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Facebook, año completo</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="border-border bg-card p-6">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatData} margin={{ top: 20, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="formato" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.3)" }} content={<RateTooltip />} />
                      <Bar dataKey="tasa" radius={[6, 6, 0, 0]}>
                        <LabelList dataKey="tasa" position="top" fill="hsl(var(--foreground))" fontSize={11} fontWeight={700} formatter={(v: any) => `${v}%`} />
                        {formatData.map((d) => (
                          <Cell key={d.formato} fill={d.top ? "hsl(var(--coral))" : "hsl(var(--muted))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="border-border bg-card p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Reel y video casi duplican la tasa de interacción del post estático, y aun así representan solo el{" "}
                  <span className="font-semibold text-foreground">11% del volumen total publicado</span>.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. Ejemplos reales */}
      <section className="border-b border-border bg-surface-elevated/40">
        <div className="container mx-auto max-w-5xl px-6 py-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Ejemplos reales — mejores prácticas en acción</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Así se ve en la práctica lo que muestran los datos. Estas son publicaciones reales de la cuenta de UAEM que
              ejemplifican los formatos y el enfoque que mejor funcionan.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {examples.map((e) => (
                <a
                  key={e.liga}
                  href={e.liga}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full"
                >
                  <Card className="flex h-full flex-col border-border bg-card p-6 transition-colors hover:border-primary/50">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">
                        <e.icon className="h-4 w-4 text-primary" />
                        {e.plataforma}
                      </span>
                      <Badge variant="outline">{e.formato}</Badge>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">{e.fecha}</div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/90">{e.porque}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Ver publicación
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Card>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. Conclusión / CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="container relative mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
          <motion.div {...fadeUp}>
            <p className="font-display text-2xl font-bold leading-snug md:text-4xl">
              Los datos no mienten: el tamaño de audiencia no siempre indica el canal correcto.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Auditamos, medimos y priorizamos dónde de verdad está la conversación.
            </p>
            <Button size="lg" className="mt-10" onClick={downloadPdf} disabled={downloading}>
              {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Descarga el reporte en PDF
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AuditoriaUAEM;
