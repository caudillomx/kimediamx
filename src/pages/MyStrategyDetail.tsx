// Simplified version of ContentCycleDetail for external users
// Only shows: Insumos + Parrilla generation + Download
// No analytics, no ads

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  useContentEngine, useContentCycles, useContentPieces,
  useContentInputs, ContentProfile, ContentPiece, ContentInput,
} from "@/hooks/useContentEngine";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Sparkles, Check, X, Download,
  Calendar, Sun, Moon, LogOut,
  Type, Trash2, Edit3, CheckCircle2, Circle, Clock,
  Package, Copy, Hash,
} from "lucide-react";
import kimediaLogo from "@/assets/kimedia-logo.png";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pendiente: { color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", icon: Clock, label: "Pendiente" },
  aprobada: { color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: CheckCircle2, label: "Aprobada" },
  rechazada: { color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30", icon: X, label: "Rechazada" },
  ejecutada: { color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30", icon: Sparkles, label: "Lista" },
};

const NETWORK_CONFIG: Record<string, { emoji: string; color: string }> = {
  Instagram: { emoji: "📸", color: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30" },
  Facebook: { emoji: "📘", color: "bg-blue-600/15 text-blue-600 dark:text-blue-400 border-blue-600/30" },
  X: { emoji: "𝕏", color: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/30" },
  LinkedIn: { emoji: "💼", color: "bg-blue-700/15 text-blue-700 dark:text-blue-300 border-blue-700/30" },
  TikTok: { emoji: "🎵", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
};

const INPUT_TYPES = [
  { value: "articulo", label: "Artículo", icon: "📄" },
  { value: "historia", label: "Historia / Caso", icon: "📖" },
  { value: "url", label: "URL / Enlace", icon: "🔗" },
  { value: "texto", label: "Texto libre", icon: "✍️" },
  { value: "notas", label: "Notas", icon: "📝" },
  { value: "referencia", label: "Referencia", icon: "🖼️" },
];

const FLOW_STEPS = [
  { key: "insumos", label: "Insumos", icon: Package, description: "Materiales base" },
  { key: "parrilla", label: "Parrilla", icon: Calendar, description: "Tu contenido" },
];

const MyStrategyDetail = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { profiles } = useContentEngine();
  const { cycles, fetchCycles, createCycle } = useContentCycles(profileId || "");
  const { isDark, toggle: toggleTheme } = useThemeToggle();
  const [session, setSession] = useState<any>(null);
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState("insumos");
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [newCycleTitle, setNewCycleTitle] = useState("");

  const profile = profiles.find(p => p.id === profileId);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (!s) navigate("/registro");
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) navigate("/registro");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (cycles.length > 0 && !selectedCycle) {
      setSelectedCycle(cycles[0].id);
    }
  }, [cycles, selectedCycle]);

  const handleCreateCycle = async () => {
    if (!newCycleTitle || !profileId) return;
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    await createCycle({
      profile_id: profileId,
      title: newCycleTitle,
      cycle_type: "mensual",
      start_date: now.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    });
    setShowNewCycle(false);
    setNewCycleTitle("");
  };

  const exportCSV = (pieces: ContentPiece[]) => {
    const headers = ["Fecha", "Red", "Formato", "Pilar", "Copy", "CTA", "Hashtags", "Prompt Diseño"];
    const rows = pieces.map(p => [
      p.scheduled_date || "", p.network, p.format, p.pillar || "",
      (p.final_copy || p.draft_copy || "").replace(/"/g, '""'),
      p.cta || "", (p.hashtags || []).join(" "), (p.design_prompt || "").replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parrilla-${profile?.client_name || "contenido"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Parrilla descargada como CSV");
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Perfil no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/mi-estrategia")} className="text-muted-foreground rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">{profile.client_name}</h1>
              <p className="text-xs text-muted-foreground">{profile.industry} · {profile.brand_tone}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground rounded-xl">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>

        {/* Cycle selector */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {cycles.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCycle(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCycle === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.title}
            </button>
          ))}
          <Button size="sm" variant="outline" onClick={() => setShowNewCycle(true)} className="rounded-xl shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Nuevo ciclo
          </Button>
        </div>

        {/* Step navigation */}
        <div className="flex gap-2">
          {FLOW_STEPS.map(step => (
            <button
              key={step.key}
              onClick={() => setActiveStep(step.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeStep === step.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <step.icon className="w-4 h-4" />
              {step.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        {selectedCycle ? (
          <AnimatePresence mode="wait">
            {activeStep === "insumos" && (
              <InputsSection key="insumos" cycleId={selectedCycle} />
            )}
            {activeStep === "parrilla" && (
              <GridSection key="parrilla" cycleId={selectedCycle} profileId={profileId!} profile={profile} onExport={exportCSV} />
            )}
          </AnimatePresence>
        ) : (
          <Card className="p-12 text-center bg-card border-border border-dashed">
            <p className="text-muted-foreground mb-4">Crea tu primer ciclo de contenido para comenzar</p>
            <Button onClick={() => setShowNewCycle(true)} className="bg-gradient-coral text-primary-foreground rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" /> Crear primer ciclo
            </Button>
          </Card>
        )}
      </div>

      {/* New Cycle Dialog */}
      <Dialog open={showNewCycle} onOpenChange={setShowNewCycle}>
        <DialogContent className="max-w-sm bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">Nuevo Ciclo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Nombre del ciclo</Label>
              <Input value={newCycleTitle} onChange={e => setNewCycleTitle(e.target.value)}
                placeholder="Ej: Marzo 2026" className="bg-secondary border-border rounded-xl mt-1" />
            </div>
            <Button onClick={handleCreateCycle} disabled={!newCycleTitle}
              className="w-full bg-gradient-coral text-primary-foreground rounded-xl">
              Crear ciclo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Inputs Section ─────────────────────────────────
function InputsSection({ cycleId }: { cycleId: string }) {
  const { inputs, fetchInputs, addInput, removeInput } = useContentInputs(cycleId);
  const [showAdd, setShowAdd] = useState(false);
  const [inputType, setInputType] = useState("texto");
  const [inputTitle, setInputTitle] = useState("");
  const [inputContent, setInputContent] = useState("");

  const handleAdd = async () => {
    if (!inputTitle) return;
    await addInput({ cycle_id: cycleId, input_type: inputType, title: inputTitle, content: inputContent });
    setShowAdd(false);
    setInputTitle("");
    setInputContent("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-foreground">Insumos</h3>
        <Button size="sm" onClick={() => setShowAdd(true)} className="bg-gradient-coral text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Agregar
        </Button>
      </div>

      {inputs.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border border-dashed">
          <p className="text-muted-foreground text-sm mb-3">Agrega artículos, historias, URLs o notas como base para tu parrilla</p>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-1" /> Primer insumo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {inputs.map(inp => {
            const typeInfo = INPUT_TYPES.find(t => t.value === inp.input_type);
            return (
              <Card key={inp.id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{typeInfo?.icon || "📝"}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{inp.title || "Sin título"}</p>
                      {inp.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{inp.content}</p>}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive w-8 h-8"
                    onClick={() => removeInput(inp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">Agregar insumo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {INPUT_TYPES.map(t => (
                <button key={t.value}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    inputType === t.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setInputType(t.value)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <Input value={inputTitle} onChange={e => setInputTitle(e.target.value)}
              placeholder="Título del insumo" className="bg-secondary border-border rounded-xl" />
            <Textarea value={inputContent} onChange={e => setInputContent(e.target.value)}
              placeholder="Contenido o descripción..." className="bg-secondary border-border rounded-xl" rows={4} />
            <Button onClick={handleAdd} disabled={!inputTitle}
              className="w-full bg-gradient-coral text-primary-foreground rounded-xl">
              Agregar insumo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Grid Section ─────────────────────────────────
function GridSection({ cycleId, profileId, profile, onExport }: {
  cycleId: string; profileId: string; profile: ContentProfile;
  onExport: (pieces: ContentPiece[]) => void;
}) {
  const { pieces, fetchPieces, updatePiece, bulkInsertPieces } = useContentPieces(cycleId);
  const { inputs } = useContentInputs(cycleId);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { profile, inputs, cycleId },
      });
      if (error) throw error;
      if (data?.pieces?.length) {
        await bulkInsertPieces(data.pieces.map((p: any) => ({ ...p, cycle_id: cycleId })));
        toast.success(`${data.pieces.length} piezas generadas`);
      }
    } catch {
      toast.error("Error generando parrilla");
    }
    setGenerating(false);
  };

  const updatePieceStatus = (id: string, status: string) => updatePiece(id, { status } as any);
  const updatePieceCopy = (id: string, copy: string) => updatePiece(id, { draft_copy: copy } as any);

  const filtered = statusFilter ? pieces.filter(p => p.status === statusFilter) : pieces;

  const counts = useMemo(() => ({
    total: pieces.length,
    pendiente: pieces.filter(p => p.status === "pendiente").length,
    aprobada: pieces.filter(p => p.status === "aprobada").length,
    ejecutada: pieces.filter(p => p.status === "ejecutada").length,
  }), [pieces]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-display font-bold text-foreground">Parrilla de Contenido</h3>
        <div className="flex gap-2">
          {pieces.length > 0 && (
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onExport(pieces)}>
              <Download className="w-4 h-4 mr-1" /> CSV
            </Button>
          )}
          <Button size="sm" onClick={handleGenerate} disabled={generating}
            className="bg-gradient-coral text-primary-foreground rounded-xl">
            <Sparkles className="w-4 h-4 mr-1" />
            {generating ? "Generando..." : pieces.length > 0 ? "Regenerar" : "Generar parrilla"}
          </Button>
        </div>
      </div>

      {/* Status bar */}
      {pieces.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !statusFilter ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
            Todas ({counts.total})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = pieces.filter(p => p.status === key).length;
            if (count === 0) return null;
            return (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  statusFilter === key ? cfg.color : "bg-secondary text-muted-foreground border-transparent"
                }`}>
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {pieces.length === 0 && !generating ? (
        <Card className="p-8 text-center bg-card border-border border-dashed">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm mb-3">
            Agrega insumos y genera tu parrilla de contenido con IA
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(piece => (
            <PieceCard key={piece.id} piece={piece}
              onStatusChange={(status) => updatePieceStatus(piece.id, status)}
              onCopyEdit={(copy) => updatePieceCopy(piece.id, copy)} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Piece Card ─────────────────────────────────
function PieceCard({ piece, onStatusChange, onCopyEdit }: {
  piece: ContentPiece;
  onStatusChange: (status: string) => void;
  onCopyEdit: (copy: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editCopy, setEditCopy] = useState(piece.draft_copy || "");
  const net = NETWORK_CONFIG[piece.network] || { emoji: "📱", color: "bg-secondary text-foreground border-border" };
  const status = STATUS_CONFIG[piece.status] || STATUS_CONFIG.pendiente;

  const handleSaveEdit = () => {
    onCopyEdit(editCopy);
    setEditing(false);
  };

  const handleCopyCopy = () => {
    navigator.clipboard.writeText(piece.final_copy || piece.draft_copy || "");
    toast.success("Copy copiado al portapapeles");
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="flex">
        {/* Left strip */}
        <div className={`w-1 shrink-0 ${net.color.split(" ")[0]}`} />

        <div className="flex-1 p-4 space-y-3">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${net.color}`}>
                {net.emoji} {piece.network}
              </span>
              <Badge variant="outline" className="text-xs">{piece.format}</Badge>
              {piece.scheduled_date && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {piece.scheduled_date}
                </span>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Pillar + Objective */}
          {(piece.pillar || piece.objective) && (
            <div className="flex flex-wrap gap-2">
              {piece.pillar && <span className="text-xs text-muted-foreground">📌 {piece.pillar}</span>}
              {piece.objective && <span className="text-xs text-muted-foreground">🎯 {piece.objective}</span>}
            </div>
          )}

          {/* Copy */}
          {editing ? (
            <div className="space-y-2">
              <Textarea value={editCopy} onChange={e => setEditCopy(e.target.value)}
                className="bg-secondary border-border rounded-xl text-sm" rows={4} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} className="rounded-lg bg-primary text-primary-foreground">
                  <Check className="w-3 h-3 mr-1" /> Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="rounded-lg">Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {piece.final_copy || piece.draft_copy || "Sin copy generado"}
            </p>
          )}

          {/* Hashtags */}
          {piece.hashtags && piece.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {piece.hashtags.map((h, i) => (
                <span key={i} className="text-xs text-primary/70 flex items-center gap-0.5">
                  <Hash className="w-3 h-3" />{h.replace("#", "")}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs rounded-lg" onClick={() => { setEditCopy(piece.final_copy || piece.draft_copy || ""); setEditing(true); }}>
              <Edit3 className="w-3 h-3 mr-1" /> Editar
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs rounded-lg" onClick={handleCopyCopy}>
              <Copy className="w-3 h-3 mr-1" /> Copiar
            </Button>
            {piece.status === "pendiente" && (
              <>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-400 rounded-lg"
                  onClick={() => onStatusChange("aprobada")}>
                  <Check className="w-3 h-3 mr-1" /> Aprobar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-400 rounded-lg"
                  onClick={() => onStatusChange("rechazada")}>
                  <X className="w-3 h-3 mr-1" /> Rechazar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default MyStrategyDetail;
