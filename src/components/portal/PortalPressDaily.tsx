import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Newspaper, AlertTriangle, Copy, ExternalLink } from "lucide-react";

type Batch = { id: string; batch_date: string; status: string };
type Entry = { id: string; medium: string | null; author: string | null; title: string | null; url: string | null; raw_text: string; tone: string | null; topic: string | null };
type Digest = { id: string; summary_md: string; whatsapp_text: string; alerts: any[]; tone_breakdown: Record<string, number>; entries_count: number; generated_at: string };

function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const ALERT_STYLES: Record<string, string> = {
  crisis: "bg-red-500/15 text-red-600 border-red-500/40",
  alta: "bg-amber-500/15 text-amber-700 border-amber-500/40",
  media: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  baja: "bg-muted text-muted-foreground border-border",
};

export default function PortalPressDaily({ clientId }: { clientId: string }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("press_daily_batches")
        .select("id, batch_date, status")
        .eq("client_id", clientId)
        .in("status", ["ready", "sent"])
        .order("batch_date", { ascending: false })
        .limit(60);
      const list = (data ?? []) as Batch[];
      setBatches(list);
      if (list.length) setSelected(list[0].id);
      setLoading(false);
    })();
  }, [clientId]);

  useEffect(() => {
    if (!selected) { setEntries([]); setDigest(null); return; }
    (async () => {
      const [e, d] = await Promise.all([
        supabase.from("press_daily_entries").select("id, medium, author, title, url, raw_text, tone, topic").eq("batch_id", selected).order("position", { ascending: true }),
        supabase.from("press_daily_digests").select("id, summary_md, whatsapp_text, alerts, tone_breakdown, entries_count, generated_at").eq("batch_id", selected).maybeSingle(),
      ]);
      setEntries((e.data ?? []) as Entry[]);
      setDigest((d.data as Digest) ?? null);
    })();
  }, [selected]);

  const current = useMemo(() => batches.find(b => b.id === selected) ?? null, [batches, selected]);

  const copyWhatsapp = () => {
    if (!digest?.whatsapp_text) return;
    navigator.clipboard.writeText(digest.whatsapp_text);
    toast.success("Copiado listo para pegar en WhatsApp");
  };

  if (loading) return <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>;

  if (!batches.length) {
    return (
      <div className="glass rounded-2xl p-14 text-center space-y-2">
        <Newspaper className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Aún no hay condensado de prensa publicado</h3>
        <p className="text-sm text-muted-foreground">El equipo KiMedia publicará aquí el condensado diario de columnas y notas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-coral" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Día</span>
        </div>
        <Select value={selected ?? ""} onValueChange={setSelected}>
          <SelectTrigger className="w-[280px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {batches.map(b => (
              <SelectItem key={b.id} value={b.id}>{fmtDate(b.batch_date)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {current && <Badge variant="secondary" className="text-[10px]">{entries.length} notas</Badge>}
      </div>

      {digest ? (
        <>
          {digest.alerts?.length > 0 && (
            <div className="grid gap-2">
              {digest.alerts.map((a: any, i: number) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${ALERT_STYLES[a.level] ?? ALERT_STYLES.media}`}>
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-[10px] uppercase" variant="outline">{a.level ?? "media"}</Badge>
                      {a.title && <span className="text-sm font-semibold">{a.title}</span>}
                    </div>
                    {a.detail && <p className="text-sm">{a.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Card className="glass p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Condensado del día</div>
                <h2 className="text-lg font-display font-semibold mt-1">{current && fmtDate(current.batch_date)}</h2>
              </div>
              <Button size="sm" onClick={copyWhatsapp}><Copy className="w-4 h-4 mr-2" /> Copiar para WhatsApp</Button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{digest.summary_md}</ReactMarkdown>
            </div>
          </Card>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Notas de la bitácora ({entries.length})</div>
            <div className="grid gap-2">
              {entries.map(e => (
                <Card key={e.id} className="p-4 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {e.medium && <Badge variant="secondary" className="text-[10px]">{e.medium}</Badge>}
                    {e.author && <span className="text-xs text-muted-foreground">· {e.author}</span>}
                    {e.tone && <Badge variant="outline" className="text-[10px] ml-auto">{e.tone}</Badge>}
                  </div>
                  {e.title && <div className="font-semibold text-sm">{e.title}</div>}
                  <p className="text-sm text-muted-foreground line-clamp-3">{e.raw_text}</p>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noreferrer" className="text-xs text-coral inline-flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Ver fuente
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          El condensado para este día aún no ha sido generado.
        </div>
      )}
    </div>
  );
}