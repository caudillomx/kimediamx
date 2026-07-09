import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useClientsData, CLIENT_TYPE_META, Client } from "@/hooks/useClientsData";
import { useClientCorpus, CorpusEntry, CorpusEntryType } from "@/hooks/useClientCorpus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Plus, Trash2, FileText, Link2, Notebook, Mic, BookOpen,
  Upload, ChevronDown, ChevronUp, ExternalLink, Megaphone, Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAdsProposals } from "@/hooks/useAdsProposals";
import { AdsProposalBuilder } from "@/components/ads/AdsProposalBuilder";

const TYPE_META: Record<string, { label: string; icon: any }> = {
  nota:       { label: "Nota",       icon: Notebook },
  url:        { label: "URL",        icon: Link2 },
  documento:  { label: "Documento",  icon: FileText },
  minuta:     { label: "Minuta",     icon: Mic },
  brandbook:  { label: "Brandbook",  icon: BookOpen },
};

const ClientWorkspace = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { clients, loading: clientsLoading } = useClientsData();
  const { entries, loading: corpusLoading, addEntry, deleteEntry } = useClientCorpus(clientId);
  const { proposals: adsProposals, loading: adsLoading } = useAdsProposals(clientId);
  const [adsBuilderOpen, setAdsBuilderOpen] = useState(false);

  const client = useMemo<Client | undefined>(
    () => clients.find(c => c.id === clientId),
    [clients, clientId]
  );

  const [stats, setStats] = useState({ tasks: 0, profiles: 0 });
  const [profile, setProfile] = useState<any | null>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentCycles, setRecentCycles] = useState<any[]>([]);

  // Auth gate
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate("/admin/operaciones/login"); return; }
      setCheckingAuth(false);
    });
  }, [navigate]);

  // Sidebar / activity data
  useEffect(() => {
    if (!clientId || !client) return;
    (async () => {
      const [t, p, ct, cy] = await Promise.all([
        supabase.from("action_items").select("id", { count: "exact", head: true })
          .or(`client_id.eq.${clientId},client.eq.${client.name}`)
          .not("status", "in", "(completado,cancelado)"),
        supabase.from("content_profiles").select("*").eq("client_id", clientId),
        supabase.from("action_items").select("id,description,status,due_date,priority,client")
          .or(`client_id.eq.${clientId},client.eq.${client.name}`)
          .order("created_at", { ascending: false }).limit(10),
        supabase.from("content_cycles").select("id,title,status,start_date,end_date,profile_id"),
      ]);
      const profiles = (p.data || []) as any[];
      setStats({ tasks: t.count || 0, profiles: profiles.length });
      setProfile(profiles[0] || null);
      setRecentTasks((ct.data || []) as any[]);
      const profileIds = new Set(profiles.map(pp => pp.id));
      setRecentCycles(((cy.data || []) as any[]).filter(c => profileIds.has(c.profile_id)).slice(0, 3));
    })();
  }, [clientId, client]);

  if (checkingAuth || clientsLoading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Cargando…</div>;
  }
  if (!client) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Cliente no encontrado.</p>
          <Button onClick={() => navigate("/admin/operaciones")}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
        </Card>
      </div>
    );
  }

  const typeMeta = CLIENT_TYPE_META[client.client_type] || CLIENT_TYPE_META.activo;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/operaciones")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Operaciones
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className={typeMeta.badgeClass}>{typeMeta.label}</Badge>
            {client.is_probono && <Badge variant="outline" className="bg-blue-500/15 text-blue-600 border-blue-500/30">Pro bono</Badge>}
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/cliente/${client.id}/portal`)}>
              <Globe className="w-4 h-4 mr-1" /> Portal cliente
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <aside className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              {client.logo_url ? (
                <img src={client.logo_url} alt={client.name} className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted grid place-items-center font-display text-xl">
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-display text-xl font-bold">{client.name}</h1>
                {client.industry && <p className="text-xs text-muted-foreground">{client.industry}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <Stat label="Tareas" value={stats.tasks} />
              <Stat label="Perfiles" value={stats.profiles} />
              <Stat label="Corpus" value={entries.length} />
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate(`/parrilla`)}>
                Ver parrilla <ExternalLink className="w-3 h-3" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate(`/admin/operaciones`)}>
                Ver tareas <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            {client.notes && (
              <p className="text-xs text-muted-foreground mt-4 whitespace-pre-line">{client.notes}</p>
            )}
          </Card>
        </aside>

        {/* RIGHT */}
        <section className="lg:col-span-2">
          <Tabs defaultValue="corpus">
            <TabsList>
              <TabsTrigger value="corpus">Corpus</TabsTrigger>
              <TabsTrigger value="profile">Perfil editorial</TabsTrigger>
              <TabsTrigger value="activity">Actividad reciente</TabsTrigger>
              <TabsTrigger value="ads">Campañas de Ads</TabsTrigger>
            </TabsList>

            <TabsContent value="corpus" className="space-y-3">
              <CorpusPanel
                clientId={client.id}
                entries={entries}
                loading={corpusLoading}
                onAdd={addEntry}
                onDelete={deleteEntry}
              />
            </TabsContent>

            <TabsContent value="profile">
              {profile ? (
                <Card className="p-5 space-y-3 text-sm">
                  <Field label="Tono" value={profile.brand_tone} />
                  <Field label="Audiencia" value={profile.target_audience} />
                  <Field label="Pilares" value={(profile.content_pillars || []).join(", ")} />
                  <Field label="Redes" value={(profile.preferred_networks || []).join(", ")} />
                  <Field label="Frecuencia" value={profile.posting_frequency} />
                  <Button variant="outline" size="sm" onClick={() => navigate(`/parrilla/${profile.id}`)}>
                    Editar en Motor <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Card>
              ) : (
                <Card className="p-5 text-sm text-muted-foreground">
                  Aún no hay un perfil editorial para este cliente.{" "}
                  <Button size="sm" variant="link" onClick={() => navigate("/parrilla")}>Crear en Motor</Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-3">
              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-sm">Últimas tareas</h3>
                {recentTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin tareas recientes.</p>
                ) : recentTasks.map(t => (
                  <div key={t.id} className="text-sm py-1.5 border-b border-border last:border-0 flex items-center justify-between">
                    <span className="truncate flex-1">{t.description}</span>
                    <Badge variant="outline" className="text-[10px] ml-2">{t.status}</Badge>
                  </div>
                ))}
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-sm">Últimos ciclos de contenido</h3>
                {recentCycles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin ciclos recientes.</p>
                ) : recentCycles.map(c => (
                  <div key={c.id} className="text-sm py-1.5 border-b border-border last:border-0 flex items-center justify-between">
                    <span className="truncate flex-1">{c.title}</span>
                    <Badge variant="outline" className="text-[10px] ml-2">{c.status}</Badge>
                  </div>
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="ads" className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {adsLoading ? "Cargando…" : `${adsProposals.length} propuesta${adsProposals.length === 1 ? "" : "s"}`}
                </p>
                <Button size="sm" onClick={() => setAdsBuilderOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Nueva propuesta
                </Button>
              </div>
              {adsProposals.length === 0 && !adsLoading ? (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  No hay campañas de ads para este cliente.
                </Card>
              ) : (
                <div className="space-y-2">
                  {adsProposals.map(p => (
                    <Card key={p.id} className="p-3 hover:bg-muted/40 transition cursor-pointer"
                      onClick={() => navigate(`/admin/propuesta/${p.id}`)}>
                      <div className="flex items-center gap-3">
                        <Megaphone className="w-4 h-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm truncate">{p.title}</h4>
                            <Badge variant="outline" className="text-[10px] capitalize">{p.status}</Badge>
                            {(p.platforms || []).map(pl => (
                              <Badge key={pl} variant="outline" className="text-[10px] capitalize">{pl}</Badge>
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {p.budget_total ? `${new Intl.NumberFormat("es-MX", { style: "currency", currency: p.budget_currency || "MXN", maximumFractionDigits: 0 }).format(p.budget_total)} · ` : ""}
                            {p.flight_start || "—"} → {p.flight_end || "—"}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <AdsProposalBuilder
        open={adsBuilderOpen}
        onOpenChange={setAdsBuilderOpen}
        clientId={client.id}
        clientName={client.name}
      />
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-muted/50 py-2">
    <div className="text-lg font-display font-bold">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div>{value || <span className="text-muted-foreground italic">—</span>}</div>
  </div>
);

/* ---------- Corpus panel ---------- */

function CorpusPanel({
  clientId, entries, loading, onAdd, onDelete,
}: {
  clientId: string;
  entries: CorpusEntry[];
  loading: boolean;
  onAdd: (p: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [type, setType] = useState<CorpusEntryType>("nota");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setType("nota"); setTitle(""); setContent(""); setSourceUrl("");
    setTagsInput(""); setFile(null); setShowForm(false);
  };

  const submit = async () => {
    if (!title.trim()) { toast.error("Falta el título"); return; }
    setSubmitting(true);
    let file_url: string | null = null;
    let file_name: string | null = null;
    try {
      if ((type === "documento" || type === "brandbook") && file) {
        const path = `${clientId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("client-corpus-files").upload(path, file);
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage
          .from("client-corpus-files").createSignedUrl(path, 60 * 60 * 24 * 365);
        file_url = signed?.signedUrl || path;
        file_name = file.name;
      }
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      const res = await onAdd({
        client_id: clientId,
        entry_type: type,
        title: title.trim(),
        content: content.trim() || null,
        source_url: type === "url" ? (sourceUrl.trim() || null) : null,
        file_url, file_name,
        tags,
      });
      if (res) { toast.success("Entrada agregada"); reset(); }
    } catch (e: any) {
      toast.error(e?.message || "Error al agregar");
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = useMemo(() => {
    const g: Record<string, CorpusEntry[]> = {};
    entries.forEach(e => { (g[e.entry_type] ||= []).push(e); });
    return g;
  }, [entries]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Cargando…" : `${entries.length} entrada${entries.length === 1 ? "" : "s"}`}
        </p>
        <Button size="sm" onClick={() => setShowForm(s => !s)}>
          <Plus className="w-4 h-4 mr-1" /> Nueva entrada
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <Select value={type} onValueChange={v => setType(v as CorpusEntryType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Título</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título descriptivo" />
            </div>
          </div>
          {type !== "url" && (
            <div>
              <label className="text-xs text-muted-foreground">Contenido</label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} />
            </div>
          )}
          {type === "url" && (
            <div>
              <label className="text-xs text-muted-foreground">URL</label>
              <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}
          {(type === "documento" || type === "brandbook") && (
            <div>
              <label className="text-xs text-muted-foreground">Archivo</label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground">Tags (separados por coma)</label>
            <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="estrategia, voz" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={reset}>Cancelar</Button>
            <Button size="sm" onClick={submit} disabled={submitting}>
              {submitting ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </Card>
      )}

      {Object.entries(grouped).map(([t, items]) => {
        const meta = TYPE_META[t] || { label: t, icon: FileText };
        const Icon = meta.icon;
        return (
          <div key={t} className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Icon className="w-3.5 h-3.5" /> {meta.label} · {items.length}
            </div>
            {items.map(e => {
              const isOpen = expanded[e.id];
              return (
                <motion.div key={e.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm truncate">{e.title}</h4>
                          {e.tags?.map(tg => (
                            <Badge key={tg} variant="outline" className="text-[10px]">{tg}</Badge>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(e.created_at), "d MMM yyyy", { locale: es })}
                        </p>
                        {e.content && (
                          <p className="text-sm mt-2 whitespace-pre-line">
                            {isOpen ? e.content : (e.content.length > 100 ? e.content.slice(0, 100) + "…" : e.content)}
                          </p>
                        )}
                        {e.source_url && (
                          <a href={e.source_url} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-1">
                            {e.source_url} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {e.file_url && (
                          <a href={e.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-1">
                            <Upload className="w-3 h-3" /> {e.file_name || "Archivo"}
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {e.content && e.content.length > 100 && (
                          <Button size="icon" variant="ghost" onClick={() => setExpanded(s => ({ ...s, [e.id]: !s[e.id] }))}>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => {
                          if (confirm("¿Eliminar esta entrada?")) onDelete(e.id);
                        }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        );
      })}

      {!loading && entries.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Aún no hay entradas en el corpus de este cliente.
        </Card>
      )}
    </div>
  );
}

export default ClientWorkspace;