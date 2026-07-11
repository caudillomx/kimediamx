import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Save, X, CheckCircle2, AlertCircle } from "lucide-react";
import { parseFanpageKarma, matchCompetitor, type ParsedRow } from "@/lib/fanpageKarmaParser";

type Competitor = {
  id: string;
  client_id: string;
  name: string;
  handle: string | null;
  platform: string;
  brand_color: string;
  active: boolean;
  sort_order: number;
};

type Week = {
  id: string;
  week_start: string;
  week_end: string;
  uploaded_file_name: string | null;
  notes: string | null;
  created_at: string;
};

type MatchedRow = ParsedRow & {
  competitorId: string | null;
  isSelf: boolean;
  needsMapping: boolean;
};

const PLATFORMS = ["multi", "facebook", "x", "instagram", "youtube", "tiktok", "linkedin"];

// Devuelve el lunes de la semana ISO para una fecha dada (YYYY-MM-DD)
function isoWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
function isoWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

export default function BenchmarkAdmin({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComp, setNewComp] = useState({ name: "", handle: "", platform: "multi", brand_color: "#94a3b8" });

  // Uploader
  const [file, setFile] = useState<File | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const [weekStart, setWeekStart] = useState<string>(isoWeekStart(today));
  const [notes, setNotes] = useState("");
  const [parsedRows, setParsedRows] = useState<MatchedRow[] | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [c, w] = await Promise.all([
      supabase.from("client_portal_benchmark_competitors").select("*").eq("client_id", clientId).order("sort_order"),
      supabase.from("client_portal_benchmark_weeks").select("*").eq("client_id", clientId).order("week_start", { ascending: false }),
    ]);
    setCompetitors((c.data ?? []) as Competitor[]);
    setWeeks((w.data ?? []) as Week[]);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [clientId]);

  // ---------- Competidores ----------
  async function addCompetitor() {
    if (!newComp.name.trim()) return;
    const { error } = await supabase.from("client_portal_benchmark_competitors").insert({
      client_id: clientId,
      name: newComp.name.trim(),
      handle: newComp.handle.trim() || null,
      platform: newComp.platform,
      brand_color: newComp.brand_color,
      sort_order: competitors.length + 1,
    });
    if (error) { toast.error(error.message); return; }
    setNewComp({ name: "", handle: "", platform: "multi", brand_color: "#94a3b8" });
    loadAll();
  }
  async function updateCompetitor(id: string, patch: Partial<Competitor>) {
    const { error } = await supabase.from("client_portal_benchmark_competitors").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCompetitors(cs => cs.map(c => c.id === id ? { ...c, ...patch } as Competitor : c));
  }
  async function deleteCompetitor(id: string) {
    if (!confirm("¿Eliminar este competidor y todas sus métricas?")) return;
    const { error } = await supabase.from("client_portal_benchmark_competitors").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    loadAll();
  }

  // ---------- Uploader ----------
  async function handleParse() {
    if (!file) { toast.error("Selecciona un archivo XLSX o CSV"); return; }
    try {
      const rows = await parseFanpageKarma(file);
      if (rows.length === 0) { toast.error("No se detectaron filas con marca/página en el archivo"); return; }
      const matched: MatchedRow[] = rows.map(r => {
        const m = matchCompetitor(r, competitors, clientName);
        return {
          ...r,
          competitorId: m.competitor?.id ?? null,
          isSelf: m.isSelf,
          needsMapping: !m.isSelf && !m.competitor,
        };
      });
      setParsedRows(matched);
      toast.success(`${rows.length} filas detectadas — revisa el mapeo antes de guardar`);
    } catch (e: any) {
      toast.error(`Error al leer el archivo: ${e.message}`);
    }
  }

  async function handleSave() {
    if (!parsedRows) return;
    setSaving(true);
    try {
      const wEnd = isoWeekEnd(weekStart);
      // upsert de semana
      const { data: weekRow, error: weekErr } = await supabase
        .from("client_portal_benchmark_weeks")
        .upsert({
          client_id: clientId,
          week_start: weekStart,
          week_end: wEnd,
          uploaded_file_name: file?.name ?? null,
          notes: notes || null,
        }, { onConflict: "client_id,week_start" })
        .select()
        .single();
      if (weekErr) throw weekErr;

      // borra métricas previas de esa semana antes de re-insertar
      await supabase.from("client_portal_benchmark_metrics").delete().eq("week_id", weekRow.id);

      const toInsert = parsedRows
        .filter(r => r.isSelf || r.competitorId)
        .map(r => ({
          week_id: weekRow.id,
          client_id: clientId,
          competitor_id: r.isSelf ? null : r.competitorId,
          is_self: r.isSelf,
          brand_name: r.brandName,
          platform: r.platform,
          fans: r.fans,
          fan_change: r.fanChange,
          followers: r.followers,
          posts: r.posts,
          interactions: r.interactions,
          engagement_rate: r.engagementRate,
          reach: r.reach,
          video_views: r.videoViews,
          raw: r.raw as any,
        }));
      if (toInsert.length === 0) {
        toast.error("No hay filas mapeadas para guardar");
        setSaving(false);
        return;
      }
      const { error: mErr } = await supabase.from("client_portal_benchmark_metrics").insert(toInsert);
      if (mErr) throw mErr;
      toast.success(`Guardadas ${toInsert.length} filas para la semana del ${weekStart}`);
      setParsedRows(null);
      setFile(null);
      setNotes("");
      loadAll();
    } catch (e: any) {
      toast.error(`Error al guardar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteWeek(id: string) {
    if (!confirm("¿Eliminar esta semana y todas sus métricas?")) return;
    const { error } = await supabase.from("client_portal_benchmark_weeks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    loadAll();
  }

  const mappingSummary = useMemo(() => {
    if (!parsedRows) return null;
    const self = parsedRows.filter(r => r.isSelf).length;
    const mapped = parsedRows.filter(r => !r.isSelf && r.competitorId).length;
    const unmapped = parsedRows.filter(r => r.needsMapping).length;
    return { self, mapped, unmapped, total: parsedRows.length };
  }, [parsedRows]);

  return (
    <div className="space-y-6">
      {/* Competidores */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg">Competidores</h3>
            <p className="text-xs text-muted-foreground">Marcas contra las que se compara {clientName} en cada semana cargada.</p>
          </div>
        </div>

        <div className="grid gap-2">
          {competitors.map(c => (
            <div key={c.id} className="grid grid-cols-[auto_1fr_1fr_140px_120px_auto_auto] gap-2 items-center border border-border/40 rounded-lg p-2">
              <input
                type="color"
                value={c.brand_color}
                onChange={(e) => updateCompetitor(c.id, { brand_color: e.target.value })}
                className="w-8 h-8 rounded border border-border/40 cursor-pointer"
              />
              <Input value={c.name} onChange={(e) => updateCompetitor(c.id, { name: e.target.value })} placeholder="Nombre" />
              <Input value={c.handle ?? ""} onChange={(e) => updateCompetitor(c.id, { handle: e.target.value })} placeholder="@handle" />
              <Select value={c.platform} onValueChange={(v) => updateCompetitor(c.id, { platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={c.active} onChange={(e) => updateCompetitor(c.id, { active: e.target.checked })} />
                Activo
              </label>
              <Input
                type="number"
                value={c.sort_order}
                onChange={(e) => updateCompetitor(c.id, { sort_order: parseInt(e.target.value) || 0 })}
                className="w-16"
              />
              <Button variant="ghost" size="sm" onClick={() => deleteCompetitor(c.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          {competitors.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground italic py-4">Sin competidores. Agrega el primero abajo.</p>
          )}
        </div>

        {/* Nuevo competidor */}
        <div className="mt-4 grid grid-cols-[auto_1fr_1fr_140px_auto] gap-2 items-end border-t border-border/40 pt-4">
          <input
            type="color"
            value={newComp.brand_color}
            onChange={(e) => setNewComp({ ...newComp, brand_color: e.target.value })}
            className="w-8 h-8 rounded border border-border/40 cursor-pointer"
          />
          <div>
            <Label className="text-xs">Nombre</Label>
            <Input value={newComp.name} onChange={(e) => setNewComp({ ...newComp, name: e.target.value })} placeholder="Ej: GBM" />
          </div>
          <div>
            <Label className="text-xs">Handle</Label>
            <Input value={newComp.handle} onChange={(e) => setNewComp({ ...newComp, handle: e.target.value })} placeholder="@GBMmx" />
          </div>
          <div>
            <Label className="text-xs">Plataforma</Label>
            <Select value={newComp.platform} onValueChange={(v) => setNewComp({ ...newComp, platform: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={addCompetitor}><Plus className="w-4 h-4 mr-1" />Agregar</Button>
        </div>
      </Card>

      {/* Uploader */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-lg mb-1">Cargar semana desde FanpageKarma</h3>
        <p className="text-xs text-muted-foreground mb-4">Sube el export XLSX/CSV. El sistema detecta columnas y mapea contra el catálogo de competidores.</p>

        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <div>
            <Label className="text-xs">Archivo (XLSX o CSV)</Label>
            <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center">
              <input
                id="fpk-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setParsedRows(null); }}
              />
              <label htmlFor="fpk-file" className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Upload className="w-4 h-4" />{file ? file.name : "Seleccionar archivo"}
              </label>
            </div>
          </div>
          <div>
            <Label className="text-xs">Semana (lunes)</Label>
            <Input type="date" value={weekStart} onChange={(e) => setWeekStart(isoWeekStart(e.target.value))} />
          </div>
        </div>

        <div className="mt-3">
          <Label className="text-xs">Notas (opcional)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: incluye Facebook + Instagram, sin TikTok" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={handleParse} disabled={!file} variant="outline">
            <Upload className="w-4 h-4 mr-1" />Analizar archivo
          </Button>
          {parsedRows && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />{saving ? "Guardando…" : `Guardar ${(mappingSummary?.self ?? 0) + (mappingSummary?.mapped ?? 0)} filas`}
            </Button>
          )}
          {parsedRows && (
            <Button variant="ghost" size="sm" onClick={() => setParsedRows(null)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
          )}
        </div>

        {parsedRows && mappingSummary && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />{mappingSummary.self} cliente
              </span>
              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">
                {mappingSummary.mapped} competidores mapeados
              </span>
              {mappingSummary.unmapped > 0 && (
                <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-3 h-3 inline mr-1" />{mappingSummary.unmapped} sin mapeo (no se guardarán)
                </span>
              )}
            </div>

            <div className="max-h-[400px] overflow-auto border border-border/40 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-background/60 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Marca detectada</th>
                    <th className="text-left p-2">Plataforma</th>
                    <th className="text-right p-2">Fans</th>
                    <th className="text-right p-2">Posts</th>
                    <th className="text-right p-2">Interacc.</th>
                    <th className="text-right p-2">Eng.%</th>
                    <th className="text-left p-2">Mapeo</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="p-2 font-medium">{r.brandName}</td>
                      <td className="p-2">{r.platform}</td>
                      <td className="p-2 text-right tabular-nums">{r.fans?.toLocaleString() ?? "—"}</td>
                      <td className="p-2 text-right tabular-nums">{r.posts ?? "—"}</td>
                      <td className="p-2 text-right tabular-nums">{r.interactions?.toLocaleString() ?? "—"}</td>
                      <td className="p-2 text-right tabular-nums">{r.engagementRate != null ? r.engagementRate.toFixed(2) : "—"}</td>
                      <td className="p-2">
                        {r.isSelf ? (
                          <span className="text-emerald-600 dark:text-emerald-400">→ {clientName} (cliente)</span>
                        ) : (
                          <Select
                            value={r.competitorId ?? "__none"}
                            onValueChange={(v) => setParsedRows(rows => rows!.map((row, idx) => idx === i
                              ? { ...row, competitorId: v === "__none" ? null : v, needsMapping: v === "__none" }
                              : row))}
                          >
                            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Sin mapear" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">— Sin mapear —</SelectItem>
                              {competitors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Historial de semanas */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-lg mb-1">Semanas cargadas</h3>
        <p className="text-xs text-muted-foreground mb-4">Historial de exports procesados.</p>

        {weeks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aún no hay semanas cargadas.</p>
        ) : (
          <div className="grid gap-2">
            {weeks.map(w => (
              <div key={w.id} className="flex items-center justify-between border border-border/40 rounded-lg p-3">
                <div>
                  <div className="font-semibold text-sm">Semana del {w.week_start} al {w.week_end}</div>
                  <div className="text-xs text-muted-foreground">
                    {w.uploaded_file_name ?? "sin archivo"} · cargada el {new Date(w.created_at).toLocaleDateString("es-MX")}
                  </div>
                  {w.notes && <div className="text-xs text-muted-foreground mt-1 italic">{w.notes}</div>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteWeek(w.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}