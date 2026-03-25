import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  useContentEngine, useContentCycles, useContentPieces,
  useContentLearnings, useContentInputs, useContentAnalytics,
  useAdCampaigns, ContentProfile, ContentPiece, ContentInput,
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
  ArrowLeft, Plus, RefreshCw, Sparkles, Check, X, Download,
  FileText, Calendar, Sun, Moon, Upload, ChevronDown, ChevronUp,
  LinkIcon, Type, Trash2, BarChart3, TrendingUp, Zap,
  Edit3, Eye, CheckCircle2, Circle, Clock, Package,
  Filter, Copy, ExternalLink, Hash,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pendiente: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Clock, label: "Pendiente" },
  aprobada: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2, label: "Aprobada" },
  rechazada: { color: "bg-red-500/15 text-red-400 border-red-500/30", icon: X, label: "Rechazada" },
  ejecutada: { color: "bg-sky-500/15 text-sky-400 border-sky-500/30", icon: Zap, label: "Ejecutada" },
};

const NETWORK_CONFIG: Record<string, { emoji: string; color: string }> = {
  Instagram: { emoji: "📸", color: "bg-pink-500/15 text-pink-400 border-pink-500/30" },
  Facebook: { emoji: "📘", color: "bg-blue-600/15 text-blue-400 border-blue-600/30" },
  X: { emoji: "𝕏", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30" },
  LinkedIn: { emoji: "💼", color: "bg-blue-700/15 text-blue-300 border-blue-700/30" },
  TikTok: { emoji: "🎵", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
};

const INPUT_TYPES = [
  { value: "articulo", label: "Artículo", icon: "📄", hint: "Pega el contenido de un artículo o blog que quieras usar como base.", fields: ["title", "url", "content"] },
  { value: "historia", label: "Historia / Caso", icon: "📖", hint: "Describe una historia de éxito, caso de estudio o testimonio.", fields: ["title", "content"] },
  { value: "url", label: "URL / Enlace", icon: "🔗", hint: "Pega un enlace y el contenido se extraerá automáticamente.", fields: ["url"] },
  { value: "texto", label: "Texto libre", icon: "✍️", hint: "Ideas sueltas, mensajes clave, datos o temas prioritarios.", fields: ["title", "content"] },
  { value: "notas", label: "Notas de reunión", icon: "📝", hint: "Pega las notas o acuerdos de una junta con el cliente.", fields: ["title", "content"] },
  { value: "referencia", label: "Referencia visual", icon: "🖼️", hint: "Sube una imagen, brand book o referencia de diseño.", fields: ["title", "file"] },
];

// ─── Flow Steps ───────────────────────────────────────────

const FLOW_STEPS = [
  { key: "insumos", label: "Insumos", icon: Package, description: "Materiales base" },
  { key: "parrilla", label: "Parrilla", icon: Calendar, description: "Planear contenido" },
  { key: "analytics", label: "Analytics", icon: BarChart3, description: "Evaluar rendimiento" },
  { key: "ads", label: "Ads", icon: TrendingUp, description: "Publicidad pagada" },
];

// ─── Piece Card Component ─────────────────────────────────

const PieceCard = ({
  piece, expanded, onToggleExpand, onApprove, onReject, onUpdateCopy,
}: {
  piece: ContentPiece;
  expanded: boolean;
  onToggleExpand: () => void;
  onApprove: () => void;
  onReject: () => void;
  onUpdateCopy: (copy: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [editCopy, setEditCopy] = useState(piece.draft_copy || "");
  const status = STATUS_CONFIG[piece.status] || STATUS_CONFIG.pendiente;
  const network = NETWORK_CONFIG[piece.network] || { emoji: "📱", color: "bg-secondary text-foreground" };
  const StatusIcon = status.icon;

  const handleSaveCopy = () => {
    onUpdateCopy(editCopy);
    setEditing(false);
  };

  return (
    <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 35 }}>
      <Card className={`overflow-hidden bg-card border-border transition-all duration-200 ${
        expanded ? "ring-1 ring-primary/20 shadow-md" : "hover:border-primary/20"
      }`}>
        {/* Header row */}
        <div className="p-4 cursor-pointer" onClick={onToggleExpand}>
          <div className="flex items-center gap-3">
            {/* Date pill */}
            <div className="hidden sm:flex flex-col items-center justify-center min-w-[52px] h-12 rounded-xl bg-secondary text-center">
              <span className="text-[10px] text-muted-foreground uppercase leading-none">
                {piece.scheduled_date ? new Date(piece.scheduled_date + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }) : "—"}
              </span>
              <span className="text-lg font-bold text-foreground leading-none">
                {piece.scheduled_date ? new Date(piece.scheduled_date + "T12:00:00").getDate() : "—"}
              </span>
            </div>

            {/* Content preview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${network.color}`}>
                  {network.emoji} {piece.network}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-secondary text-muted-foreground font-medium">
                  {piece.format}
                </span>
                {piece.pillar && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary font-medium">
                    {piece.pillar}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground line-clamp-1">{piece.final_copy || piece.draft_copy || "Sin contenido"}</p>
            </div>

            {/* Status + Actions */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${status.color}`}>
                <StatusIcon className="w-3 h-3" /> {status.label}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                {/* Objective */}
                {piece.objective && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-secondary/50">
                    <span className="text-xs">🎯</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{piece.objective}</p>
                  </div>
                )}

                {/* Copy - editable */}
                {editing ? (
                  <div className="space-y-2">
                    <Textarea value={editCopy} onChange={e => setEditCopy(e.target.value)}
                      className="bg-secondary border-border rounded-xl text-sm min-h-[120px]" />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="rounded-xl">Cancelar</Button>
                      <Button size="sm" onClick={handleSaveCopy} className="bg-gradient-coral text-primary-foreground rounded-xl">Guardar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed p-3 rounded-xl bg-secondary/30">
                      {piece.final_copy || piece.draft_copy}
                    </p>
                    {piece.status === "pendiente" && (
                      <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditCopy(piece.draft_copy || ""); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-card border border-border hover:bg-secondary">
                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}

                {/* Hashtags */}
                {piece.hashtags && piece.hashtags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-primary/80 leading-relaxed">{piece.hashtags.map(h => `#${h}`).join(" ")}</p>
                  </div>
                )}

                {/* CTA */}
                {piece.cta && (
                  <div className="flex items-start gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground"><strong>CTA:</strong> {piece.cta}</p>
                  </div>
                )}

                {/* Design prompt */}
                {piece.design_prompt && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                    <p className="text-[11px] font-semibold text-primary mb-1 uppercase tracking-wider">Prompt de diseño</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{piece.design_prompt}</p>
                  </div>
                )}

                {/* Action buttons */}
                {piece.status === "pendiente" && (
                  <div className="flex gap-2 pt-1">
                    <Button onClick={(e) => { e.stopPropagation(); onApprove(); }}
                      className="flex-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl" variant="ghost" size="sm">
                      <Check className="w-4 h-4 mr-1.5" /> Aprobar
                    </Button>
                    <Button onClick={(e) => { e.stopPropagation(); onReject(); }}
                      className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl" variant="ghost" size="sm">
                      <X className="w-4 h-4 mr-1.5" /> Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────

const ContentCycleDetail = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useThemeToggle();
  const { profiles } = useContentEngine();
  const { cycles, createCycle, updateCycle } = useContentCycles(profileId || null);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const { pieces, updatePiece, bulkInsertPieces } = useContentPieces(selectedCycleId);
  const { learnings } = useContentLearnings(profileId || null);
  const { inputs, addInput, removeInput } = useContentInputs(selectedCycleId);
  const { analytics, bulkInsert: bulkInsertAnalytics } = useContentAnalytics(profileId || null);
  const { campaigns, performance, importAds } = useAdCampaigns(profileId || null);
  const [generating, setGenerating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [expandedPiece, setExpandedPiece] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("insumos");
  const [pieceFilter, setPieceFilter] = useState<string>("all");
  const analyticsFileRef = useRef<HTMLInputElement>(null);
  const adsFileRef = useRef<HTMLInputElement>(null);
  const [newCycle, setNewCycle] = useState({
    title: "", cycle_type: "mensual", start_date: "", end_date: "",
    briefing_data: { objective: "", themes: "", special_dates: "" },
  });
  const [newInput, setNewInput] = useState({
    input_type: "articulo", title: "", content: "", url: "", tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const profile = useMemo(() => profiles.find(p => p.id === profileId), [profiles, profileId]);
  const selectedCycle = useMemo(() => cycles.find(c => c.id === selectedCycleId), [cycles, selectedCycleId]);

  useEffect(() => {
    if (cycles.length > 0 && !selectedCycleId) setSelectedCycleId(cycles[0].id);
  }, [cycles, selectedCycleId]);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin/operaciones/login");
    };
    check();
  }, [navigate]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // ─── Handlers ────────────────────

  const handleCreateCycle = async () => {
    if (!newCycle.title || !newCycle.start_date || !newCycle.end_date) return;
    const result = await createCycle({ profile_id: profileId!, ...newCycle });
    if (result) {
      setSelectedCycleId(result.id);
      setShowNewCycle(false);
      setNewCycle({ title: "", cycle_type: "mensual", start_date: "", end_date: "", briefing_data: { objective: "", themes: "", special_dates: "" } });
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${selectedCycleId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("content-inputs").upload(path, file);
    if (error) { toast.error("Error subiendo archivo"); setUploading(false); return null; }
    const { data: urlData } = supabase.storage.from("content-inputs").getPublicUrl(path);
    setUploading(false);
    return { url: urlData.publicUrl, name: file.name };
  };


  const handleAddInput = async () => {
    const typeConfig = INPUT_TYPES.find(t => t.value === newInput.input_type);
    const fields = typeConfig?.fields || [];
    const hasContent = (fields.includes("title") && newInput.title) ||
      (fields.includes("content") && newInput.content) ||
      (fields.includes("url") && newInput.url);
    if (!hasContent && !fields.includes("file")) return;

    let finalTitle = newInput.title || null;
    let finalContent = newInput.content || null;

    // Auto-scrape URL content
    if (newInput.input_type === "url" && newInput.url) {
      setScraping(true);
      toast.info("Extrayendo contenido de la URL…");
      try {
        const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
          body: { url: newInput.url },
        });
        if (error) throw error;
        if (data?.success && data.markdown) {
          // Truncate to ~8000 chars to keep prompt manageable
          finalContent = data.markdown.slice(0, 8000);
          finalTitle = finalTitle || data.title || new URL(newInput.url).hostname;
          toast.success(`Contenido extraído (${finalContent.length} caracteres)`);
        } else {
          toast.warning("No se pudo extraer contenido. Se guardará solo la URL.");
        }
      } catch (e: any) {
        console.error("Scraping error:", e);
        toast.warning("Error extrayendo contenido. Se guardará solo la URL.");
      } finally {
        setScraping(false);
      }
    }

    await addInput({
      cycle_id: selectedCycleId!,
      input_type: newInput.input_type,
      title: finalTitle,
      content: finalContent,
      url: newInput.url || null,
      tags: newInput.tags,
      sort_order: inputs.length,
    });
    setNewInput({ input_type: "articulo", title: "", content: "", url: "", tags: [] });
    setShowAddInput(false);
  };

  const handleGenerateGrid = async () => {
    if (!selectedCycle) return;
    if (inputs.length === 0) {
      toast.error("Agrega al menos un insumo antes de generar la parrilla");
      return;
    }
    // Warn if no inputs have actual text content
    const hasTextContent = inputs.some(inp => inp.content && inp.content.trim().length > 20);
    if (!hasTextContent) {
      toast.error("Los insumos no tienen contenido de texto. Agrega insumos con contenido o URLs (se extraerán automáticamente).");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { action: "generate_grid", profile, cycle: selectedCycle, learnings, inputs },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Error generando parrilla");
      const generatedPieces = (data.data.pieces || []).map((p: any, i: number) => ({
        cycle_id: selectedCycleId,
        scheduled_date: p.scheduled_date,
        network: p.network,
        format: p.format,
        pillar: p.pillar,
        objective: p.objective,
        draft_copy: p.draft_copy,
        hashtags: p.hashtags || [],
        cta: p.cta,
        tone: p.tone,
        status: "pendiente",
        sort_order: i,
      }));
      await bulkInsertPieces(generatedPieces);
      await updateCycle(selectedCycleId!, { status: "parrilla" });
      setActiveTab("parrilla");
      toast.success(`${generatedPieces.length} piezas generadas a partir de ${inputs.length} insumos`);
    } catch (e: any) {
      toast.error(e.message || "Error generando contenido");
    } finally {
      setGenerating(false);
    }
  };

  const handleExecutePieces = async () => {
    const approved = pieces.filter(p => p.status === "aprobada");
    if (approved.length === 0) { toast.error("No hay piezas aprobadas"); return; }
    setExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { action: "execute_pieces", profile, pieces: approved },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error);
      for (const ep of (data.data.executed_pieces || [])) {
        await updatePiece(ep.id, {
          final_copy: ep.final_copy, hashtags: ep.hashtags || [],
          cta: ep.cta, design_prompt: ep.design_prompt, status: "ejecutada",
        });
      }
      await updateCycle(selectedCycleId!, { status: "ejecutado" });
      toast.success("Piezas ejecutadas con IA");
    } catch (e: any) {
      toast.error(e.message || "Error ejecutando");
    } finally {
      setExecuting(false);
    }
  };

  const handleReviewPieces = async () => {
    const pendingPieces = pieces.filter(p => p.status === "pendiente");
    if (pendingPieces.length === 0) { toast.error("No hay piezas pendientes para revisar"); return; }
    setReviewing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { action: "review_pieces", profile, pieces: pendingPieces },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error);
      const reviews = data.data.reviews || [];
      let improved = 0;
      for (const review of reviews) {
        const piece = pendingPieces[review.piece_index];
        if (!piece) continue;
        const updates: any = {};
        if (review.improved_copy) { updates.draft_copy = review.improved_copy; improved++; }
        if (review.improved_cta) updates.cta = review.improved_cta;
        if (review.improved_hashtags?.length) updates.hashtags = review.improved_hashtags;
        if (Object.keys(updates).length > 0) await updatePiece(piece.id, updates);
      }
      const generalNotes = data.data.general_notes;
      if (generalNotes) toast.info(generalNotes, { duration: 8000 });
      toast.success(`Revisión completa: ${improved} piezas mejoradas de ${pendingPieces.length}`);
    } catch (e: any) {
      toast.error(e.message || "Error en revisión");
    } finally {
      setReviewing(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Fecha", "Red", "Formato", "Pilar", "Copy", "Hashtags", "CTA", "Estado"];
    const rows = pieces.map(p => [
      p.scheduled_date || "", p.network, p.format, p.pillar || "",
      (p.final_copy || p.draft_copy || "").replace(/"/g, '""'),
      (p.hashtags || []).join(" "), p.cta || "", p.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `parrilla_${profile.client_name}_${selectedCycle?.start_date || "export"}.csv`;
    a.click();
    toast.success("CSV exportado");
  };

  const handleAnalyticsImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) { toast.error("CSV vacío"); return; }
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const batch = crypto.randomUUID().slice(0, 8);
    const rows = lines.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const row: any = { profile_id: profileId, import_batch: batch, raw_data: {} };
      headers.forEach((h, i) => {
        const v = cols[i] || "";
        row.raw_data[h] = v;
        if (h.includes("date") || h.includes("fecha")) row.published_date = v || null;
        else if (h.includes("network") || h.includes("red")) row.network = v;
        else if (h.includes("type") || h.includes("tipo")) row.post_type = v;
        else if (h.includes("text") || h.includes("post") || h.includes("mensaje")) row.post_text = v;
        else if (h.includes("reach") || h.includes("alcance")) row.reach = parseInt(v) || 0;
        else if (h.includes("impression")) row.impressions = parseInt(v) || 0;
        else if (h.includes("engagement") && !h.includes("rate")) row.engagement = parseInt(v) || 0;
        else if (h.includes("reaction") || h.includes("like")) row.reactions = parseInt(v) || 0;
        else if (h.includes("comment") || h.includes("comentario")) row.comments = parseInt(v) || 0;
        else if (h.includes("share") || h.includes("compartido")) row.shares = parseInt(v) || 0;
        else if (h.includes("click")) row.clicks = parseInt(v) || 0;
        else if (h.includes("video") || h.includes("view")) row.video_views = parseInt(v) || 0;
        else if (h.includes("rate") || h.includes("tasa")) row.engagement_rate = parseFloat(v) || 0;
      });
      return row;
    }).filter(r => r.published_date || r.post_text);
    if (rows.length === 0) { toast.error("No se encontraron datos válidos"); return; }
    await bulkInsertAnalytics(rows);
    e.target.value = "";
  };

  const handleAdsImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) { toast.error("CSV vacío"); return; }
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const batch = crypto.randomUUID().slice(0, 8);
    const platform = headers.some(h => h.includes("campaign") && h.includes("id"))
      ? (text.toLowerCase().includes("google") ? "Google Ads" : "Meta Ads") : "Otra";
    const campaignName = file.name.replace(/\.csv$/i, "");
    const perfRows = lines.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const row: any = { raw_data: {} };
      headers.forEach((h, i) => {
        const v = cols[i] || "";
        row.raw_data[h] = v;
        if (h.includes("ad name") || h.includes("nombre")) row.ad_name = v;
        else if (h.includes("ad set") || h.includes("conjunto")) row.ad_set_name = v;
        else if (h.includes("date") || h.includes("fecha")) row.report_date = v || null;
        else if (h.includes("impression")) row.impressions = parseInt(v) || 0;
        else if (h.includes("click") && !h.includes("rate")) row.clicks = parseInt(v) || 0;
        else if (h.includes("spend") || h.includes("gasto") || h.includes("cost")) row.spend = parseFloat(v) || 0;
        else if (h.includes("conversion") && !h.includes("value")) row.conversions = parseInt(v) || 0;
        else if (h.includes("conversion") && h.includes("value")) row.conversion_value = parseFloat(v) || 0;
        else if (h === "cpc") row.cpc = parseFloat(v) || 0;
        else if (h === "cpm") row.cpm = parseFloat(v) || 0;
        else if (h === "ctr") row.ctr = parseFloat(v) || 0;
        else if (h.includes("roas")) row.roas = parseFloat(v) || 0;
        else if (h.includes("reach") || h.includes("alcance")) row.reach = parseInt(v) || 0;
        else if (h.includes("frequency") || h.includes("frecuencia")) row.frequency = parseFloat(v) || 0;
      });
      return row;
    }).filter(r => r.ad_name || r.impressions || r.spend);
    if (perfRows.length === 0) { toast.error("No se encontraron datos de ads"); return; }
    await importAds(
      { profile_id: profileId!, platform, campaign_name: campaignName, import_batch: batch },
      perfRows
    );
    e.target.value = "";
  };

  // ─── Computed ────────────────────

  const pendingCount = pieces.filter(p => p.status === "pendiente").length;
  const approvedCount = pieces.filter(p => p.status === "aprobada").length;
  const executedCount = pieces.filter(p => p.status === "ejecutada").length;
  const rejectedCount = pieces.filter(p => p.status === "rechazada").length;
  const totalSpend = performance.reduce((s, p) => s + (p.spend || 0), 0);
  const totalImpressions = performance.reduce((s, p) => s + (p.impressions || 0), 0);
  const avgCTR = performance.length > 0 ? performance.reduce((s, p) => s + (p.ctr || 0), 0) / performance.length : 0;

  const filteredPieces = pieceFilter === "all" ? pieces : pieces.filter(p => p.status === pieceFilter);

  const progressPercent = pieces.length > 0
    ? Math.round(((approvedCount + executedCount) / pieces.length) * 100)
    : 0;

  // ─── Render ──────────────────────

  return (
    <div className={`min-h-screen bg-background ${isDark ? "" : "theme-light"}`}>
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/parrilla")}
              className="text-muted-foreground hover:text-foreground rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-coral flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {profile.client_name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">{profile.client_name}</h1>
                  <p className="text-xs text-muted-foreground">{profile.industry} · {(profile.preferred_networks || []).join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground rounded-xl">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* ─── Cycle Selector ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-secondary/80 rounded-2xl p-1 overflow-x-auto backdrop-blur-sm">
            {cycles.map(c => (
              <button key={c.id} onClick={() => setSelectedCycleId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCycleId === c.id
                    ? "bg-card text-foreground shadow-md ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}>
                {c.title}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowNewCycle(true)} className="rounded-xl">
            <Plus className="w-3.5 h-3.5 mr-1" /> Nuevo ciclo
          </Button>
        </motion.div>

        {!selectedCycle ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-16 text-center bg-card border-border border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-gradient-coral/10 flex items-center justify-center mx-auto mb-5">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">Crea tu primer ciclo</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Un ciclo representa un periodo (semana, quincena, mes) para planear y ejecutar contenido
              </p>
              <Button onClick={() => setShowNewCycle(true)} className="bg-gradient-coral text-primary-foreground font-semibold rounded-xl px-6">
                <Plus className="w-4 h-4 mr-1.5" /> Nuevo ciclo
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* ─── Progress Bar ─── */}
            {pieces.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progreso del ciclo</span>
                    <span className="text-sm font-bold text-foreground">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 rounded-full" />
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {[
                      { label: "Pendientes", count: pendingCount, color: "text-amber-400" },
                      { label: "Aprobadas", count: approvedCount, color: "text-emerald-400" },
                      { label: "Ejecutadas", count: executedCount, color: "text-sky-400" },
                      { label: "Rechazadas", count: rejectedCount, color: "text-red-400" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <span className={`text-lg font-bold ${s.color}`}>{s.count}</span>
                        <span className="text-[11px] text-muted-foreground">{s.label}</span>
                      </div>
                    ))}
                    <span className="text-[11px] text-muted-foreground ml-auto">{pieces.length} piezas total</span>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Flow Steps (Tab Navigation) ─── */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FLOW_STEPS.map((step, i) => {
                const isActive = activeTab === step.key;
                const StepIcon = step.icon;
                const count = step.key === "insumos" ? inputs.length
                  : step.key === "parrilla" ? pieces.length
                  : step.key === "analytics" ? analytics.length
                  : campaigns.length;

                return (
                  <button key={step.key} onClick={() => setActiveTab(step.key)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-card text-foreground shadow-md ring-1 ring-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }`}>
                    <StepIcon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                    <span>{step.label}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── Tab Content ─── */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                {/* INSUMOS */}
                {activeTab === "insumos" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-lg font-display font-bold text-foreground">Insumos del ciclo</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Artículos, historias, notas y materiales que alimentarán la parrilla
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowAddInput(true)} className="rounded-xl">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
                        </Button>
                        {inputs.length > 0 && (
                          <Button onClick={handleGenerateGrid} disabled={generating}
                            className="bg-gradient-coral text-primary-foreground font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-shadow" size="sm">
                            {generating ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                            {generating ? "Generando parrilla..." : "Generar parrilla con IA"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {inputs.length === 0 ? (
                      <Card className="p-12 text-center bg-card border-border border-dashed">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Package className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-foreground font-display font-bold mb-1">Sin insumos aún</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                          Agrega los materiales que la IA usará para crear tu parrilla: artículos, historias, notas de reunión...
                        </p>
                        <Button variant="outline" onClick={() => setShowAddInput(true)} className="rounded-xl">
                          <Plus className="w-4 h-4 mr-1" /> Agregar primer insumo
                        </Button>
                      </Card>
                    ) : (
                      <div className="grid gap-3">
                        {inputs.map((inp, i) => {
                          const typeConfig = INPUT_TYPES.find(t => t.value === inp.input_type);
                          return (
                            <motion.div key={inp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}>
                              <Card className="p-4 bg-card border-border hover:border-primary/20 transition-colors group">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
                                    {typeConfig?.icon || "📄"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-foreground text-sm">{inp.title || `Insumo ${i + 1}`}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{inp.input_type}</span>
                                    </div>
                                    {inp.content && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{inp.content}</p>}
                                    {inp.url && (
                                      <a href={inp.url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                        <LinkIcon className="w-3 h-3" /> {inp.url}
                                      </a>
                                    )}
                                    {inp.tags && inp.tags.length > 0 && (
                                      <div className="flex gap-1 mt-1.5">
                                        {inp.tags.map(t => (
                                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive rounded-xl"
                                    onClick={() => removeInput(inp.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* PARRILLA */}
                {activeTab === "parrilla" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-lg font-display font-bold text-foreground">Parrilla de contenido</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Revisa, edita, aprueba y ejecuta cada pieza
                        </p>
                      </div>
                      {pieces.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {pendingCount > 0 && (
                            <Button variant="outline" size="sm" className="rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              onClick={handleReviewPieces} disabled={reviewing}>
                              {reviewing ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                              Revisar con IA ({pendingCount})
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="rounded-xl"
                            onClick={() => { pieces.filter(p => p.status === "pendiente").forEach(p => updatePiece(p.id, { status: "aprobada" })); }}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprobar todas
                          </Button>
                          {approvedCount > 0 && executedCount < approvedCount && (
                            <Button onClick={handleExecutePieces} disabled={executing}
                              className="bg-gradient-coral text-primary-foreground font-semibold rounded-xl shadow-glow" size="sm">
                              {executing ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                              Ejecutar {approvedCount} aprobadas
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-xl">
                            <Download className="w-3.5 h-3.5 mr-1" /> CSV
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Filters */}
                    {pieces.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {[
                          { key: "all", label: "Todas", count: pieces.length },
                          { key: "pendiente", label: "Pendientes", count: pendingCount },
                          { key: "aprobada", label: "Aprobadas", count: approvedCount },
                          { key: "ejecutada", label: "Ejecutadas", count: executedCount },
                          { key: "rechazada", label: "Rechazadas", count: rejectedCount },
                        ].filter(f => f.count > 0 || f.key === "all").map(f => (
                          <button key={f.key} onClick={() => setPieceFilter(f.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                              pieceFilter === f.key
                                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground"
                            }`}>
                            {f.label} ({f.count})
                          </button>
                        ))}
                      </div>
                    )}

                    {pieces.length === 0 ? (
                      <Card className="p-12 text-center bg-card border-border border-dashed">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-foreground font-display font-bold mb-1">Sin piezas aún</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Agrega insumos en la pestaña anterior y genera la parrilla con IA
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {filteredPieces.map(piece => (
                          <PieceCard
                            key={piece.id}
                            piece={piece}
                            expanded={expandedPiece === piece.id}
                            onToggleExpand={() => setExpandedPiece(expandedPiece === piece.id ? null : piece.id)}
                            onApprove={() => updatePiece(piece.id, { status: "aprobada" })}
                            onReject={() => updatePiece(piece.id, { status: "rechazada" })}
                            onUpdateCopy={(copy) => updatePiece(piece.id, { draft_copy: copy })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ANALYTICS */}
                {activeTab === "analytics" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-lg font-display font-bold text-foreground">Analytics orgánico</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Importa datos de FanPage Karma para evaluar rendimiento</p>
                      </div>
                      <div>
                        <input ref={analyticsFileRef} type="file" accept=".csv" className="hidden" onChange={handleAnalyticsImport} />
                        <Button variant="outline" size="sm" onClick={() => analyticsFileRef.current?.click()} className="rounded-xl">
                          <Upload className="w-3.5 h-3.5 mr-1" /> Importar CSV
                        </Button>
                      </div>
                    </div>

                    {analytics.length === 0 ? (
                      <Card className="p-12 text-center bg-card border-border border-dashed">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-foreground font-display font-bold mb-1">Sin datos de analytics</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Exporta tu reporte de FanPage Karma como CSV y súbelo aquí
                        </p>
                      </Card>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: "Alcance total", value: analytics.reduce((s, a) => s + a.reach, 0).toLocaleString(), icon: "👁️" },
                            { label: "Engagement", value: analytics.reduce((s, a) => s + a.engagement, 0).toLocaleString(), icon: "❤️" },
                            { label: "ER% promedio", value: `${(analytics.reduce((s, a) => s + a.engagement_rate, 0) / analytics.length * 100).toFixed(2)}%`, icon: "📊" },
                            { label: "Posts", value: analytics.length.toString(), icon: "📝" },
                          ].map(s => (
                            <Card key={s.label} className="p-4 bg-card border-border">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{s.icon}</span>
                                <span className="text-xs text-muted-foreground">{s.label}</span>
                              </div>
                              <p className="text-xl font-bold text-foreground">{s.value}</p>
                            </Card>
                          ))}
                        </div>
                        <Card className="overflow-hidden bg-card border-border">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Red</th>
                                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alcance</th>
                                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Engage</th>
                                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clicks</th>
                                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ER%</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analytics.slice(0, 50).map((a, i) => (
                                  <tr key={a.id} className={`border-b border-border/30 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}>
                                    <td className="p-3 text-foreground text-xs">{a.published_date || "—"}</td>
                                    <td className="p-3">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${NETWORK_CONFIG[a.network || ""]?.color || "bg-secondary text-muted-foreground"}`}>
                                        {a.network || "—"}
                                      </span>
                                    </td>
                                    <td className="p-3 text-muted-foreground text-xs">{a.post_type || "—"}</td>
                                    <td className="p-3 text-right text-foreground text-xs font-medium">{a.reach.toLocaleString()}</td>
                                    <td className="p-3 text-right text-foreground text-xs font-medium">{a.engagement.toLocaleString()}</td>
                                    <td className="p-3 text-right text-foreground text-xs font-medium">{a.clicks.toLocaleString()}</td>
                                    <td className="p-3 text-right text-foreground text-xs font-medium">{(a.engagement_rate * 100).toFixed(2)}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      </>
                    )}
                  </div>
                )}

                {/* ADS */}
                {activeTab === "ads" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-lg font-display font-bold text-foreground">Publicidad pagada</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Importa reportes de Meta Ads o Google Ads</p>
                      </div>
                      <div>
                        <input ref={adsFileRef} type="file" accept=".csv" className="hidden" onChange={handleAdsImport} />
                        <Button variant="outline" size="sm" onClick={() => adsFileRef.current?.click()} className="rounded-xl">
                          <Upload className="w-3.5 h-3.5 mr-1" /> Importar CSV
                        </Button>
                      </div>
                    </div>

                    {campaigns.length === 0 ? (
                      <Card className="p-12 text-center bg-card border-border border-dashed">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-foreground font-display font-bold mb-1">Sin datos de publicidad</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Exporta tu reporte de Meta Ads Manager o Google Ads como CSV
                        </p>
                      </Card>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: "Gasto total", value: `$${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: "💰" },
                            { label: "Impresiones", value: totalImpressions.toLocaleString(), icon: "👁️" },
                            { label: "CTR promedio", value: `${(avgCTR * 100).toFixed(2)}%`, icon: "🖱️" },
                            { label: "Campañas", value: campaigns.length.toString(), icon: "📢" },
                          ].map(s => (
                            <Card key={s.label} className="p-4 bg-card border-border">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{s.icon}</span>
                                <span className="text-xs text-muted-foreground">{s.label}</span>
                              </div>
                              <p className="text-xl font-bold text-foreground">{s.value}</p>
                            </Card>
                          ))}
                        </div>

                        {campaigns.map(camp => {
                          const campPerf = performance.filter(p => p.campaign_id === camp.id);
                          const campSpend = campPerf.reduce((s, p) => s + (p.spend || 0), 0);
                          const campClicks = campPerf.reduce((s, p) => s + (p.clicks || 0), 0);
                          return (
                            <Card key={camp.id} className="overflow-hidden bg-card border-border">
                              <div className="p-4 flex items-start justify-between">
                                <div>
                                  <h4 className="font-display font-bold text-foreground">{camp.campaign_name}</h4>
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{camp.platform}</span>
                                    <span className="text-xs text-muted-foreground">{campPerf.length} anuncios</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-foreground">${campSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                  <p className="text-xs text-muted-foreground">{campClicks.toLocaleString()} clicks</p>
                                </div>
                              </div>
                              <div className="border-t border-border/50">
                                {campPerf.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5).map((ad, i) => (
                                  <div key={ad.id} className={`flex items-center justify-between px-4 py-2.5 text-xs ${i % 2 ? "bg-secondary/20" : ""}`}>
                                    <span className="text-foreground truncate max-w-[200px]">{ad.ad_name || "Sin nombre"}</span>
                                    <div className="flex gap-4 text-muted-foreground">
                                      <span>${(ad.spend || 0).toFixed(0)}</span>
                                      <span>{(ad.clicks || 0)} clicks</span>
                                      <span className="font-medium text-foreground">{((ad.ctr || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ─── New Cycle Dialog ─── */}
      <Dialog open={showNewCycle} onOpenChange={setShowNewCycle}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl">Nuevo Ciclo de Contenido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Título *</Label>
              <Input value={newCycle.title} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewCycle(c => ({ ...c, title: e.target.value }))} placeholder="Ej: Abril 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Inicio *</Label>
                <Input type="date" value={newCycle.start_date} className="bg-secondary border-border mt-1.5 rounded-xl"
                  onChange={e => setNewCycle(c => ({ ...c, start_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Fin *</Label>
                <Input type="date" value={newCycle.end_date} className="bg-secondary border-border mt-1.5 rounded-xl"
                  onChange={e => setNewCycle(c => ({ ...c, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Objetivo del ciclo</Label>
              <Textarea value={newCycle.briefing_data.objective} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewCycle(c => ({ ...c, briefing_data: { ...c.briefing_data, objective: e.target.value } }))}
                placeholder="¿Qué quiere lograr el cliente este periodo?" rows={3} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Temas prioritarios</Label>
              <Input value={newCycle.briefing_data.themes} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewCycle(c => ({ ...c, briefing_data: { ...c.briefing_data, themes: e.target.value } }))}
                placeholder="Ej: Lanzamiento nuevo producto, fecha conmemorativa..." />
            </div>
            <Button onClick={handleCreateCycle}
              className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-11 shadow-glow hover:shadow-glow-lg transition-shadow"
              disabled={!newCycle.title || !newCycle.start_date || !newCycle.end_date}>
              Crear ciclo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Add Input Dialog ─── */}
      <Dialog open={showAddInput} onOpenChange={setShowAddInput}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl">Agregar Insumo</DialogTitle>
          </DialogHeader>
          {(() => {
            const typeConfig = INPUT_TYPES.find(t => t.value === newInput.input_type);
            const fields = typeConfig?.fields || [];
            return (
              <div className="space-y-5">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tipo de insumo</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {INPUT_TYPES.map(t => (
                      <button key={t.value}
                        className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all border ${
                          newInput.input_type === t.value
                            ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                            : "bg-secondary text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                        }`}
                        onClick={() => setNewInput(i => ({ ...i, input_type: t.value, title: "", content: "", url: "", tags: [] }))}>
                        <span className="text-base">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  {typeConfig?.hint && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{typeConfig.hint}</p>
                  )}
                </div>

                {fields.includes("title") && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {newInput.input_type === "notas" ? "Nombre de la reunión" : newInput.input_type === "historia" ? "Nombre del caso" : "Título"}
                    </Label>
                    <Input value={newInput.title} className="bg-secondary border-border mt-1.5 rounded-xl"
                      onChange={e => setNewInput(i => ({ ...i, title: e.target.value }))}
                      placeholder={
                        newInput.input_type === "notas" ? "Ej: Junta semanal FIMeme 24-mar" :
                        newInput.input_type === "historia" ? "Ej: Caso éxito campaña diciembre" :
                        newInput.input_type === "texto" ? "Ej: Ideas para campaña de verano" :
                        "Ej: Artículo sobre tendencias 2026"
                      } />
                  </div>
                )}

                {fields.includes("url") && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">URL</Label>
                    <Input value={newInput.url} className="bg-secondary border-border mt-1.5 rounded-xl"
                      onChange={e => setNewInput(i => ({ ...i, url: e.target.value }))}
                      placeholder="https://..." />
                    {newInput.input_type === "url" && (
                      <p className="text-[11px] text-muted-foreground mt-1">La IA usará esta referencia al generar la parrilla.</p>
                    )}
                  </div>
                )}

                {fields.includes("content") && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {newInput.input_type === "notas" ? "Notas / Acuerdos" :
                       newInput.input_type === "historia" ? "Descripción del caso" :
                       newInput.input_type === "articulo" ? "Contenido del artículo" : "Texto"}
                    </Label>
                    <Textarea value={newInput.content} className="bg-secondary border-border mt-1.5 rounded-xl"
                      onChange={e => setNewInput(i => ({ ...i, content: e.target.value }))}
                      placeholder={
                        newInput.input_type === "notas" ? "Pega aquí las notas o puntos clave de la reunión..." :
                        newInput.input_type === "historia" ? "Describe la historia, quién participó, qué pasó, qué resultados hubo..." :
                        newInput.input_type === "articulo" ? "Pega el texto completo del artículo (importante para que la IA genere contenido basado en él)..." :
                        "Escribe ideas, mensajes clave, datos o temas que quieras incluir en la parrilla..."
                      } rows={6} />
                  </div>
                )}

                {fields.includes("file") && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Archivo / Imagen</Label>
                    <input ref={inputFileRef} type="file" accept="image/*,.pdf,.pptx,.ppt" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const result = await handleFileUpload(file);
                        if (result) {
                          setNewInput(i => ({ ...i, url: result.url, title: i.title || result.name }));
                        }
                      }} />
                    <div className="mt-1.5">
                      {newInput.url ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary border border-border">
                          {newInput.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={newInput.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                          ) : (
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{newInput.title || "Archivo subido"}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{newInput.url}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setNewInput(i => ({ ...i, url: "", title: "" }))}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" className="w-full rounded-xl h-20 border-dashed flex flex-col gap-1"
                          onClick={() => inputFileRef.current?.click()} disabled={uploading}>
                          {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          <span className="text-xs">{uploading ? "Subiendo..." : "Haz clic para subir imagen, PDF o presentación"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tags <span className="normal-case font-normal">(opcional)</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setNewInput(i => ({ ...i, tags: [...i.tags, tagInput.trim()] })); setTagInput(""); } } }}
                      placeholder="Agregar tag y Enter..." className="bg-secondary border-border rounded-xl" />
                  </div>
                  {newInput.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {newInput.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => setNewInput(i => ({ ...i, tags: i.tags.filter(x => x !== t) }))}>{t} ×</span>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleAddInput}
                  className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-11 shadow-glow hover:shadow-glow-lg transition-shadow"
                  disabled={uploading || scraping || (!newInput.title && !newInput.content && !newInput.url)}>
                  {scraping ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Extrayendo contenido…</>
                  ) : "Agregar insumo"}
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentCycleDetail;
