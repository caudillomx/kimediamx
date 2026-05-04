import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  RefreshCw, Inbox, CheckCircle2, XCircle, ExternalLink, Clock, Users,
  Sparkles, Shield, Plus, Trash2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { CLIENTS } from "@/hooks/useOperationsData";

type Meeting = {
  id: string;
  fireflies_id: string;
  title: string;
  meeting_date: string | null;
  duration_seconds: number | null;
  host_email: string | null;
  participants: string[] | null;
  transcript_url: string | null;
  summary_overview: string | null;
  summary_short: string | null;
  review_status: string;
  exclusion_reason: string | null;
  suggested_client: string | null;
  assigned_client: string | null;
  imported_minute_id: string | null;
  created_at: string;
};

type Rule = {
  id: string;
  rule_type: string;
  pattern: string;
  client_name: string | null;
  match_field: string | null;
  is_active: boolean;
  notes: string | null;
};

const RULE_LABELS: Record<string, string> = {
  host_whitelist: "Hosts permitidos",
  title_blacklist: "Palabras prohibidas en título",
  client_mapping: "Mapeo a cliente",
  min_duration: "Duración mínima (seg)",
};

const FirefliesInbox = ({ onImported }: { onImported?: () => void }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("needs_review");
  // New rule form
  const [newRuleType, setNewRuleType] = useState("title_blacklist");
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleClient, setNewRuleClient] = useState("");
  const [newRuleField, setNewRuleField] = useState("title");

  const fetchAll = async () => {
    setLoading(true);
    const [m, r] = await Promise.all([
      supabase.from("fireflies_meetings").select("*").order("meeting_date", { ascending: false }).limit(200),
      supabase.from("fireflies_filter_rules").select("*").order("rule_type"),
    ]);
    if (m.data) setMeetings(m.data as Meeting[]);
    if (r.data) setRules(r.data as Rule[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("fireflies-sync-inbox", {
        body: { limit: 50 },
      });
      if (error) throw error;
      toast.success(`Sync OK · ${data.inserted} nuevas (${data.needsReview} por revisar, ${data.autoApproved} listas, ${data.excluded} excluidas)`);
      await fetchAll();
    } catch (e: any) {
      toast.error(`Error de sync: ${e?.message || "desconocido"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async (m: Meeting, client: string | null) => {
    setBusyId(m.id);
    try {
      const { data, error } = await supabase.functions.invoke("fireflies-import-meeting", {
        body: { meetingId: m.id, client },
      });
      if (error) throw error;
      toast.success(`Importada · ${data.taskCount} tareas extraídas`);
      await fetchAll();
      onImported?.();
    } catch (e: any) {
      toast.error(`No se pudo importar: ${e?.message || "desconocido"}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleExclude = async (m: Meeting, learnPattern = false) => {
    setBusyId(m.id);
    try {
      await supabase.from("fireflies_meetings").update({
        review_status: "excluded",
        exclusion_reason: "manual",
        reviewed_at: new Date().toISOString(),
      }).eq("id", m.id);

      if (learnPattern) {
        // Learn first significant word from title
        const word = m.title.toLowerCase().split(/\s+/).find(w => w.length > 3);
        if (word) {
          await supabase.from("fireflies_filter_rules").insert({
            rule_type: "title_blacklist",
            pattern: word,
            notes: `Auto-aprendida desde "${m.title}"`,
          });
          toast.success(`Excluida + regla aprendida: "${word}"`);
        }
      } else {
        toast.success("Excluida");
      }
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || "Error");
    } finally {
      setBusyId(null);
    }
  };

  const handleReactivate = async (m: Meeting) => {
    setBusyId(m.id);
    try {
      await supabase.from("fireflies_meetings").update({
        review_status: "needs_review",
        exclusion_reason: null,
        reviewed_at: new Date().toISOString(),
      }).eq("id", m.id);
      toast.success("Movida a Por revisar");
      await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || "Error");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddRule = async () => {
    if (!newRulePattern.trim()) return;
    const payload: any = {
      rule_type: newRuleType,
      pattern: newRulePattern.trim(),
    };
    if (newRuleType === "client_mapping") {
      payload.client_name = newRuleClient || null;
      payload.match_field = newRuleField;
    }
    const { error } = await supabase.from("fireflies_filter_rules").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Regla agregada");
      setNewRulePattern("");
      setNewRuleClient("");
      fetchAll();
    }
  };

  const handleDeleteRule = async (id: string) => {
    await supabase.from("fireflies_filter_rules").delete().eq("id", id);
    fetchAll();
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";
  const fmtDur = (s: number | null) => s ? `${Math.round(s / 60)} min` : "—";

  const counts = {
    needs_review: meetings.filter(m => m.review_status === "needs_review").length,
    approved: meetings.filter(m => m.review_status === "approved").length,
    imported: meetings.filter(m => m.review_status === "imported").length,
    excluded: meetings.filter(m => m.review_status === "excluded").length,
  };

  const filtered = meetings.filter(m =>
    tab === "rules" ? false : m.review_status === tab
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <Inbox className="w-5 h-5 text-coral" />
            Bandeja Fireflies
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reuniones traídas de Fireflies, filtradas antes de generar pendientes
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="bg-gradient-coral text-primary-foreground font-semibold">
          {syncing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
          Sincronizar
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="needs_review">Por revisar · {counts.needs_review}</TabsTrigger>
          <TabsTrigger value="approved">Pre-aprobadas · {counts.approved}</TabsTrigger>
          <TabsTrigger value="imported">Importadas · {counts.imported}</TabsTrigger>
          <TabsTrigger value="excluded">Excluidas · {counts.excluded}</TabsTrigger>
          <TabsTrigger value="rules"><Shield className="w-3.5 h-3.5 mr-1" /> Reglas</TabsTrigger>
        </TabsList>

        {(["needs_review", "approved", "imported", "excluded"] as const).map(s => (
          <TabsContent key={s} value={s} className="space-y-3 mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-coral" /></div>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Nada por aquí. {s === "needs_review" && "Dale a Sincronizar para traer reuniones recientes."}
              </Card>
            ) : filtered.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 bg-card border-border space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{m.title}</h3>
                        {m.suggested_client && (
                          <Badge variant="outline" className="text-xs border-cyan/40 text-cyan">
                            <Sparkles className="w-3 h-3 mr-1" /> {m.suggested_client}
                          </Badge>
                        )}
                        {m.exclusion_reason && (
                          <Badge variant="outline" className="text-xs border-destructive/40 text-destructive">
                            {m.exclusion_reason}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDate(m.meeting_date)}</span>
                        <span>· {fmtDur(m.duration_seconds)}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(m.participants || []).length} participantes</span>
                        {m.host_email && <span>· host: {m.host_email}</span>}
                      </div>
                    </div>
                    {m.transcript_url && (
                      <a href={m.transcript_url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
                      </a>
                    )}
                  </div>

                  {m.summary_short && (
                    <p className="text-xs text-muted-foreground line-clamp-3 bg-secondary/40 rounded p-2">
                      {m.summary_short}
                    </p>
                  )}

                  {(s === "needs_review" || s === "approved") && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <Select defaultValue={m.suggested_client || "_none"} onValueChange={(v) => (m as any).__client = v === "_none" ? null : v}>
                        <SelectTrigger className="w-[200px] h-9 bg-secondary border-border text-xs">
                          <SelectValue placeholder="Asignar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Sin cliente</SelectItem>
                          {CLIENTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={busyId === m.id}
                        onClick={() => handleImport(m, ((m as any).__client ?? m.suggested_client) || null)}
                        className="bg-gradient-coral text-primary-foreground font-semibold"
                      >
                        {busyId === m.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                        Importar y extraer tareas
                      </Button>
                      <Button size="sm" variant="ghost" disabled={busyId === m.id} onClick={() => handleExclude(m, false)}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Excluir
                      </Button>
                      <Button size="sm" variant="ghost" disabled={busyId === m.id} onClick={() => handleExclude(m, true)} title="Excluye esta reunión y agrega una regla para excluir similares">
                        Excluir y aprender
                      </Button>
                    </div>
                  )}

                  {s === "imported" && (
                    <p className="text-xs text-lime">
                      ✓ Importada como minuta {m.assigned_client ? `· cliente: ${m.assigned_client}` : ""}
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        ))}

        <TabsContent value="rules" className="space-y-4 mt-4">
          <Card className="p-4 bg-card border-border space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-coral" /> Nueva regla</h3>
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2">
              <Select value={newRuleType} onValueChange={setNewRuleType}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RULE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder={newRuleType === "host_whitelist" ? "@dominio.com" : newRuleType === "min_duration" ? "300" : "palabra o texto"}
                value={newRulePattern}
                onChange={(e) => setNewRulePattern(e.target.value)}
                className="bg-secondary border-border"
              />
              <Button onClick={handleAddRule} className="bg-gradient-coral text-primary-foreground font-semibold">Agregar</Button>
            </div>
            {newRuleType === "client_mapping" && (
              <div className="grid grid-cols-2 gap-2">
                <Select value={newRuleClient} onValueChange={setNewRuleClient}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Cliente" /></SelectTrigger>
                  <SelectContent>{CLIENTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={newRuleField} onValueChange={setNewRuleField}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Match en título</SelectItem>
                    <SelectItem value="participant_email">Match en email participante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </Card>

          <div className="space-y-2">
            {Object.keys(RULE_LABELS).map(type => {
              const items = rules.filter(r => r.rule_type === type);
              if (!items.length) return null;
              return (
                <Card key={type} className="p-3 bg-card border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{RULE_LABELS[type]}</p>
                  <div className="space-y-1.5">
                    {items.map(r => (
                      <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <code className="px-1.5 py-0.5 rounded bg-secondary text-xs">{r.pattern}</code>
                          {r.client_name && <span className="text-xs text-cyan">→ {r.client_name}</span>}
                          {r.notes && <span className="text-xs text-muted-foreground truncate">· {r.notes}</span>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(r.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirefliesInbox;