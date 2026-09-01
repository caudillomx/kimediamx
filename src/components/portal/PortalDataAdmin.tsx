import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BarChart3, Globe, Megaphone, Upload, Trash2, Loader2 } from "lucide-react";
import {
  AD_PLATFORMS,
  NETWORK_LABELS,
  accountKeyOf,
  monthBounds,
  normalizeKey,
  parseAdsFile,
  parseSocialFile,
  parseSocialFileByMonth,

  parseWebFile,
  periodLabel,
  type AdPlatform,
} from "@/lib/portalDataImport";

type Period = { start: string; end: string; label: string };

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function PeriodPicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const [mode, setMode] = useState<"mes" | "rango">("mes");
  const [ym, setYm] = useState(currentMonth());

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Periodo</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as "mes" | "rango")}>
          <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Mes</SelectItem>
            <SelectItem value="rango">Rango</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mode === "mes" ? (
        <div className="space-y-1">
          <Label className="text-xs">Mes</Label>
          <Input
            type="month"
            className="h-9 w-44"
            value={ym}
            onChange={(e) => {
              setYm(e.target.value);
              if (e.target.value) onChange(monthBounds(e.target.value));
            }}
          />
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input type="date" className="h-9 w-40" value={value.start}
              onChange={(e) => onChange({ ...value, start: e.target.value, label: periodLabel(e.target.value, value.end) })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input type="date" className="h-9 w-40" value={value.end}
              onChange={(e) => onChange({ ...value, end: e.target.value, label: periodLabel(value.start, e.target.value) })} />
          </div>
        </>
      )}
      <Badge variant="outline" className="h-9 px-3 flex items-center">{value.label}</Badge>
    </div>
  );
}

