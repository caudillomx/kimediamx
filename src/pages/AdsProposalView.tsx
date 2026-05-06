import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AdsProposal, AdsPerformance, fetchProposalById,
  listProposalPerformance, addProposalPerformance,
} from "@/hooks/useAdsProposals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Download, CheckCircle2, FileText, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  borrador:  "bg-muted text-foreground",
  revision:  "bg-amber-500/15 text-amber-700 border-amber-500/30",
  aprobado:  "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  activo:    "bg-blue-500/15 text-blue-700 border-blue-500/30",
  pausado:   "bg-orange-500/15 text-orange-700 border-orange-500/30",
  cerrado:   "bg-zinc-500/15 text-zinc-700 border-zinc-500/30",
};

const fmtMoney = (n: number, cur = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n || 0);

const AdsProposalView = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [proposal, setProposal] = useState<AdsProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"client" | "internal">("internal");
  const [perf, setPerf] = useState<AdsPerformance[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate("/admin/operaciones/login"); return; }
      setCheckingAuth(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (!proposalId || checkingAuth) return;
    (async () => {
      setLoading(true);
      const p = await fetchProposalById(proposalId);
      setProposal(p);
      if (p) setPerf(await listProposalPerformance(p.id));
      setLoading(false);
    })();
  }, [proposalId, checkingAuth]);

  const data = proposal?.proposal_data as any | undefined;

  const budgetChartData = useMemo(() => {
    return (data?.budget_breakdown?.by_platform || []).map((p: any) => ({
      name: p.platform, amount: Number(p.amount) || 0,
    }));
  }, [data]);

  const approve = async () => {
    if (!proposal) return;
    const { error } = await supabase.from("ads_proposals")
      .update({ status: "aprobado", approved_at: new Date().toISOString() })
      .eq("id", proposal.id);
    if (error) return toast.error(error.message);
    setProposal({ ...proposal, status: "aprobado", approved_at: new Date().toISOString() });
    toast.success("Propuesta aprobada");
  };

  if (checkingAuth || loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Cargando…</div>;
  }
  if (!proposal) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Propuesta no encontrada.</p>
          <Button onClick={() => navigate("/admin/operaciones")}><ArrowLeft className="w-4 h-4 mr-2" />Volver</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>
          <Badge variant="outline" className={STATUS_COLORS[proposal.status] || ""}>{proposal.status}</Badge>
          <div className="ml-auto flex items-center gap-2">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList>
                <TabsTrigger value="client">Vista cliente</TabsTrigger>
                <TabsTrigger value="internal">Vista interna</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
            {proposal.status === "revision" && (
              <Button size="sm" onClick={approve}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Aprobar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 print:p-0">
        {/* Brand header */}
        <div className="mb-6 pb-4 border-b border-border print:border-none">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">KiMedia · Propuesta de medios</p>
          <h1 className="font-display text-3xl font-bold mt-1">{proposal.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {proposal.flight_start} → {proposal.flight_end} ·{" "}
            {fmtMoney(proposal.budget_total || 0, proposal.budget_currency || "MXN")} ·{" "}
            {(proposal.platforms || []).join(" · ")}
          </p>
        </div>

        {!data ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Esta propuesta aún no tiene contenido generado.
            {(proposal.internal_brief as any)?.error && (
              <p className="text-destructive mt-2">Error: {(proposal.internal_brief as any).error}</p>
            )}
          </Card>
        ) : (
          <div className="space-y-8">
            <Section title="Resumen ejecutivo">
              <p className="whitespace-pre-line leading-relaxed">{data.executive_summary}</p>
            </Section>

            <Section title="Diagnóstico estratégico">
              <p className="whitespace-pre-line leading-relaxed">{data.strategic_diagnosis}</p>
            </Section>

            <Section title="Objetivos y KPIs">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2">Objetivo</th><th className="py-2">KPI</th><th className="py-2">Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.campaign_objectives || []).map((o: any, i: number) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="py-2">{o.objective}</td>
                      <td className="py-2">{o.kpi}</td>
                      <td className="py-2">{o.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="Audiencia">
              <Field label="Primaria" value={data.audience?.primary} />
              <Field label="Secundaria" value={data.audience?.secondary} />
              <Field label="Exclusiones" value={data.audience?.exclusions} />
            </Section>

            <Section title="Estrategia por plataforma">
              <div className="grid gap-3">
                {(data.platforms || []).map((p: any, i: number) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-bold capitalize">{p.platform}</h3>
                      <div className="text-right">
                        <div className="font-semibold">{fmtMoney(p.budget_amount, proposal.budget_currency || "MXN")}</div>
                        <div className="text-xs text-muted-foreground">{p.budget_percentage}% del total</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">{p.role}</p>
                    <Field label="Objetivo" value={p.objective} />
                    <Field label="Formatos" value={(p.formats || []).join(", ")} />
                    <Field label="Targeting" value={p.targeting_approach} />
                    <Field label="Guidelines creativas" value={p.creative_guidelines} />
                    {p.kpis?.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">KPIs</div>
                        <ul className="text-sm mt-1 space-y-0.5">
                          {p.kpis.map((k: any, j: number) => (
                            <li key={j}>• {k.metric}: <span className="font-medium">{k.target}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Section>

            <Section title="Alineación con contenido orgánico">
              <p className="whitespace-pre-line leading-relaxed">{data.content_alignment}</p>
            </Section>

            <Section title="Desglose de presupuesto">
              {budgetChartData.length > 0 && (
                <div className="h-56 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v: any) => fmtMoney(v, proposal.budget_currency || "MXN")} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="text-sm space-y-1">
                <div>Total: <strong>{fmtMoney(data.budget_breakdown?.total || 0, data.budget_breakdown?.currency || "MXN")}</strong></div>
                {data.budget_breakdown?.production_reserve > 0 && (
                  <div>Reserva de producción: {fmtMoney(data.budget_breakdown.production_reserve, data.budget_breakdown?.currency || "MXN")}</div>
                )}
                {data.budget_breakdown?.notes && <p className="text-muted-foreground mt-1">{data.budget_breakdown.notes}</p>}
              </div>
            </Section>

            <Section title="Timeline">
              <div className="space-y-2">
                {(data.timeline || []).map((t: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary pl-3 py-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <strong className="text-sm">{t.phase}</strong>
                      <span className="text-xs text-muted-foreground">{t.dates}</span>
                    </div>
                    <p className="text-sm">{t.activities}</p>
                    {t.budget > 0 && <p className="text-xs text-muted-foreground">Presupuesto: {fmtMoney(t.budget, proposal.budget_currency || "MXN")}</p>}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Métricas de éxito">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2">Métrica</th><th className="py-2">Baseline</th>
                    <th className="py-2">Meta</th><th className="py-2">Medición</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.success_metrics || []).map((m: any, i: number) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="py-2">{m.metric}</td>
                      <td className="py-2">{m.baseline}</td>
                      <td className="py-2">{m.target}</td>
                      <td className="py-2">{m.measurement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="Siguientes pasos">
              <ul className="space-y-1 text-sm">
                {(data.next_steps || []).map((s: string, i: number) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </Section>

            {mode === "internal" && (
              <>
                {data.internal_notes && (
                  <Card className="p-5 border-amber-500/30 bg-amber-500/5">
                    <h3 className="font-display text-lg font-bold mb-2 text-amber-700">Notas internas (KiMedia)</h3>
                    <p className="whitespace-pre-line text-sm">{data.internal_notes}</p>
                  </Card>
                )}

                <PerformancePanel
                  proposalId={proposal.id}
                  clientId={proposal.client_id}
                  currency={proposal.budget_currency || "MXN"}
                  perf={perf}
                  onAdded={(p) => setPerf(prev => [p, ...prev])}
                />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="font-display text-xl font-bold mb-2">{title}</h2>
    <div>{children}</div>
  </section>
);

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="text-sm py-1">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">{label}:</span>
    <span>{value || <span className="text-muted-foreground italic">—</span>}</span>
  </div>
);

function PerformancePanel({
  proposalId, clientId, currency, perf, onAdded,
}: {
  proposalId: string; clientId: string; currency: string;
  perf: AdsPerformance[]; onAdded: (p: AdsPerformance) => void;
}) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({
    platform: "meta", period_start: "", period_end: "",
    impressions: "", reach: "", clicks: "", conversions: "", spend: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const payload: any = {
      proposal_id: proposalId, client_id: clientId, currency,
      platform: form.platform,
      period_start: form.period_start || null,
      period_end: form.period_end || null,
      impressions: form.impressions ? Number(form.impressions) : null,
      reach: form.reach ? Number(form.reach) : null,
      clicks: form.clicks ? Number(form.clicks) : null,
      conversions: form.conversions ? Number(form.conversions) : null,
      spend: form.spend ? Number(form.spend) : null,
      notes: form.notes || null,
      raw_metrics: null, ctr: null, cpm: null, cpc: null, roas: null,
    };
    if (payload.impressions && payload.clicks) payload.ctr = +(payload.clicks / payload.impressions * 100).toFixed(2);
    if (payload.spend && payload.impressions) payload.cpm = +(payload.spend / payload.impressions * 1000).toFixed(2);
    if (payload.spend && payload.clicks) payload.cpc = +(payload.spend / payload.clicks).toFixed(2);
    const created = await addProposalPerformance(payload);
    setSaving(false);
    if (created) {
      onAdded(created);
      setShow(false);
      setForm({ platform: "meta", period_start: "", period_end: "", impressions: "", reach: "", clicks: "", conversions: "", spend: "", notes: "" });
      toast.success("Performance registrada");
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <FileText className="w-4 h-4" /> Performance
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShow(s => !s)}>
          <Plus className="w-4 h-4 mr-1" /> Registrar métricas
        </Button>
      </div>

      {show && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          <Input placeholder="Plataforma" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} />
          <Input type="date" value={form.period_start} onChange={e => setForm({ ...form, period_start: e.target.value })} />
          <Input type="date" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} />
          <Input type="number" placeholder="Impresiones" value={form.impressions} onChange={e => setForm({ ...form, impressions: e.target.value })} />
          <Input type="number" placeholder="Alcance" value={form.reach} onChange={e => setForm({ ...form, reach: e.target.value })} />
          <Input type="number" placeholder="Clicks" value={form.clicks} onChange={e => setForm({ ...form, clicks: e.target.value })} />
          <Input type="number" placeholder="Conversiones" value={form.conversions} onChange={e => setForm({ ...form, conversions: e.target.value })} />
          <Input type="number" placeholder="Gasto" value={form.spend} onChange={e => setForm({ ...form, spend: e.target.value })} />
          <Textarea className="col-span-full" placeholder="Notas" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
          <div className="col-span-full flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShow(false)}>Cancelar</Button>
            <Button size="sm" onClick={submit} disabled={saving}>Guardar</Button>
          </div>
        </div>
      )}

      {perf.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin registros aún.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-2">Plataforma</th><th>Periodo</th>
              <th>Impr.</th><th>Clicks</th><th>Conv.</th><th>Gasto</th>
              <th>CTR</th><th>CPM</th><th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {perf.map(p => (
              <tr key={p.id} className="border-b border-border/60">
                <td className="py-2">{p.platform}</td>
                <td className="text-xs">{p.period_start} → {p.period_end}</td>
                <td>{p.impressions ?? "—"}</td>
                <td>{p.clicks ?? "—"}</td>
                <td>{p.conversions ?? "—"}</td>
                <td>{p.spend ? fmtMoney(p.spend, p.currency || currency) : "—"}</td>
                <td>{p.ctr ?? "—"}</td>
                <td>{p.cpm ?? "—"}</td>
                <td>{p.roas ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export default AdsProposalView;