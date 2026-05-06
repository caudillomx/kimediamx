import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, Sparkles, ChevronDown, ChevronUp, Facebook, Search, Music2 } from "lucide-react";
import { toast } from "sonner";
import { useAdsProposals } from "@/hooks/useAdsProposals";

const PLATFORMS = [
  { id: "meta",   label: "Meta",   icon: Facebook },
  { id: "google", label: "Google", icon: Search },
  { id: "tiktok", label: "TikTok", icon: Music2 },
];
const OBJECTIVES = ["Awareness", "Tráfico", "Leads", "Conversión", "Retención", "Engagement"];

const PROGRESS_STEPS = [
  "Leyendo corpus del cliente…",
  "Analizando contenido orgánico activo…",
  "Consultando performance histórico…",
  "Generando estrategia de medios…",
];

export function AdsProposalBuilder({
  open, onOpenChange, clientId, clientName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clientId: string;
  clientName: string;
}) {
  const navigate = useNavigate();
  const { createProposal } = useAdsProposals(clientId);

  const [title, setTitle] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [businessObjective, setBusinessObjective] = useState("");
  const [campaignObjectives, setCampaignObjectives] = useState<string[]>([]);
  const [budgetTotal, setBudgetTotal] = useState<string>("");
  const [currency, setCurrency] = useState<"MXN" | "USD">("MXN");
  const [flightStart, setFlightStart] = useState("");
  const [flightEnd, setFlightEnd] = useState("");
  const [audienceBrief, setAudienceBrief] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [ctx, setCtx] = useState<{ corpus: number; cycles: number; perf: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);

  // Context preview counts
  useEffect(() => {
    if (!open || !clientId) return;
    (async () => {
      const [c, p, perf] = await Promise.all([
        supabase.from("client_corpus").select("id", { count: "exact", head: true }).eq("client_id", clientId),
        supabase.from("content_profiles").select("id").eq("client_id", clientId),
      , supabase.from("ads_proposal_performance").select("id", { count: "exact", head: true }).eq("client_id", clientId),
      ]);
      const profileIds = (p.data || []).map((x: any) => x.id);
      let cycles = 0;
      if (profileIds.length) {
        const { count } = await supabase
          .from("content_cycles").select("id", { count: "exact", head: true })
          .in("profile_id", profileIds)
          .in("status", ["briefing", "corpus", "parrilla"]);
        cycles = count || 0;
      }
      setCtx({ corpus: c.count || 0, cycles, perf: perf.count || 0 });
    })();
  }, [open, clientId]);

  // Animate progress messages
  useEffect(() => {
    if (!generating) return;
    setProgressIdx(0);
    const t = setInterval(() => setProgressIdx(i => Math.min(i + 1, PROGRESS_STEPS.length - 1)), 3500);
    return () => clearInterval(t);
  }, [generating]);

  const togglePlatform = (id: string) =>
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleObjective = (id: string) =>
    setCampaignObjectives(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const canSubmit = useMemo(() =>
    title.trim() && platforms.length && businessObjective.trim() &&
    Number(budgetTotal) > 0 && flightStart && flightEnd && !generating,
    [title, platforms, businessObjective, budgetTotal, flightStart, flightEnd, generating]);

  const submit = async () => {
    if (!canSubmit) return;
    setGenerating(true);
    try {
      const proposal = await createProposal({
        client_id: clientId,
        title: title.trim(),
        status: "borrador",
        platforms,
        business_objective: businessObjective.trim(),
        campaign_objectives: campaignObjectives,
        budget_total: Number(budgetTotal),
        budget_currency: currency,
        flight_start: flightStart,
        flight_end: flightEnd,
        target_audience_brief: audienceBrief.trim() || null,
      });
      if (!proposal) { setGenerating(false); return; }

      const { data, error } = await supabase.functions.invoke("generate-ads-proposal", {
        body: {
          proposal_id: proposal.id,
          client_id: clientId,
          platforms,
          business_objective: businessObjective.trim(),
          campaign_objectives: campaignObjectives,
          budget_total: Number(budgetTotal),
          budget_currency: currency,
          flight_start: flightStart,
          flight_end: flightEnd,
          target_audience_brief: audienceBrief.trim(),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast.success("Propuesta generada");
      onOpenChange(false);
      navigate(`/admin/propuesta/${proposal.id}`);
    } catch (e: any) {
      toast.error(e?.message || "Error generando propuesta");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !generating && onOpenChange(o)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva propuesta de ads · {clientName}</DialogTitle>
        </DialogHeader>

        {generating ? (
          <div className="py-12 flex flex-col items-center text-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="space-y-1">
              {PROGRESS_STEPS.map((s, i) => (
                <p key={s} className={`text-sm ${i === progressIdx ? "font-medium" : i < progressIdx ? "text-muted-foreground line-through" : "text-muted-foreground/50"}`}>
                  {s}
                </p>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Esto puede tardar 30-60 segundos. No cierres esta ventana.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Título de la propuesta</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Campaña Q3 - Lanzamiento línea X" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Plataformas</label>
              <div className="flex gap-2">
                {PLATFORMS.map(p => {
                  const Icon = p.icon;
                  const active = platforms.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"}`}>
                      <Icon className="w-4 h-4" /> {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Objetivo de negocio</label>
              <Textarea value={businessObjective} onChange={e => setBusinessObjective(e.target.value)} rows={2}
                placeholder="Ej. Aumentar ventas de consultas médicas 30% en Q3" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Objetivos de campaña</label>
              <div className="flex flex-wrap gap-1.5">
                {OBJECTIVES.map(o => {
                  const active = campaignObjectives.includes(o);
                  return (
                    <button key={o} type="button" onClick={() => toggleObjective(o)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"}`}>
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Presupuesto total</label>
                <Input type="number" value={budgetTotal} onChange={e => setBudgetTotal(e.target.value)} placeholder="50000" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Moneda</label>
                <Select value={currency} onValueChange={v => setCurrency(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Inicio</label>
                <Input type="date" value={flightStart} onChange={e => setFlightStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fin</label>
                <Input type="date" value={flightEnd} onChange={e => setFlightEnd(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Audiencia adicional al corpus del cliente</label>
              <Textarea value={audienceBrief} onChange={e => setAudienceBrief(e.target.value)} rows={2}
                placeholder="Notas extra sobre segmentación, geografía, comportamientos…" />
            </div>

            <Card className="p-3 bg-muted/30">
              <button type="button" onClick={() => setShowPreview(s => !s)}
                className="w-full flex items-center justify-between text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Vista previa del contexto que usará la IA
                </span>
                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showPreview && (
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entradas de corpus</span>
                    <Badge variant="outline">{ctx?.corpus ?? "…"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ciclos de contenido activos</span>
                    <Badge variant="outline">{ctx?.cycles ?? "…"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registros de performance</span>
                    <Badge variant="outline">{ctx?.perf ?? "…"}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-2 border-t border-border mt-2">
                    La IA leerá estos datos junto con el brief para generar la propuesta.
                  </p>
                </div>
              )}
            </Card>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={!canSubmit}>
                <Sparkles className="w-4 h-4 mr-1.5" /> Generar propuesta
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AdsProposalBuilder;