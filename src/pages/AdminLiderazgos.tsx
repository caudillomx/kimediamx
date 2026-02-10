import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Key, Download, Eye, EyeOff, LogOut, Plus, Search,
  Filter, Trash2, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AdminLogin } from "@/components/liderazgos/AdminLogin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mexicanStates } from "@/data/liderazgosData";
import kimediaLogo from "@/assets/kimedia-logo.png";
import { Link } from "react-router-dom";

interface Participant {
  id: string;
  full_name: string;
  state: string;
  role_title: string;
  social_handle: string;
  diagnostic_score: number | null;
  diagnostic_level: string | null;
  cause: string | null;
  political_message: string | null;
  bio_text: string | null;
  post_text: string | null;
  post_published: boolean;
  show_on_map: boolean;
  access_code_used: string;
  created_at: string;
}

interface AccessCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export default function AdminLiderazgos() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [filterState, setFilterState] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [search, setSearch] = useState("");

  // New code form
  const [newCode, setNewCode] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("50");
  const [newExpiry, setNewExpiry] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: roles } = await supabase.from("user_roles").select("role").limit(1);
      if (roles?.length && roles[0].role === "admin") {
        setAuthenticated(true);
      }
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchData = useCallback(async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("participants").select("*").order("created_at", { ascending: false }),
      supabase.from("access_codes").select("*").order("created_at", { ascending: false }),
    ]);
    setParticipants(p || []);
    setCodes(c || []);
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  const handleToggleMap = async (id: string, current: boolean) => {
    await supabase.from("participants").update({ show_on_map: !current }).eq("id", id);
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, show_on_map: !current } : p))
    );
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const { error } = await supabase.from("access_codes").insert({
      code: newCode.trim().toUpperCase(),
      max_uses: parseInt(newMaxUses) || 50,
      expires_at: newExpiry || null,
      description: newDesc || null,
    });

    if (error) {
      toast({ title: "Error creando código", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Código creado" });
      setNewCode("");
      setNewDesc("");
      fetchData();
    }
  };

  const handleToggleCode = async (id: string, current: boolean) => {
    await supabase.from("access_codes").update({ is_active: !current }).eq("id", id);
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)));
  };

  const exportCSV = () => {
    const headers = ["Nombre", "Estado", "Cargo", "Red Social", "Score", "Nivel", "Causa", "Mensaje", "Publicado", "Fecha"];
    const rows = filteredParticipants.map((p) => [
      p.full_name, p.state, p.role_title, p.social_handle,
      p.diagnostic_score ?? "", p.diagnostic_level ?? "", p.cause ?? "",
      (p.political_message ?? "").replace(/\n/g, " "),
      p.post_published ? "Sí" : "No",
      new Date(p.created_at).toLocaleDateString("es-MX"),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liderazgos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredParticipants = participants.filter((p) => {
    if (filterState !== "all" && p.state !== filterState) return false;
    if (filterLevel !== "all" && p.diagnostic_level !== filterLevel) return false;
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (checkingAuth) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando...</div>;
  if (!authenticated) return <AdminLogin onLogin={() => { setAuthenticated(true); }} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-coral font-bold">Admin</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4 container mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Panel de Liderazgos</h1>

        <Tabs defaultValue="participants">
          <TabsList className="mb-6">
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Participantes ({participants.length})
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex items-center gap-2">
              <Key className="w-4 h-4" /> Códigos ({codes.length})
            </TabsTrigger>
          </TabsList>

          {/* PARTICIPANTS TAB */}
          <TabsContent value="participants">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="pl-10 bg-card border-border"
                />
              </div>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="w-[180px] bg-card border-border">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {mexicanStates.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[160px] bg-card border-border">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="rojo">🔴 Rojo</SelectItem>
                  <SelectItem value="amarillo">🟡 Amarillo</SelectItem>
                  <SelectItem value="verde">🟢 Verde</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportCSV} className="border-border">
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
            </div>

            <p className="text-muted-foreground text-xs mb-4">{filteredParticipants.length} resultado(s)</p>

            <div className="space-y-3">
              {filteredParticipants.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground text-sm">{p.full_name}</span>
                        {p.diagnostic_level === "rojo" && <span className="w-2 h-2 rounded-full bg-red-500" />}
                        {p.diagnostic_level === "amarillo" && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                        {p.diagnostic_level === "verde" && <span className="w-2 h-2 rounded-full bg-green-500" />}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {p.state} · {p.role_title} · {p.social_handle} · Score: {p.diagnostic_score ?? "—"}
                      </p>
                      {p.cause && <p className="text-muted-foreground text-xs mt-1">Causa: {p.cause}</p>}
                      <p className="text-muted-foreground text-[10px] mt-1">
                        {new Date(p.created_at).toLocaleDateString("es-MX")} · Código: {p.access_code_used}
                        {p.post_published && " · ✅ Publicado"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">Mapa</span>
                      <Switch
                        checked={p.show_on_map}
                        onCheckedChange={() => handleToggleMap(p.id, p.show_on_map)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* CODES TAB */}
          <TabsContent value="codes">
            <form onSubmit={handleCreateCode} className="bg-card rounded-xl p-4 border border-border mb-6 space-y-3">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-coral" /> Crear nuevo código
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Código</Label>
                  <Input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="TALLER2026"
                    className="bg-background border-border font-mono text-sm"
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Usos máximos</Label>
                  <Input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                    className="bg-background border-border"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs">Expira (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Descripción</Label>
                  <Input
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Taller CDMX"
                    className="bg-background border-border"
                    maxLength={100}
                  />
                </div>
              </div>
              <Button type="submit" className="bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold">
                Crear código
              </Button>
            </form>

            <div className="space-y-3">
              {codes.map((c) => (
                <div key={c.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-sm">{c.code}</span>
                      {!c.is_active && <span className="text-[10px] bg-destructive/20 text-destructive px-2 py-0.5 rounded">Inactivo</span>}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      {c.current_uses}/{c.max_uses} usos
                      {c.description && ` · ${c.description}`}
                      {c.expires_at && ` · Expira: ${new Date(c.expires_at).toLocaleDateString("es-MX")}`}
                    </p>
                  </div>
                  <Switch
                    checked={c.is_active}
                    onCheckedChange={() => handleToggleCode(c.id, c.is_active)}
                  />
                </div>
              ))}
              {codes.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No hay códigos creados. Crea el primero arriba.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
