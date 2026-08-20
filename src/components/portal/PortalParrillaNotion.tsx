import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Download, ExternalLink, Layers, RefreshCw, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";

export type NotionItem = {
  id: string;
  notion_page_id: string;
  account: string | null;
  title: string | null;
  scheduled_date: string | null;
  theme: string | null;
  objective: string | null;
  format: string | null;
  network: string | null;
  status: string | null;
  responsible: string | null;
  notion_url: string | null;
};

const statusClass = (s: string | null) => {
  const v = (s ?? "").toLowerCase();
  if (v.includes("public")) return "bg-lime/15 text-lime border-lime/30";
  if (v.includes("program")) return "bg-cyan/15 text-cyan border-cyan/30";
  if (v.includes("aprob")) return "bg-electric/15 text-electric border-electric/30";
  if (v.includes("pend") || v.includes("revis")) return "bg-coral/15 text-coral border-coral/30";
  return "bg-muted text-muted-foreground border-border";
};

const fmtDate = (s: string | null) =>
  s ? new Date(s + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }) : "Sin fecha";

const monthKey = (s: string | null) => (s ? s.slice(0, 7) : "sin-fecha");
const monthLabel = (k: string) =>
  k === "sin-fecha"
    ? "Sin fecha"
    : new Date(k + "-01T00:00:00").toLocaleDateString("es-MX", { month: "long", year: "numeric" });

export default function PortalParrillaNotion({
  clientId,
  clientName,
  canSync,
}: {
  clientId: string;
  clientName: string;
  canSync?: boolean;
}) {
  const [items, setItems] = useState<NotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [month, setMonth] = useState<string>("all");
  const [network, setNetwork] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase
      .from("notion_parrilla_items")
      .select("id, notion_page_id, account, title, scheduled_date, theme, objective, format, network, status, responsible, notion_url")
      .eq("client_id", clientId)
      .order("scheduled_date", { ascending: true });
    setItems((data ?? []) as NotionItem[]);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const sync = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("notion-sync-parrilla", { body: {} });
    setSyncing(false);
    if (error) {
      toast.error("No se pudo sincronizar con Notion");
      return;
    }
    const total = ((data as any)?.report ?? []).reduce((a: number, r: any) => a + (r.imported ?? 0), 0);
    toast.success(`Notion sincronizado · ${total} piezas`);
    load();
  };

  const months = useMemo(
    () => Array.from(new Set(items.map((i) => monthKey(i.scheduled_date)))).sort(),
    [items]
  );
  const networks = useMemo(
    () => Array.from(new Set(items.map((i) => i.network).filter(Boolean) as string[])),
    [items]
  );

  const visible = useMemo(
    () =>
      items.filter(
        (i) =>
          (month === "all" || monthKey(i.scheduled_date) === month) &&
          (network === "all" || i.network === network)
      ),
    [items, month, network]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, NotionItem[]>();
    visible.forEach((i) => {
      const k = i.scheduled_date ?? "sin-fecha";
      map.set(k, [...(map.get(k) ?? []), i]);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visible]);

  const stats = useMemo(() => {
    const done = visible.filter((i) => /public|program|aprob/i.test(i.status ?? "")).length;
    const formats = new Set(visible.map((i) => i.format).filter(Boolean)).size;
    return { total: visible.length, done, formats };
  }, [visible]);

  const exportCsv = () => {
    const rows = [
      ["Fecha", "Cuenta", "Tema", "Objetivo", "Formato", "Plataforma", "Status", "Responsable"],
      ...visible.map((i) => [
        i.scheduled_date ?? "",
        i.account ?? "",
        i.title ?? i.theme ?? "",
        i.objective ?? "",
        i.format ?? "",
        i.network ?? "",
        i.status ?? "",
        i.responsible ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `parrilla-notion-${clientName.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  }

  if (!items.length) {
    return (
      <Card className="glass p-14 text-center space-y-3 border-border/50">
        <Sparkles className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Aún no hay parrilla sincronizada desde Notion</h3>
        <p className="text-sm text-muted-foreground">
          En cuanto el equipo KiMedia publique el calendario, aparecerá aquí.
        </p>
        {canSync && (
          <Button size="sm" variant="outline" onClick={sync} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} /> Sincronizar Notion
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="w-4 h-4 text-coral shrink-0" />
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[220px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el periodo</SelectItem>
              {months.map((m) => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las plataformas</SelectItem>
              {networks.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9" onClick={exportCsv} disabled={!visible.length}>
            <Download className="w-4 h-4 mr-2" /> Descargar
          </Button>
          {canSync && (
            <Button variant="outline" size="sm" className="h-9" onClick={sync} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} /> Sincronizar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        <MiniKpi label="Piezas en parrilla" value={stats.total} icon={<Layers className="w-4 h-4" />} />
        <MiniKpi label="Aprobadas / programadas" value={stats.done} icon={<Sparkles className="w-4 h-4" />} />
        <MiniKpi label="Formatos distintos" value={stats.formats} icon={<Target className="w-4 h-4" />} />
      </div>

      <div className="space-y-4">
        {grouped.map(([date, list]) => (
          <div key={date} className="space-y-2">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              {date === "sin-fecha" ? "Sin fecha" : fmtDate(date)}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((i) => (
                <Card key={i.id} className="glass border-border/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {i.network && <Badge variant="outline" className="bg-electric/10 text-electric border-electric/30">{i.network}</Badge>}
                    {i.format && <Badge variant="outline">{i.format}</Badge>}
                    {i.status && <Badge variant="outline" className={`ml-auto ${statusClass(i.status)}`}>{i.status}</Badge>}
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{i.title || i.theme || "Sin tema"}</p>
                  {i.objective && (
                    <div className="text-xs text-muted-foreground">
                      Objetivo: <span className="text-foreground">{i.objective}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {i.responsible && <span>Responsable: {i.responsible}</span>}
                    {i.notion_url && (
                      <a href={i.notion_url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 hover:text-coral">
                        Ver en Notion <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {!grouped.length && (
          <Card className="glass p-10 text-center text-sm text-muted-foreground border-border/50">
            No hay piezas con este filtro.
          </Card>
        )}
      </div>
    </div>
  );
}

function MiniKpi({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="glass border-border/50 p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="font-display font-bold mt-1 text-2xl">{value}</div>
    </Card>
  );
}
