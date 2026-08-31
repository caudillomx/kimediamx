import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Download, Globe, Megaphone, Users } from "lucide-react";
import { toast } from "sonner";
import { AD_PLATFORMS, NETWORK_LABELS } from "@/lib/portalDataImport";
import { cn } from "@/lib/utils";

type SocialRow = {
  id: string; network: string; account_name: string; period_start: string; period_end: string; period_label: string | null;
  followers: number | null; follower_growth: number | null; follower_growth_rate: number | null; posts: number | null;
  interactions: number | null; engagement_rate: number | null; impressions: number | null; reach: number | null;
};
type WebRow = {
  id: string; period_start: string; period_end: string; period_label: string | null;
  users: number | null; new_users: number | null; sessions: number | null; pageviews: number | null;
  avg_session_seconds: number | null; bounce_rate: number | null; conversions: number | null;
  channels: { channel: string; sessions: number | null; users: number | null }[] | null;
};
type AdsRow = {
  id: string; platform: string; campaign_name: string; period_start: string; period_end: string; period_label: string | null;
  spend: number | null; impressions: number | null; reach: number | null; clicks: number | null; ctr: number | null;
  cpc: number | null; results: number | null; result_type: string | null; cost_per_result: number | null;
};

const nf = (v: number | null | undefined, digits = 0) =>
  v == null || !Number.isFinite(v) ? "—" : Number(v).toLocaleString("es-MX", { maximumFractionDigits: digits, minimumFractionDigits: digits });
const money = (v: number | null | undefined) => (v == null ? "—" : `$${nf(v, 0)}`);
const pct = (v: number | null | undefined) => (v == null ? "—" : `${nf(v, 2)}%`);

