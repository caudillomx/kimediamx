import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  stage: string;
  name: string;
  channel: string | null;
  url: string | null;
  status: string;
  owner: string | null;
  metric_label: string | null;
  metric_value: string | null;
  notes: string | null;
};

const STAGES = [
  { key: "awareness", label: "Atracción", hint: "Dónde nos descubren", cls: "from-electric/20 to-electric/5 border-electric/25" },
  { key: "consideration", label: "Consideración", hint: "Dónde nos evalúan", cls: "from-cyan/20 to-cyan/5 border-cyan/25" },
  { key: "conversion", label: "Conversión", hint: "Dónde nos contactan o compran", cls: "from-coral/20 to-coral/5 border-coral/25" },
  { key: "loyalty", label: "Fidelización", hint: "Dónde nos quedamos con ellos", cls: "from-magenta/20 to-magenta/5 border-magenta/25" },
];

const STATUS_CLASS: Record<string, string> = {
  activo: "bg-lime/15 text-lime border-lime/30",
  "en construcción": "bg-cyan/15 text-cyan border-cyan/30",
  pausado: "bg-muted text-muted-foreground border-border",
  propuesto: "bg-electric/15 text-electric border-electric/30",
};

const EMPTY = {
  stage: "awareness",
  name: "",
  channel: "",
  url: "",
  status: "activo",
  owner: "",
  metric_label: "",
  metric_value: "",
  notes: "",
};

export default function PortalActivos({ clientId, canEdit }: { clientId: string; canEdit: boolean }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("client_portal_assets")
      .select("id, stage, name, channel, url, status, owner, metric_label, metric_value, notes")
      .eq("client_id", clientId)
      .order("stage", { ascending: true })
      .order("sort_order", { ascending: true });
    setAssets((data ?? []) as Asset[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clientId]);

  const byStage = useMemo(() => {
    const m = new Map<string, Asset[]>();
    assets.forEach((a) => m.set(a.stage, [...(m.get(a.stage) ?? []), a]));
    return m;
  }, [assets]);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Ponle nombre al activo"); return; }
    setSaving(true);
    const { error } = await supabase.from("client_portal_assets").insert({
      client_id: clientId,
      ...form,
      channel: form.channel || null,
      url: form.url || null,
      owner: form.owner || null,
      metric_label: form.metric_label || null,
      metric_value: form.metric_value || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error("No se pudo guardar"); return; }
    toast.success("Activo agregado");
    setForm({ ...EMPTY });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("client_portal_assets").delete().eq("id", id);
    if (error) { toast.error("No se pudo eliminar"); return; }
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return <div className="grid gap-3 md:grid-cols-4">{STAGES.map((s) => <Skeleton key={s.key} className="h-64 rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-coral" />
          <div>
            <div className="text-sm font-semibold">Funnel y activos digitales</div>
            <div className="text-xs text-muted-foreground">Cómo se conecta cada canal con la ruta de tu audiencia.</div>
          </div>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto h-9"><Plus className="w-4 h-4 mr-2" /> Nuevo activo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Agregar activo digital</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["activo", "en construcción", "pausado", "propuesto"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Nombre del activo (ej. Instagram @cliente)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Canal (Instagram, Web…)" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} />
                  <Input placeholder="Responsable" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
                </div>
                <Input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Métrica (ej. Seguidores)" value={form.metric_label} onChange={(e) => setForm({ ...form, metric_label: e.target.value })} />
                  <Input placeholder="Valor (ej. 12.4K)" value={form.metric_value} onChange={(e) => setForm({ ...form, metric_value: e.target.value })} />
                </div>
                <Textarea placeholder="Notas / rol dentro del funnel" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Button className="w-full" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar activo"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((s) => {
          const items = byStage.get(s.key) ?? [];
          return (
            <div key={s.key} className={cn("rounded-2xl border bg-gradient-to-b p-4 space-y-3", s.cls)}>
              <div>
                <div className="text-sm font-display font-bold">{s.label}</div>
                <div className="text-[11px] text-muted-foreground">{s.hint}</div>
              </div>
              {items.map((a) => (
                <Card key={a.id} className="glass border-border/50 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{a.name}</div>
                      {a.channel && <div className="text-[11px] text-muted-foreground">{a.channel}</div>}
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={() => remove(a.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  {(a.metric_label || a.metric_value) && (
                    <div className="text-xs"><span className="text-muted-foreground">{a.metric_label}: </span><span className="font-semibold">{a.metric_value}</span></div>
                  )}
                  {a.notes && <p className="text-[11px] text-muted-foreground leading-relaxed">{a.notes}</p>}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_CLASS[a.status] ?? "")}>{a.status}</Badge>
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-[11px] text-electric inline-flex items-center gap-1 ml-auto">
                        Abrir <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
              {!items.length && (
                <div className="text-[11px] text-muted-foreground py-6 text-center">Sin activos registrados.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
