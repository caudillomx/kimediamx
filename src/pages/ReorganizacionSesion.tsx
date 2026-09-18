import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, RefreshCw, Maximize2, ArrowRight, Eraser,
} from "lucide-react";
import {
  LINEAS, LINEA_COLOR, CLIENTES_MATRIZ, CLIENTES_PENDIENTES, MATRIZ_LLENA,
  CRECIMIENTO, CLIENTE_COLOR, CONTENIDO_CARDS, LEADS_DORIA, PROPOSITO_TABLA, PREGUNTAS,
  type LineaKey,
} from "@/data/reorgSesion";

const STORAGE_KEY = "kimedia_reorg_sesion_v1";

/* ---------- utilidades de celdas editables (se llenan en vivo) ---------- */
function useLiveCells() {
  const [cells, setCells] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCells(JSON.parse(raw));
    } catch { /* sin datos previos */ }
  }, []);
  const set = (key: string, value: string) => {
    setCells(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* no disponible */ }
      return next;
    });
  };
  const clear = () => {
    setCells({});
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* no disponible */ }
  };
  return { cells, set, clear };
}

type CellsApi = ReturnType<typeof useLiveCells>;

const Slide = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`min-h-[calc(100vh-72px)] flex flex-col justify-center px-5 sm:px-10 lg:px-16 py-10 ${className}`}>
    <div className="w-full max-w-[1500px] mx-auto">{children}</div>
  </div>
);

const SlideTitle = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <div className="mb-7">
    <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl lg:text-5xl tracking-tight">{children}</h2>
    {sub && <p className="text-muted-foreground mt-2 text-sm sm:text-base">{sub}</p>}
  </div>
);

