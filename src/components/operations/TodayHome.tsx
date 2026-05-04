import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ActionItem, TeamMember } from "@/hooks/useOperationsData";
import { Deal } from "@/hooks/useDealsData";
import { ClientObjective } from "@/hooks/useObjectivesData";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, AlertTriangle, Inbox, Target, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { differenceInCalendarDays, format, isPast, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  items: ActionItem[];
  teamMembers: TeamMember[];
  deals: Deal[];
  objectives: ClientObjective[];
  firefliesPending: number;
  onSelectItem: (item: ActionItem) => void;
  onGoTo: (section: "trabajo" | "clientes" | "entradas") => void;
}

const ME_KEY = "ops_me_responsible";

const TodayHome = ({ items, teamMembers, deals, objectives, firefliesPending, onSelectItem, onGoTo }: Props) => {
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    setMe(localStorage.getItem(ME_KEY));
  }, []);

  const updateMe = (name: string | null) => {
    setMe(name);
    if (name) localStorage.setItem(ME_KEY, name);
    else localStorage.removeItem(ME_KEY);
  };

  const active = useMemo(
    () => items.filter(i => i.status !== "completado" && i.status !== "cancelado"),
    [items]
  );

  const myActive = useMemo(
    () => (me ? active.filter(i => i.responsible_name === me) : active),
    [active, me]
  );

  const overdue = useMemo(
    () => myActive.filter(i => i.due_date && isPast(parseISO(i.due_date)) && !isToday(parseISO(i.due_date))),
    [myActive]
  );
  const today = useMemo(
    () => myActive.filter(i => i.due_date && isToday(parseISO(i.due_date))),
    [myActive]
  );
  const next7 = useMemo(
    () =>
      myActive
        .filter(i => {
          if (!i.due_date) return false;
          const d = differenceInCalendarDays(parseISO(i.due_date), new Date());
          return d > 0 && d <= 7;
        })
        .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1)),
    [myActive]
  );

  const noDate = useMemo(
    () => myActive.filter(i => !i.due_date && i.priority === "alta"),
    [myActive]
  );

  const activeDeals = deals.filter(d => !["cerrado_ganado", "cerrado_perdido"].includes(d.stage));
  const dealsPipelineValue = activeDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

  const monthMilestones = useMemo(() => {
    const m = new Date().getMonth() + 1;
    return objectives.flatMap(o => o.milestones.filter(ms => ms.month === m));
  }, [objectives]);
  const monthDone = monthMilestones.filter(m => m.is_completed).length;

  const TaskRow = ({ item, urgent }: { item: ActionItem; urgent?: boolean }) => (
    <button
      onClick={() => onSelectItem(item)}
      className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-secondary/60 transition-colors text-left group"
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          item.priority === "alta" ? "bg-destructive" : item.priority === "media" ? "bg-[hsl(45,100%,55%)]" : "bg-muted-foreground/30"
        }`}
      />
      <span className="text-sm text-foreground flex-1 truncate">{item.description}</span>
      {item.client && (
        <Badge variant="outline" className="text-[10px] border-border shrink-0 hidden sm:inline-flex">
          {item.client}
        </Badge>
      )}
      {item.due_date && (
        <span className={`text-xs shrink-0 ${urgent ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
          {format(parseISO(item.due_date), "d MMM", { locale: es })}
        </span>
      )}
      {!me && item.responsible_name && (
        <span className="text-[10px] text-muted-foreground shrink-0 hidden md:inline">
          {item.responsible_name.split(" ")[0]}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Header: who am I + KPIs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Estoy operando como:</span>
          <Select value={me || "all"} onValueChange={v => updateMe(v === "all" ? null : v)}>
            <SelectTrigger className="w-[200px] h-9 bg-card border-border">
              <SelectValue placeholder="Todo el equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el equipo</SelectItem>
              {teamMembers.map(m => (
                <SelectItem key={m.id} value={m.full_name}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-xs text-muted-foreground capitalize">
          {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Vencidas
          </div>
          <div className="text-2xl font-display font-bold text-destructive">{overdue.length}</div>
        </Card>
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5 text-[hsl(45,100%,55%)]" /> Hoy
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{today.length}</div>
        </Card>
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3.5 h-3.5 text-cyan" /> Próx. 7 días
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{next7.length}</div>
        </Card>
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-magenta" /> Pipeline
          </div>
          <div className="text-lg font-display font-bold text-foreground">
            {activeDeals.length}
            <span className="text-[10px] text-muted-foreground font-normal ml-1">
              · ${(dealsPipelineValue / 1000).toFixed(0)}K
            </span>
          </div>
        </Card>
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Target className="w-3.5 h-3.5 text-lime" /> Hitos del mes
          </div>
          <div className="text-lg font-display font-bold text-foreground">
            {monthDone}
            <span className="text-[10px] text-muted-foreground font-normal">/{monthMilestones.length}</span>
          </div>
        </Card>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {overdue.length > 0 && (
            <Card className="bg-card border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-foreground">Vencidas ({overdue.length})</h3>
                </div>
              </div>
              <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto">
                {overdue.map(item => (
                  <TaskRow key={item.id} item={item} urgent />
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-card border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-coral" />
                <h3 className="text-sm font-semibold text-foreground">
                  Hoy y próximos días ({today.length + next7.length})
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onGoTo("trabajo")} className="text-xs h-7">
                Ver todas <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="p-2 space-y-0.5 max-h-96 overflow-y-auto">
              {today.length === 0 && next7.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Sin tareas con vencimiento próximo. ✨
                </p>
              )}
              {today.length > 0 && (
                <>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">
                    Hoy
                  </div>
                  {today.map(item => <TaskRow key={item.id} item={item} />)}
                </>
              )}
              {next7.length > 0 && (
                <>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">
                    Próximos 7 días
                  </div>
                  {next7.map(item => <TaskRow key={item.id} item={item} />)}
                </>
              )}
            </div>
          </Card>

          {noDate.length > 0 && (
            <Card className="bg-card border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[hsl(45,100%,55%)]" />
                <h3 className="text-sm font-semibold text-foreground">
                  Prioridad alta sin fecha ({noDate.length})
                </h3>
              </div>
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {noDate.map(item => <TaskRow key={item.id} item={item} />)}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-cyan" />
                <h3 className="text-sm font-semibold text-foreground">Bandeja Fireflies</h3>
              </div>
              {firefliesPending > 0 && (
                <Badge className="bg-coral text-primary-foreground">{firefliesPending}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {firefliesPending === 0
                ? "Sin minutas pendientes de revisar."
                : `${firefliesPending} minuta${firefliesPending > 1 ? "s" : ""} esperando revisión.`}
            </p>
            <Button variant="outline" size="sm" onClick={() => onGoTo("entradas")} className="w-full">
              Abrir bandeja <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-lime" />
              <h3 className="text-sm font-semibold text-foreground">Clientes activos</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Revisa objetivos, tareas y pipeline por cliente en un solo lugar.
            </p>
            <Button variant="outline" size="sm" onClick={() => onGoTo("clientes")} className="w-full">
              Ver clientes <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TodayHome;