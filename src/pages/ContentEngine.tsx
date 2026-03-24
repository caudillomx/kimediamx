import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContentEngine, ContentProfile } from "@/hooks/useContentEngine";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Search, RefreshCw, LogOut, Sun, Moon, ArrowLeft,
  Grid3X3, BarChart3, Megaphone, BookOpen,
} from "lucide-react";
import { CLIENTS } from "@/hooks/useOperationsData";

const NETWORKS = ["Instagram", "Facebook", "X", "LinkedIn", "TikTok"];
const TONES = ["Profesional", "Cercano", "Inspirador", "Educativo", "Disruptivo", "Formal"];

const ContentEngine = () => {
  const navigate = useNavigate();
  const { profiles, loading, fetchProfiles, createProfile } = useContentEngine();
  const { isDark, toggle: toggleTheme } = useThemeToggle();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProfile, setShowNewProfile] = useState(false);
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
        <RefreshCw className="w-6 h-6 text-coral animate-spin" />
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

  const getCycleCount = (profileId: string) => 0; // Will be populated when cycles exist

  return (
    <div className={`min-h-screen bg-background ${isDark ? "" : "theme-light"}`}>
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/operaciones")}
              className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Motor de <span className="text-gradient">Contenido</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {profiles.length} clientes · Planea, ejecuta y evalúa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/operaciones")}
              className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Search + New */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente..." className="pl-10 bg-secondary border-border" />
          </div>
          <Button onClick={() => setShowNewProfile(true)}
            className="bg-gradient-coral text-primary-foreground font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Nuevo cliente
          </Button>
        </div>

        {/* Client Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-coral animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sin clientes aún</h3>
            <p className="text-muted-foreground mb-4">Crea tu primer perfil editorial para comenzar</p>
            <Button onClick={() => setShowNewProfile(true)} className="bg-gradient-coral text-primary-foreground">
              <Plus className="w-4 h-4 mr-1.5" /> Crear perfil
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(profile => (
              <motion.div key={profile.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Card className="p-5 bg-card border-border cursor-pointer hover:border-coral/50 transition-colors"
                  onClick={() => navigate(`/parrilla/${profile.id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground">{profile.client_name}</h3>
                    <Badge variant="secondary" className="text-xs">{profile.industry || "General"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {profile.target_audience || "Audiencia no definida"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(profile.content_pillars || []).slice(0, 3).map(p => (
                      <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                    {(profile.content_pillars || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">+{profile.content_pillars.length - 3}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Grid3X3 className="w-3 h-3" /> {(profile.preferred_networks || []).length} redes
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {profile.posting_frequency || "—"}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New Profile Dialog */}
      <Dialog open={showNewProfile} onOpenChange={setShowNewProfile}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Perfil Editorial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente *</Label>
              <select value={newProfile.client_name}
                onChange={e => setNewProfile(p => ({ ...p, client_name: e.target.value }))}
                className="w-full mt-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
                <option value="">Seleccionar...</option>
                {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">+ Otro cliente</option>
              </select>
              {newProfile.client_name === "__custom__" && (
                <Input className="mt-2 bg-secondary border-border" placeholder="Nombre del cliente"
                  onChange={e => setNewProfile(p => ({ ...p, client_name: e.target.value }))} />
              )}
            </div>
            <div>
              <Label>Industria</Label>
              <Input value={newProfile.industry} className="bg-secondary border-border mt-1"
                onChange={e => setNewProfile(p => ({ ...p, industry: e.target.value }))}
                placeholder="Ej: Salud, Tecnología, Gobierno..." />
            </div>
            <div>
              <Label>Audiencia objetivo</Label>
              <Textarea value={newProfile.target_audience} className="bg-secondary border-border mt-1"
                onChange={e => setNewProfile(p => ({ ...p, target_audience: e.target.value }))}
                placeholder="¿A quién le habla este cliente?" rows={2} />
            </div>
            <div>
              <Label>Tono de marca</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {TONES.map(t => (
                  <Badge key={t} variant={newProfile.brand_tone === t ? "default" : "outline"}
                    className="cursor-pointer" onClick={() => setNewProfile(p => ({ ...p, brand_tone: t }))}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Pilares de contenido</Label>
              <div className="flex gap-2 mt-1">
                <Input value={pillarInput} onChange={e => setPillarInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addPillar())}
                  placeholder="Agregar pilar..." className="bg-secondary border-border" />
                <Button variant="outline" onClick={addPillar} size="sm">+</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {newProfile.content_pillars.map(p => (
                  <Badge key={p} variant="secondary" className="cursor-pointer"
                    onClick={() => setNewProfile(pr => ({ ...pr, content_pillars: pr.content_pillars.filter(x => x !== p) }))}>
                    {p} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Redes sociales</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {NETWORKS.map(n => (
                  <Badge key={n} variant={newProfile.preferred_networks.includes(n) ? "default" : "outline"}
                    className="cursor-pointer" onClick={() => toggleNetwork(n)}>
                    {n}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Frecuencia de publicación</Label>
              <Input value={newProfile.posting_frequency} className="bg-secondary border-border mt-1"
                onChange={e => setNewProfile(p => ({ ...p, posting_frequency: e.target.value }))}
                placeholder="Ej: 3 veces por semana" />
            </div>
            <div>
              <Label>Restricciones</Label>
              <Textarea value={newProfile.restrictions} className="bg-secondary border-border mt-1"
                onChange={e => setNewProfile(p => ({ ...p, restrictions: e.target.value }))}
                placeholder="Temas prohibidos, lineamientos..." rows={2} />
            </div>
            <Button onClick={handleCreateProfile} className="w-full bg-gradient-coral text-primary-foreground font-semibold"
              disabled={!newProfile.client_name || newProfile.client_name === "__custom__"}>
              Crear perfil editorial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentEngine;
