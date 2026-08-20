import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Download, Layers, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type Cycle = {
  id: string;
  title: string;
  cycle_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

type Piece = {
  id: string;
  scheduled_date: string | null;
  network: string | null;
  format: string | null;
  pillar: string | null;
  objective: string | null;
  final_copy: string | null;
  draft_copy: string | null;
  hashtags: string[] | null;
  cta: string | null;
  status: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  review: "En revisión",
  approved: "Aprobada",
  published: "Publicada",
  rejected: "Rechazada",
  scheduled: "Programada",
};

const STATUS_CLASS: Record<string, string> = {
  approved: "bg-lime/15 text-lime border-lime/30",
  published: "bg-lime/15 text-lime border-lime/30",
  review: "bg-cyan/15 text-cyan border-cyan/30",
  draft: "bg-muted text-muted-foreground border-border",
  rejected: "bg-coral/15 text-coral border-coral/30",
};

function fmtDate(s: string | null) {
  if (!s) return "Sin fecha";
  return new Date(s + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

export default function PortalParrilla({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [network, setNetwork] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: profiles } = await supabase
        .from("content_profiles")
        .select("id, client_id, client_name")
        .or(`client_id.eq.${clientId},client_name.eq.${clientName}`);
      const ids = (profiles ?? []).map((p: any) => p.id);
      if (!ids.length) {
        if (alive) { setCycles([]); setPieces([]); setLoading(false); }
        return;
      }
      const { data: cy } = await supabase
        .from("content_cycles")
        .select("id, title, cycle_type, start_date, end_date, status")
        .in("profile_id", ids)
        .order("start_date", { ascending: false });
      if (!alive) return;
      setCycles((cy ?? []) as Cycle[]);
      setCycleId((cy ?? [])[0]?.id ?? null);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [clientId, clientName]);

  useEffect(() => {
    if (!cycleId) { setPieces([]); return; }
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("content_pieces")
        .select("id, scheduled_date, network, format, pillar, objective, final_copy, draft_copy, hashtags, cta, status")
        .eq("cycle_id", cycleId)
        .order("scheduled_date", { ascending: true })
        .order("sort_order", { ascending: true });
      if (alive) setPieces((data ?? []) as Piece[]);
    })();
    return () => { alive = false; };
  }, [cycleId]);

  const networks = useMemo(
    () => Array.from(new Set(pieces.map((p) => p.network).filter(Boolean) as string[])),
    [pieces]
  );

  const visible = useMemo(
    () => (network === "all" ? pieces : pieces.filter((p) => p.network === network)),
    [pieces, network]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Piece[]>();
    visible.forEach((p) => {
      const k = p.scheduled_date ?? "sin-fecha";
      map.set(k, [...(map.get(k) ?? []), p]);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visible]);

  const stats = useMemo(() => {
    const total = pieces.length;
    const approved = pieces.filter((p) => ["approved", "published", "scheduled"].includes(p.status ?? "")).length;
    const pillars = new Set(pieces.map((p) => p.pillar).filter(Boolean)).size;
    return { total, approved, pillars };
  }, [pieces]);

  const exportCsv = () => {
    const rows = [
      ["Fecha", "Red", "Formato", "Pilar", "Objetivo", "Estatus", "Copy", "CTA", "Hashtags"],
      ...visible.map((p) => [
        p.scheduled_date ?? "",
        p.network ?? "",
        p.format ?? "",
        p.pillar ?? "",
        p.objective ?? "",
        STATUS_LABEL[p.status ?? ""] ?? p.status ?? "",
        (p.final_copy || p.draft_copy || "").replace(/\s+/g, " "),
        p.cta ?? "",
        (p.hashtags ?? []).join(" "),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `parrilla-${clientName.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  }

  if (!cycles.length) {
    return (
      <Card className="glass p-14 text-center space-y-2 border-border/50">
        <Sparkles className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Aún no hay parrilla publicada</h3>
        <p className="text-sm text-muted-foreground">
          Cuando el equipo KiMedia libere el ciclo editorial aparecerá aquí, listo para revisar y descargar.
        </p>
      </Card>
    );
  }

  const cycle = cycles.find((c) => c.id === cycleId);

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="w-4 h-4 text-coral shrink-0" />
          <Select value={cycleId ?? ""} onValueChange={setCycleId}>
            <SelectTrigger className="w-[300px] h-9"><SelectValue placeholder="Elige el ciclo" /></SelectTrigger>
            <SelectContent>
              {cycles.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="w-[170px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las redes</SelectItem>
              {networks.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9" onClick={exportCsv} disabled={!visible.length}>
            <Download className="w-4 h-4 mr-2" /> Descargar parrilla
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MiniKpi label="Piezas del ciclo" value={stats.total} icon={<Layers className="w-4 h-4" />} />
        <MiniKpi label="Listas / publicadas" value={stats.approved} icon={<Sparkles className="w-4 h-4" />} />
        <MiniKpi label="Pilares de contenido" value={stats.pillars} icon={<Target className="w-4 h-4" />} />
        <MiniKpi
          label="Periodo"
          value={cycle ? `${fmtDate(cycle.start_date)} – ${fmtDate(cycle.end_date)}` : "—"}
          icon={<CalendarDays className="w-4 h-4" />}
          small
        />
      </div>

      <div className="space-y-4">
        {grouped.map(([date, items]) => (
          <div key={date} className="space-y-2">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              {date === "sin-fecha" ? "Sin fecha" : fmtDate(date)}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((p) => (
                <Card key={p.id} className="glass border-border/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.network && <Badge variant="outline" className="bg-electric/10 text-electric border-electric/30">{p.network}</Badge>}
                    {p.format && <Badge variant="outline">{p.format}</Badge>}
                    {p.status && (
                      <Badge variant="outline" className={cn("ml-auto", STATUS_CLASS[p.status] ?? "")}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </Badge>
                    )}
                  </div>
                  {p.pillar && <div className="text-xs text-muted-foreground">Pilar: <span className="text-foreground">{p.pillar}</span></div>}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {p.final_copy || p.draft_copy || "—"}
                  </p>
                  {p.cta && <div className="text-xs"><span className="text-muted-foreground">CTA:</span> {p.cta}</div>}
                  {!!(p.hashtags ?? []).length && (
                    <div className="text-xs text-muted-foreground">{(p.hashtags ?? []).join(" ")}</div>
                  )}
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

function MiniKpi({ label, value, icon, small }: { label: string; value: string | number; icon: React.ReactNode; small?: boolean }) {
  return (
    <Card className="glass border-border/50 p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className={cn("font-display font-bold mt-1", small ? "text-sm" : "text-2xl")}>{value}</div>
    </Card>
  );
}
