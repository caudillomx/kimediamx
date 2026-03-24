import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ClientObjective, WeeklyMilestone } from "@/hooks/useObjectivesData";
import { ActionItem } from "@/hooks/useOperationsData";
import { Check, ChevronDown, ChevronRight, Target, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ObjectivesViewProps {
  objectives: ClientObjective[];
  actionItems: ActionItem[];
  onToggleMilestone: (id: string, completed: boolean) => void;
  onSelectItem?: (item: ActionItem) => void;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const getCurrentWeek = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const week = Math.min(4, Math.ceil(day / 7));
  return { month, week };
};

const ObjectivesView = ({ objectives, actionItems, onToggleMilestone, onSelectItem }: ObjectivesViewProps) => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<"week" | "month" | "all">("month");
  const [hideEmpty, setHideEmpty] = useState(true);

  const current = getCurrentWeek();

  const filterMilestones = (milestones: WeeklyMilestone[]) => {
    if (viewScope === "all") return milestones;
    if (viewScope === "month") return milestones.filter(m => m.month === current.month);
    return milestones.filter(m => m.month === current.month && m.week_number === current.week);
  };

  const getClientPendingItems = (clientName: string) =>
    actionItems.filter(i => i.client === clientName && i.status !== "completado" && i.status !== "cancelado");

  const clientGroups = useMemo(() => {
    const groups = new Map<string, { priority: number; objectives: ClientObjective[]; pendingItems: ActionItem[] }>();

    // Group objectives by client
    objectives.forEach(obj => {
      if (filterClient && obj.client_name !== filterClient) return;
      const existing = groups.get(obj.client_name);
      if (existing) {
        existing.objectives.push(obj);
      } else {
        groups.set(obj.client_name, {
          priority: obj.priority,
          objectives: [obj],
          pendingItems: getClientPendingItems(obj.client_name),
        });
      }
    });

    // Also include clients that have action items but no objectives
    actionItems.forEach(item => {
      if (!item.client || (filterClient && item.client !== filterClient)) return;
      if (!groups.has(item.client) && item.status !== "completado" && item.status !== "cancelado") {
        groups.set(item.client, {
          priority: 0,
          objectives: [],
          pendingItems: getClientPendingItems(item.client),
        });
      }
    });

    let entries = Array.from(groups.entries());

    // If hideEmpty, filter out clients with nothing actionable in scope
    if (hideEmpty) {
      entries = entries.filter(([, { objectives: objs, pendingItems }]) => {
        const hasMilestones = objs.some(o => filterMilestones(o.milestones).some(m => !m.is_completed));
        return hasMilestones || pendingItems.length > 0;
      });
    }

    return entries.sort((a, b) => b[1].priority - a[1].priority);
  }, [objectives, actionItems, filterClient, viewScope, hideEmpty, current.month, current.week]);

  const clientNames = useMemo(() =>
    [...new Set([...objectives.map(o => o.client_name), ...actionItems.map(i => i.client).filter(Boolean) as string[]])].sort(),
    [objectives, actionItems]
  );

  const toggleClient = (name: string) => {
    setExpandedClients(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const expandAll = () => setExpandedClients(new Set(clientGroups.map(([name]) => name)));
  const collapseAll = () => setExpandedClients(new Set());

  const priorityColor = (p: number) => {
    if (p >= 5) return "bg-destructive/10 text-destructive border-destructive/30";
    if (p >= 4) return "bg-[hsl(25,100%,50%)]/10 text-[hsl(25,100%,50%)] border-[hsl(25,100%,50%)]/30";
    if (p >= 3) return "bg-[hsl(45,100%,55%)]/10 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const statusIcon = (status: string) => {
    if (status === "completado") return <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(142,71%,45%)]" />;
    if (status === "en_progreso") return <Circle className="w-3.5 h-3.5 text-cyan" />;
    return <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />;
  };

  // Summary stats
  const totalPendingMilestones = clientGroups.reduce((sum, [, { objectives: objs }]) => {
    return sum + objs.flatMap(o => filterMilestones(o.milestones)).filter(m => !m.is_completed).length;
  }, 0);
  const totalPendingItems = clientGroups.reduce((sum, [, { pendingItems }]) => sum + pendingItems.length, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-foreground font-semibold">
          {clientGroups.length} cliente{clientGroups.length !== 1 ? "s" : ""}
        </span>
        <span className="text-muted-foreground">
          {totalPendingMilestones} hito{totalPendingMilestones !== 1 ? "s" : ""} pendiente{totalPendingMilestones !== 1 ? "s" : ""}
        </span>
        <span className="text-muted-foreground">
          {totalPendingItems} tarea{totalPendingItems !== 1 ? "s" : ""} activa{totalPendingItems !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {MONTH_NAMES[current.month - 1]} · Semana {current.week}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterClient || "all"} onValueChange={v => setFilterClient(v === "all" ? null : v)}>
          <SelectTrigger className="w-[200px] bg-secondary border-border">
            <SelectValue placeholder="Todos los clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {clientNames.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center bg-secondary rounded-lg p-1 gap-0.5">
          {(["week", "month", "all"] as const).map(scope => (
            <button
              key={scope}
              onClick={() => setViewScope(scope)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewScope === scope ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {scope === "week" ? "Esta semana" : scope === "month" ? "Este mes" : "Todo el año"}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideEmpty}
            onChange={e => setHideEmpty(e.target.checked)}
            className="rounded border-border"
          />
          Ocultar sin pendientes
        </label>

        <div className="flex items-center gap-1 ml-auto">
          <button onClick={expandAll} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1">
            Expandir todo
          </button>
          <button onClick={collapseAll} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1">
            Colapsar
          </button>
        </div>
      </div>

      {/* Client groups */}
      <div className="space-y-3">
        {clientGroups.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            No hay actividad pendiente para {viewScope === "week" ? "esta semana" : viewScope === "month" ? "este mes" : "el año"}.
          </p>
        )}

        {clientGroups.map(([clientName, { priority, objectives: clientObjs, pendingItems }], idx) => {
          const isExpanded = expandedClients.has(clientName);
          const scopedMilestones = clientObjs.flatMap(o => filterMilestones(o.milestones));
          const pendingMilestones = scopedMilestones.filter(m => !m.is_completed).length;
          const completedMilestones = scopedMilestones.filter(m => m.is_completed).length;
          const totalScoped = scopedMilestones.length;

          return (
            <motion.div
              key={clientName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="glass rounded-xl overflow-hidden"
            >
              {/* Client header */}
              <button
                onClick={() => toggleClient(clientName)}
                className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}

                <span className="font-display font-bold text-foreground">{clientName}</span>

                {priority > 0 && (
                  <Badge variant="outline" className={`text-[10px] ${priorityColor(priority)}`}>
                    P{priority}
                  </Badge>
                )}

                {/* Compact summary */}
                <div className="flex items-center gap-3 ml-auto text-[11px]">
                  {pendingMilestones > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-3 h-3" />
                      {pendingMilestones} hito{pendingMilestones !== 1 ? "s" : ""}
                    </span>
                  )}
                  {pendingItems.length > 0 && (
                    <span className="flex items-center gap-1 text-coral">
                      <AlertCircle className="w-3 h-3" />
                      {pendingItems.length} tarea{pendingItems.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {totalScoped > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[hsl(142,71%,45%)] rounded-full transition-all"
                          style={{ width: `${(completedMilestones / totalScoped) * 100}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{completedMilestones}/{totalScoped}</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Expanded: unified view */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Action items section */}
                  {pendingItems.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Tareas pendientes
                      </p>
                      {pendingItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => onSelectItem?.(item)}
                          className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/40 transition-colors text-left"
                        >
                          {statusIcon(item.status)}
                          <span className="text-xs text-foreground flex-1 truncate">{item.description}</span>
                          {item.due_date && (
                            <span className="text-[9px] text-muted-foreground shrink-0">
                              {new Date(item.due_date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                            </span>
                          )}
                          <span className="text-[9px] text-muted-foreground shrink-0">
                            {item.responsible_name?.split(" ")[0]}
                          </span>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.priority === "alta" ? "bg-destructive" :
                            item.priority === "media" ? "bg-[hsl(45,100%,55%)]" : "bg-muted-foreground/30"
                          }`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Objectives / milestones section */}
                  {clientObjs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <Target className="w-3 h-3" />
                        Objetivos estratégicos
                      </p>
                      {clientObjs.map(obj => {
                        const filtered = filterMilestones(obj.milestones);
                        const pendingInObj = filtered.filter(m => !m.is_completed);
                        // In hideEmpty mode, skip objectives with all milestones completed or none
                        if (hideEmpty && pendingInObj.length === 0 && filtered.length > 0) return null;

                        return (
                          <div key={obj.id} className="bg-secondary/20 rounded-lg p-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <Target className="w-3.5 h-3.5 text-coral mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{obj.objective_text}</p>
                                {obj.main_activities && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{obj.main_activities}</p>
                                )}
                                {obj.business_unit && (
                                  <Badge variant="outline" className="text-[9px] mt-1 border-border">
                                    {obj.business_unit}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {filtered.length > 0 && (
                              <div className="space-y-1 pl-5">
                                {filtered.map(m => (
                                  <label
                                    key={m.id}
                                    className="flex items-center gap-2 group cursor-pointer py-1 px-2 rounded-md hover:bg-secondary/40 transition-colors"
                                  >
                                    <button
                                      onClick={() => onToggleMilestone(m.id, !m.is_completed)}
                                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                        m.is_completed
                                          ? "bg-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)] text-white"
                                          : "border-muted-foreground/30 hover:border-coral"
                                      }`}
                                    >
                                      {m.is_completed && <Check className="w-3 h-3" />}
                                    </button>
                                    <span className={`text-xs flex-1 ${m.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                      {m.activity_text}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground shrink-0">
                                      {MONTH_NAMES[m.month - 1]} S{m.week_number}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {filtered.length === 0 && !hideEmpty && (
                              <p className="text-[10px] text-muted-foreground/50 pl-5 italic">
                                Sin actividades para {viewScope === "week" ? "esta semana" : viewScope === "month" ? "este mes" : "el año"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ObjectivesView;
