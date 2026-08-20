import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";
import { Megaphone, MousePointerClick, Eye, Target, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Proposal = {
  id: string;
  title: string;
  status: string | null;
  platforms: string[] | null;
  business_objective: string | null;
  budget_total: number | null;
  budget_currency: string | null;
  flight_start: string | null;
  flight_end: string | null;
};

type Perf = {
  id: string;
  proposal_id: string | null;
  platform: string | null;
  period_start: string | null;
  period_end: string | null;
  impressions: number | null;
  reach: number | null;
  clicks: number | null;
  conversions: number | null;
  spend: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  roas: number | null;
};

const mx = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 0 });
const money = (n: number) => `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;

export default function PortalAdsModule({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [perf, setPerf] = useState<Perf[]>([]);
  const [scope, setScope] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [{ data: pr }, { data: pf }] = await Promise.all([
        supabase
          .from("ads_proposals")
          .select("id, title, status, platforms, business_objective, budget_total, budget_currency, flight_start, flight_end")
          .eq("client_id", clientId)
          .order("flight_start", { ascending: false }),
        supabase
          .from("ads_proposal_performance")
          .select("id, proposal_id, platform, period_start, period_end, impressions, reach, clicks, conversions, spend, ctr, cpc, cpm, roas")
          .eq("client_id", clientId)
          .order("period_start", { ascending: true }),
      ]);
      if (!alive) return;
      setProposals((pr ?? []) as Proposal[]);
      setPerf((pf ?? []) as Perf[]);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [clientId]);

  const rows = useMemo(
    () => (scope === "all" ? perf : perf.filter((p) => p.proposal_id === scope)),
    [perf, scope]
  );

  const totals = useMemo(() => {
    const sum = (k: keyof Perf) => rows.reduce((a, r) => a + (Number(r[k] ?? 0) || 0), 0);
    const impressions = sum("impressions");
    const clicks = sum("clicks");
    const spend = sum("spend");
    const conversions = sum("conversions");
    return {
      impressions,
      clicks,
      spend,
      conversions,
      reach: sum("reach"),
      ctr: impressions ? (clicks / impressions) * 100 : 0,
      cpc: clicks ? spend / clicks : 0,
      cpa: conversions ? spend / conversions : 0,
    };
  }, [rows]);

  const byPlatform = useMemo(() => {
    const m = new Map<string, { platform: string; spend: number; clicks: number; impressions: number; conversions: number }>();
    rows.forEach((r) => {
      const k = r.platform || "otros";
      const cur = m.get(k) ?? { platform: k, spend: 0, clicks: 0, impressions: 0, conversions: 0 };
      cur.spend += Number(r.spend ?? 0);
      cur.clicks += Number(r.clicks ?? 0);
      cur.impressions += Number(r.impressions ?? 0);
      cur.conversions += Number(r.conversions ?? 0);
      m.set(k, cur);
    });
    return Array.from(m.values()).sort((a, b) => b.spend - a.spend);
  }, [rows]);

  const timeline = useMemo(() => {
    const m = new Map<string, { period: string; spend: number; clicks: number; conversions: number }>();
    rows.forEach((r) => {
      const k = r.period_start ?? "—";
      const cur = m.get(k) ?? { period: k, spend: 0, clicks: 0, conversions: 0 };
      cur.spend += Number(r.spend ?? 0);
      cur.clicks += Number(r.clicks ?? 0);
      cur.conversions += Number(r.conversions ?? 0);
      m.set(k, cur);
    });
    return Array.from(m.values())
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((x) => ({
        ...x,
        label: x.period === "—" ? "—" : new Date(x.period + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      }));
  }, [rows]);

  const insights = useMemo(() => {
    const out: string[] = [];
    if (!rows.length) return out;
    const best = [...byPlatform].sort((a, b) => (b.conversions || b.clicks) - (a.conversions || a.clicks))[0];
    if (best) out.push(`${best.platform} concentra el mejor rendimiento del periodo (${mx(best.clicks)} clics, ${mx(best.conversions)} conversiones) con ${money(best.spend)} invertidos.`);
    if (totals.ctr) out.push(`El CTR promedio es ${totals.ctr.toFixed(2)}%: ${totals.ctr >= 1 ? "por encima" : "por debajo"} del referente de 1% para campañas de tráfico.`);
    if (totals.cpa) out.push(`Cada conversión está costando ${money(totals.cpa)}; es la métrica a vigilar para escalar presupuesto.`);
    const expensive = [...byPlatform].filter((p) => p.spend > 0 && p.clicks === 0)[0];
    if (expensive) out.push(`${expensive.platform} consumió presupuesto sin clics registrados: conviene revisar segmentación o creativos.`);
    return out;
  }, [rows, byPlatform, totals]);

  if (loading) {
    return <div className="grid gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  }

  if (!proposals.length && !perf.length) {
    return (
      <Card className="glass p-14 text-center space-y-2 border-border/50">
        <Megaphone className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Aún no hay campañas cargadas</h3>
        <p className="text-sm text-muted-foreground">En cuanto arranque la pauta verás aquí inversión, resultados y aprendizajes.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <Megaphone className="w-4 h-4 text-coral" />
        <div className="text-sm font-semibold">Pauta y resultados</div>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="w-[280px] h-9 ml-auto"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las campañas</SelectItem>
            {proposals.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Kpi label="Inversión" value={money(totals.spend)} icon={<Wallet className="w-4 h-4" />} />
        <Kpi label="Impresiones" value={mx(totals.impressions)} icon={<Eye className="w-4 h-4" />} />
        <Kpi label="Clics" value={mx(totals.clicks)} icon={<MousePointerClick className="w-4 h-4" />} />
        <Kpi label="Conversiones" value={mx(totals.conversions)} icon={<Target className="w-4 h-4" />} />
        <Kpi label="CTR" value={`${totals.ctr.toFixed(2)}%`} icon={<TrendingUp className="w-4 h-4" />} />
        <Kpi label="CPC" value={totals.cpc ? money(totals.cpc) : "—"} icon={<MousePointerClick className="w-4 h-4" />} />
        <Kpi label="Costo por conversión" value={totals.cpa ? money(totals.cpa) : "—"} icon={<Target className="w-4 h-4" />} />
        <Kpi label="Alcance" value={mx(totals.reach)} icon={<Eye className="w-4 h-4" />} />
      </div>

      {!!insights.length && (
        <Card className="glass border-border/50 p-5 space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Lectura del periodo</div>
          <ul className="space-y-1.5 text-sm">
            {insights.map((t, i) => (
              <li key={i} className="flex gap-2"><span className="text-coral">•</span><span>{t}</span></li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass border-border/50 p-5">
          <div className="text-sm font-semibold mb-3">Inversión y clics por plataforma</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPlatform}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="spend" name="Inversión" fill="hsl(var(--coral))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="clicks" name="Clics" fill="hsl(var(--electric))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="glass border-border/50 p-5">
          <div className="text-sm font-semibold mb-3">Evolución del periodo</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="spend" name="Inversión" stroke="hsl(var(--coral))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversions" name="Conversiones" stroke="hsl(var(--mint))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {!!proposals.length && (
        <Card className="glass border-border/50 p-5 space-y-3">
          <div className="text-sm font-semibold">Campañas</div>
          <div className="space-y-2">
            {proposals.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.flight_start ? new Date(p.flight_start + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    {p.flight_end ? ` → ${new Date(p.flight_end + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  {(p.platforms ?? []).map((pl) => <Badge key={pl} variant="outline">{pl}</Badge>)}
                  {p.budget_total != null && (
                    <Badge variant="outline" className="bg-coral/10 text-coral border-coral/30">
                      {money(Number(p.budget_total))} {p.budget_currency ?? "MXN"}
                    </Badge>
                  )}
                  {p.status && <Badge variant="outline">{p.status}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className={cn("glass border-border/50 p-4")}>
      <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-widest">{icon} {label}</div>
      <div className="text-xl font-display font-bold mt-1">{value}</div>
    </Card>
  );
}
