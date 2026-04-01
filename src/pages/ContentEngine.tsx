import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContentEngine, useContentCycles, ContentProfile } from "@/hooks/useContentEngine";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Search, RefreshCw, LogOut, Sun, Moon, ArrowLeft,
  Grid3X3, BarChart3, Megaphone, BookOpen, Zap, TrendingUp,
  Calendar, Layers, Download, Users, Trash2, Pencil, Camera,
  Upload, FileText, X, Flame, Loader2, Send,
} from "lucide-react";
import { CLIENTS } from "@/hooks/useOperationsData";

const NETWORKS = ["Instagram", "Facebook", "X", "LinkedIn", "TikTok"];
const TONES = ["Profesional", "Cercano", "Inspirador", "Educativo", "Disruptivo", "Formal"];
const CLIENT_TYPES = [
  { value: "calendarizado", label: "📅 Calendarizado", desc: "Contenido predecible, temáticas fijas (ej: Padre Sada)" },
  { value: "coyuntural", label: "🔥 Coyuntural", desc: "Depende de tendencias y virales (ej: KiMedia)" },
  { value: "mixto", label: "⚡ Mixto", desc: "Combina calendario fijo con contenido de tendencias" },
];

const NETWORK_ICONS: Record<string, string> = {
  Instagram: "📸", Facebook: "📘", X: "𝕏", LinkedIn: "💼", TikTok: "🎵",
};

