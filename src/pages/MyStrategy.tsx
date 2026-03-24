import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContentEngine, useContentCycles, ContentProfile } from "@/hooks/useContentEngine";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Zap, Plus, LogOut, Sun, Moon, Calendar, Layers,
  Grid3X3, RefreshCw, ArrowRight, Sparkles, Download,
} from "lucide-react";
import kimediaLogo from "@/assets/kimedia-logo.png";

const MyStrategy = () => {
  const navigate = useNavigate();
  const { profiles, loading, fetchProfiles, createProfile } = useContentEngine();
  const { isDark, toggle: toggleTheme } = useThemeToggle();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("");
  const [showLinkKit, setShowLinkKit] = useState(false);
  const [kitProfiles, setKitProfiles] = useState<any[]>([]);
  const [loadingKit, setLoadingKit] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setCheckingAuth(false);
      if (!s) navigate("/registro");
      else setUserName(s.user?.user_metadata?.full_name || s.user?.email || "");
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setCheckingAuth(false);
      if (!s) navigate("/registro");
      else setUserName(s.user?.user_metadata?.full_name || s.user?.email || "");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load kit profiles linked to this user
  const loadMyKitProfiles = async () => {
    if (!session?.user?.id) return;
    setLoadingKit(true);
    const { data } = await supabase
      .from("brand_kit_profiles")
      .select("id, full_name, email, profession, industry, brand_tone, target_audience, main_channel, company_name, kit_type")
      .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
      .order("created_at", { ascending: false });
    setKitProfiles(data || []);
    setLoadingKit(false);
  };

  const importKitToProfile = async (kit: any) => {
    const clientName = kit.kit_type === "pyme" ? kit.company_name || kit.full_name : kit.full_name;
    const existing = profiles.find(p => p.client_name === clientName);
    if (existing) {
      toast.error("Ya existe un perfil para este kit");
      return;
    }
    const mainChannel = kit.main_channel || "Instagram";
    const networks = [mainChannel];
    if (!networks.includes("Instagram")) networks.push("Instagram");

    const result = await createProfile({
      client_name: clientName,
      industry: kit.industry || "",
      target_audience: kit.target_audience || "",
      brand_tone: kit.brand_tone || "Profesional",
      content_pillars: [],
      preferred_networks: networks,
      posting_frequency: "3 veces por semana",
      restrictions: "",
      notes: `Desde Kit ${kit.kit_type === "pyme" ? "PyME" : "Personal"} — ${kit.email}`,
    });
    if (result) {
      toast.success(`Perfil "${clientName}" creado`);
      setShowLinkKit(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-coral flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando tu espacio...</p>
        </div>
      </div>
    );
  }

  // Filter profiles — for now show all (later can filter by user)
  const myProfiles = profiles;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                Mi <span className="text-gradient">Estrategia</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hola, {userName?.split(" ")[0] || ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground rounded-xl">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground rounded-xl">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          <Link to="/kit/marca-personal">
            <Button variant="outline" className="border-border text-foreground rounded-xl h-11 px-5">
              <Sparkles className="w-4 h-4 mr-1.5" /> Hacer Kit Personal
            </Button>
          </Link>
          <Link to="/kit/pyme">
            <Button variant="outline" className="border-border text-foreground rounded-xl h-11 px-5">
              <Sparkles className="w-4 h-4 mr-1.5" /> Hacer Kit PyME
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-border text-foreground rounded-xl h-11 px-5"
            onClick={() => { setShowLinkKit(true); loadMyKitProfiles(); }}
          >
            <Download className="w-4 h-4 mr-1.5" /> Importar desde mi Kit
          </Button>
        </motion.div>

        {/* My profiles */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : myProfiles.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-12 text-center bg-card border-border border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-gradient-coral/10 flex items-center justify-center mx-auto mb-5">
                <Grid3X3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                ¡Bienvenido a tu motor!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                Comienza haciendo tu Kit de Marca Personal o PyME. Después, impórtalo aquí para generar tu primera parrilla de contenido con IA.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/kit/marca-personal">
                  <Button className="bg-gradient-coral text-primary-foreground font-semibold rounded-xl px-6">
                    <Sparkles className="w-4 h-4 mr-1.5" /> Comenzar Kit Personal
                  </Button>
                </Link>
                <Link to="/kit/pyme">
                  <Button variant="outline" className="border-border text-foreground rounded-xl px-6">
                    Comenzar Kit PyME
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {myProfiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <ProfileCard profile={profile} onClick={() => navigate(`/mi-estrategia/${profile.id}`)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Import Kit Dialog */}
      <Dialog open={showLinkKit} onOpenChange={setShowLinkKit}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl">Importar desde mi Kit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Selecciona un kit que hayas completado para crear tu perfil de contenido.
          </p>
          {loadingKit ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : kitProfiles.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground text-sm">
                No encontramos un Kit completado con tu correo. ¡Completa uno primero!
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/kit/marca-personal" onClick={() => setShowLinkKit(false)}>
                  <Button size="sm" className="bg-gradient-coral text-primary-foreground rounded-xl">Kit Personal</Button>
                </Link>
                <Link to="/kit/pyme" onClick={() => setShowLinkKit(false)}>
                  <Button size="sm" variant="outline" className="rounded-xl">Kit PyME</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {kitProfiles.map(kit => {
                const clientName = kit.kit_type === "pyme" ? kit.company_name || kit.full_name : kit.full_name;
                const alreadyImported = myProfiles.some(p => p.client_name === clientName);
                return (
                  <div key={kit.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    alreadyImported ? "border-border bg-muted/50 opacity-60" : "border-border bg-secondary hover:border-primary/40"
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-coral flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                        {clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {kit.kit_type === "pyme" ? "PyME" : "Personal"} · {kit.industry || "Sin industria"}
                        </p>
                      </div>
                    </div>
                    {alreadyImported ? (
                      <Badge variant="secondary" className="text-xs">Ya importado</Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => importKitToProfile(kit)}>
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

const ProfileCard = ({ profile, onClick }: { profile: ContentProfile; onClick: () => void }) => {
  const networks = profile.preferred_networks || [];
  const pillars = profile.content_pillars || [];

  const NETWORK_ICONS: Record<string, string> = {
    Instagram: "📸", Facebook: "📘", X: "𝕏", LinkedIn: "💼", TikTok: "🎵",
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-glow"
      onClick={onClick}
    >
      <div className="h-1 bg-gradient-coral w-full" />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-display font-bold text-foreground">{profile.client_name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              {profile.industry || "Sin industria"} · {profile.brand_tone || "Profesional"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center text-primary-foreground text-sm font-bold">
            {profile.client_name.charAt(0)}
          </div>
        </div>

        {pillars.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pillars.slice(0, 3).map(p => (
              <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            {networks.map(n => (
              <span key={n} className="text-sm" title={n}>{NETWORK_ICONS[n] || "📱"}</span>
            ))}
          </div>
          <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver parrillas <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MyStrategy;
