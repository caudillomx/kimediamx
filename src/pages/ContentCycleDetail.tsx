import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContentEngine, useContentCycles, useContentPieces, useContentLearnings, ContentProfile, ContentCycle } from "@/hooks/useContentEngine";
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
  CheckCircle2, Clock, XCircle, Eye,
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

const ContentCycleDetail = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useThemeToggle();
  const { profiles } = useContentEngine();
  const { cycles, createCycle, updateCycle } = useContentCycles(profileId || null);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const { pieces, updatePiece, bulkInsertPieces } = useContentPieces(selectedCycleId);
  const { learnings } = useContentLearnings(profileId || null);
  const [generating, setGenerating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [expandedPiece, setExpandedPiece] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("parrilla");
  const [newCycle, setNewCycle] = useState({
    title: "", cycle_type: "mensual", start_date: "", end_date: "",
    briefing_data: { objective: "", themes: "", special_dates: "" },
  });

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
    const result = await createCycle({
      profile_id: profileId!,
      ...newCycle,
    });
    if (result) {
      setSelectedCycleId(result.id);
      setShowNewCycle(false);
      setNewCycle({ title: "", cycle_type: "mensual", start_date: "", end_date: "", briefing_data: { objective: "", themes: "", special_dates: "" } });
    }
  };

  const handleGenerateGrid = async () => {
    if (!selectedCycle) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          action: "generate_grid",
          profile,
          cycle: selectedCycle,
          learnings,
        },
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
      toast.success(`${generatedPieces.length} piezas generadas`);
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
        body: {
          action: "execute_pieces",
          profile,
          pieces: approved,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Error ejecutando");

      for (const ep of (data.data.executed_pieces || [])) {
        await updatePiece(ep.id, {
          final_copy: ep.final_copy,
          hashtags: ep.hashtags || [],
          cta: ep.cta,
          design_prompt: ep.design_prompt,
          status: "ejecutada",
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
      p.scheduled_date || "",
      p.network,
      p.format,
      p.pillar || "",
      (p.final_copy || p.draft_copy || "").replace(/"/g, '""'),
      (p.hashtags || []).join(" "),
      p.cta || "",
      p.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parrilla_${profile.client_name}_${selectedCycle?.start_date || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const approvedCount = pieces.filter(p => p.status === "aprobada").length;
  const executedCount = pieces.filter(p => p.status === "ejecutada").length;

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
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                {profile.client_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {profile.industry} · {(profile.preferred_networks || []).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
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
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-3 bg-card border-border text-center">
                <p className="text-2xl font-bold text-foreground">{pieces.length}</p>
                <p className="text-xs text-muted-foreground">Piezas totales</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {selectedCycle.status === "briefing" ? "📋" : selectedCycle.status === "parrilla" ? "📝" : selectedCycle.status === "ejecutado" ? "✅" : "📊"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{selectedCycle.status}</p>
              </Card>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {pieces.length === 0 && (
                <Button onClick={handleGenerateGrid} disabled={generating}
                  className="bg-gradient-coral text-primary-foreground font-semibold">
                  {generating ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                  {generating ? "Generando..." : "Generar parrilla con IA"}
                </Button>
              )}
              {approvedCount > 0 && executedCount < approvedCount && (
                <Button onClick={handleExecutePieces} disabled={executing} variant="outline">
                  {executing ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                  {executing ? "Ejecutando..." : `Ejecutar ${approvedCount} aprobadas`}
                </Button>
              )}
              {pieces.length > 0 && (
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-1.5" /> Exportar CSV
                </Button>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-secondary">
                <TabsTrigger value="parrilla">Parrilla ({pieces.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="ads">Publicidad</TabsTrigger>
              </TabsList>

              <TabsContent value="parrilla">
                <AnimatePresence>
                  {pieces.length === 0 ? (
                    <Card className="p-8 text-center bg-card border-border">
                      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Genera la parrilla con IA para ver las piezas aquí</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {pieces.map(piece => (
                        <motion.div key={piece.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Card className="p-4 bg-card border-border">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge className={NETWORK_COLORS[piece.network] || "bg-secondary text-foreground"}>
                                    {piece.network}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{piece.format}</Badge>
                                  {piece.pillar && <Badge variant="outline" className="text-xs">{piece.pillar}</Badge>}
                                  <Badge className={STATUS_COLORS[piece.status] || ""}>{piece.status}</Badge>
                                  <span className="text-xs text-muted-foreground ml-auto">{piece.scheduled_date}</span>
                                </div>
                                <p className="text-sm text-foreground line-clamp-2">
                                  {piece.final_copy || piece.draft_copy || "Sin contenido"}
                                </p>
                                {expandedPiece === piece.id && (
                                  <div className="mt-3 space-y-2">
                                    {piece.objective && (
                                      <p className="text-xs text-muted-foreground"><strong>Objetivo:</strong> {piece.objective}</p>
                                    )}
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                      {piece.final_copy || piece.draft_copy}
                                    </p>
                                    {piece.hashtags?.length > 0 && (
                                      <p className="text-xs text-cyan-400">{piece.hashtags.map(h => `#${h}`).join(" ")}</p>
                                    )}
                                    {piece.cta && <p className="text-xs text-muted-foreground"><strong>CTA:</strong> {piece.cta}</p>}
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
                                    <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300"
                                      onClick={() => updatePiece(piece.id, { status: "aprobada" })}>
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"
                                      onClick={() => updatePiece(piece.id, { status: "rechazada" })}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="p-8 text-center bg-card border-border">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Importar datos de FanPage Karma</h3>
                  <p className="text-sm text-muted-foreground mb-4">Sube un CSV con las métricas del periodo para generar análisis con IA</p>
                  <Button variant="outline" disabled>
                    <Upload className="w-4 h-4 mr-1.5" /> Próximamente
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="ads">
                <Card className="p-8 text-center bg-card border-border">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Importar reportes de Ads</h3>
                  <p className="text-sm text-muted-foreground mb-4">Sube CSVs de Meta Ads o Google Ads para análisis de rendimiento</p>
                  <Button variant="outline" disabled>
                    <Upload className="w-4 h-4 mr-1.5" /> Próximamente
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* New Cycle Dialog */}
      <Dialog open={showNewCycle} onOpenChange={setShowNewCycle}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Ciclo de Contenido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={newCycle.title} className="bg-secondary border-border mt-1"
                onChange={e => setNewCycle(c => ({ ...c, title: e.target.value }))}
                placeholder="Ej: Abril 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Inicio *</Label>
                <Input type="date" value={newCycle.start_date} className="bg-secondary border-border mt-1"
                  onChange={e => setNewCycle(c => ({ ...c, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>Fin *</Label>
                <Input type="date" value={newCycle.end_date} className="bg-secondary border-border mt-1"
                  onChange={e => setNewCycle(c => ({ ...c, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Objetivo del ciclo</Label>
              <Textarea value={newCycle.briefing_data.objective} className="bg-secondary border-border mt-1"
                onChange={e => setNewCycle(c => ({ ...c, briefing_data: { ...c.briefing_data, objective: e.target.value } }))}
                placeholder="¿Qué quiere lograr el cliente este mes?" rows={2} />
            </div>
            <div>
              <Label>Temas prioritarios</Label>
              <Textarea value={newCycle.briefing_data.themes} className="bg-secondary border-border mt-1"
                onChange={e => setNewCycle(c => ({ ...c, briefing_data: { ...c.briefing_data, themes: e.target.value } }))}
                placeholder="Temas o fechas especiales a cubrir" rows={2} />
            </div>
            <Button onClick={handleCreateCycle} className="w-full bg-gradient-coral text-primary-foreground font-semibold"
              disabled={!newCycle.title || !newCycle.start_date || !newCycle.end_date}>
              Crear ciclo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentCycleDetail;
