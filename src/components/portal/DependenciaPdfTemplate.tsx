import { forwardRef } from "react";
import type { DeltaLine } from "@/lib/dependenciaDeltas";


/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type DepAccountRow = {
  perfil: string;
  red: string;
  tipo: string; // institucional | titular
  seguidores: number | null;
  crecimiento: number | null; // rate
  engagement: number | null;  // rate
  postsDia: number | null;
  publicaciones?: number | null;
  sinDatos?: boolean;
};

export type DepPostRow = {
  perfil: string;
  red: string;
  fecha: string | null;
  texto: string;
  interacciones: number;
};

export type DepPressRow = {
  fecha: string;
  medio: string;
  titular: string;
  tono: string;
  url: string;
  cita?: string;
  canal?: string;
  /** Nombre (titular o dependencia) que originó la coincidencia; sirve como evidencia. */
  match?: string;
};

export type ScopeKey = "institucional" | "titular";

export type ScopeBlock = {
  key: ScopeKey;
  label: string;      // "Cuentas de la dependencia" / "Cuentas del titular"
  sujeto: string;     // nombre de la dependencia o del titular
  cuentas: DepAccountRow[];
  seguidores: number;
  engagement: number | null;
  postsDia: number | null;
  publicaciones: number;
  variacionSeguidores: number | null;
  rank: number | null;
  rankTotal: number;
  promedioGabinete: number | null;
  topPosts: DepPostRow[];
  narrativas: { name: string; description?: string }[];
  narrativasFuentes: string[];
  prensa: DepPressRow[];
  prensaTotal: number;
  prensaTono: { positivo: number; neutral: number; negativo: number };
  prensaMedios: { medio: string; n: number }[];
  /** Frases de "lo que cambió" contra el corte anterior. */
  cambios?: DeltaLine[];
};

export type DepRecomendacion = { accion: string; porque: string; prioridad?: string };


export type DependenciaReportData = {
  dependencia: string;
  tipo: string | null;
  titular: string | null;
  titularCargo: string | null;
  periodoLabel: string;
  modo: "combinado" | "institucional" | "titular";
  enfoqueLabel: string;
  bloques: ScopeBlock[];
  conjunto?: {
    seguidores: number;
    engagement: number | null;
    postsDia: number | null;
    prensaTotal: number;
    variacionSeguidores: number | null;
    rank: number | null;
    rankTotal: number;
  } | null;
  /** Recomendaciones generadas con IA a partir del corte y la prensa del periodo. */
  recomendaciones?: { lectura?: string; items: DepRecomendacion[] } | null;
};


export type GabineteRankRow = {
  nombre: string;
  seguidores: number | null;
  engagement: number | null;
  publicaciones: number | null;
  cuentas: number;
  /** Variación de audiencia calculada sólo con las cuentas presentes en ambos cortes. */
  deltaSeguidores: number | null;
  deltaEngagement: number | null;
  /** Lugar en el corte anterior dentro de su misma categoría de tamaño. */
  lugarPrevio: number | null;
  comparable: boolean;
};

export type GabineteMoveRow = { nombre: string; delta: number; base: number; detalle: string; tipo?: "institucional" | "titular" };

export type GabineteTier = { label: string; nota: string; rows: GabineteRankRow[] };

export type GabineteTitularRow = {
  nombre: string;
  dependencia: string;
  seguidores: number | null;
  engagement: number | null;
  publicaciones: number | null;
  cuentas: number;
  deltaSeguidores: number | null;
  comparable: boolean;
};

export type GabineteTitularTier = { label: string; nota: string; rows: GabineteTitularRow[] };

export type GabineteReportData = {
  periodoLabel: string;
  dependencias: number;
  cuentas: number;
  seguidoresTotales: number;
  publicacionesTotales: number | null;
  /** Interacción del gabinete ponderada por audiencia (no promedio simple). */
  interaccionPonderada: number | null;
  interaccionMediana: number | null;
  ranking: GabineteRankRow[];
  tiers: GabineteTier[];
  /** Cuentas personales de los titulares, en bloque breve. */
  titulares?: GabineteTitularRow[];
  titularesInteraccion?: number | null;
  /** Desglose institucional vs. titulares para los indicadores de portada. */
  titularesConDatos?: number;
  cuentasTitulares?: number;
  seguidoresTitulares?: number;
  publicacionesTitulares?: number | null;
  titularTiers?: GabineteTitularTier[];
  suben: GabineteMoveRow[];
  bajan: GabineteMoveRow[];
  sinDatos: string[];
  comparables: number;
  nota: string;

  /** Interpretación generada con IA a partir de este mismo corte. */
  interpretacion?: {
    lectura?: string;
    hallazgos?: { titulo: string; que_pasa: string; por_que_importa: string }[];
    recomendaciones?: DepRecomendacion[];
  } | null;

};


/* ------------------------------------------------------------------ */
/* Paleta y helpers                                                    */
/* ------------------------------------------------------------------ */

const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

const SCOPE = {
  institucional: { main: "#1d4ed8", soft: "#eff6ff", border: "#bfdbfe", tag: "Institución" },
  titular:       { main: "#be123c", soft: "#fff1f2", border: "#fecdd3", tag: "Titular" },
  conjunto:      { main: "#0f172a", soft: "#f1f5f9", border: "#cbd5e1", tag: "Conjunto" },
} as const;

const TONE_COLOR: Record<string, string> = {
  positivo: "#059669", neutral: "#64748b", negativo: "#dc2626", crisis: "#991b1b",
};

const nf = (n: number | null | undefined, d = 0) =>
  n == null || !Number.isFinite(Number(n)) ? "s/d" : Number(n).toLocaleString("es-MX", { maximumFractionDigits: d });
