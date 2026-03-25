import { useState, useEffect } from "react";
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
  Calendar, Layers, Download, Users, Trash2,
} from "lucide-react";
import { CLIENTS } from "@/hooks/useOperationsData";

const NETWORKS = ["Instagram", "Facebook", "X", "LinkedIn", "TikTok"];
const TONES = ["Profesional", "Cercano", "Inspirador", "Educativo", "Disruptivo", "Formal"];

const NETWORK_ICONS: Record<string, string> = {
  Instagram: "📸", Facebook: "📘", X: "𝕏", LinkedIn: "💼", TikTok: "🎵",
};

const ClientCard = ({ profile, onClick, onDelete }: { profile: ContentProfile; onClick: () => void; onDelete: () => void }) => {
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
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center text-primary-foreground text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                {profile.client_name.charAt(0)}
              </div>
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
  const { profiles, loading, fetchProfiles, createProfile } = useContentEngine();
  const { isDark, toggle: toggleTheme } = useThemeToggle();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [showImportKit, setShowImportKit] = useState(false);
  const [kitProfiles, setKitProfiles] = useState<any[]>([]);
  const [loadingKit, setLoadingKit] = useState(false);
  const [newProfile, setNewProfile] = useState({
    client_name: "",
    industry: "",
    target_audience: "",
    brand_tone: "Profesional",
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
      setNewProfile({
        client_name: "", industry: "", target_audience: "", brand_tone: "Profesional",
        content_pillars: [], preferred_networks: ["Instagram", "Facebook"],
        posting_frequency: "3 veces por semana", restrictions: "",
      });
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
              <select value={newProfile.client_name}
                onChange={e => setNewProfile(p => ({ ...p, client_name: e.target.value }))}
                className="w-full mt-1.5 rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/30 transition-shadow">
                <option value="">Seleccionar...</option>
                {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">+ Otro cliente</option>
              </select>
              {newProfile.client_name === "__custom__" && (
                <Input className="mt-2 bg-secondary border-border rounded-xl" placeholder="Nombre del cliente"
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tono de marca</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {TONES.map(t => (
                  <button key={t}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      newProfile.brand_tone === t
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => setNewProfile(p => ({ ...p, brand_tone: t }))}>
                    {t}
                  </button>
                ))}
              </div>
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
    </div>
  );
};

export default ContentEngine;
