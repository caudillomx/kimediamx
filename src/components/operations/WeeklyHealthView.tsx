import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ClientRow = { id: string; name: string };

type Semaforo = "verde" | "amarillo" | "rojo";

type StatusRow = {
  id: string;
  client_id: string;
  week_start: string;
  semaforo: Semaforo;
  proximo_hito: string | null;
  riesgo_activo: string | null;
  updated_by: string | null;
  updated_at: string;
};

type ProfileMap = Record<string, { full_name: string | null; email: string | null }>;

interface Props {
  clients: ClientRow[];
}

const SEMAFORO_META: Record<Semaforo, { label: string; dot: string; bar: string }> = {
  verde: { label: "Verde", dot: "bg-lime", bar: "border-l-lime" },
  amarillo: { label: "Amarillo", dot: "bg-yellow-400", bar: "border-l-yellow-400" },
  rojo: { label: "Rojo", dot: "bg-destructive", bar: "border-l-destructive" },
};

function currentMondayISO(): string {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

export default function WeeklyHealthView({ clients }: Props) {
  const weekStart = useMemo(currentMondayISO, []);
  const [rows, setRows] = useState<Record<string, StatusRow>>({});
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const textDrafts = useRef<Record<string, { proximo_hito: string; riesgo_activo: string }>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const clientIds = clients.map((c) => c.id);
        if (clientIds.length === 0) {
          setRows({});
          setLoading(false);
          return;
        }

        const { data: existing, error } = await supabase
          .from("client_weekly_status")
          .select("*")
          .eq("week_start", weekStart)
          .in("client_id", clientIds);
        if (error) throw error;

        const existingMap: Record<string, StatusRow> = {};
        (existing || []).forEach((r) => {
          existingMap[r.client_id] = r as StatusRow;
        });

        const missing = clients.filter((c) => !existingMap[c.id]);
        if (missing.length > 0) {
          const { data: created, error: insertErr } = await supabase
            .from("client_weekly_status")
            .insert(
              missing.map((c) => ({
                client_id: c.id,
                week_start: weekStart,
                semaforo: "verde" as const,
              })),
            )
            .select();
          if (insertErr) throw insertErr;
          (created || []).forEach((r) => {
            existingMap[r.client_id] = r as StatusRow;
          });
        }

        // Load profile names for updated_by
        const userIds = Array.from(
          new Set(Object.values(existingMap).map((r) => r.updated_by).filter(Boolean) as string[]),
        );
        if (userIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", userIds);
          const pmap: ProfileMap = {};
          (profs || []).forEach((p: any) => {
            pmap[p.id] = { full_name: p.full_name, email: p.email };
          });
          if (!cancelled) setProfiles(pmap);
        }

        if (!cancelled) {
          setRows(existingMap);
          // seed text drafts
          Object.values(existingMap).forEach((r) => {
            textDrafts.current[r.id] = {
              proximo_hito: r.proximo_hito || "",
              riesgo_activo: r.riesgo_activo || "",
            };
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("No se pudo cargar la salud semanal");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clients, weekStart]);

  const persist = async (rowId: string, patch: Partial<Pick<StatusRow, "semaforo" | "proximo_hito" | "riesgo_activo">>) => {
    setSavingId(rowId);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("client_weekly_status")
        .update({ ...patch, updated_by: uid, updated_at: nowIso })
        .eq("id", rowId)
        .select()
        .single();
      if (error) throw error;

      setRows((prev) => {
        const clientId = data!.client_id as string;
        return { ...prev, [clientId]: data as StatusRow };
      });

      if (uid && !profiles[uid]) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", uid)
          .maybeSingle();
        if (p) {
          setProfiles((prev) => ({ ...prev, [p.id]: { full_name: p.full_name, email: p.email } }));
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("No se pudo guardar el cambio");
    } finally {
      setSavingId(null);
    }
  };

  const formatUpdated = (row: StatusRow) => {
    const who = row.updated_by
      ? profiles[row.updated_by]?.full_name || profiles[row.updated_by]?.email || "Usuario"
      : "—";
    try {
      const when = format(new Date(row.updated_at), "d MMM · HH:mm", { locale: es });
      return `${who} · ${when}`;
    } catch {
      return who;
    }
  };

  const weekLabel = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(monday, "'Semana del' d 'de' MMMM yyyy", { locale: es });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cargando salud semanal…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground capitalize">{weekLabel}</p>
        <span className="text-xs text-muted-foreground">
          {clients.length} clientes activos
        </span>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/40">
          <div className="col-span-3">Cliente</div>
          <div className="col-span-2">Semáforo</div>
          <div className="col-span-3">Próximo hito</div>
          <div className="col-span-2">Riesgo activo</div>
          <div className="col-span-2 text-right">Actualizado</div>
        </div>

        <div className="divide-y divide-border">
          {clients.map((c) => {
            const row = rows[c.id];
            if (!row) return null;
            const meta = SEMAFORO_META[row.semaforo];
            return (
              <div
                key={c.id}
                className={`grid grid-cols-12 gap-3 px-4 py-3 items-center border-l-4 ${meta.bar} hover:bg-muted/30 transition-colors`}
              >
                <div className="col-span-3 font-medium text-foreground text-sm truncate">{c.name}</div>

                <div className="col-span-2">
                  <Select
                    value={row.semaforo}
                    onValueChange={(v) => persist(row.id, { semaforo: v as Semaforo })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(SEMAFORO_META) as Semaforo[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${SEMAFORO_META[s].dot}`} />
                            {SEMAFORO_META[s].label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <Input
                    defaultValue={row.proximo_hito || ""}
                    placeholder="Próximo hito…"
                    className="h-8 text-xs bg-background"
                    onChange={(e) => {
                      textDrafts.current[row.id] = {
                        ...(textDrafts.current[row.id] || { proximo_hito: "", riesgo_activo: "" }),
                        proximo_hito: e.target.value,
                      };
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if ((row.proximo_hito || "") !== val) {
                        persist(row.id, { proximo_hito: val || null });
                      }
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    defaultValue={row.riesgo_activo || ""}
                    placeholder="Opcional"
                    className="h-8 text-xs bg-background"
                    onChange={(e) => {
                      textDrafts.current[row.id] = {
                        ...(textDrafts.current[row.id] || { proximo_hito: "", riesgo_activo: "" }),
                        riesgo_activo: e.target.value,
                      };
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if ((row.riesgo_activo || "") !== val) {
                        persist(row.id, { riesgo_activo: val || null });
                      }
                    }}
                  />
                </div>

                <div className="col-span-2 text-right text-[11px] text-muted-foreground">
                  {savingId === row.id ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Guardando…
                    </span>
                  ) : (
                    formatUpdated(row)
                  )}
                </div>
              </div>
            );
          })}

          {clients.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No hay clientes activos.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}