const pf = (n: number | null | undefined, d = 2) =>
  n == null || !Number.isFinite(Number(n)) ? "s/d" : `${(Number(n) * 100).toFixed(d)}%`;
const df = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? "s/d" : `${Number(n) >= 0 ? "+" : ""}${(Number(n) * 100).toFixed(1)}%`;
const deltaColor = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? MUTED : Number(n) >= 0 ? "#059669" : "#dc2626";

const page: React.CSSProperties = {
  width: 794,
  boxSizing: "border-box",
  padding: "16px 42px 8px",
  background: "#ffffff",
  color: INK,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 10.5,
  lineHeight: 1.45,
};

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#ffffff",
  padding: "5px 6px",
};
const td: React.CSSProperties = {
  padding: "4px 6px",
  borderBottom: `1px solid #f1f5f9`,
  verticalAlign: "top",
};

/** html2canvas no rasteriza emojis: se eliminan para evitar cadenas de "?". */
export function stripEmoji(text: string): string {
  return (text ?? "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{20E3}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\?{2,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function SectionTitle({ text, color = INK, hint }: { text: string; color?: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 4, height: 13, background: color, borderRadius: 2, display: "inline-block" }} />
        <span style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: INK, fontWeight: 700 }}>
          {text}
        </span>
      </div>
      {hint && <div style={{ fontSize: 8.8, color: "#94a3b8", marginTop: 3, marginLeft: 11 }}>{hint}</div>}
    </div>
  );
}

function Kpi({ label, value, foot, color, footColor, explain }: {
  label: string; value: string; foot?: string; color: string; footColor?: string; explain?: string;
}) {
  return (
    <div style={{ minWidth: 0, boxSizing: "border-box", border: `1px solid ${LINE}`, borderTop: `3px solid ${color}`, borderRadius: 8, padding: "7px 9px", background: "#ffffff", overflow: "hidden" }}>
      <div style={{ fontSize: 8.2, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, lineHeight: 1.25, overflowWrap: "anywhere" }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, marginTop: 1, color: INK }}>{value}</div>
      {foot && <div style={{ fontSize: 8.6, color: footColor ?? MUTED, marginTop: 1, lineHeight: 1.25, overflowWrap: "anywhere" }}>{foot}</div>}
      {explain && (
        <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 3, lineHeight: 1.3, borderTop: `1px dashed ${LINE}`, paddingTop: 3 }}>
          {explain}
        </div>
      )}
    </div>
  );
}