const ClientCard = ({ profile, onClick, onDelete, onEdit }: { profile: ContentProfile; onClick: () => void; onDelete: () => void; onEdit: () => void }) => {
  const networks = profile.preferred_networks || [];
  const pillars = profile.content_pillars || [];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card
        className="group relative overflow-hidden cursor-pointer bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-glow"
        onClick={onClick}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-coral w-full" />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold text-foreground group-hover:text-gradient transition-colors">
                {profile.client_name}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                {profile.industry || "Sin industria"} · {profile.brand_tone || "Profesional"}
                {profile.client_type && profile.client_type !== "calendarizado" && (
                  <span className="ml-1">{profile.client_type === "coyuntural" ? "🔥" : "⚡"}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.client_name} className="w-10 h-10 rounded-xl object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center text-primary-foreground text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                  {profile.client_name.charAt(0)}
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Editar cliente"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Eliminar cliente"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Audience */}
          {profile.target_audience && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              🎯 {profile.target_audience}
            </p>
          )}

          {/* Pillars */}
          {pillars.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pillars.slice(0, 4).map(p => (
                <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  {p}
                </span>
              ))}
              {pillars.length > 4 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  +{pillars.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Networks + Frequency */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              {networks.map(n => (
                <span key={n} className="text-sm" title={n}>{NETWORK_ICONS[n] || "📱"}</span>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {profile.posting_frequency || "Sin frecuencia"}
            </span>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-primary/5 to-transparent" />
      </Card>
    </motion.div>
  );
};

const ContentEngine = () => {
  const navigate = useNavigate();
  const { profiles, loading, fetchProfiles, createProfile, updateProfile, deleteProfile } = useContentEngine();
  const { isDark, toggle: toggleTheme } = useThemeToggle();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [showImportKit, setShowImportKit] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<ContentProfile | null>(null);
  const [profileToEdit, setProfileToEdit] = useState<ContentProfile | null>(null);
  const [editData, setEditData] = useState({ client_name: "", brand_tone: "", brand_essence: "", client_type: "calendarizado", content_pillars: [] as string[], preferred_networks: [] as string[], brandbook_url: "" as string | null, brandbook_file_name: "" as string | null, target_audience: "", restrictions: "", reference_accounts: "" });
  const [uploadingBrandbook, setUploadingBrandbook] = useState(false);
  const [editPillarInput, setEditPillarInput] = useState("");
  const [kitProfiles, setKitProfiles] = useState<any[]>([]);
  const [loadingKit, setLoadingKit] = useState(false);
  // Express Cycle state
  const [showExpress, setShowExpress] = useState(false);
  const [expressGenerating, setExpressGenerating] = useState(false);
  const [expressData, setExpressData] = useState({
    profileId: "",
    topic: "",
    context: "",
    networks: ["Instagram"] as string[],
    formats: ["imagen"] as string[],
    numPieces: 3,
  });
  const [newProfile, setNewProfile] = useState({
    client_name: "",
    industry: "",
    target_audience: "",
    brand_tone: "Profesional",
    brand_essence: "",
    client_type: "calendarizado",
    content_pillars: [] as string[],
    preferred_networks: ["Instagram", "Facebook"] as string[],
    posting_frequency: "3 veces por semana",
    restrictions: "",
  });
  const [pillarInput, setPillarInput] = useState("");

  const loadKitProfiles = async () => {
    setLoadingKit(true);
    const { data } = await supabase
      .from("brand_kit_profiles")
      .select("id, full_name, email, profession, industry, brand_tone, target_audience, main_channel, company_name, kit_type, created_at")
      .order("created_at", { ascending: false });
    setKitProfiles(data || []);
    setLoadingKit(false);
  };

  const importKitProfile = async (kit: any) => {
    const clientName = kit.kit_type === "pyme" ? kit.company_name || kit.full_name : kit.full_name;
    const existing = profiles.find(p => p.client_name === clientName);
    if (existing) {
      toast({ title: "Ya existe un perfil para este cliente", variant: "destructive" });
      return;
    }
    const mainChannel = kit.main_channel || "Instagram";
    const networks = [mainChannel];
    if (!networks.includes("Instagram")) networks.push("Instagram");
    if (!networks.includes("Facebook")) networks.push("Facebook");

    const result = await createProfile({
      client_name: clientName,
      industry: kit.industry || "",
      target_audience: kit.target_audience || "",
      brand_tone: kit.brand_tone || "Profesional",
      content_pillars: [],
      preferred_networks: networks,
      posting_frequency: "3 veces por semana",
      restrictions: "",
      notes: `Importado desde Kit ${kit.kit_type === "pyme" ? "PyME" : "Marca Personal"} — ${kit.email}`,
    });
    if (result) {
      toast({ title: `Perfil "${clientName}" creado desde Kit` });
      setShowImportKit(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setCheckingAuth(false);
      if (!s) navigate("/admin/operaciones/login");
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setCheckingAuth(false);
      if (!s) navigate("/admin/operaciones/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-coral flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground animate-fade-in">Cargando motor...</p>
        </div>
      </div>
    );
  }

  const filtered = profiles.filter(p =>
    !searchQuery || p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProfile = async () => {
    if (!newProfile.client_name) return;
    const result = await createProfile(newProfile);
    if (result) {
      setShowNewProfile(false);
      setIsCustomClient(false);
      setNewProfile({
        client_name: "", industry: "", target_audience: "", brand_tone: "Profesional",
        brand_essence: "", client_type: "calendarizado",
        content_pillars: [], preferred_networks: ["Instagram", "Facebook"],
        posting_frequency: "3 veces por semana", restrictions: "",
      });
    }
  };

  const handleExpressCycle = async () => {
    if (!expressData.profileId || !expressData.topic.trim()) return;
    const selectedProfile = profiles.find(p => p.id === expressData.profileId);
    if (!selectedProfile) return;
    setExpressGenerating(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      // 1. Create express cycle
      const { data: cycle, error: cycleErr } = await supabase
        .from("content_cycles")
        .insert({
          profile_id: expressData.profileId,
          title: `⚡ Express: ${expressData.topic.slice(0, 50)}`,
          cycle_type: "express",
          start_date: today,
          end_date: today,
          status: "briefing",
          briefing_data: { objective: expressData.topic, themes: expressData.context },
        })
        .select()
        .single();
      if (cycleErr || !cycle) throw new Error("Error creando ciclo express");

      // 2. Add topic as input
      await supabase.from("content_inputs").insert({
        cycle_id: (cycle as any).id,
        input_type: "texto",
        title: expressData.topic,
        content: `TEMA DE COYUNTURA / EMERGENCIA:\n${expressData.topic}\n\nCONTEXTO:\n${expressData.context || "Sin contexto adicional"}`,
        sort_order: 0,
      });

      // 3. Generate pieces via AI
      const expressCycle = {
        ...(cycle as any),
        cycle_type: "express",
      };
      const expressProfile = {
        ...selectedProfile,
        preferred_networks: expressData.networks,
      };
      const expressInputs = [{
        input_type: "texto",
        title: expressData.topic,
        content: `TEMA DE COYUNTURA / EMERGENCIA:\n${expressData.topic}\n\nCONTEXTO:\n${expressData.context || "Sin contexto adicional"}\n\nINSTRUCCIONES ESPECIALES: Genera exactamente ${expressData.numPieces} piezas de contenido para publicación INMEDIATA. Formatos solicitados: ${expressData.formats.join(", ")}. Prioriza urgencia, relevancia y timing. El contenido debe sentirse oportuno y actual.`,
        tags: [],
      }];

      const { data: genData, error: genErr } = await supabase.functions.invoke("generate-content", {
        body: { action: "generate_grid", profile: expressProfile, cycle: expressCycle, learnings: [], inputs: expressInputs, trendResults: [] },
      });
      if (genErr) throw genErr;
      if (!genData?.success) throw new Error(genData?.error || "Error generando contenido express");

      const generatedPieces = (genData.data.pieces || []).map((p: any, i: number) => ({
        cycle_id: (cycle as any).id,
        scheduled_date: today,
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
      await supabase.from("content_pieces").insert(generatedPieces as any[]);
      await supabase.from("content_cycles").update({ status: "parrilla" }).eq("id", (cycle as any).id);

      toast({ title: `⚡ ${generatedPieces.length} piezas express generadas` });
      setShowExpress(false);
      setExpressData({ profileId: "", topic: "", context: "", networks: ["Instagram"], formats: ["imagen"], numPieces: 3 });
      navigate(`/parrilla/${expressData.profileId}`);
    } catch (e: any) {
      toast({ title: e.message || "Error creando ciclo express", variant: "destructive" });
    } finally {
      setExpressGenerating(false);
    }
  };

  const addPillar = () => {
    if (pillarInput.trim() && !newProfile.content_pillars.includes(pillarInput.trim())) {
      setNewProfile(p => ({ ...p, content_pillars: [...p.content_pillars, pillarInput.trim()] }));
      setPillarInput("");
    }
  };

  const toggleNetwork = (net: string) => {
    setNewProfile(p => ({
      ...p,
      preferred_networks: p.preferred_networks.includes(net)
        ? p.preferred_networks.filter(n => n !== net)
        : [...p.preferred_networks, net]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/operaciones")}
              className="text-muted-foreground hover:text-foreground rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-coral flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </span>
                Motor de <span className="text-gradient">Contenido</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 ml-[52px]">
                {profiles.length} {profiles.length === 1 ? "cliente" : "clientes"} · Planea → Ejecuta → Evalúa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground rounded-xl">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/operaciones")}
              className="text-muted-foreground hover:text-foreground rounded-xl">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Search + Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente..." className="pl-10 bg-secondary border-border rounded-xl h-11" />
          </div>
          <Button variant="outline" onClick={() => { setShowExpress(true); if (profiles.length > 0 && !expressData.profileId) setExpressData(d => ({ ...d, profileId: profiles[0].id })); }}
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-semibold rounded-xl h-11 px-5">
            <Flame className="w-4 h-4 mr-1.5" /> Post Express
          </Button>
          <Button variant="outline" onClick={() => { setShowImportKit(true); loadKitProfiles(); }}
            className="border-border text-foreground font-semibold rounded-xl h-11 px-5">
            <Download className="w-4 h-4 mr-1.5" /> Importar desde Kit
          </Button>
          <Button onClick={() => setShowNewProfile(true)}
            className="bg-gradient-coral text-primary-foreground font-semibold rounded-xl h-11 px-5 shadow-glow hover:shadow-glow-lg transition-shadow">
            <Plus className="w-4 h-4 mr-1.5" /> Nuevo cliente
          </Button>
        </motion.div>

        {/* Client Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando clientes...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-16 text-center bg-card border-border border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-gradient-coral/10 flex items-center justify-center mx-auto mb-5">
                <Grid3X3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {searchQuery ? "Sin resultados" : "Tu motor está listo"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `No hay clientes que coincidan con "${searchQuery}"`
                  : "Crea tu primer perfil editorial para comenzar a planear, generar y evaluar contenido con IA"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowNewProfile(true)} className="bg-gradient-coral text-primary-foreground font-semibold rounded-xl px-6">
                  <Plus className="w-4 h-4 mr-1.5" /> Crear primer perfil
                </Button>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <ClientCard
                    profile={profile}
                    onClick={() => navigate(`/parrilla/${profile.id}`)}
                    onDelete={() => setProfileToDelete(profile)}
                    onEdit={() => {
                      setProfileToEdit(profile);
                      setEditData({
                        client_name: profile.client_name,
                        brand_tone: profile.brand_tone || "",
                        brand_essence: (profile as any).brand_essence || "",
                        client_type: (profile as any).client_type || "calendarizado",
                        content_pillars: profile.content_pillars || [],
                        preferred_networks: profile.preferred_networks || [],
                        brandbook_url: (profile as any).brandbook_url || null,
                        brandbook_file_name: (profile as any).brandbook_file_name || null,
                        target_audience: profile.target_audience || "",
                        restrictions: (profile as any).restrictions || "",
                        reference_accounts: (profile as any).reference_accounts || "",
                        website_url: (profile as any).website_url || "",
                      } as any);
                      setEditPillarInput("");
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New Profile Dialog */}
      <Dialog open={showNewProfile} onOpenChange={setShowNewProfile}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl">Nuevo Perfil Editorial</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cliente *</Label>
              <select value={isCustomClient ? "__custom__" : newProfile.client_name}
                onChange={e => {
                  if (e.target.value === "__custom__") {
                    setIsCustomClient(true);
                    setNewProfile(p => ({ ...p, client_name: "" }));
                  } else {
                    setIsCustomClient(false);
                    setNewProfile(p => ({ ...p, client_name: e.target.value }));
                  }
                }}
                className="w-full mt-1.5 rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/30 transition-shadow">
                <option value="">Seleccionar...</option>
                {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">+ Otro cliente</option>
              </select>
              {isCustomClient && (
                <Input className="mt-2 bg-secondary border-border rounded-xl" placeholder="Nombre del cliente"
                  value={newProfile.client_name}
                  onChange={e => setNewProfile(p => ({ ...p, client_name: e.target.value }))} />
              )}
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Industria</Label>
              <Input value={newProfile.industry} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewProfile(p => ({ ...p, industry: e.target.value }))}
                placeholder="Ej: Salud, Tecnología, Gobierno..." />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Audiencia objetivo</Label>
              <Textarea value={newProfile.target_audience} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewProfile(p => ({ ...p, target_audience: e.target.value }))}
                placeholder="¿A quién le habla este cliente?" rows={2} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tono de marca <span className="text-primary">(puedes elegir varios)</span></Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {TONES.map(t => {
                  const selected = newProfile.brand_tone.split(", ").filter(Boolean);
                  const isSelected = selected.includes(t);
                  return (
                    <button key={t}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => {
                        const tones = selected.includes(t) ? selected.filter(x => x !== t) : [...selected, t];
                        setNewProfile(p => ({ ...p, brand_tone: tones.join(", ") }));
                      }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tipo de cliente</Label>
              <div className="flex flex-col gap-2 mt-1.5">
                {CLIENT_TYPES.map(ct => (
                  <button key={ct.value}
                    className={`text-left px-3 py-2 rounded-xl text-sm transition-all border ${
                      newProfile.client_type === ct.value
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-secondary border-border text-muted-foreground hover:border-primary/20"
                    }`}
                    onClick={() => setNewProfile(p => ({ ...p, client_type: ct.value }))}>
                    <span className="font-medium">{ct.label}</span>
                    <span className="text-xs block mt-0.5 opacity-70">{ct.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Esencia de marca / Brandbook</Label>
              <Textarea value={newProfile.brand_essence} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewProfile(p => ({ ...p, brand_essence: e.target.value }))}
                placeholder="Visión, misión, valores, personalidad de marca, propuesta de valor..." rows={4} />
              <p className="text-[10px] text-muted-foreground mt-1">Escribe un resumen o sube el archivo completo del brandbook</p>
              <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Subir brandbook (PDF, DOCX)</span>
                <input type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  toast({ title: "El brandbook se guardará al crear el perfil" });
                }} />
              </label>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pilares de contenido</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={pillarInput} onChange={e => setPillarInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addPillar())}
                  placeholder="Agregar pilar..." className="bg-secondary border-border rounded-xl" />
                <Button variant="outline" onClick={addPillar} size="sm" className="rounded-xl">+</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {newProfile.content_pillars.map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setNewProfile(pr => ({ ...pr, content_pillars: pr.content_pillars.filter(x => x !== p) }))}>
                    {p} ×
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Redes sociales</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {NETWORKS.map(n => (
                  <button key={n}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      newProfile.preferred_networks.includes(n)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => toggleNetwork(n)}>
                    <span>{NETWORK_ICONS[n]}</span> {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Frecuencia</Label>
              <Input value={newProfile.posting_frequency} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewProfile(p => ({ ...p, posting_frequency: e.target.value }))}
                placeholder="Ej: 3 veces por semana" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Restricciones</Label>
              <Textarea value={newProfile.restrictions} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setNewProfile(p => ({ ...p, restrictions: e.target.value }))}
                placeholder="Temas prohibidos, lineamientos..." rows={2} />
            </div>
            <Button onClick={handleCreateProfile}
              className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-11 shadow-glow hover:shadow-glow-lg transition-shadow"
              disabled={!newProfile.client_name || newProfile.client_name === "__custom__"}>
              Crear perfil editorial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import from Kit Dialog */}
      <Dialog open={showImportKit} onOpenChange={setShowImportKit}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Importar desde Kit Digital
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Selecciona un perfil del Kit de Marca Personal o PyME para crear automáticamente un perfil editorial.
          </p>
          {loadingKit ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : kitProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No hay perfiles de Kit registrados aún.
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {kitProfiles.map(kit => {
                const clientName = kit.kit_type === "pyme" ? kit.company_name || kit.full_name : kit.full_name;
                const alreadyImported = profiles.some(p => p.client_name === clientName);
                return (
                  <div key={kit.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      alreadyImported ? "border-border bg-muted/50 opacity-60" : "border-border bg-secondary hover:border-primary/40 hover:bg-secondary/80"
                    }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-coral flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                        {clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {kit.kit_type === "pyme" ? "PyME" : "Personal"} · {kit.industry || "Sin industria"} · {kit.email}
                        </p>
                      </div>
                    </div>
                    {alreadyImported ? (
                      <Badge variant="secondary" className="text-xs shrink-0">Ya importado</Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-lg shrink-0"
                        onClick={() => importKitProfile(kit)}>
                        Importar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!profileToDelete} onOpenChange={(open) => !open && setProfileToDelete(null)}>
        <AlertDialogContent className="bg-card border-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-display">¿Eliminar a {profileToDelete?.client_name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Se borrarán todos los ciclos, piezas, insumos, analytics y campañas asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90"
              onClick={async () => {
                if (profileToDelete) {
                  await deleteProfile(profileToDelete.id);
                  setProfileToDelete(null);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit Profile Dialog */}
      <Dialog open={!!profileToEdit} onOpenChange={(open) => !open && setProfileToEdit(null)}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" /> Editar perfil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group/avatar">
                {profileToEdit?.avatar_url ? (
                  <img src={profileToEdit.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-border" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-coral flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {editData.client_name?.charAt(0) || "?"}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !profileToEdit) return;
                    const ext = file.name.split(".").pop();
                    const path = `${profileToEdit.id}.${ext}`;
                    const { error: upErr } = await supabase.storage.from("client-avatars").upload(path, file, { upsert: true });
                    if (upErr) { toast({ title: "Error subiendo imagen", variant: "destructive" }); return; }
                    const { data: urlData } = supabase.storage.from("client-avatars").getPublicUrl(path);
                    const avatarUrl = urlData.publicUrl + "?t=" + Date.now();
                    await updateProfile(profileToEdit.id, { avatar_url: avatarUrl } as any);
                    setProfileToEdit({ ...profileToEdit, avatar_url: avatarUrl });
                    toast({ title: "Imagen actualizada" });
                  }} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Haz clic en la imagen para cambiarla</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nombre del cliente</Label>
              <Input value={editData.client_name} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setEditData(d => ({ ...d, client_name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tono de marca <span className="text-primary">(puedes elegir varios)</span></Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {TONES.map(t => {
                  const selected = editData.brand_tone.split(", ").filter(Boolean);
                  const isSelected = selected.includes(t);
                  return (
                    <button key={t}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => {
                        const tones = isSelected ? selected.filter(x => x !== t) : [...selected, t];
                        setEditData(d => ({ ...d, brand_tone: tones.join(", ") }));
                      }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tipo de cliente</Label>
              <div className="flex flex-col gap-2 mt-1.5">
                {CLIENT_TYPES.map(ct => (
                  <button key={ct.value}
                    className={`text-left px-3 py-2 rounded-xl text-sm transition-all border ${
                      editData.client_type === ct.value
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-secondary border-border text-muted-foreground hover:border-primary/20"
                    }`}
                    onClick={() => setEditData(d => ({ ...d, client_type: ct.value }))}>
                    <span className="font-medium">{ct.label}</span>
                    <span className="text-xs block mt-0.5 opacity-70">{ct.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Esencia de marca / Brandbook</Label>
              <Textarea value={editData.brand_essence} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setEditData(d => ({ ...d, brand_essence: e.target.value }))}
                placeholder="Visión, misión, valores, personalidad de marca..." rows={4} />
              <p className="text-[10px] text-muted-foreground mt-1">Contexto base para la IA al generar contenido</p>
              {editData.brandbook_file_name ? (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-secondary/50">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs text-foreground flex-1 truncate">{editData.brandbook_file_name}</span>
                  <button className="text-muted-foreground hover:text-destructive transition-colors" onClick={async () => {
                    if (!profileToEdit) return;
                    const path = `${profileToEdit.id}/${editData.brandbook_file_name}`;
                    await supabase.storage.from("client-brandbooks").remove([path]);
                    await updateProfile(profileToEdit.id, { brandbook_url: null, brandbook_file_name: null } as any);
                    setEditData(d => ({ ...d, brandbook_url: null, brandbook_file_name: null }));
                    toast({ title: "Brandbook eliminado" });
                  }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors ${uploadingBrandbook ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{uploadingBrandbook ? "Subiendo..." : "Subir brandbook (PDF, DOCX)"}</span>
                  <input type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !profileToEdit) return;
                    setUploadingBrandbook(true);
                    const path = `${profileToEdit.id}/${file.name}`;
                    const { error: upErr } = await supabase.storage.from("client-brandbooks").upload(path, file, { upsert: true });
                    if (upErr) { toast({ title: "Error subiendo brandbook", variant: "destructive" }); setUploadingBrandbook(false); return; }
                    const { data: urlData } = supabase.storage.from("client-brandbooks").getPublicUrl(path);
                    const bbUrl = urlData.publicUrl;
                    await updateProfile(profileToEdit.id, { brandbook_url: bbUrl, brandbook_file_name: file.name } as any);
                    setEditData(d => ({ ...d, brandbook_url: bbUrl, brandbook_file_name: file.name }));
                    setUploadingBrandbook(false);
                    toast({ title: "Brandbook subido correctamente" });
                  }} />
                </label>
              )}
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pilares de contenido</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={editPillarInput} onChange={e => setEditPillarInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (editPillarInput.trim() && !editData.content_pillars.includes(editPillarInput.trim())) {
                        setEditData(d => ({ ...d, content_pillars: [...d.content_pillars, editPillarInput.trim()] }));
                        setEditPillarInput("");
                      }
                    }
                  }}
                  placeholder="Agregar pilar..." className="bg-secondary border-border rounded-xl" />
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                  if (editPillarInput.trim() && !editData.content_pillars.includes(editPillarInput.trim())) {
                    setEditData(d => ({ ...d, content_pillars: [...d.content_pillars, editPillarInput.trim()] }));
                    setEditPillarInput("");
                  }
                }}>+</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {editData.content_pillars.map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setEditData(d => ({ ...d, content_pillars: d.content_pillars.filter(x => x !== p) }))}>
                    {p} ×
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Audiencia objetivo</Label>
              <Textarea rows={3} value={editData.target_audience || ""} onChange={e => setEditData(d => ({ ...d, target_audience: e.target.value }))}
                placeholder="¿A quién le hablas? Describe a tu audiencia ideal: quiénes son, qué buscan, qué los mueve."
                className="mt-1.5 bg-secondary border-border rounded-xl" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Temas o palabras a evitar</Label>
              <Textarea rows={3} value={editData.restrictions || ""} onChange={e => setEditData(d => ({ ...d, restrictions: e.target.value }))}
                placeholder="¿Qué NO quieres que aparezca en tu contenido? Temas, frases, tonos, enfoques."
                className="mt-1.5 bg-secondary border-border rounded-xl" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Sitio web</Label>
              <Input value={(editData as any).website_url || ""} onChange={e => setEditData(d => ({ ...d, website_url: e.target.value } as any))}
                placeholder="https://tusitio.com"
                className="mt-1.5 bg-secondary border-border rounded-xl" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Referencias e inspiración</Label>
              <Textarea rows={3} value={(editData as any).reference_accounts || ""} onChange={e => setEditData(d => ({ ...d, reference_accounts: e.target.value } as any))}
                placeholder="¿A quién admiras? Creadores, comunicadores, marcas cuyo estilo te inspira."
                className="mt-1.5 bg-secondary border-border rounded-xl" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Redes sociales</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {NETWORKS.map(n => (
                  <button key={n}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      editData.preferred_networks.includes(n)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setEditData(d => ({
                      ...d,
                      preferred_networks: d.preferred_networks.includes(n)
                        ? d.preferred_networks.filter(x => x !== n)
                        : [...d.preferred_networks, n]
                    }))}>
                    <span>{NETWORK_ICONS[n]}</span> {n}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-11 shadow-glow hover:shadow-glow-lg transition-shadow"
              disabled={!editData.client_name.trim()}
              onClick={async () => {
                if (profileToEdit) {
                  await updateProfile(profileToEdit.id, {
                    client_name: editData.client_name.trim(),
                    brand_tone: editData.brand_tone,
                    brand_essence: editData.brand_essence,
                    client_type: editData.client_type,
                    content_pillars: editData.content_pillars,
                    preferred_networks: editData.preferred_networks,
                    target_audience: editData.target_audience,
                    restrictions: editData.restrictions,
                    reference_accounts: (editData as any).reference_accounts,
                    website_url: (editData as any).website_url,
                  } as any);
                  setProfileToEdit(null);
                  toast({ title: "Perfil actualizado" });
                }
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Express Cycle Dialog */}
      <Dialog open={showExpress} onOpenChange={setShowExpress}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" /> Post Express — Coyuntura
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Genera contenido de emergencia al instante. Se creará un ciclo express con las piezas listas para publicar.
          </p>
          <div className="space-y-4 mt-2">
            {/* Client selector */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cliente *</Label>
              <select value={expressData.profileId}
                onChange={e => setExpressData(d => ({ ...d, profileId: e.target.value }))}
                className="w-full mt-1.5 rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/30 transition-shadow">
                <option value="">Seleccionar...</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.client_name}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tema / Coyuntura *</Label>
              <Input value={expressData.topic} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setExpressData(d => ({ ...d, topic: e.target.value }))}
                placeholder="Ej: Día del Padre, crisis de imagen, viral del momento..." />
            </div>

            {/* Context */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contexto adicional</Label>
              <Textarea value={expressData.context} className="bg-secondary border-border mt-1.5 rounded-xl"
                onChange={e => setExpressData(d => ({ ...d, context: e.target.value }))}
                placeholder="Información relevante, ángulo deseado, datos clave, postura de la marca..." rows={3} />
            </div>

            {/* Networks */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Redes sociales</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {NETWORKS.map(n => (
                  <button key={n}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      expressData.networks.includes(n)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setExpressData(d => ({
                      ...d,
                      networks: d.networks.includes(n)
                        ? d.networks.filter(x => x !== n)
                        : [...d.networks, n]
                    }))}>
                    <span>{NETWORK_ICONS[n]}</span> {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Formats */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Formatos preferidos</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {["imagen", "carrusel", "reel", "historia", "video", "texto", "hilo"].map(f => (
                  <button key={f}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                      expressData.formats.includes(f)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setExpressData(d => ({
                      ...d,
                      formats: d.formats.includes(f)
                        ? d.formats.filter(x => x !== f)
                        : [...d.formats, f]
                    }))}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Num pieces */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cantidad de piezas</Label>
              <div className="flex gap-2 mt-1.5">
                {[1, 2, 3, 5].map(n => (
                  <button key={n}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      expressData.numPieces === n
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setExpressData(d => ({ ...d, numPieces: n }))}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleExpressCycle}
              disabled={!expressData.profileId || !expressData.topic.trim() || expressData.networks.length === 0 || expressGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-shadow">
              {expressGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando contenido express...</>
              ) : (
                <><Flame className="w-4 h-4 mr-2" /> Generar {expressData.numPieces} {expressData.numPieces === 1 ? "pieza" : "piezas"} express</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentEngine;