/* ---------- matriz editable ---------- */
const MatrizEditable = ({ clientes, prefix, api }: { clientes: string[]; prefix: string; api: CellsApi }) => (
  <div className="overflow-x-auto rounded-2xl border border-border bg-card">
    <table className="w-full min-w-[820px] border-collapse">
      <thead>
        <tr>
          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground border-b border-border w-[220px]">Cliente</th>
          {LINEAS.map(l => (
            <th
              key={l.key}
              className="text-left px-4 py-3 text-sm font-semibold border-b border-border"
              style={{ color: l.color }}
            >
              {l.label === "Producción Audiovisual" ? "Audiovisual" : l.label === "Estrategia digital" ? "Estrategia" : l.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {clientes.map(c => (
          <tr key={c}>
            <td className="px-4 py-2.5 text-sm font-medium text-foreground border-b border-border align-middle">{c}</td>
            {LINEAS.map(l => {
              const key = `${prefix}|${c}|${l.key}`;
              return (
                <td key={l.key} className="border-b border-border p-1.5">
                  <input
                    value={api.cells[key] || ""}
                    onChange={e => api.set(key, e.target.value)}
                    className="w-full min-w-[150px] rounded-lg bg-background/60 border px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2"
                    style={{ borderColor: `${l.color}55`, boxShadow: "none" }}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- barras mini lleno/vacío ---------- */
const MiniLineas = ({ celdas }: { celdas: Record<LineaKey, { nivel: 0 | 1 | 2; texto: string }> }) => (
  <div className="space-y-2.5">
    {LINEAS.map(l => {
      const nivel = celdas[l.key].nivel;
      return (
        <div key={l.key} className="flex items-center gap-3">
          <span className="w-[112px] text-xs font-medium" style={{ color: l.color }}>
            {l.label === "Producción Audiovisual" ? "Audiovisual" : l.label === "Estrategia digital" ? "Estrategia" : l.label}
          </span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="h-4 w-8 rounded-sm border"
                style={{
                  backgroundColor: i < (nivel === 2 ? 3 : nivel === 1 ? 2 : 0) ? l.color : "transparent",
                  borderColor: `${l.color}55`,
                }}
              />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const nivelBg = (nivel: 0 | 1 | 2, color: string) =>
  nivel === 2 ? `${color}33` : nivel === 1 ? `${color}1a` : "hsl(var(--muted) / 0.35)";

const ReorganizacionSesion = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [index, setIndex] = useState(0);
  const api = useLiveCells();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCheckingAuth(false);
      if (!session) navigate("/admin/operaciones/login");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCheckingAuth(false);
      if (!session) navigate("/admin/operaciones/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const slidesBase: { titulo: string; render: () => ReactNode }[] = useMemo(() => [
    /* 1 — Portada */
    {
      titulo: "Portada",
      render: () => (
        <Slide className="text-center">
          <p className="text-coral text-sm sm:text-base font-semibold tracking-[0.2em] uppercase">Sesión interna de trabajo</p>
          <h1 className="font-display font-bold text-foreground text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mt-5">
            KiMedia — <span className="text-gradient">Reorganización</span><br className="hidden sm:block" /> por líneas de negocio
          </h1>
          <div className="flex flex-wrap justify-center gap-2.5 mt-10">
            {LINEAS.map(l => (
              <span key={l.key} className="px-4 py-2 rounded-full text-sm font-semibold border"
                style={{ color: l.color, borderColor: `${l.color}66`, backgroundColor: `${l.color}14` }}>
                {l.label}
              </span>
            ))}
          </div>
        </Slide>
      ),
    },
    /* 2 — Diagnóstico */
    {
      titulo: "Diagnóstico",
      render: () => (
        <Slide className="text-center">
          <p className="font-display font-bold text-foreground text-3xl sm:text-5xl lg:text-6xl leading-[1.15] tracking-tight max-w-[1150px] mx-auto">
            Publicamos para abrir conversación, no para llenar parrilla.
          </p>
          <p className="text-muted-foreground text-sm sm:text-base mt-8 max-w-[720px] mx-auto">
            La estrategia se redujo a generación de contenido en redes. Debería incluir también activos digitales, embudo y conversación.
          </p>
        </Slide>
      ),
    },
    /* 3 — Metodología */
    {
      titulo: "Metodología",
      render: () => (
        <Slide>
          <SlideTitle sub="Ya decidida. No está a debate.">La metodología</SlideTitle>
          <div className="flex flex-col lg:flex-row items-stretch gap-3">
            {LINEAS.map((l, i) => (
              <div key={l.key} className="flex items-center gap-3 flex-1">
                <div
                  className="flex-1 rounded-2xl border p-5 min-h-[170px] flex flex-col justify-between"
                  style={{ borderColor: `${l.color}66`, backgroundColor: `${l.color}14` }}
                >
                  <span className="text-xs font-semibold tracking-widest" style={{ color: l.color }}>0{i + 1}</span>
                  <h3 className="font-display font-bold text-foreground text-xl sm:text-2xl mt-2">{l.label}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{l.desc}</p>
                </div>
                {i < LINEAS.length - 1 && (
                  <ArrowRight className="w-7 h-7 shrink-0 text-muted-foreground rotate-90 lg:rotate-0 mx-auto" />
                )}
              </div>
            ))}
          </div>
        </Slide>
      ),
    },
    /* 4 — Matriz en blanco */
    {
      titulo: "Matriz en blanco",
      render: () => (
        <Slide>
          <SlideTitle sub="Cliente × línea de negocio. Se llena en vivo.">Matriz de clientes</SlideTitle>
          <MatrizEditable clientes={CLIENTES_MATRIZ} prefix="m1" api={api} />
        </Slide>
      ),
    },
    /* 5 — Matriz llena */
    {
      titulo: "Matriz: 4 cuentas",
      render: () => (
        <Slide>
          <SlideTitle sub="Verde/lleno = línea fuerte · gris = ausente o débil">Dónde está el hueco</SlideTitle>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground border-b border-border w-[230px]">Cliente</th>
                  {LINEAS.map(l => (
                    <th key={l.key} className="text-left px-4 py-3 text-sm font-semibold border-b border-border" style={{ color: l.color }}>
                      {l.label === "Producción Audiovisual" ? "Audiovisual" : l.label === "Estrategia digital" ? "Estrategia" : l.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIZ_LLENA.map(row => (
                  <tr key={row.cliente}>
                    <td className="px-4 py-4 border-b border-border align-top">
                      <span className="font-display font-bold text-foreground text-lg">{row.cliente}</span>
                      {row.tagline && <p className="text-xs text-coral mt-1 font-medium">{row.tagline}</p>}
                    </td>
                    {LINEAS.map(l => {
                      const celda = row.celdas[l.key];
                      return (
                        <td key={l.key} className="border-b border-border p-1.5 align-top">
                          <div
                            className="rounded-xl px-3 py-3 min-h-[74px] text-sm"
                            style={{
                              backgroundColor: nivelBg(celda.nivel, l.color),
                              color: celda.nivel === 0 ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                            }}
                          >
                            <span className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: l.color }}>
                              {celda.nivel === 2 ? "Fuerte" : celda.nivel === 1 ? "Parcial" : "Vacío"}
                            </span>
                            {celda.texto}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Slide>
      ),
    },
    /* 6 — Números */
    {
      titulo: "Los números",
      render: () => (
        <Slide>
          <SlideTitle sub="Crecimiento absoluto de seguidores, enero – septiembre 2026">Los números no mienten</SlideTitle>
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CRECIMIENTO} margin={{ top: 10, right: 16, left: 0, bottom: 62 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="perfil" angle={-32} textAnchor="end" interval={0} height={70}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }}
                    formatter={(v: number) => [`+${v.toLocaleString("es-MX")}`, "Crecimiento"]}
                  />
                  <Bar dataKey="crecimiento" radius={[6, 6, 0, 0]}>
                    {CRECIMIENTO.map(d => (
                      <Cell key={d.perfil} fill={CLIENTE_COLOR[d.cliente] || "hsl(var(--muted-foreground))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 pt-3 border-t border-border mt-2">
              {Object.entries(CLIENTE_COLOR).map(([cliente, color]) => (
                <span key={cliente} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} /> {cliente}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mt-4">
            {CONTENIDO_CARDS.map(c => (
              <div key={c.cliente} className="rounded-2xl border p-4" style={{ borderColor: `${c.color}55`, backgroundColor: `${c.color}12` }}>
                <h4 className="font-display font-bold text-foreground text-lg">{c.cliente}</h4>
                <p className="text-xs font-semibold mt-0.5" style={{ color: c.color }}>{c.posts} en 2026</p>
                <ul className="mt-2 space-y-1">
                  {c.lineas.map(l => <li key={l} className="text-xs text-muted-foreground">{l}</li>)}
                </ul>
                <p className="text-sm font-semibold text-foreground mt-3">“{c.tagline}”</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-coral/50 bg-coral/10 p-5 sm:p-7 mt-4 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-coral font-semibold">Mario Doria</p>
              <p className="font-display font-bold text-foreground text-5xl sm:text-7xl leading-none mt-1">55.3%</p>
              <p className="text-sm text-muted-foreground mt-3">700 pacientes agendados de 1,265 leads — marzo 2025 a hoy</p>
              <p className="text-sm font-semibold text-foreground mt-4">“Esto es un embudo completo. Con número, no con intuición.”</p>
            </div>
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={LEADS_DORIA} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={1} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                    formatter={(v: number) => [`${v} leads`, ""]}
                  />
                  <Line type="monotone" dataKey="leads" stroke="hsl(var(--coral))" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground text-right">sep 2026 en curso, mes incompleto</p>
            </div>
          </div>
        </Slide>
      ),
    },
    /* 6.5 — Para qué trabajamos */
    {
      titulo: "¿Para qué trabajamos?",
      render: () => (
        <Slide>
          <SlideTitle sub="Objetivo original · Qué espera el cliente · Cómo nos medimos">¿Para qué trabajamos con cada uno?</SlideTitle>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="text-left text-sm font-semibold text-foreground">
                  <th className="px-4 py-3 border-b border-border w-[170px]">Cliente</th>
                  <th className="px-4 py-3 border-b border-border">Objetivo original (ene 2026)</th>
                  <th className="px-4 py-3 border-b border-border">Qué espera el cliente de nosotros</th>
                  <th className="px-4 py-3 border-b border-border">Cómo nos medimos hoy</th>
                </tr>
              </thead>
              <tbody>
                {PROPOSITO_TABLA.map(r => (
                  <tr key={r.cliente}>
                    <td className="px-4 py-3 border-b border-border font-display font-bold text-foreground">{r.cliente}</td>
                    {[r.objetivo, r.espera, r.medimos].map((val, i) => {
                      const alerta = val.trim() === "???";
                      return (
                        <td key={i} className="border-b border-border p-1.5 align-middle">
                          <div
                            className={`rounded-xl px-3 py-3 text-sm ${alerta ? "font-display font-bold text-2xl text-center" : "text-muted-foreground"}`}
                            style={
                              alerta
                                ? { backgroundColor: "hsl(0 84% 60% / 0.22)", color: "hsl(0 84% 68%)", border: "1px solid hsl(0 84% 60% / 0.5)" }
                                : { backgroundColor: "hsl(var(--muted) / 0.4)" }
                            }
                          >
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-display font-bold text-foreground text-2xl sm:text-4xl text-center mt-8">
            De 8 cuentas, 1 sola se mide hasta el final del embudo.
          </p>
        </Slide>
      ),
    },
    /* 7 — Contraste */
    {
      titulo: "Contraste",
      render: () => (
        <Slide>
          <SlideTitle>¿Por qué aquí sí funciona el embudo y aquí no?</SlideTitle>
          <div className="grid gap-4 lg:grid-cols-3">
            {["Falcon", "Mario Doria", "Padre Sada"].map(nombre => {
              const row = MATRIZ_LLENA.find(r => r.cliente === nombre)!;
              return (
                <div key={nombre} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display font-bold text-foreground text-2xl sm:text-3xl mb-5">{nombre}</h3>
                  <MiniLineas celdas={row.celdas} />
                  {row.tagline && <p className="text-sm font-semibold text-coral mt-5">“{row.tagline}”</p>}
                </div>
              );
            })}
          </div>
        </Slide>
      ),
    },
    /* 8 — Preguntas */
    {
      titulo: "Preguntas",
      render: () => (
        <Slide>
          <SlideTitle>Preguntas para cada línea</SlideTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {PREGUNTAS.map(q => {
              const linea = LINEAS.find(l => l.key === q.linea)!;
              return (
                <div key={q.linea} className="rounded-2xl border p-6"
                  style={{ borderColor: `${linea.color}66`, backgroundColor: `${linea.color}14` }}>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: linea.color }}>{linea.label}</span>
                  <p className="font-display font-bold text-foreground text-xl sm:text-2xl lg:text-3xl leading-snug mt-3">{q.texto}</p>
                </div>
              );
            })}
          </div>
        </Slide>
      ),
    },
    /* 9 — Matriz completa */
    {
      titulo: "Matriz completa",
      render: () => (
        <Slide>
          <SlideTitle sub="Cuentas pendientes de definir">Matriz completa — la llenamos juntos</SlideTitle>
          <MatrizEditable clientes={CLIENTES_PENDIENTES} prefix="m2" api={api} />
        </Slide>
      ),
    },
    /* 10 — Cierre */
    {
      titulo: "Lo que cambia mañana",
      render: () => (
        <Slide>
          <SlideTitle>Lo que cambia mañana</SlideTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {LINEAS.map(l => (
              <div key={l.key} className="rounded-2xl border p-6"
                style={{ borderColor: `${l.color}66`, backgroundColor: `${l.color}14` }}>
                <h3 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: l.color }}>{l.label}</h3>
                <div className="mt-5 space-y-4">
                  {(["deja", "empieza"] as const).map(campo => (
                    <div key={campo}>
                      <label className="text-sm font-semibold text-foreground">
                        {campo === "deja" ? "Deja de" : "Empieza a"}
                      </label>
                      <input
                        value={api.cells[`cierre|${l.key}|${campo}`] || ""}
                        onChange={e => api.set(`cierre|${l.key}|${campo}`, e.target.value)}
                        placeholder="___________"
                        className="w-full mt-1.5 rounded-lg bg-background/60 border px-3 py-3 text-base text-foreground outline-none"
                        style={{ borderColor: `${l.color}55` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Slide>
      ),
    },
  ], [api]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight" || e.key === " ") setIndex(i => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-coral animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10">
        <motion.div key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {slides[index].render()}
        </motion.div>

        {/* Barra de navegación */}
        <div className="sticky bottom-0 z-20 border-t border-border bg-card/90 backdrop-blur">
          <div className="max-w-[1500px] mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/operaciones")}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Operaciones
            </Button>
            <div className="flex-1 min-w-[80px] text-center text-xs text-muted-foreground truncate">
              {index + 1} / {slides.length} · {slides[index].titulo}
            </div>
            <Button variant="ghost" size="sm" onClick={api.clear} title="Borrar lo escrito en vivo">
              <Eraser className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => document.documentElement.requestFullscreen?.()}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => setIndex(i => i - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="bg-gradient-coral text-primary-foreground font-semibold"
              disabled={index === slides.length - 1}
              onClick={() => setIndex(i => i + 1)}
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReorganizacionSesion;