function PdfLabel({ text, color }: { text: string; color: string }) {
  const normalized = text.toUpperCase();
  const widths: Record<string, number> = {
    "INSTITUCIÓN": 82,
    "TITULAR": 59,
    "CONJUNTO": 69,
    "DEPENDENCIA + TITULAR": 142,
    "SOLO INSTITUCIONAL": 127,
    "SOLO TITULAR": 88,
  };
  const width = widths[normalized] ?? Math.max(62, normalized.length * 6.2 + 20);
  return (
    <svg
      width={width}
      height="24"
      viewBox={`0 0 ${width} 24`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={text}
      style={{ display: "block", width, height: 24, overflow: "visible", flexShrink: 0 }}
    >
      <rect x="0" y="0" width={width} height="24" rx="4" fill={color} />
      <text
        x="10"
        y="15.5"
        fill="#ffffff"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0"
      >
        {normalized}
      </text>
    </svg>
  );
}

function ScopeChip({ scope }: { scope: ScopeKey | "conjunto" }) {
  const s = SCOPE[scope];
  return <PdfLabel text={s.tag} color={s.main} />;
}

/** Bloque didáctico: explica qué es una sección y por qué importa. */
function Explainer({ text, color }: { text: string; color: string }) {
  return (
    <div style={{
      background: "#f8fafc", borderLeft: `3px solid ${color}`, borderRadius: "0 6px 6px 0",
      padding: "5px 8px", marginBottom: 6, fontSize: 8.8, color: "#475569", lineHeight: 1.4,
    }}>
      {text}
    </div>
  );
}

const DIR_COLOR: Record<string, string> = { up: "#059669", down: "#dc2626", flat: MUTED };
const DIR_MARK: Record<string, string> = { up: "▲", down: "▼", flat: "=" };

/** "Lo que cambió": comparativo contra el corte anterior, en frases cortas. */
function CambiosBlock({ cambios, color, scope }: { cambios: DeltaLine[]; color: string; scope: ScopeKey }) {
  return (
    <div className="pdf-avoid" style={{ marginBottom: 10 }}>
      <SectionTitle
        text="Lo que cambió frente al corte anterior"
        color={color}
        hint="Comparativo directo contra el periodo inmediato anterior. Solo aparecen los indicadores con dato en ambos cortes."
      />
      {cambios.length === 0 ? (
        <div style={{ color: MUTED, fontSize: 10 }}>
          Primer corte con datos comparables para {scope === "titular" ? "el titular" : "la dependencia"}: aún no hay periodo previo con el que contrastar.
        </div>
      ) : (
        <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, overflow: "hidden" }}>
          {cambios.map((c, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "16px 108px minmax(0, 1fr)", gap: 8, alignItems: "start",
              padding: "5px 9px", background: i % 2 ? "#f8fafc" : "#ffffff",
              borderTop: i ? `1px solid ${LINE}` : undefined, fontSize: 9.6,
            }}>
              <span style={{ color: DIR_COLOR[c.dir], fontWeight: 700, fontSize: 9 }}>{DIR_MARK[c.dir]}</span>
              <span style={{ fontWeight: 700, color: INK, overflowWrap: "anywhere" }}>{c.label}</span>
              <span style={{ color: "#334155", overflowWrap: "anywhere" }}>{c.texto}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** "Qué hacer ahora": recomendaciones accionables generadas del corte y la prensa. */
function RecomendacionesBlock({ data }: { data: { lectura?: string; items: DepRecomendacion[] } }) {
  if (!data.items?.length) return null;
  return (
    <div style={{ marginTop: 4, marginBottom: 10 }}>
      <SectionTitle
        text="Qué hacer ahora"
        color={SCOPE.conjunto.main}
        hint="Acciones sugeridas a partir de los cambios del periodo, el contenido publicado y las menciones de prensa detectadas."
      />
      {data.lectura && (
        <Explainer color={SCOPE.conjunto.main} text={stripEmoji(data.lectura)} />
      )}
      {data.items.slice(0, 5).map((r, i) => (
        <div className="pdf-avoid" key={i} style={{
          border: `1px solid ${LINE}`,
          borderLeft: `3px solid ${r.prioridad === "alta" ? SCOPE.titular.main : SCOPE.institucional.main}`,
          borderRadius: 7, padding: "6px 9px", marginBottom: 5, background: "#ffffff",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 10.2, fontWeight: 700, color: INK, overflowWrap: "anywhere" }}>
              {i + 1}. {stripEmoji(r.accion)}
            </div>
            {r.prioridad && (
              <span style={{
                fontSize: 8.2, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                color: r.prioridad === "alta" ? SCOPE.titular.main : SCOPE.institucional.main, whiteSpace: "nowrap",
              }}>
                {r.prioridad}
              </span>
            )}
          </div>
          <div style={{ fontSize: 9.4, color: "#475569", marginTop: 2, overflowWrap: "anywhere" }}>
            <b style={{ color: MUTED }}>Porque:</b> {stripEmoji(r.porque)}
          </div>
        </div>
      ))}
    </div>
  );
}



const GLOSARIO: { termino: string; que: string; porque: string }[] = [
  {
    termino: "Seguidores",
    que: "Total de personas suscritas a las cuentas consideradas, sumando todas las redes.",
    porque: "Es el alcance potencial: cuánta gente puede recibir un mensaje sin pagar publicidad.",
  },
  {
    termino: "Crecimiento por día (Crec./día)",
    que: "Porcentaje promedio diario en que aumenta o disminuye la base de seguidores.",
    porque: "Muestra si la audiencia se está construyendo de forma sostenida, más allá de picos aislados.",
  },
  {
    termino: "Interacción (engagement)",
    que: "Reacciones, comentarios y compartidos divididos entre los seguidores de la cuenta.",
    porque: "Mide calidad, no tamaño: una cuenta pequeña con alta interacción comunica mejor que una grande e inerte. Referencia sana en gobierno: 0.5%–2%.",
  },
  {
    termino: "Publicaciones por día (Pub./día)",
    que: "Ritmo de publicación promedio en el periodo.",
    porque: "Permite ver si la baja interacción viene de poco contenido o de contenido poco relevante.",
  },
  {
    termino: "Posición en el gabinete",
    que: "Lugar que ocupa la cuenta al ordenar a todas las dependencias (o titulares) por interacción.",
    porque: "Da contexto: compara contra pares con condiciones similares, no contra marcas comerciales.",
  },
  {
    termino: "Menciones de prensa y tono",
    que: "Notas de medios monitoreados en el periodo, clasificadas como positiva, neutral o negativa.",
    porque: "Es la conversación que no controlamos; el tono anticipa riesgos reputacionales y temas por atender.",
  },
  {
    termino: "Narrativas / territorios",
    que: "Temas recurrentes detectados en las publicaciones propias del periodo.",
    porque: "Revelan de qué se habla realmente y si la agenda pública prioritaria está siendo comunicada.",
  },
  {
    termino: "s/d",
    que: "Sin dato: la red social no reportó esa métrica en el periodo consultado.",
    porque: "No significa cero; significa que el dato no está disponible y no debe interpretarse como caída.",
  },
];

function Glosario() {
  return (
    <div className="pdf-page-break" style={{
      marginTop: 0,
      paddingTop: 4,
      pageBreakBefore: "always",
      breakBefore: "page",
    }}>
      <SectionTitle
        text="Glosario: cómo leer estos indicadores"
        color={SCOPE.conjunto.main}
        hint="Referencia rápida de los términos técnicos usados en el reporte y de por qué importan para la toma de decisiones."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {GLOSARIO.map((g, i) => (
          <div className="pdf-avoid" key={i} style={{
            border: `1px solid ${LINE}`, borderRadius: 7, padding: "6px 8px", background: "#ffffff",
          }}>
            <div style={{ fontSize: 9.6, fontWeight: 700, color: INK }}>{g.termino}</div>
            <div style={{ fontSize: 8.8, color: "#475569", marginTop: 1 }}>{g.que}</div>
            <div style={{ fontSize: 8.8, color: MUTED, marginTop: 2 }}>
              <b style={{ color: SCOPE.institucional.main }}>Por qué importa:</b> {g.porque}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Header({ title, subtitle, periodo, scope }: {
  title: string; subtitle?: string | null; periodo: string; scope?: string;
}) {
  return (
    <div className="pdf-avoid" style={{ borderBottom: `2px solid ${INK}`, paddingBottom: 10, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
            Reporte de comunicación digital
          </div>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: "4px 0 2px", lineHeight: 1.2, overflowWrap: "anywhere" }}>{title}</h1>
          {subtitle && <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.3, overflowWrap: "anywhere" }}>{subtitle}</div>}
          <div style={{ color: MUTED, fontSize: 10.5, marginTop: 3 }}>{periodo}</div>
          {scope && (
            <div style={{ marginTop: 6 }}>
              <PdfLabel text={scope} color={INK} />
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, fontSize: 8.5, color: "#94a3b8" }}>
            {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="pdf-avoid" style={{ marginTop: 10, paddingTop: 6, borderTop: `1px solid ${LINE}` }} />
  );
}

/* ------------------------------------------------------------------ */
/* Bloque por ámbito (institución o titular)                           */
/* ------------------------------------------------------------------ */

function BlockSection({ b, compacto }: { b: ScopeBlock; compacto: boolean }) {
  const s = SCOPE[b.key];
  const maxCuentas = compacto ? 6 : 12;
  const maxNarr = compacto ? 2 : 4;
  const maxPosts = compacto ? 2 : 3;
  const maxPrensa = compacto ? 5 : 8;
  const cuentasActivas = b.cuentas.filter((c) => !c.sinDatos);
  const cuentasInactivas = b.cuentas.filter((c) => c.sinDatos);

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Encabezado del bloque */}
      <div className="pdf-avoid" style={{
        background: s.soft, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.main}`,
        borderRadius: 8, padding: "9px 10px", marginBottom: 8,
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "start", columnGap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "max-content minmax(0, 1fr)", alignItems: "center", columnGap: 9, minWidth: 0 }}>
            <div><ScopeChip scope={b.key} /></div>
            <div style={{ minWidth: 0, fontSize: 12.5, fontWeight: 700, lineHeight: "17px", overflowWrap: "anywhere" }}>{b.label}</div>
          </div>
          <div style={{ fontSize: 9.5, color: "#475569", marginTop: 5, lineHeight: "14px", overflowWrap: "anywhere" }}>{b.sujeto}</div>
        </div>
        <div style={{ maxWidth: 205, fontSize: 8.8, color: MUTED, textAlign: "right", lineHeight: 1.3, overflowWrap: "anywhere" }}>
          {b.cuentas.length} cuenta{b.cuentas.length === 1 ? "" : "s"}<br />{b.publicaciones} publicaciones en el periodo
        </div>
      </div>

      <Explainer
        color={s.main}
        text={
          b.key === "titular"
            ? "Este bloque mide la voz personal del titular: sus cuentas propias, lo que publica y cómo la prensa lo menciona por nombre. Sirve para evaluar liderazgo y vocería."
            : "Este bloque mide la voz institucional de la dependencia: cuentas oficiales, contenido publicado y cobertura de prensa a nombre de la institución. Sirve para evaluar la comunicación de la política pública."
        }
      />

      {/* KPIs del bloque */}
      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
        <Kpi label="Seguidores" value={nf(b.seguidores)} color={s.main}
             foot={`${df(b.variacionSeguidores)} vs periodo previo`} footColor={deltaColor(b.variacionSeguidores)}
             explain="Audiencia propia acumulada: a cuánta gente se puede llegar sin pagar pauta." />
        <Kpi label="Interacción" value={pf(b.engagement)} color={s.main}
             foot={`Promedio gabinete: ${pf(b.promedioGabinete)}`}
             explain="Reacciones + comentarios + compartidos entre seguidores. Mide relevancia del contenido, no tamaño." />
        <Kpi label="Posición en el gabinete" value={b.rank ? `#${b.rank}` : "s/d"} color={s.main}
             foot={`de ${b.rankTotal} ${b.key === "titular" ? "titulares" : "dependencias"}`}
             explain="Lugar al ordenar por interacción a todos los pares del gabinete en el mismo periodo." />
        <Kpi label="Menciones de prensa" value={String(b.prensaTotal)} color={s.main}
             foot={`${b.prensaTono.positivo} pos · ${b.prensaTono.neutral} neu · ${b.prensaTono.negativo} neg`}
             explain="Cobertura de medios monitoreados. El tono anticipa riesgos y temas que requieren respuesta." />
      </div>

      {/* Lo que cambió */}
      <CambiosBlock cambios={b.cambios ?? []} color={s.main} scope={b.key} />

      {/* Cuentas */}

      <div className="pdf-avoid" style={{ marginBottom: 10 }}>
        <SectionTitle
          text={b.key === "titular" ? "Cuentas del titular" : "Cuentas institucionales"}
          color={s.main}
          hint="Crec./día = crecimiento promedio diario de seguidores. Pub./día = publicaciones por día. “s/d” = la red no reportó el dato en el periodo."
        />
        {cuentasActivas.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>Sin cuentas con actividad en el periodo.</div>
        ) : (
          <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", border: `1px solid ${LINE}`, borderRadius: 6, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: s.main }}>
                <th style={{ ...th, width: "24%" }}>Perfil</th>
                <th style={{ ...th, width: "12%" }}>Red</th>
                <th style={{ ...th, textAlign: "right" }}>Seguidores</th>
                <th style={{ ...th, textAlign: "right" }}>Crec./día</th>
                <th style={{ ...th, textAlign: "right" }}>Interacción</th>
                <th style={{ ...th, textAlign: "right" }}>Pub.</th>
                <th style={{ ...th, textAlign: "right" }}>Pub./día</th>
              </tr>
            </thead>
            <tbody>
              {cuentasActivas.slice(0, maxCuentas).map((c, i) => (
                <tr key={i} style={{ background: i % 2 ? "#f8fafc" : "#ffffff" }}>
                  <td style={{ ...td, fontWeight: 600, overflowWrap: "anywhere" }}>{c.perfil}</td>
                  <td style={{ ...td, textTransform: "capitalize", overflowWrap: "anywhere" }}>{c.red}</td>
                  <td style={{ ...td, textAlign: "right" }}>{nf(c.seguidores)}</td>
                  <td style={{ ...td, textAlign: "right", color: deltaColor(c.crecimiento) }}>{pf(c.crecimiento, 3)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{pf(c.engagement)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{c.publicaciones == null ? "s/d" : nf(c.publicaciones)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{nf(c.postsDia, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {cuentasInactivas.length > 0 && (
          <div style={{ fontSize: 8.8, color: "#94a3b8", marginTop: 4 }}>
            Sin actividad ni datos en el periodo: {cuentasInactivas.map((c) => `${c.perfil} (${c.red})`).join(", ")}.
          </div>
        )}
      </div>

      {/* Narrativas */}
      <div className="pdf-avoid" style={{ marginBottom: 10 }}>
        <SectionTitle
          text={b.key === "titular" ? "De qué habla el titular en sus redes" : "De qué habla la dependencia en sus redes"}
          color={s.main}
          hint={`Temas recurrentes de las publicaciones propias del periodo${b.narrativasFuentes.length ? ` (${b.narrativasFuentes.slice(0, 3).join(", ")})` : ""}. Describen el contenido publicado, no son recomendaciones.`}
        />
        {b.narrativas.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>
            Aún no hay análisis de narrativas para estas cuentas en el periodo.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {b.narrativas.slice(0, maxNarr).map((n, i) => (
              <div key={i} style={{ background: s.soft, border: `1px solid ${s.border}`, borderRadius: 8, padding: "7px 9px" }}>
                <div style={{ fontWeight: 700, fontSize: 10.5, color: s.main }}>{n.name}</div>
                {n.description && <div style={{ fontSize: 9.5, color: "#475569", marginTop: 1 }}>{n.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top posts */}
      <div style={{ marginBottom: 10 }}>
        <SectionTitle
          text={b.key === "titular" ? "Publicaciones del titular con mayor interacción" : "Publicaciones institucionales con mayor interacción"}
          color={s.main}
          hint="Contenido con más reacciones, comentarios y compartidos del periodo. Indica qué mensajes conectaron con la audiencia y conviene replicar."
        />
        {b.topPosts.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>Sin publicaciones registradas en el periodo.</div>
        ) : (
          b.topPosts.slice(0, maxPosts).map((p, i) => (
            <div className="pdf-avoid" key={i} style={{
              border: `1px solid ${LINE}`, borderLeft: `3px solid ${s.main}`, borderRadius: 7,
              padding: "6px 9px", marginBottom: 5, background: "#ffffff",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 9.2, color: MUTED }}>
                <span style={{ fontWeight: 600, color: s.main }}>{p.perfil} · {p.red}</span>
                <span>
                  {p.fecha ? new Date(p.fecha).toLocaleDateString("es-MX") : ""} ·{" "}
                  <b style={{ color: INK }}>{nf(p.interacciones)}</b> interacciones
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 9.8 }}>{stripEmoji(p.texto).slice(0, 190)}{stripEmoji(p.texto).length > 190 ? "…" : ""}</div>
            </div>
          ))
        )}
      </div>

      {/* Prensa */}
      <div>
        <SectionTitle
          text={b.key === "titular" ? "Menciones de prensa del titular" : "Menciones de prensa de la dependencia"}
          color={s.main}
          hint={
            b.prensaTotal > 0
              ? `${b.prensaTotal} menciones · ${b.prensaTono.positivo} positivas, ${b.prensaTono.neutral} neutrales, ${b.prensaTono.negativo} negativas.${
                  b.prensaMedios.length ? ` Medios más activos: ${b.prensaMedios.slice(0, 3).map((m) => `${m.medio} (${m.n})`).join(", ")}.` : ""
                }`
              : undefined
          }
        />
        {b.prensa.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>
            Sin menciones registradas en el periodo para {b.key === "titular" ? "el titular" : "la dependencia"}.
          </div>
        ) : (
          b.prensa.slice(0, maxPrensa).map((m, i) => (
            <div className="pdf-avoid" key={i} style={{
              border: `1px solid ${LINE}`, borderLeft: `3px solid ${TONE_COLOR[m.tono] ?? MUTED}`,
              borderRadius: 7, padding: "6px 9px", marginBottom: 5, background: "#ffffff",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, fontSize: 9, color: MUTED }}>
                <span>{m.fecha} · {m.medio}{m.canal && m.canal !== "medios" ? ` · ${m.canal}` : ""}</span>
                <span style={{
                  color: TONE_COLOR[m.tono] ?? MUTED, textTransform: "uppercase", fontWeight: 700,
                  fontSize: 8.5, letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {m.tono}
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 10.2, fontWeight: 600, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                {stripEmoji(m.titular).slice(0, 130) || "(sin titular)"}{stripEmoji(m.titular).length > 130 ? "…" : ""}
              </div>
              {m.cita && (
                <div style={{ marginTop: 2, fontSize: 9.4, color: "#475569", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                  “{stripEmoji(m.cita).slice(0, 180)}{stripEmoji(m.cita).length > 180 ? "…" : ""}”
                </div>
              )}
              {m.match && (
                <div style={{ marginTop: 3, fontSize: 8.4, color: "#94a3b8" }}>
                  Vinculada por coincidencia con: {m.match}
                </div>
              )}
            </div>
          ))
        )}
        {b.prensaTotal > Math.min(b.prensa.length, maxPrensa) && (
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>
            Se muestran {Math.min(b.prensa.length, maxPrensa)} de {b.prensaTotal} menciones. La lista completa está en la descarga de Excel.
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reporte de dependencia                                              */
/* ------------------------------------------------------------------ */

export const DependenciaPdfTemplate = forwardRef<HTMLDivElement, { data: DependenciaReportData | null }>(({ data }, ref) => {
  if (!data) return <div ref={ref} style={page} />;
  const combinado = data.modo === "combinado";
  const c = data.conjunto;

  return (
    <div ref={ref} style={page}>
      <Header
        title={data.dependencia}
        subtitle={
          data.modo === "titular"
            ? (data.titular ? `${data.titular}${data.titularCargo ? ` · ${data.titularCargo}` : ""}` : data.tipo)
            : data.modo === "institucional"
              ? (data.tipo ?? "Cuentas institucionales")
              : (data.titular ? `${data.titular}${data.titularCargo ? ` · ${data.titularCargo}` : ""}` : data.tipo)
        }
        periodo={data.periodoLabel}
        scope={data.enfoqueLabel}
      />

      {/* Cómo leer el reporte */}
      <div className="pdf-avoid" style={{
        border: `1px solid ${LINE}`, borderRadius: 8, background: "#f8fafc",
        padding: "7px 10px", marginBottom: 12, fontSize: 9.3, color: "#475569",
      }}>
        {combinado ? (
          <>
            <b>Cómo leer este reporte.</b> Incluye dos bloques independientes: en <span style={{ color: SCOPE.institucional.main, fontWeight: 700 }}>azul</span> lo que corresponde a las cuentas
            institucionales de la dependencia y en <span style={{ color: SCOPE.titular.main, fontWeight: 700 }}>rojo</span> lo que corresponde a las cuentas personales del titular.
            Cada bloque tiene sus propios indicadores, cuentas, narrativas, publicaciones y menciones de prensa; el resumen conjunto de abajo suma ambos.
            Cada indicador incluye una nota que explica qué mide y por qué importa, y al final encontrará un glosario con los términos técnicos.
          </>
        ) : data.modo === "titular" ? (
          <>
            <b>Cómo leer este reporte.</b> Considera únicamente las cuentas personales del titular
            {data.titular ? ` (${data.titular})` : ""}. Los indicadores institucionales de la dependencia no se incluyen y la posición se compara contra el resto de titulares del gabinete.
          </>
        ) : (
          <>
            <b>Cómo leer este reporte.</b> Considera únicamente las cuentas institucionales de la dependencia. Las cuentas personales del titular quedan fuera y la
            posición se compara contra el resto de dependencias.
          </>
        )}
      </div>

      {/* Resumen conjunto solo en modo combinado */}
      {combinado && c && (
        <div className="pdf-avoid" style={{ marginBottom: 14 }}>
          <SectionTitle text="Resumen conjunto (institución + titular)" color={SCOPE.conjunto.main} />
          <Explainer
            color={SCOPE.conjunto.main}
            text="Suma de la comunicación institucional y la del titular. Es la fotografía general del esfuerzo comunicativo de la dependencia; el detalle por ámbito se desglosa en los bloques siguientes."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <Kpi label="Seguidores totales" value={nf(c.seguidores)} color={INK}
                 foot={`${df(c.variacionSeguidores)} vs periodo previo`} footColor={deltaColor(c.variacionSeguidores)}
                 explain="Audiencia sumada de cuentas institucionales y del titular." />
            <Kpi label="Interacción promedio" value={pf(c.engagement)} color={INK} foot="Promedio de todas las cuentas"
                 explain="Qué tanto responde la gente al contenido publicado por ambos ámbitos." />
            <Kpi label="Posición combinada" value={c.rank ? `#${c.rank}` : "s/d"} color={INK} foot={`de ${c.rankTotal} dependencias`}
                 explain="Lugar frente al resto del gabinete considerando ambos ámbitos." />
            <Kpi label="Menciones de prensa" value={String(c.prensaTotal)} color={INK} foot="Dependencia y titular"
                 explain="Notas de medios del periodo que aluden a la institución o a su titular." />
          </div>
        </div>
      )}

      {data.bloques.map((b) => (
        <BlockSection key={b.key} b={b} compacto={combinado} />
      ))}

      {data.recomendaciones && <RecomendacionesBlock data={data.recomendaciones} />}

      <Glosario />


      <Footer />
    </div>
  );
});
DependenciaPdfTemplate.displayName = "DependenciaPdfTemplate";

/* ------------------------------------------------------------------ */
/* Reporte de gabinete                                                 */
/* ------------------------------------------------------------------ */

function MoveList({ rows, color, titulo, hint }: { rows: GabineteMoveRow[]; color: string; titulo: string; hint: string }) {
  return (
    <div className="pdf-avoid">
      <SectionTitle text={titulo} color={color} hint={hint} />
      {rows.length === 0 ? (
        <div style={{ color: MUTED, fontSize: 9.5 }}>Sin movimientos relevantes en el corte.</div>
      ) : rows.map((r, i) => (
        <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{r.nombre}</span>
            <span style={{ color, fontWeight: 700 }}>{df(r.delta)}</span>
          </div>
          <div style={{ fontSize: 8.6, color: MUTED }}>{r.detalle}</div>
        </div>
      ))}
    </div>
  );
}

function TitularTable({ rows }: { rows: GabineteTitularRow[] }) {
  const color = SCOPE.titular.main;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${LINE}`, marginBottom: 6 }}>
      <thead>
        <tr style={{ background: color }}>
          <th style={{ ...th, width: 24 }}>#</th>
          <th style={th}>Titular</th>
          <th style={{ ...th, textAlign: "right", width: 66 }}>Seguidores</th>
          <th style={{ ...th, textAlign: "right", width: 62 }}>Var. audiencia</th>
          <th style={{ ...th, textAlign: "right", width: 58 }}>Interacción</th>
          <th style={{ ...th, textAlign: "right", width: 48 }}>Publicac.</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ background: i % 2 ? "#fff7f8" : "#ffffff" }}>
            <td style={{ ...td, fontWeight: 700, color: MUTED }}>{i + 1}</td>
            <td style={td}>
              {r.nombre}
              <span style={{ color: "#94a3b8", fontSize: 8.4 }}> · {r.dependencia}</span>
            </td>
            <td style={{ ...td, textAlign: "right" }}>{nf(r.seguidores)}</td>
            <td style={{ ...td, textAlign: "right", color: r.comparable ? deltaColor(r.deltaSeguidores) : MUTED }}>
              {r.comparable ? df(r.deltaSeguidores) : "nuevo"}
            </td>
            <td style={{ ...td, textAlign: "right" }}>{pf(r.engagement)}</td>
            <td style={{ ...td, textAlign: "right" }}>{r.publicaciones == null ? "s/d" : nf(r.publicaciones)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RankTable({ rows, color, mostrarLugarPrevio, indiceInicial = 0, ocultarEncabezado, continua }: {
  rows: GabineteRankRow[]; color: string; mostrarLugarPrevio?: boolean; indiceInicial?: number; ocultarEncabezado?: boolean; continua?: boolean;
}) {
  return (
    <table style={{
      width: "100%", borderCollapse: "collapse", border: `1px solid ${LINE}`,
      borderTop: ocultarEncabezado ? "none" : `1px solid ${LINE}`,
      borderBottom: continua ? "none" : `1px solid ${LINE}`, marginBottom: continua ? 0 : 10,
    }}>
      {!ocultarEncabezado && (
        <thead>
          <tr style={{ background: color }}>
            <th style={{ ...th, width: 24 }}>#</th>
            <th style={th}>Dependencia</th>
            <th style={{ ...th, textAlign: "right", width: 66 }}>Seguidores</th>
            <th style={{ ...th, textAlign: "right", width: 62 }}>Var. audiencia</th>
            <th style={{ ...th, textAlign: "right", width: 58 }}>Interacción</th>
            <th style={{ ...th, textAlign: "right", width: 48 }}>Publicac.</th>
            {mostrarLugarPrevio && <th style={{ ...th, textAlign: "right", width: 46 }}>Lugar previo</th>}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ background: (i + indiceInicial) % 2 ? "#f8fafc" : "#ffffff" }}>
            <td style={{ ...td, fontWeight: 700, color: MUTED }}>{i + indiceInicial + 1}</td>

            <td style={td}>
              {r.nombre}
              <span style={{ color: "#94a3b8", fontSize: 8.4 }}> · {r.cuentas} cuenta{r.cuentas === 1 ? "" : "s"}</span>
            </td>
            <td style={{ ...td, textAlign: "right" }}>{nf(r.seguidores)}</td>
            <td style={{ ...td, textAlign: "right", color: r.comparable ? deltaColor(r.deltaSeguidores) : MUTED }}>
              {r.comparable ? df(r.deltaSeguidores) : "nuevo"}
            </td>
            <td style={{ ...td, textAlign: "right" }}>{pf(r.engagement)}</td>
            <td style={{ ...td, textAlign: "right" }}>{r.publicaciones == null ? "s/d" : nf(r.publicaciones)}</td>
            {mostrarLugarPrevio && (
              <td style={{ ...td, textAlign: "right", color: MUTED }}>{r.lugarPrevio ? `#${r.lugarPrevio}` : "—"}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const GabinetePdfTemplate = forwardRef<HTMLDivElement, { data: GabineteReportData | null; portalName: string }>(({ data, portalName }, ref) => {
  if (!data) return <div ref={ref} style={page} />;
  
  return (
    <div ref={ref} style={page}>
      <Header title={portalName} subtitle="Panorama de comunicación digital del gabinete" periodo={data.periodoLabel} />

      {(() => {
        const tit = data.titulares ?? [];
        const hayTitulares = tit.length > 0;
        const segTit = data.seguidoresTitulares ?? 0;
        const segInst = Math.max(0, data.seguidoresTotales - segTit);
        const pubTit = data.publicacionesTitulares ?? null;
        const pubInst = data.publicacionesTotales == null ? null : Math.max(0, data.publicacionesTotales - (pubTit ?? 0));
        return (
          <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: `repeat(${hayTitulares ? 5 : 4}, 1fr)`, gap: 8, marginBottom: 12 }}>
            <Kpi label="Dependencias con datos" value={String(data.dependencias)} color={SCOPE.institucional.main}
                 foot={`${Math.max(0, data.cuentas - (data.cuentasTitulares ?? 0))} cuentas institucionales`}
                 explain="Sólo se cuentan dependencias con al menos una cuenta institucional con datos en el corte." />
            {hayTitulares && (
              <Kpi label="Titulares con datos" value={String(data.titularesConDatos ?? tit.length)} color={SCOPE.titular.main}
                   foot={`${data.cuentasTitulares ?? 0} cuentas personales`}
                   explain="Funcionarios con al menos una cuenta personal medida en el corte." />
            )}
            <Kpi label="Audiencia del gabinete" value={nf(data.seguidoresTotales)} color={SCOPE.conjunto.main}
                 foot={hayTitulares ? `Instituciones ${nf(segInst)} · Titulares ${nf(segTit)}` : "Seguidores sumados sin duplicar cuentas"}
                 explain="Cada cuenta se cuenta una sola vez, aunque aparezca en varias cargas del mes." />
            <Kpi label="Interacción del gabinete" value={pf(data.interaccionPonderada)} color={SCOPE.titular.main}
                 foot={hayTitulares && data.titularesInteraccion != null
                   ? `Instituciones ${pf(data.interaccionPonderada)} · Titulares ${pf(data.titularesInteraccion)}`
                   : `Mediana por dependencia: ${pf(data.interaccionMediana)}`}
                 explain="Ponderada por audiencia: las cuentas grandes pesan más que las pequeñas." />
            <Kpi label="Publicaciones del periodo" value={data.publicacionesTotales == null ? "s/d" : nf(data.publicacionesTotales)}
                 color={INK}
                 foot={hayTitulares && pubInst != null ? `Instituciones ${nf(pubInst)} · Titulares ${pubTit == null ? "s/d" : nf(pubTit)}` : "Contenido publicado por el gabinete"}
                 explain="Publicaciones registradas en el corte, sin duplicados entre cargas." />
          </div>
        );
      })()}

      <div className="pdf-avoid" style={{
        border: `1px solid ${LINE}`, borderLeft: `3px solid ${SCOPE.institucional.main}`,
        borderRadius: 6, padding: "7px 10px", marginBottom: 14, fontSize: 9, color: MUTED, background: "#f8fafc",
      }}>
        <strong style={{ color: INK }}>Cómo leer este reporte. </strong>
        El panorama separa dos ámbitos: las <b style={{ color: SCOPE.institucional.main }}>cuentas institucionales</b> de cada dependencia y las{" "}
        <b style={{ color: SCOPE.titular.main }}>cuentas personales de los titulares</b>. Cada indicador y cada tabla indica a cuál de los dos corresponde;
        cuando la cifra es del conjunto, el desglose aparece debajo del número. {data.nota}
      </div>


      {data.interpretacion?.lectura && (
        <div className="pdf-avoid" style={{ marginBottom: 14 }}>
          <SectionTitle text="Qué significa este corte" color={SCOPE.conjunto.main}
                        hint="Interpretación de las cifras del periodo: qué está pasando y por qué importa." />
          <Explainer color={SCOPE.conjunto.main} text={stripEmoji(data.interpretacion.lectura)} />
          {(data.interpretacion.hallazgos ?? []).slice(0, 4).map((h, i) => (
            <div className="pdf-avoid" key={i} style={{
              border: `1px solid ${LINE}`, borderLeft: `3px solid ${SCOPE.conjunto.main}`,
              borderRadius: 7, padding: "6px 9px", marginBottom: 5, background: "#ffffff",
            }}>
              <div style={{ fontSize: 10.2, fontWeight: 700, color: INK, overflowWrap: "anywhere" }}>
                {i + 1}. {stripEmoji(h.titulo)}
              </div>
              <div style={{ fontSize: 9.4, color: "#475569", marginTop: 2, overflowWrap: "anywhere" }}>
                {stripEmoji(h.que_pasa)}
              </div>
              <div style={{ fontSize: 9.4, color: "#334155", marginTop: 2, overflowWrap: "anywhere" }}>
                <b style={{ color: MUTED }}>Por qué importa:</b> {stripEmoji(h.por_que_importa)}
              </div>
            </div>
          ))}
        </div>
      )}


      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <MoveList rows={data.suben} color="#059669" titulo="Quién creció" hint="Dependencias y titulares; sólo variaciones reales, comparando las mismas cuentas" />
        <MoveList rows={data.bajan} color="#dc2626" titulo="Quién retrocedió" hint="Dependencias y titulares con caídas de audiencia frente al corte anterior" />
      </div>

      <div className="pdf-avoid" style={{ marginBottom: 4 }}>
        <SectionTitle text="Dependencias por tamaño de audiencia" color={SCOPE.institucional.main}
                      hint="Cuentas institucionales, agrupadas para comparar entre iguales." />
      </div>
      {data.tiers.map((t) => (
        <div className="pdf-avoid" key={t.label} style={{ marginBottom: 12 }}>
          <SectionTitle text={t.label} color={SCOPE.institucional.main}
                        hint={t.rows.length > 5 ? `${t.nota} · se muestran las 5 primeras de ${t.rows.length}` : t.nota} />
          <RankTable rows={t.rows.slice(0, 5)} color={SCOPE.institucional.main} mostrarLugarPrevio />
        </div>
      ))}

      {(data.titularTiers ?? []).length > 0 && (
        <>
          <div className="pdf-avoid" style={{ marginBottom: 4 }}>
            <SectionTitle text="Titulares por tamaño de audiencia" color={SCOPE.titular.main}
                          hint={`Cuentas personales de los funcionarios${data.titularesInteraccion != null ? ` · interacción ponderada ${pf(data.titularesInteraccion)}` : ""}`} />
          </div>
          {(data.titularTiers ?? []).map((t) => (
            <div className="pdf-avoid" key={t.label} style={{ marginBottom: 12 }}>
              <SectionTitle text={t.label} color={SCOPE.titular.main}
                            hint={t.rows.length > 5 ? `${t.nota} · se muestran los 5 primeros de ${t.rows.length}` : t.nota} />
              <TitularTable rows={t.rows.slice(0, 5)} />
            </div>
          ))}
        </>
      )}



      {data.sinDatos.length > 0 && (
        <div className="pdf-avoid" style={{ marginTop: 8, fontSize: 8.8, color: MUTED }}>
          <strong style={{ color: INK }}>Sin datos en este corte: </strong>{data.sinDatos.join(" · ")}
        </div>
      )}

      {(data.interpretacion?.recomendaciones ?? []).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <RecomendacionesBlock data={{ items: data.interpretacion!.recomendaciones! }} />
        </div>
      )}

      <Footer />

    </div>
  );

});
GabinetePdfTemplate.displayName = "GabinetePdfTemplate";
