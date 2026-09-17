import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ChevronLeft, Filter, Target, ClipboardCopy, Users } from "lucide-react";
import { toast } from "sonner";
import { JUNTA_EMBUDO_MAPA as MAPA, ESTADO_LABEL, type FunnelKey } from "@/data/juntaEmbudoMapa";

type Tab = "mapa" | "embudo" | "reflexion";
const STORAGE_KEY = "kimedia_junta_embudo_reflexion_v1";

type Reflexion = Record<string, Partial<Record<FunnelKey, string>>>;

const JuntaEmbudo = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tab, setTab] = useState<Tab>("mapa");
  const [estado, setEstado] = useState<string>("activo");
  const [clienteId, setClienteId] = useState<string>(MAPA.clientes[0]?.id ?? "");
  const [reflexion, setReflexion] = useState<Reflexion>({});

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReflexion(JSON.parse(raw));
    } catch { /* sin datos previos */ }
  }, []);

  const saveReflexion = (next: Reflexion) => {
    setReflexion(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* almacenamiento no disponible */ }
  };

  const clientes = useMemo(
    () => (estado === "todos" ? MAPA.clientes : MAPA.clientes.filter(c => c.estado === estado)),
    [estado]
  );

  const cliente = MAPA.clientes.find(c => c.id === clienteId);

  const setCampo = (etapa: FunnelKey, value: string) => {
    if (!cliente) return;
    saveReflexion({ ...reflexion, [cliente.id]: { ...(reflexion[cliente.id] || {}), [etapa]: value } });
  };

  const copiarResumen = async () => {
    if (!cliente) return;
    const lineas = [
      `${cliente.nombre} — reflexión de embudo (${MAPA.fecha_objetivo})`,
      `Acción final: ${cliente.accion_final}`,
      "",
      ...MAPA.funnel.map(e => {
        const hoy = cliente.funnel_hoy[e.id] || "—";
        const deberia = reflexion[cliente.id]?.[e.id]?.trim() || "(pendiente)";
        return `${e.nombre}\n  Hoy: ${hoy}\n  Deberíamos: ${deberia}`;
      }),
      "",
      cliente.hueco_tipico ? `Hueco típico: ${cliente.hueco_tipico}` : "",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lineas.join("\n"));
      toast.success("Resumen copiado");
    } catch {
      toast.error("No se pudo copiar; selecciona el texto manualmente");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-coral animate-spin" />
      </div>
    );
  }

  const TABS: { value: Tab; label: string; icon: any }[] = [
    { value: "mapa", label: "Mapa", icon: Users },
    { value: "embudo", label: "Embudo", icon: Filter },
    { value: "reflexion", label: "Reflexión", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/operaciones")}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Operaciones
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {MAPA.titulo.replace("KiMedia — ", "")} <span className="text-gradient">KiMedia</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Uso interno · junta del {MAPA.fecha_objetivo}</p>
        </motion.div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground">{MAPA.doctrina}</p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {MAPA.doctrina_puntos.map(p => (
              <li key={p} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-coral">•</span>{p}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.value ? "border-coral text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "mapa" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["todos", ...MAPA.filtros_estado].map(f => (
                <button
                  key={f}
                  onClick={() => setEstado(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    estado === f
                      ? "bg-gradient-coral text-primary-foreground border-transparent"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {f === "todos" ? "Todos" : ESTADO_LABEL[f] ?? f}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{MAPA.secundarios_nota}</p>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {clientes.map(c => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-foreground">{c.nombre}</h3>
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {ESTADO_LABEL[c.estado] ?? c.estado}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground"><strong className="text-foreground">Dueño:</strong> {c.dueno}</p>
                  <p className="text-xs text-muted-foreground"><strong className="text-foreground">Qué hacemos:</strong> {c.que_hacemos}</p>
                  <p className="text-xs text-coral"><strong>Acción final:</strong> {c.accion_final}</p>
                  {c.canales?.length ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.canales.map(ch => (
                        <span key={ch} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{ch}</span>
                      ))}
                    </div>
                  ) : null}
                  {c.hueco_tipico && (
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
                      <strong className="text-foreground">Hueco:</strong> {c.hueco_tipico}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs px-0 h-7 text-coral"
                    onClick={() => { setClienteId(c.id); setTab("reflexion"); }}
                  >
                    Reflexionar este cliente →
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "embudo" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {MAPA.funnel.map((e, i) => (
                <div key={e.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-coral text-primary-foreground text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                    <h3 className="font-display font-semibold text-foreground">{e.nombre}</h3>
                  </div>
                  <p className="text-xs text-coral mt-2">Métricas: {e.metricas}</p>
                  <p className="text-xs text-muted-foreground mt-1">{e.nota}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-display font-semibold text-foreground mb-2">Reglas de la casa</h3>
                <ul className="space-y-1.5">
                  {MAPA.reglas.map(r => (
                    <li key={r} className="text-xs text-muted-foreground flex gap-2"><span className="text-coral">•</span>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-display font-semibold text-foreground mb-2">Equipo</h3>
                <ul className="space-y-1.5">
                  {MAPA.equipo.map(m => (
                    <li key={m.nombre} className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{m.nombre}:</strong> {m.rol}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "reflexion" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="w-[260px] bg-card border-border"><SelectValue placeholder="Cliente" /></SelectTrigger>
                <SelectContent>
                  {MAPA.clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={copiarResumen} className="bg-gradient-coral text-primary-foreground font-semibold">
                <ClipboardCopy className="w-4 h-4 mr-1.5" /> Copiar resumen
              </Button>
            </div>

            {cliente && (
              <>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Acción final:</strong> {cliente.accion_final}
                  {cliente.hint_deberiamos && <> · <span className="text-coral">Pista: {cliente.hint_deberiamos}</span></>}
                </p>
                <div className="space-y-3">
                  {MAPA.funnel.map(e => (
                    <div key={e.id} className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{e.nombre}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{e.metricas}</p>
                        <div className="mt-2 rounded-lg bg-secondary p-2.5 text-xs text-muted-foreground">
                          <span className="text-foreground font-medium">Hoy: </span>
                          {cliente.funnel_hoy[e.id] || "—"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground">Deberíamos</label>
                        <Textarea
                          value={reflexion[cliente.id]?.[e.id] || ""}
                          onChange={ev => setCampo(e.id, ev.target.value)}
                          placeholder={cliente.hint_deberiamos || "¿Qué conversación abrimos y con qué métrica la medimos?"}
                          className="mt-1 bg-background border-border min-h-[76px] text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JuntaEmbudo;