export default function PortalDataAdmin({ clientId }: { clientId: string }) {
  const [period, setPeriod] = useState<Period>(() => monthBounds(currentMonth()));
  const [busy, setBusy] = useState<string | null>(null);
  const [social, setSocial] = useState<any[]>([]);
  const [web, setWeb] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [network, setNetwork] = useState("linkedin");
  const [accountName, setAccountName] = useState("");
  const [platform, setPlatform] = useState<AdPlatform>("meta");
  const [autoMonths, setAutoMonths] = useState(true);


  const socialRef = useRef<HTMLInputElement>(null);
  const webRef = useRef<HTMLInputElement>(null);
  const adsRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [s, w, a] = await Promise.all([
      supabase.from("client_portal_social_metrics").select("*").eq("client_id", clientId).order("period_end", { ascending: false }).limit(200),
      supabase.from("client_portal_web_analytics").select("*").eq("client_id", clientId).order("period_end", { ascending: false }).limit(60),
      supabase.from("client_portal_ads_metrics").select("*").eq("client_id", clientId).order("period_end", { ascending: false }).limit(200),
    ]);
    setSocial(s.data ?? []);
    setWeb(w.data ?? []);
    setAds(a.data ?? []);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const uid = useRef<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { uid.current = data.user?.id ?? null; }); }, []);

  const handleSocial = async (file: File) => {
    setBusy("social");
    try {
      const groups = autoMonths
        ? await parseSocialFileByMonth(file, network, accountName || undefined)
        : [{ ym: null as string | null, rows: await parseSocialFile(file, network, accountName || undefined) }];
      const usable = groups.filter((g) => g.rows.length);
      if (!usable.length) { toast.error("No encontré filas con cuentas en ese archivo"); return; }

      let total = 0;
      const labels: string[] = [];
      for (const g of usable) {
        const p = g.ym ? monthBounds(g.ym) : period;
        labels.push(p.label);
        const payload = g.rows.map((r) => ({
          client_id: clientId,
          network: r.network,
          account_key: accountKeyOf(r.account_name, r.account_handle),
          account_name: r.account_name,
          account_handle: r.account_handle,
          period_start: p.start,
          period_end: p.end,
          period_label: p.label,
          source: r.network === "linkedin" ? "linkedin" : "fanpage_karma",
          followers: r.followers,
          follower_growth: r.follower_growth,
          follower_growth_rate: r.follower_growth_rate,
          posts: r.posts,
          interactions: r.interactions,
          engagement_rate: r.engagement_rate,
          impressions: r.impressions,
          reach: r.reach,
          performance_index: r.performance_index,
          raw: r.raw as any,
          created_by: uid.current,
        }));
        const { error } = await supabase
          .from("client_portal_social_metrics")
          .upsert(payload, { onConflict: "client_id,network,account_key,period_start,period_end" });
        if (error) throw error;
        total += payload.length;
      }
      toast.success(
        usable.length > 1
          ? `${total} registros en ${usable.length} periodos: ${labels.join(", ")}`
          : `${total} cuentas actualizadas · ${labels[0]}`
      );
      load();
    } catch (e: any) {
      toast.error(e.message ?? "No se pudo importar");
    } finally {
      setBusy(null);
      if (socialRef.current) socialRef.current.value = "";
    }
  };


  const handleWeb = async (file: File) => {
    setBusy("web");
    try {
      const t = await parseWebFile(file);
      if (t.sessions == null && t.users == null) { toast.error("No reconocí métricas de GA4 en el archivo"); return; }
      const { error } = await supabase.from("client_portal_web_analytics").upsert(
        {
          client_id: clientId,
          period_start: period.start,
          period_end: period.end,
          period_label: period.label,
          users: t.users,
          new_users: t.new_users,
          sessions: t.sessions,
          pageviews: t.pageviews,
          avg_session_seconds: t.avg_session_seconds,
          bounce_rate: t.bounce_rate,
          conversions: t.conversions,
          channels: t.channels as any,
          created_by: uid.current,
        },
        { onConflict: "client_id,period_start,period_end" }
      );
      if (error) throw error;
      toast.success("Analítica web actualizada");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "No se pudo importar");
    } finally {
      setBusy(null);
      if (webRef.current) webRef.current.value = "";
    }
  };

  const handleAds = async (file: File) => {
    setBusy("ads");
    try {
      const { platform: detected, rows } = await parseAdsFile(file);
      if (!rows.length) { toast.error("No encontré campañas en el archivo"); return; }
      const plat = detected ?? platform;
      const payload = rows.map((r) => ({
        client_id: clientId,
        platform: plat,
        campaign_key: normalizeKey(r.campaign_name).replace(/\s+/g, "-").slice(0, 120),
        campaign_name: r.campaign_name,
        objective: r.objective,
        period_start: period.start,
        period_end: period.end,
        period_label: period.label,
        spend: r.spend,
        impressions: r.impressions,
        reach: r.reach,
        clicks: r.clicks,
        ctr: r.ctr,
        cpc: r.cpc,
        cpm: r.cpm,
        results: r.results,
        result_type: r.result_type,
        cost_per_result: r.cost_per_result,
        conversions: r.conversions,
        raw: r.raw as any,
        created_by: uid.current,
      }));
      const { error } = await supabase
        .from("client_portal_ads_metrics")
        .upsert(payload, { onConflict: "client_id,platform,campaign_key,period_start,period_end" });
      if (error) throw error;
      toast.success(`${payload.length} campañas de ${plat} actualizadas`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "No se pudo importar");
    } finally {
      setBusy(null);
      if (adsRef.current) adsRef.current.value = "";
    }
  };

  const removeRow = async (table: "client_portal_social_metrics" | "client_portal_web_analytics" | "client_portal_ads_metrics", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const socialGrouped = useMemo(() => {
    const m = new Map<string, any[]>();
    social.forEach((r) => {
      const k = `${r.period_label ?? r.period_end}`;
      m.set(k, [...(m.get(k) ?? []), r]);
    });
    return [...m.entries()];
  }, [social]);

  return (
    <div className="space-y-5">
      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">Periodo de la carga</div>
        <p className="text-xs text-muted-foreground">
          Todo lo que subas abajo se guarda en este periodo. Si vuelves a subir el mismo periodo, se actualiza en vez de duplicarse.
        </p>
        <PeriodPicker value={period} onChange={setPeriod} />
      </Card>

      <Tabs defaultValue="redes" className="space-y-4">
        <TabsList className="h-auto p-1 flex-wrap">
          <TabsTrigger value="redes" className="gap-2"><BarChart3 className="w-4 h-4" /> Redes</TabsTrigger>
          <TabsTrigger value="web" className="gap-2"><Globe className="w-4 h-4" /> Web (GA4)</TabsTrigger>
          <TabsTrigger value="ads" className="gap-2"><Megaphone className="w-4 h-4" /> Ads</TabsTrigger>
        </TabsList>

        {/* -------- Redes -------- */}
        <TabsContent value="redes" className="mt-0 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Subir performance de redes</div>
            <p className="text-xs text-muted-foreground">
              Acepta el comparativo de FanpageKarma (detecta red y cuenta solo) o el export de LinkedIn. Formatos: XLSX o CSV.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Red por defecto (si el archivo no la trae)</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(NETWORK_LABELS).filter(([k]) => k !== "x").map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cuenta por defecto (opcional)</Label>
                <Input className="h-9" placeholder="Ej. Falcon" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
              <Switch id="auto-months" checked={autoMonths} onCheckedChange={setAutoMonths} />
              <div className="space-y-0.5">
                <Label htmlFor="auto-months" className="text-xs font-medium">Detectar meses dentro del archivo</Label>
                <p className="text-[11px] text-muted-foreground">
                  Si el export trae varios meses (columnas tipo “Seguidores 06/2026” o una columna de fecha), crea un corte por
                  cada mes automáticamente. Si se apaga, todo se guarda en el periodo seleccionado arriba.
                </p>
              </div>
            </div>

            <input ref={socialRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSocial(f); }} />
            <Button size="sm" onClick={() => socialRef.current?.click()} disabled={busy === "social"}>
              {busy === "social" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Subir archivo
            </Button>
          </Card>

          {socialGrouped.map(([label, rows]) => (
            <Card key={label} className="p-4 space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
              {rows.map((r) => (
                <div key={r.id} className="flex items-center gap-3 text-sm border-b border-border/40 last:border-0 py-1.5">
                  <Badge variant="outline" className="text-[10px]">{NETWORK_LABELS[r.network] ?? r.network}</Badge>
                  <span className="font-medium truncate">{r.account_name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {r.followers != null ? `${Number(r.followers).toLocaleString("es-MX")} seg.` : "—"}
                    {r.engagement_rate != null ? ` · ${Number(r.engagement_rate).toFixed(2)}% int.` : ""}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow("client_portal_social_metrics", r.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </Card>
          ))}
        </TabsContent>

        {/* -------- Web -------- */}
        <TabsContent value="web" className="mt-0 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Subir analítica web (Google Analytics 4)</div>
            <p className="text-xs text-muted-foreground">
              Exporta de GA4 el informe de adquisición por canal (CSV) y súbelo. Se suman sesiones, usuarios, vistas y conversiones del periodo.
            </p>
            <input ref={webRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWeb(f); }} />
            <Button size="sm" onClick={() => webRef.current?.click()} disabled={busy === "web"}>
              {busy === "web" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Subir CSV de GA4
            </Button>
          </Card>

          {web.map((r) => (
            <Card key={r.id} className="p-4 flex items-center gap-4 text-sm">
              <div className="min-w-0">
                <div className="font-medium">{r.period_label ?? `${r.period_start} → ${r.period_end}`}</div>
                <div className="text-xs text-muted-foreground">
                  {Number(r.sessions ?? 0).toLocaleString("es-MX")} sesiones · {Number(r.users ?? 0).toLocaleString("es-MX")} usuarios
                  {r.conversions ? ` · ${Number(r.conversions).toLocaleString("es-MX")} conversiones` : ""}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={() => removeRow("client_portal_web_analytics", r.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </TabsContent>

        {/* -------- Ads -------- */}
        <TabsContent value="ads" className="mt-0 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Subir resultados de campañas</div>
            <p className="text-xs text-muted-foreground">
              Export por campaña de Meta, Google, TikTok o X. Si no logro detectar la plataforma, uso la que elijas aquí.
            </p>
            <div className="space-y-1 max-w-xs">
              <Label className="text-xs">Plataforma por defecto</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as AdPlatform)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_PLATFORMS.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <input ref={adsRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAds(f); }} />
            <Button size="sm" onClick={() => adsRef.current?.click()} disabled={busy === "ads"}>
              {busy === "ads" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Subir archivo
            </Button>
          </Card>

          {ads.map((r) => (
            <Card key={r.id} className="p-3 flex items-center gap-3 text-sm">
              <Badge variant="outline" className="text-[10px]">{AD_PLATFORMS.find((p) => p.key === r.platform)?.label ?? r.platform}</Badge>
              <span className="font-medium truncate">{r.campaign_name}</span>
              <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                {r.period_label} · ${Number(r.spend ?? 0).toLocaleString("es-MX")}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow("client_portal_ads_metrics", r.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
