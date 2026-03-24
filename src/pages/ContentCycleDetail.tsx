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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, RefreshCw, Sparkles, Check, X, Download,
  FileText, Calendar, Sun, Moon, Upload, ChevronDown, ChevronUp,
  LinkIcon, Type, Trash2, BarChart3, TrendingUp,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-400",
  aprobada: "bg-green-500/20 text-green-400",
  rechazada: "bg-red-500/20 text-red-400",
  ejecutada: "bg-blue-500/20 text-blue-400",
};

const NETWORK_COLORS: Record<string, string> = {
  Instagram: "bg-pink-500/20 text-pink-400",
  Facebook: "bg-blue-600/20 text-blue-400",
  X: "bg-gray-500/20 text-gray-300",
  LinkedIn: "bg-blue-700/20 text-blue-300",
  TikTok: "bg-purple-500/20 text-purple-400",
};

const INPUT_TYPES = [
  { value: "articulo", label: "Artículo", icon: FileText },
  { value: "historia", label: "Historia / Caso", icon: Type },
  { value: "url", label: "URL / Enlace", icon: LinkIcon },
  { value: "texto", label: "Texto libre", icon: Type },
  { value: "notas", label: "Notas de reunión", icon: FileText },
  { value: "referencia", label: "Referencia visual", icon: FileText },
];

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
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [expandedPiece, setExpandedPiece] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("insumos");
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
        <RefreshCw className="w-6 h-6 text-coral animate-spin" />
      </div>
    );
  }

  const handleCreateCycle = async () => {
    if (!newCycle.title || !newCycle.start_date || !newCycle.end_date) return;
    const result = await createCycle({ profile_id: profileId!, ...newCycle });
    if (result) {
      setSelectedCycleId(result.id);
      setShowNewCycle(false);
      setNewCycle({ title: "", cycle_type: "mensual", start_date: "", end_date: "", briefing_data: { objective: "", themes: "", special_dates: "" } });
    }
  };

  const handleAddInput = async () => {
    if (!newInput.title && !newInput.content && !newInput.url) return;
    await addInput({
      cycle_id: selectedCycleId!,
      input_type: newInput.input_type,
      title: newInput.title || null,
      content: newInput.content || null,
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
      toast.success("Piezas ejecutadas");
    } catch (e: any) {
      toast.error(e.message || "Error ejecutando");
    } finally {
      setExecuting(false);
    }
  };

  const handleExportCSV = () => {
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

  // Analytics CSV import
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

  // Ads CSV import
  const handleAdsImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) { toast.error("CSV vacío"); return; }

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const batch = crypto.randomUUID().slice(0, 8);

    // Detect platform
    const platform = headers.some(h => h.includes("campaign") && h.includes("id"))
      ? (text.toLowerCase().includes("google") ? "Google Ads" : "Meta Ads")
      : "Otra";

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

  const approvedCount = pieces.filter(p => p.status === "aprobada").length;
  const executedCount = pieces.filter(p => p.status === "ejecutada").length;
  const totalSpend = performance.reduce((s, p) => s + (p.spend || 0), 0);
  const totalImpressions = performance.reduce((s, p) => s + (p.impressions || 0), 0);
  const avgCTR = performance.length > 0 ? performance.reduce((s, p) => s + (p.ctr || 0), 0) / performance.length : 0;

  return (
    <div className={`min-h-screen bg-background ${isDark ? "" : "theme-light"}`}>
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/parrilla")}
              className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">{profile.client_name}</h1>
              <p className="text-sm text-muted-foreground">{profile.industry} · {(profile.preferred_networks || []).join(", ")}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* Cycle selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1 overflow-x-auto">
            {cycles.map(c => (
              <button key={c.id} onClick={() => setSelectedCycleId(c.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCycleId === c.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {c.title}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowNewCycle(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Nuevo ciclo
          </Button>
        </div>

        {!selectedCycle ? (
          <Card className="p-12 text-center bg-card border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Crea tu primer ciclo de contenido</h3>
            <Button onClick={() => setShowNewCycle(true)} className="bg-gradient-coral text-primary-foreground mt-2">
              <Plus className="w-4 h-4 mr-1.5" /> Nuevo ciclo
            </Button>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-2xl font-bold text-foreground">{inputs.length}</p>
                <p className="text-xs text-muted-foreground">Insumos</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-2xl font-bold text-foreground">{pieces.length}</p>
                <p className="text-xs text-muted-foreground">Piezas</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Aprobadas</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-2xl font-bold text-blue-400">{executedCount}</p>
                <p className="text-xs text-muted-foreground">Ejecutadas</p>
              </Card>
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-2xl font-bold text-foreground">{analytics.length}</p>
                <p className="text-xs text-muted-foreground">Métricas</p>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-secondary">
                <TabsTrigger value="insumos">Insumos ({inputs.length})</TabsTrigger>
                <TabsTrigger value="parrilla">Parrilla ({pieces.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics ({analytics.length})</TabsTrigger>
                <TabsTrigger value="ads">Ads ({campaigns.length})</TabsTrigger>
              </TabsList>

              {/* INSUMOS TAB */}
              <TabsContent value="insumos">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Agrega los materiales que alimentarán la parrilla: artículos, historias, URLs, notas, etc.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowAddInput(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Agregar insumo
                      </Button>
                      {inputs.length > 0 && (
                        <Button onClick={handleGenerateGrid} disabled={generating}
                          className="bg-gradient-coral text-primary-foreground font-semibold" size="sm">
                          {generating ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                          {generating ? "Generando..." : "Generar parrilla"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {inputs.length === 0 ? (
                    <Card className="p-8 text-center bg-card border-border">
                      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-foreground font-semibold mb-1">Sin insumos</h3>
                      <p className="text-sm text-muted-foreground mb-3">Agrega artículos, historias o materiales para generar la parrilla</p>
                      <Button variant="outline" onClick={() => setShowAddInput(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Agregar primer insumo
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {inputs.map((inp, i) => (
                        <Card key={inp.id} className="p-4 bg-card border-border">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs capitalize">{inp.input_type}</Badge>
                                <span className="font-medium text-foreground text-sm">{inp.title || `Insumo ${i + 1}`}</span>
                              </div>
                              {inp.content && <p className="text-sm text-muted-foreground line-clamp-3">{inp.content}</p>}
                              {inp.url && <a href={inp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">{inp.url}</a>}
                              {inp.tags?.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {inp.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                              onClick={() => removeInput(inp.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* PARRILLA TAB */}
              <TabsContent value="parrilla">
                <div className="space-y-3">
                  {pieces.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {approvedCount > 0 && executedCount < approvedCount && (
                        <Button onClick={handleExecutePieces} disabled={executing} variant="outline" size="sm">
                          {executing ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                          Ejecutar {approvedCount} aprobadas
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="w-3.5 h-3.5 mr-1" /> CSV
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => { pieces.filter(p => p.status === "pendiente").forEach(p => updatePiece(p.id, { status: "aprobada" })); }}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Aprobar todas
                      </Button>
                    </div>
                  )}

                  {pieces.length === 0 ? (
                    <Card className="p-8 text-center bg-card border-border">
                      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Agrega insumos y genera la parrilla con IA</p>
                    </Card>
                  ) : (
                    pieces.map(piece => (
                      <motion.div key={piece.id} layout>
                        <Card className="p-4 bg-card border-border">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className={NETWORK_COLORS[piece.network] || "bg-secondary text-foreground"}>{piece.network}</Badge>
                                <Badge variant="outline" className="text-xs">{piece.format}</Badge>
                                {piece.pillar && <Badge variant="outline" className="text-xs">{piece.pillar}</Badge>}
                                <Badge className={STATUS_COLORS[piece.status] || ""}>{piece.status}</Badge>
                                <span className="text-xs text-muted-foreground ml-auto">{piece.scheduled_date}</span>
                              </div>
                              <p className="text-sm text-foreground line-clamp-2">{piece.final_copy || piece.draft_copy || "Sin contenido"}</p>
                              {expandedPiece === piece.id && (
                                <div className="mt-3 space-y-2 text-sm">
                                  {piece.objective && <p className="text-muted-foreground"><strong>Objetivo:</strong> {piece.objective}</p>}
                                  <p className="text-foreground whitespace-pre-wrap">{piece.final_copy || piece.draft_copy}</p>
                                  {piece.hashtags?.length > 0 && <p className="text-cyan-400 text-xs">{piece.hashtags.map(h => `#${h}`).join(" ")}</p>}
                                  {piece.cta && <p className="text-muted-foreground text-xs"><strong>CTA:</strong> {piece.cta}</p>}
                                  {piece.design_prompt && (
                                    <div className="bg-secondary p-2 rounded text-xs text-muted-foreground">
                                      <strong>Prompt de diseño:</strong> {piece.design_prompt}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setExpandedPiece(expandedPiece === piece.id ? null : piece.id)}>
                                {expandedPiece === piece.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                              {piece.status === "pendiente" && (
                                <>
                                  <Button variant="ghost" size="sm" className="text-green-400" onClick={() => updatePiece(piece.id, { status: "aprobada" })}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => updatePiece(piece.id, { status: "rechazada" })}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Importa datos de FanPage Karma para analizar rendimiento</p>
                    <div>
                      <input ref={analyticsFileRef} type="file" accept=".csv" className="hidden" onChange={handleAnalyticsImport} />
                      <Button variant="outline" size="sm" onClick={() => analyticsFileRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5 mr-1" /> Importar CSV
                      </Button>
                    </div>
                  </div>

                  {analytics.length === 0 ? (
                    <Card className="p-8 text-center bg-card border-border">
                      <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-foreground font-semibold mb-1">Sin datos de analytics</h3>
                      <p className="text-sm text-muted-foreground">Exporta tu reporte de FanPage Karma como CSV y súbelo aquí</p>
                    </Card>
                  ) : (
                    <>
                      {/* Summary cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">{analytics.reduce((s, a) => s + a.reach, 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Alcance total</p>
                        </Card>
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">{analytics.reduce((s, a) => s + a.engagement, 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Engagement total</p>
                        </Card>
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">
                            {(analytics.reduce((s, a) => s + a.engagement_rate, 0) / analytics.length * 100).toFixed(2)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Engagement rate prom.</p>
                        </Card>
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">{analytics.length}</p>
                          <p className="text-xs text-muted-foreground">Posts analizados</p>
                        </Card>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground text-xs">
                              <th className="text-left p-2">Fecha</th>
                              <th className="text-left p-2">Red</th>
                              <th className="text-left p-2">Tipo</th>
                              <th className="text-right p-2">Alcance</th>
                              <th className="text-right p-2">Engagement</th>
                              <th className="text-right p-2">Clicks</th>
                              <th className="text-right p-2">ER%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.slice(0, 50).map(a => (
                              <tr key={a.id} className="border-b border-border/50">
                                <td className="p-2 text-foreground">{a.published_date}</td>
                                <td className="p-2"><Badge variant="outline" className="text-xs">{a.network || "—"}</Badge></td>
                                <td className="p-2 text-muted-foreground">{a.post_type || "—"}</td>
                                <td className="p-2 text-right text-foreground">{a.reach.toLocaleString()}</td>
                                <td className="p-2 text-right text-foreground">{a.engagement.toLocaleString()}</td>
                                <td className="p-2 text-right text-foreground">{a.clicks.toLocaleString()}</td>
                                <td className="p-2 text-right text-foreground">{(a.engagement_rate * 100).toFixed(2)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* ADS TAB */}
              <TabsContent value="ads">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Importa reportes de Meta Ads o Google Ads</p>
                    <div>
                      <input ref={adsFileRef} type="file" accept=".csv" className="hidden" onChange={handleAdsImport} />
                      <Button variant="outline" size="sm" onClick={() => adsFileRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5 mr-1" /> Importar CSV de Ads
                      </Button>
                    </div>
                  </div>

                  {campaigns.length === 0 ? (
                    <Card className="p-8 text-center bg-card border-border">
                      <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-foreground font-semibold mb-1">Sin datos de publicidad</h3>
                      <p className="text-sm text-muted-foreground">Exporta tu reporte de Meta Ads Manager o Google Ads como CSV</p>
                    </Card>
                  ) : (
                    <>
                      {/* Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          <p className="text-xs text-muted-foreground">Gasto total</p>
                        </Card>
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">{totalImpressions.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Impresiones</p>
                        </Card>
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">{(avgCTR * 100).toFixed(2)}%</p>
                          <p className="text-xs text-muted-foreground">CTR promedio</p>
                        </Card>
                        <Card className="p-3 bg-card border-border text-center">
                          <p className="text-xl font-bold text-foreground">{campaigns.length}</p>
                          <p className="text-xs text-muted-foreground">Campañas</p>
                        </Card>
                      </div>

                      {/* Campaigns list */}
                      {campaigns.map(camp => {
                        const campPerf = performance.filter(p => p.campaign_id === camp.id);
                        const campSpend = campPerf.reduce((s, p) => s + (p.spend || 0), 0);
                        const campClicks = campPerf.reduce((s, p) => s + (p.clicks || 0), 0);
                        return (
                          <Card key={camp.id} className="p-4 bg-card border-border">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground">{camp.campaign_name}</h4>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{camp.platform}</Badge>
                                  <span className="text-xs text-muted-foreground">{campPerf.length} anuncios</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-foreground">${campSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">{campClicks.toLocaleString()} clicks</p>
                              </div>
                            </div>
                            {/* Top ads */}
                            <div className="space-y-1 mt-3">
                              {campPerf.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5).map(ad => (
                                <div key={ad.id} className="flex items-center justify-between text-xs py-1 border-t border-border/30">
                                  <span className="text-foreground truncate max-w-[200px]">{ad.ad_name || "Sin nombre"}</span>
                                  <div className="flex gap-3 text-muted-foreground">
                                    <span>${(ad.spend || 0).toFixed(0)}</span>
                                    <span>{(ad.clicks || 0)} clicks</span>
                                    <span>{((ad.ctr || 0) * 100).toFixed(1)}% CTR</span>
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
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* New Cycle Dialog */}
      <Dialog open={showNewCycle} onOpenChange={setShowNewCycle}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">Nuevo Ciclo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={newCycle.title} className="bg-secondary border-border mt-1"
              onChange={e => setNewCycle(c => ({ ...c, title: e.target.value }))} placeholder="Ej: Abril 2026" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inicio *</Label><Input type="date" value={newCycle.start_date} className="bg-secondary border-border mt-1"
                onChange={e => setNewCycle(c => ({ ...c, start_date: e.target.value }))} /></div>
              <div><Label>Fin *</Label><Input type="date" value={newCycle.end_date} className="bg-secondary border-border mt-1"
                onChange={e => setNewCycle(c => ({ ...c, end_date: e.target.value }))} /></div>
            </div>
            <div><Label>Objetivo</Label><Textarea value={newCycle.briefing_data.objective} className="bg-secondary border-border mt-1"
              onChange={e => setNewCycle(c => ({ ...c, briefing_data: { ...c.briefing_data, objective: e.target.value } }))}
              placeholder="¿Qué quiere lograr el cliente?" rows={2} /></div>
            <Button onClick={handleCreateCycle} className="w-full bg-gradient-coral text-primary-foreground font-semibold"
              disabled={!newCycle.title || !newCycle.start_date || !newCycle.end_date}>Crear ciclo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Input Dialog */}
      <Dialog open={showAddInput} onOpenChange={setShowAddInput}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground">Agregar Insumo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de insumo</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {INPUT_TYPES.map(t => (
                  <Badge key={t.value} className="cursor-pointer"
                    variant={newInput.input_type === t.value ? "default" : "outline"}
                    onClick={() => setNewInput(i => ({ ...i, input_type: t.value }))}>
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div><Label>Título</Label><Input value={newInput.title} className="bg-secondary border-border mt-1"
              onChange={e => setNewInput(i => ({ ...i, title: e.target.value }))}
              placeholder="Ej: Artículo sobre elecciones 2026" /></div>
            {(newInput.input_type === "url" || newInput.input_type === "articulo") && (
              <div><Label>URL</Label><Input value={newInput.url} className="bg-secondary border-border mt-1"
                onChange={e => setNewInput(i => ({ ...i, url: e.target.value }))}
                placeholder="https://..." /></div>
            )}
            <div><Label>Contenido / Texto</Label><Textarea value={newInput.content} className="bg-secondary border-border mt-1"
              onChange={e => setNewInput(i => ({ ...i, content: e.target.value }))}
              placeholder="Pega aquí el texto del artículo, historia, notas..." rows={6} /></div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setNewInput(i => ({ ...i, tags: [...i.tags, tagInput.trim()] })); setTagInput(""); } } }}
                  placeholder="Agregar tag..." className="bg-secondary border-border" />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {newInput.tags.map(t => (
                  <Badge key={t} variant="secondary" className="cursor-pointer text-xs"
                    onClick={() => setNewInput(i => ({ ...i, tags: i.tags.filter(x => x !== t) }))}>{t} ×</Badge>
                ))}
              </div>
            </div>
            <Button onClick={handleAddInput} className="w-full bg-gradient-coral text-primary-foreground font-semibold"
              disabled={!newInput.title && !newInput.content && !newInput.url}>Agregar insumo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentCycleDetail;
