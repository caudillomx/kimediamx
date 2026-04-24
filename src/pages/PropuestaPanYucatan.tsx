import { useEffect, useState, type FormEvent } from "react";

const STORAGE_KEY = "propuesta_pan_yucatan_access";
const VALID_NAME = "pilar santos";
const VALID_PASS = "pan2026";

const colors = {
  bg: "#0b0c10",
  surface: "#13141a",
  surface2: "#1c1d26",
  blue: "#00c2ff",
  orange: "#ff6b35",
  gold: "#f5c842",
  text: "#e8eaf0",
  muted: "#8a8f9c",
  border: "#2a2c38",
};

const fontHead = "'Syne', system-ui, sans-serif";
const fontBody = "'DM Sans', system-ui, sans-serif";

const PropuestaPanYucatan = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    const prevTitle = document.title;
    document.title = "KiMedia — Propuesta Confidencial · PAN Yucatán";
    return () => {
      document.head.removeChild(link);
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
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: colors.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: fontBody,
          color: colors.text,
          zIndex: 9999,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 440,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: 36,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.blue,
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            KiMedia — Propuesta Confidencial
          </div>
          <h1
            style={{
              fontFamily: fontHead,
              fontWeight: 800,
              fontSize: 28,
              lineHeight: 1.15,
              margin: "0 0 12px",
            }}
          >
            Acceso restringido a destinataria
          </h1>
          <p style={{ color: colors.muted, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
            Este documento es de uso exclusivo. Ingresa tu nombre y clave de acceso para continuar.
          </p>

          <label style={{ display: "block", fontSize: 12, color: colors.muted, marginBottom: 6 }}>
            Nombre completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: colors.surface2,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              color: colors.text,
              fontSize: 14,
              fontFamily: fontBody,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", fontSize: 12, color: colors.muted, marginBottom: 6 }}>
            Clave de acceso
          </label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: colors.surface2,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              color: colors.text,
              fontSize: 14,
              fontFamily: fontBody,
              marginBottom: 20,
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div
              style={{
                background: "rgba(255,107,53,0.1)",
                border: `1px solid ${colors.orange}`,
                color: colors.orange,
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px 18px",
              background: colors.blue,
              color: colors.bg,
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: fontBody,
              cursor: "pointer",
              letterSpacing: 0.3,
            }}
          >
            Ingresar al documento
          </button>
        </form>
      </div>
    );
  }

  const logistics = [
    { label: "Fecha", value: "Por confirmar" },
    { label: "Sede", value: "Mérida, Yucatán" },
    { label: "Horario", value: "10:00 – 12:00 hrs" },
    { label: "Duración", value: "2 horas" },
    { label: "Asistentes", value: "Hasta 25 personas" },
    { label: "Modalidad", value: "Presencial · interactiva" },
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

  return (
    <div style={{ background: colors.bg, color: colors.text, fontFamily: fontBody, minHeight: "100vh" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* HEADER */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            paddingBottom: 28,
            borderBottom: `1px solid ${colors.border}`,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 380px" }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: colors.blue,
                marginBottom: 14,
                fontWeight: 600,
              }}
            >
              KiMedia · Propuesta de Taller
            </div>
            <h1
              style={{
                fontFamily: fontHead,
                fontWeight: 800,
                fontSize: 38,
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              Comunicación Política e Inteligencia Artificial
              <span style={{ color: colors.orange }}> Vol. 1</span>
            </h1>
          </div>
          <div style={{ fontSize: 12, color: colors.muted, lineHeight: 1.9, textAlign: "right", minWidth: 200 }}>
            <div>Por confirmar</div>
            <div>Mérida, Yucatán</div>
            <div>10:00 – 12:00 hrs</div>
            <div>Duración: 2 hrs</div>
            <div>Hasta 25 asistentes</div>
            <div
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "4px 10px",
                background: "rgba(245,200,66,0.12)",
                color: colors.gold,
                borderRadius: 4,
                fontSize: 10,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Confidencial
            </div>
          </div>
        </header>

        {/* ATTN */}
        <div
          style={{
            borderLeft: `3px solid ${colors.blue}`,
            padding: "14px 20px",
            background: colors.surface,
            marginBottom: 36,
            borderRadius: "0 8px 8px 0",
          }}
        >
          <div style={{ fontSize: 11, color: colors.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
            Presentado a
          </div>
          <div style={{ fontFamily: fontHead, fontWeight: 700, fontSize: 20 }}>Pilar Santos</div>
          <div style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
            Secretaria de Mujeres · PAN Yucatán
          </div>
        </div>

        {/* INTRO */}
        <p style={{ fontSize: 16, lineHeight: 1.7, color: colors.text, marginBottom: 48 }}>
          Esta propuesta presenta un taller intensivo diseñado específicamente para el equipo de la Secretaría
          de Mujeres del PAN Yucatán. Su objetivo es fortalecer las capacidades de comunicación política del
          equipo a través del uso aplicado de inteligencia artificial, con un enfoque editorial, ético y con
          perspectiva de género. El resultado: vocerías más claras, contenido más estratégico y herramientas
          listas para operar en campaña.
        </p>

        {/* LOGISTICS GRID */}
        <SectionTitle>Logística</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginBottom: 56,
          }}
        >
          {logistics.map((item) => (
            <div
              key={item.label}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                padding: "18px 20px",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* STRUCTURE */}
        <SectionTitle>Estructura del taller</SectionTitle>
        <div style={{ marginBottom: 24 }}>
          {moments.map((m, i) => (
            <div
              key={m.n}
              style={{
                display: "flex",
                gap: 20,
                padding: "20px 0",
                borderBottom: i < moments.length - 1 ? `1px solid ${colors.border}` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: fontHead,
                  fontWeight: 800,
                  fontSize: 28,
                  color: colors.blue,
                  minWidth: 50,
                  lineHeight: 1,
                }}
              >
                {m.n}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                  <div style={{ fontFamily: fontHead, fontWeight: 700, fontSize: 18 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: colors.orange, fontWeight: 600, whiteSpace: "nowrap" }}>{m.time}</div>
                </div>
                <div style={{ fontSize: 14, color: colors.muted, lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            marginBottom: 56,
            padding: "14px 18px",
            background: "rgba(0,194,255,0.06)",
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 13,
            color: colors.muted,
          }}
        >
          <strong style={{ color: colors.text }}>Cierre · 10 min</strong> — Síntesis colectiva, plan de
          acción individual y entrega de credenciales al tablero digital.
        </div>

        {/* DIGITAL TOOL */}
        <SectionTitle>Herramienta digital del taller</SectionTitle>
        <p style={{ fontSize: 14, color: colors.muted, marginBottom: 20, lineHeight: 1.7 }}>
          Cada asistente recibe acceso a un tablero web con cuatro módulos diseñados para acompañar el taller
          y permitir uso continuo después de la sesión.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
            marginBottom: 56,
          }}
        >
          {moments.map((m) => (
            <div
              key={m.n}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: 20,
                minHeight: 130,
              }}
            >
              <div style={{ fontSize: 11, color: colors.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
                MÓDULO {m.n}
              </div>
              <div style={{ fontFamily: fontHead, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                {m.title}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>

        {/* ABOUT KIMEDIA */}
        <SectionTitle>Sobre KiMedia</SectionTitle>
        <p style={{ fontSize: 14, color: colors.muted, marginBottom: 20, lineHeight: 1.7 }}>
          Casa de comunicación estratégica que combina narrativa editorial, inteligencia artificial y
          producción de contenido para liderazgos políticos, marcas e instituciones.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 56,
          }}
        >
          {skills.map((s) => (
            <div
              key={s}
              style={{
                padding: "10px 16px",
                background: colors.surface2,
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* ANTECEDENTES */}
        <div
          style={{
            borderLeft: `3px solid ${colors.gold}`,
            padding: "18px 22px",
            background: colors.surface,
            borderRadius: "0 8px 8px 0",
            marginBottom: 56,
          }}
        >
          <div style={{ fontSize: 11, color: colors.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
            Antecedentes
          </div>
          <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.7, margin: 0 }}>
            KiMedia ha desarrollado talleres similares para liderazgos del PAN en distintos estados. La
            edición más reciente se llevó a cabo en <strong>Tequila, Jalisco el 18 de febrero de 2026</strong>,
            con resultados de alta satisfacción y aplicación inmediata por parte de las y los asistentes.
          </p>
        </div>

        {/* INVESTMENT */}
        <SectionTitle>Inversión</SectionTitle>
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: 28,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 22 }}>
            <div style={{ fontFamily: fontHead, fontWeight: 800, fontSize: 40, color: colors.orange, lineHeight: 1 }}>
              $50,000
            </div>
            <div style={{ fontSize: 14, color: colors.muted, fontWeight: 600 }}>MXN + IVA</div>
          </div>
          <div style={{ fontSize: 12, color: colors.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14, fontWeight: 600 }}>
            Incluye
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {[
              "Diseño y facilitación del taller (2 horas)",
              "Acceso al tablero digital con 4 módulos para cada asistente",
              "Material editorial y guía de vocería personalizada",
              "Sesión de seguimiento remota a los 15 días",
              "Reporte ejecutivo de aprendizajes y recomendaciones",
            ].map((item) => (
              <li
                key={item}
                style={{
                  fontSize: 14,
                  padding: "10px 0",
                  borderBottom: `1px solid ${colors.border}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ color: colors.blue, fontWeight: 700 }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* VIGENCIA */}
        <div
          style={{
            padding: "16px 20px",
            background: colors.surface2,
            borderRadius: 8,
            fontSize: 13,
            color: colors.muted,
            marginBottom: 56,
          }}
        >
          <strong style={{ color: colors.text }}>Vigencia:</strong> Esta propuesta tiene una validez de
          10 días naturales a partir de su recepción.
        </div>

        {/* SIGNATURE */}
        <div
          style={{
            paddingTop: 32,
            borderTop: `1px solid ${colors.border}`,
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ fontFamily: fontHead, fontWeight: 700, fontSize: 18, color: colors.text }}>
            Jesús Caudillo
          </div>
          <div style={{ color: colors.muted }}>Director Ejecutivo · KiMedia</div>
          <div style={{ color: colors.muted, marginTop: 6 }}>
            hola@kimedia.mx · kimediamx.com
          </div>
        </div>
      </div>

      {/* PRINT BUTTON */}
      <button
        className="no-print"
        onClick={() => window.print()}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          padding: "14px 22px",
          background: colors.blue,
          color: colors.bg,
          border: "none",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: fontBody,
          cursor: "pointer",
          letterSpacing: 0.3,
          boxShadow: "0 8px 24px rgba(0,194,255,0.35)",
          zIndex: 100,
        }}
      >
        Descargar PDF
      </button>
    </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: fontHead,
      fontWeight: 700,
      fontSize: 22,
      margin: "0 0 20px",
      letterSpacing: -0.3,
    }}
  >
    {children}
  </h2>
);

export default PropuestaPanYucatan;