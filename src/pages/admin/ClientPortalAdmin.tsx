import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Paperclip, Upload, X, Users, FileText } from "lucide-react";
import { toast } from "sonner";

type Report = {
  id: string;
  report_date: string;
  title: string;
  type: string;
  summary_md: string | null;
  created_at: string;
};

type Attachment = {
  id: string;
  file_name: string;
  storage_path: string;
};

type AccessRow = {
  id: string;
  user_id: string;
  created_at: string;
  email?: string | null;
};

const TYPE_OPTIONS = [
  { value: "daily", label: "Análisis diario" },
  { value: "weekly", label: "Reporte semanal" },
  { value: "benchmark", label: "Benchmark" },
  { value: "other", label: "Otro" },
];

export default function ClientPortalAdmin() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [clientName, setClientName] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Create-report dialog state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    report_date: new Date().toISOString().slice(0, 10),
    title: "",
    type: "daily",
    summary_md: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  // Grant-access state
  const [newUserId, setNewUserId] = useState("");

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { navigate("/admin/operaciones/login"); return; }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        toast.error("Solo admins pueden acceder");
        navigate("/admin/operaciones");
        return;
      }
      setChecking(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (checking || !clientId) return;
    load();
  }, [checking, clientId]);

  const load = async () => {
    setLoading(true);
    const [c, r, a] = await Promise.all([
      supabase.from("clients").select("name").eq("id", clientId).maybeSingle(),
      supabase
        .from("client_portal_reports")
        .select("id, report_date, title, type, summary_md, created_at")
        .eq("client_id", clientId)
        .order("report_date", { ascending: false }),
      supabase
        .from("client_access")
        .select("id, user_id, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ]);
    setClientName(c.data?.name ?? "");
    setReports((r.data ?? []) as Report[]);
    setAccess((a.data ?? []) as AccessRow[]);
    setLoading(false);
  };

  const createReport = async () => {
    if (!clientId) return;
    if (!form.title.trim()) { toast.error("El título es obligatorio"); return; }
    setSaving(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      const { data: created, error } = await supabase
        .from("client_portal_reports")
        .insert({
          client_id: clientId,
          report_date: form.report_date,
          title: form.title.trim(),
          type: form.type,
          summary_md: form.summary_md.trim() || null,
          created_by: s.session?.user.id,
        })
        .select()
        .single();
      if (error) throw error;

      for (const f of files) {
        const path = `${clientId}/${created.id}/${Date.now()}-${f.name}`;
        const { error: upErr } = await supabase.storage
          .from("client-reports")
          .upload(path, f, { upsert: false });
        if (upErr) { toast.error(`Adjunto ${f.name}: ${upErr.message}`); continue; }
        await supabase.from("client_portal_attachments").insert({
          report_id: created.id,
          file_name: f.name,
          storage_path: path,
          mime_type: f.type,
          size_bytes: f.size,
        });
      }

      toast.success("Reporte publicado");
      setForm({ report_date: new Date().toISOString().slice(0, 10), title: "", type: "daily", summary_md: "" });
      setFiles([]);
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("¿Eliminar este reporte?")) return;
    const { data: atts } = await supabase
      .from("client_portal_attachments")
      .select("storage_path")
      .eq("report_id", id);
    if (atts && atts.length) {
      await supabase.storage.from("client-reports").remove(atts.map((a) => a.storage_path));
    }
    const { error } = await supabase.from("client_portal_reports").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Eliminado");
    load();
  };

  const grantAccess = async () => {
    if (!clientId || !newUserId.trim()) return;
    const { error } = await supabase
      .from("client_access")
      .insert({ user_id: newUserId.trim(), client_id: clientId });
    if (error) { toast.error(error.message); return; }
    toast.success("Acceso otorgado");
    setNewUserId("");
    load();
  };

  const revokeAccess = async (id: string) => {
    if (!confirm("¿Revocar acceso?")) return;
    const { error } = await supabase.from("client_access").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Acceso revocado");
    load();
  };

  if (checking) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/operaciones">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Operaciones</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">Portal cliente · {clientName}</h1>
            <p className="text-sm text-muted-foreground">Reportes publicados y accesos autorizados.</p>
          </div>
        </div>

        <Tabs defaultValue="reportes">
          <TabsList>
            <TabsTrigger value="reportes"><FileText className="w-4 h-4 mr-2" /> Reportes</TabsTrigger>
            <TabsTrigger value="accesos"><Users className="w-4 h-4 mr-2" /> Accesos</TabsTrigger>
          </TabsList>

          <TabsContent value="reportes" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" /> Nuevo reporte</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Nuevo reporte</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Fecha</Label>
                        <Input type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Título</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Análisis del 9 de julio" />
                    </div>
                    <div>
                      <Label>Resumen (Markdown)</Label>
                      <Textarea rows={10} value={form.summary_md} onChange={(e) => setForm({ ...form, summary_md: e.target.value })} placeholder="## Resumen&#10;- Punto 1&#10;- Punto 2" />
                    </div>
                    <div>
                      <Label>Adjuntos</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                          id="file-input"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                        />
                        <label htmlFor="file-input" className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                          <Upload className="w-4 h-4" /> Selecciona archivos
                        </label>
                        {files.length > 0 && (
                          <ul className="mt-3 text-left text-sm space-y-1">
                            {files.map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Paperclip className="w-3 h-3" /> {f.name}
                                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="ml-auto text-muted-foreground hover:text-destructive">
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                      <Button disabled={saving} onClick={createReport}>{saving ? "Guardando..." : "Publicar"}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Cargando...</div>
            ) : reports.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground">Sin reportes aún.</Card>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <Card key={r.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{TYPE_OPTIONS.find((t) => t.value === r.type)?.label ?? r.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.report_date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="font-medium truncate">{r.title}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteReport(r.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accesos" className="space-y-4">
            <Card className="p-4 space-y-3">
              <div>
                <Label>Otorgar acceso por User ID</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Pega el UUID del usuario (Cloud → Users). Debe ya haberse registrado.
                </p>
                <div className="flex gap-2">
                  <Input value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="uuid del usuario" />
                  <Button onClick={grantAccess}>Otorgar</Button>
                </div>
              </div>
            </Card>

            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Cargando...</div>
            ) : access.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground">Nadie tiene acceso aún.</Card>
            ) : (
              <div className="space-y-2">
                {access.map((a) => (
                  <Card key={a.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="text-sm">
                      <div className="font-mono text-xs">{a.user_id}</div>
                      <div className="text-xs text-muted-foreground">
                        Otorgado {new Date(a.created_at).toLocaleDateString("es-MX")}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => revokeAccess(a.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}