const sum = (arr: (number | null | undefined)[]) => {
  const vals = arr.filter((v): v is number => v != null && Number.isFinite(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
};
const avg = (arr: (number | null | undefined)[]) => {
  const vals = arr.filter((v): v is number => v != null && Number.isFinite(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};

function Delta({ current, previous, invert = false }: { current: number | null; previous: number | null; invert?: boolean }) {
  if (current == null || previous == null || previous === 0) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(change) < 2) {
    return <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><ArrowRight className="w-3 h-3" /> sin cambio</span>;
  }
  const up = change > 0;
  const good = invert ? !up : up;
  return (
    <span className={cn("text-[11px] inline-flex items-center gap-1", good ? "text-lime" : "text-coral")}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

function Kpi({ label, value, current, previous, invert }: { label: string; value: string; current?: number | null; previous?: number | null; invert?: boolean }) {
  return (
    <Card className="glass border-border/50 p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-display font-bold mt-1 leading-none">{value}</div>
      <div className="mt-1.5 h-4"><Delta current={current ?? null} previous={previous ?? null} invert={invert} /></div>
    </Card>
  );
}

export default function PortalResumen({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [loading, setLoading] = useState(true);
  const [social, setSocial] = useState<SocialRow[]>([]);
  const [web, setWeb] = useState<WebRow[]>([]);
  const [ads, setAds] = useState<AdsRow[]>([]);
  const [periodKey, setPeriodKey] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [s, w, a] = await Promise.all([
        supabase.from("client_portal_social_metrics").select("*").eq("client_id", clientId).order("period_end", { ascending: false }).limit(500),
        supabase.from("client_portal_web_analytics").select("*").eq("client_id", clientId).order("period_end", { ascending: false }).limit(100),
        supabase.from("client_portal_ads_metrics").select("*").eq("client_id", clientId).order("period_end", { ascending: false }).limit(500),
      ]);
      if (!alive) return;
      setSocial((s.data ?? []) as any);
      setWeb((w.data ?? []) as any);
      setAds((a.data ?? []) as any);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [clientId]);

  const periods = useMemo(() => {
    const m = new Map<string, { start: string; end: string; label: string }>();
    [...social, ...web, ...ads].forEach((r: any) => {
      const key = `${r.period_start}|${r.period_end}`;
      if (!m.has(key)) m.set(key, { start: r.period_start, end: r.period_end, label: r.period_label ?? `${r.period_start} → ${r.period_end}` });
    });
    return [...m.values()].sort((a, b) => (a.end < b.end ? 1 : -1));
  }, [social, web, ads]);

  useEffect(() => {
    if (periods.length && !periods.some((p) => `${p.start}|${p.end}` === periodKey)) {
      setPeriodKey(`${periods[0].start}|${periods[0].end}`);
    }
  }, [periods, periodKey]);

  const idx = periods.findIndex((p) => `${p.start}|${p.end}` === periodKey);
  const cur = idx >= 0 ? periods[idx] : null;
  const prev = idx >= 0 && idx + 1 < periods.length ? periods[idx + 1] : null;

  const inPeriod = <T extends { period_start: string; period_end: string }>(rows: T[], p: { start: string; end: string } | null) =>
    p ? rows.filter((r) => r.period_start === p.start && r.period_end === p.end) : [];

  const sCur = inPeriod(social, cur), sPrev = inPeriod(social, prev);
  const wCur = inPeriod(web, cur)[0] ?? null, wPrev = inPeriod(web, prev)[0] ?? null;
  const aCur = inPeriod(ads, cur), aPrev = inPeriod(ads, prev);

  const followersCur = sum(sCur.map((r) => r.followers));
  const followersPrev = sum(sPrev.map((r) => r.followers));
  const interCur = sum(sCur.map((r) => r.interactions));
  const interPrev = sum(sPrev.map((r) => r.interactions));
  const erCur = avg(sCur.map((r) => r.engagement_rate));
  const erPrev = avg(sPrev.map((r) => r.engagement_rate));
  const spendCur = sum(aCur.map((r) => r.spend));
  const spendPrev = sum(aPrev.map((r) => r.spend));
  const resultsCur = sum(aCur.map((r) => r.results));
  const cprCur = spendCur && resultsCur ? spendCur / resultsCur : null;
  const resultsPrev = sum(aPrev.map((r) => r.results));
  const cprPrev = spendPrev && resultsPrev ? spendPrev / resultsPrev : null;

  const byPlatform = useMemo(() => {
    const m = new Map<string, AdsRow[]>();
    aCur.forEach((r) => m.set(r.platform, [...(m.get(r.platform) ?? []), r]));
    return [...m.entries()].map(([platform, rows]) => ({
      platform,
      spend: sum(rows.map((r) => r.spend)),
      impressions: sum(rows.map((r) => r.impressions)),
      clicks: sum(rows.map((r) => r.clicks)),
      results: sum(rows.map((r) => r.results)),
      campaigns: rows.length,
    })).sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0));
  }, [aCur]);

  const topCampaigns = useMemo(
    () => [...aCur].sort((a, b) => (b.results ?? 0) - (a.results ?? 0) || (b.spend ?? 0) - (a.spend ?? 0)).slice(0, 5),
    [aCur]
  );

  const hasAny = sCur.length || wCur || aCur.length;

  const download = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `${clientName.replace(/\s+/g, "-").toLowerCase()}-resumen-${cur?.end ?? "periodo"}.pdf`,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(pdfRef.current)
        .save();
    } catch (e: any) {
      toast.error("No se pudo generar el PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="grid gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  }

  if (!periods.length) {
    return (
      <Card className="glass border-border/50 p-14 text-center space-y-2">
        <Users className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Aún no hay datos cargados</h3>
        <p className="text-sm text-muted-foreground">En cuanto subamos el primer corte de resultados, aparecerá aquí tu resumen.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={periodKey} onValueChange={setPeriodKey}>
          <SelectTrigger className="h-9 w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            {periods.map((p) => <SelectItem key={`${p.start}|${p.end}`} value={`${p.start}|${p.end}`}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {prev && <span className="text-xs text-muted-foreground">Comparado con {prev.label}</span>}
        <Button size="sm" variant="outline" className="ml-auto h-9" onClick={download} disabled={downloading || !hasAny}>
          <Download className="w-4 h-4 mr-2" /> {downloading ? "Generando…" : "Descargar reporte"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Comunidad total" value={nf(followersCur)} current={followersCur} previous={followersPrev} />
        <Kpi label="Interacciones" value={nf(interCur)} current={interCur} previous={interPrev} />
        <Kpi label="Tasa de interacción" value={pct(erCur)} current={erCur} previous={erPrev} />
        {wCur ? (
          <Kpi label="Sesiones web" value={nf(wCur.sessions)} current={wCur.sessions} previous={wPrev?.sessions ?? null} />
        ) : (
          <Kpi label="Inversión publicitaria" value={money(spendCur)} current={spendCur} previous={spendPrev} />
        )}
      </div>

      {sCur.length > 0 && (
        <Card className="glass border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-coral" />
            <div className="text-sm font-semibold">Redes sociales</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/50">
                  <th className="text-left py-2 font-medium">Cuenta</th>
                  <th className="text-right py-2 font-medium">Seguidores</th>
                  <th className="text-right py-2 font-medium">Publicaciones</th>
                  <th className="text-right py-2 font-medium">Interacciones</th>
                  <th className="text-right py-2 font-medium">Tasa</th>
                </tr>
              </thead>
              <tbody>
                {sCur.map((r) => {
                  const p = sPrev.find((x) => x.network === r.network && x.account_name === r.account_name);
                  return (
                    <tr key={r.id} className="border-b border-border/30 last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{NETWORK_LABELS[r.network] ?? r.network}</Badge>
                          <span className="truncate">{r.account_name}</span>
                        </div>
                      </td>
                      <td className="text-right py-2">
                        <div>{nf(r.followers)}</div>
                        <Delta current={r.followers} previous={p?.followers ?? null} />
                      </td>
                      <td className="text-right py-2">{nf(r.posts, r.posts != null && r.posts < 10 ? 1 : 0)}</td>
                      <td className="text-right py-2">{nf(r.interactions)}</td>
                      <td className="text-right py-2">{pct(r.engagement_rate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {wCur && (
        <Card className="glass border-border/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan" />
            <div className="text-sm font-semibold">Sitio web</div>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <div><div className="text-[11px] text-muted-foreground">Usuarios</div><div className="text-lg font-semibold">{nf(wCur.users)}</div><Delta current={wCur.users} previous={wPrev?.users ?? null} /></div>
            <div><div className="text-[11px] text-muted-foreground">Sesiones</div><div className="text-lg font-semibold">{nf(wCur.sessions)}</div><Delta current={wCur.sessions} previous={wPrev?.sessions ?? null} /></div>
            <div><div className="text-[11px] text-muted-foreground">Vistas</div><div className="text-lg font-semibold">{nf(wCur.pageviews)}</div><Delta current={wCur.pageviews} previous={wPrev?.pageviews ?? null} /></div>
            <div><div className="text-[11px] text-muted-foreground">Conversiones</div><div className="text-lg font-semibold">{nf(wCur.conversions)}</div><Delta current={wCur.conversions} previous={wPrev?.conversions ?? null} /></div>
          </div>
          {!!wCur.channels?.length && (
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">De dónde llega el tráfico</div>
              {wCur.channels.slice(0, 6).map((c) => {
                const total = wCur.channels!.reduce((a, x) => a + (x.sessions ?? 0), 0) || 1;
                const w = Math.round(((c.sessions ?? 0) / total) * 100);
                return (
                  <div key={c.channel} className="flex items-center gap-3 text-xs">
                    <span className="w-40 truncate">{c.channel}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-cyan/70" style={{ width: `${w}%` }} />
                    </div>
                    <span className="w-20 text-right text-muted-foreground">{nf(c.sessions)} ({w}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {aCur.length > 0 && (
        <Card className="glass border-border/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-magenta" />
            <div className="text-sm font-semibold">Publicidad</div>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <div><div className="text-[11px] text-muted-foreground">Inversión</div><div className="text-lg font-semibold">{money(spendCur)}</div><Delta current={spendCur} previous={spendPrev} /></div>
            <div><div className="text-[11px] text-muted-foreground">Impresiones</div><div className="text-lg font-semibold">{nf(sum(aCur.map((r) => r.impressions)))}</div></div>
            <div><div className="text-[11px] text-muted-foreground">Resultados</div><div className="text-lg font-semibold">{nf(resultsCur)}</div><Delta current={resultsCur} previous={resultsPrev} /></div>
            <div><div className="text-[11px] text-muted-foreground">Costo por resultado</div><div className="text-lg font-semibold">{money(cprCur)}</div><Delta current={cprCur} previous={cprPrev} invert /></div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {byPlatform.map((p) => (
              <div key={p.platform} className="rounded-xl border border-border/50 p-3">
                <div className="text-sm font-medium">{AD_PLATFORMS.find((x) => x.key === p.platform)?.label ?? p.platform}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {p.campaigns} campaña{p.campaigns === 1 ? "" : "s"} · {money(p.spend)} · {nf(p.impressions)} impresiones · {nf(p.results)} resultados
                </div>
              </div>
            ))}
          </div>

          {topCampaigns.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Campañas con mejor rendimiento</div>
              {topCampaigns.map((c) => (
                <div key={c.id} className="flex items-center gap-3 text-xs border-b border-border/30 last:border-0 py-1.5">
                  <span className="truncate flex-1">{c.campaign_name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">{money(c.spend)} · {nf(c.results)} {c.result_type ?? "resultados"} · {money(c.cost_per_result)} c/u</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Plantilla de PDF (oculta) */}
      <div className="fixed -left-[10000px] top-0" aria-hidden>
        <div ref={pdfRef} style={{ width: "794px", background: "#ffffff", color: "#12121a", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
          <div style={{ padding: "40px 48px", borderBottom: "4px solid #FF5A5F" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8a8a99" }}>Reporte de resultados</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{clientName}</div>
            <div style={{ fontSize: 13, color: "#5a5a6a", marginTop: 4 }}>{cur?.label}{prev ? ` · comparado con ${prev.label}` : ""}</div>
          </div>
          <div style={{ padding: "28px 48px", display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { l: "Comunidad", v: nf(followersCur) },
              { l: "Interacciones", v: nf(interCur) },
              { l: "Tasa de interacción", v: pct(erCur) },
              { l: "Sesiones web", v: nf(wCur?.sessions ?? null) },
              { l: "Inversión", v: money(spendCur) },
              { l: "Costo por resultado", v: money(cprCur) },
            ].map((k) => (
              <div key={k.l} style={{ width: 200, border: "1px solid #e6e6ee", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#8a8a99" }}>{k.l}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{k.v}</div>
              </div>
            ))}
          </div>

          {sCur.length > 0 && (
            <div style={{ padding: "0 48px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Redes sociales</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#12121a", color: "#fff" }}>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Cuenta</th>
                    <th style={{ textAlign: "right", padding: "8px 10px" }}>Seguidores</th>
                    <th style={{ textAlign: "right", padding: "8px 10px" }}>Publicaciones</th>
                    <th style={{ textAlign: "right", padding: "8px 10px" }}>Interacciones</th>
                    <th style={{ textAlign: "right", padding: "8px 10px" }}>Tasa</th>
                  </tr>
                </thead>
                <tbody>
                  {sCur.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "7px 10px" }}>{(NETWORK_LABELS[r.network] ?? r.network) + " · " + r.account_name}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>{nf(r.followers)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>{nf(r.posts, 0)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>{nf(r.interactions)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>{pct(r.engagement_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {aCur.length > 0 && (
            <div style={{ padding: "0 48px 32px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Publicidad</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#12121a", color: "#fff" }}>
                    <th style={{ textAlign: "left", padding: "8px 10px" }}>Campaña</th>
                    <th style={{ textAlign: "right", padding: "8px 10px" }}>Inversión</th>
                    <th style={{ textAlign: "right", padding: "8px 10px" }}>Impresiones</th>
                    <th style={{ textAlign: "right", padding: "8px 10px" }}>Resultados</th>
                  </tr>
                </thead>
                <tbody>
                  {aCur.slice(0, 14).map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "7px 10px" }}>{c.campaign_name}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>{money(c.spend)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>{nf(c.impressions)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>{nf(c.results)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
