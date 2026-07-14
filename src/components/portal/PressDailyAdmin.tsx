import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Copy, RefreshCw } from "lucide-react";

type Batch = { id: string; batch_date: string; status: string };
type Entry = { id: string; medium: string | null; author: string | null; title: string | null; url: string | null; raw_text: string; tone: string | null; topic: string | null; position: number };
type Digest = { summary_md: string; whatsapp_text: string; alerts: any[]; generated_at: string; entries_count: number } | null;

const TONES = ["positivo", "neutral", "negativo", "crisis"];

export default function PressDailyAdmin({ clientId }: { clientId: string }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [digest, setDigest] = useState<Digest>(null);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState<Partial<Entry>>({ medium: "", author: "", title: "", url: "", raw_text: "", tone: "neutral", topic: "" });

  const load = async () => {
    const { data } = await supabase.from("press_daily_batches").select("id, batch_date, status").eq("client_id", clientId).order("batch_date", { ascending: false }).limit(60);
    const list = (data ?? []) as Batch[];
    setBatches(list);
    if (!selected && list.length) setSelected(list[0].id);
  };

  const loadEntries = async () => {
    if (!selected) { setEntries([]); setDigest(null); return; }
    const [e, d] = await Promise.all([
      supabase.from("press_daily_entries").select("*").eq("batch_id", selected).order("position", { ascending: true }),
      supabase.from("press_daily_digests").select("summary_md, whatsapp_text, alerts, generated_at, entries_count").eq("batch_id", selected).maybeSingle(),
    ]);
    setEntries((e.data ?? []) as Entry[]);
    setDigest((d.data as any) ?? null);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clientId]);
  useEffect(() => { loadEntries(); /* eslint-disable-next-line */ }, [selected]);

  const createBatch = async () => {
    if (!newDate) return;
    setBusy(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      const { data, error } = await supabase.from("press_daily_batches")
        .upsert({ client_id: clientId, batch_date: newDate, status: "draft", created_by: s.session?.user.id }, { onConflict: "client_id,batch_date" })
        .select().single();
      if (error) throw error;
      toast.success("Lote listo");
      setSelected(data.id);
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const addEntry = async () => {
    if (!selected || !form.raw_text?.trim()) { toast.error("El texto de la nota es obligatorio"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("press_daily_entries").insert({
        batch_id: selected, client_id: clientId,
        medium: form.medium?.trim() || null,
        author: form.author?.trim() || null,
        title: form.title?.trim() || null,
        url: form.url?.trim() || null,
        raw_text: form.raw_text!.trim(),
        tone: form.tone || null,
        topic: form.topic?.trim() || null,
        position: entries.length,
      });
      if (error) throw error;
      setForm({ medium: "", author: "", title: "", url: "", raw_text: "", tone: "neutral", topic: "" });
      await loadEntries();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const removeEntry = async (id: string) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    const { error } = await supabase.from("press_daily_entries").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await loadEntries();
  };

  const removeBatch = async () => {
    if (!selected) return;
    if (!confirm("¿Eliminar todo el lote de este día (incluye notas y condensado)?")) return;
    const { error } = await supabase.from("press_daily_batches").delete().eq("id", selected);
    if (error) { toast.error(error.message); return; }
    setSelected(null);
    await load();
  };

  const generate = async () => {
    if (!selected) return;
    if (entries.length === 0) { toast.error("Agrega al menos una nota"); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("press-daily-generate", { body: { batch_id: selected } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Condensado generado. Ya está visible en el portal.");
      await loadEntries();
      await load();
    } catch (e: any) { toast.error(e.message ?? "Error"); }
    finally { setGenerating(false); }
  };

  const copyWhatsapp = () => {
    if (!digest?.whatsapp_text) return;
    navigator.clipboard.writeText(digest.whatsapp_text);
    toast.success("Texto WhatsApp copiado");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Lote del día</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-xs">Fecha</Label>
            <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-[180px]" />
          </div>
          <Button onClick={createBatch} disabled={busy}><Plus className="w-4 h-4 mr-1" /> Crear o abrir lote</Button>
          <div className="ml-auto flex items-center gap-2">
            <Label className="text-xs">Ir a:</Label>
            <Select value={selected ?? ""} onValueChange={setSelected}>
              <SelectTrigger className="w-[220px] h-9"><SelectValue placeholder="Elige un lote" /></SelectTrigger>
              <SelectContent>
                {batches.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.batch_date} · {b.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {selected && (
        <>
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">Agregar nota / columna</h3>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={removeBatch}><Trash2 className="w-4 h-4 mr-1" /> Borrar lote</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div><Label className="text-xs">Medio</Label><Input value={form.medium ?? ""} onChange={(e) => setForm({ ...form, medium: e.target.value })} placeholder="Correo, Reforma…" /></div>
              <div><Label className="text-xs">Autor / Columnista</Label><Input value={form.author ?? ""} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div><Label className="text-xs">Título</Label><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label className="text-xs">URL (opcional)</Label><Input value={form.url ?? ""} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></div>
              <div>
                <Label className="text-xs">Tono</Label>
                <Select value={form.tone ?? "neutral"} onValueChange={(v) => setForm({ ...form, tone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Tema</Label><Input value={form.topic ?? ""} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Seguridad, Economía…" /></div>
            </div>
            <div>
              <Label className="text-xs">Texto de la nota / columna</Label>
              <Textarea rows={5} value={form.raw_text ?? ""} onChange={(e) => setForm({ ...form, raw_text: e.target.value })} placeholder="Pega aquí el cuerpo de la nota, con las citas relevantes." />
            </div>
            <div className="flex justify-end">
              <Button onClick={addEntry} disabled={busy}><Plus className="w-4 h-4 mr-1" /> Agregar a la bitácora</Button>
            </div>
          </Card>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Bitácora del día ({entries.length})</div>
            {entries.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">Sin notas aún</Card>
            ) : (
              <div className="space-y-2">
                {entries.map(e => (
                  <Card key={e.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {e.medium && <Badge variant="secondary" className="text-[10px]">{e.medium}</Badge>}
                        {e.author && <span className="text-xs text-muted-foreground">· {e.author}</span>}
                        {e.tone && <Badge variant="outline" className="text-[10px] ml-auto">{e.tone}</Badge>}
                      </div>
                      {e.title && <div className="text-sm font-medium">{e.title}</div>}
                      <p className="text-xs text-muted-foreground line-clamp-2">{e.raw_text}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeEntry(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="p-4 space-y-3 border-coral/30">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-coral shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Condensado del día (IA)</h3>
                <p className="text-xs text-muted-foreground">
                  Se genera desde las notas capturadas. La IA solo cita información presente — nunca inventa.
                </p>
              </div>
              <Button onClick={generate} disabled={generating || entries.length === 0}>
                <RefreshCw className={`w-4 h-4 mr-1 ${generating ? "animate-spin" : ""}`} />
                {digest ? "Regenerar" : "Generar"}
              </Button>
            </div>
            {digest ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/60 p-3 bg-background/50">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">WhatsApp ({digest.whatsapp_text.length} chars)</div>
                  <pre className="text-xs whitespace-pre-wrap font-sans">{digest.whatsapp_text}</pre>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={copyWhatsapp}><Copy className="w-3 h-3 mr-1" /> Copiar</Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-3 bg-background/50">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Resumen ejecutivo</div>
                  <pre className="text-xs whitespace-pre-wrap font-sans">{digest.summary_md}</pre>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">Aún sin generar. Agrega notas y presiona Generar.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}