import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ClientObjective, WeeklyMilestone } from "@/hooks/useObjectivesData";
import { ActionItem } from "@/hooks/useOperationsData";
import { Check, ChevronDown, ChevronRight, Target, CalendarDays, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ObjectivesViewProps {
  objectives: ClientObjective[];
  actionItems: ActionItem[];
  onToggleMilestone: (id: string, completed: boolean) => void;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const getCurrentWeek = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const week = Math.min(4, Math.ceil(day / 7));
  return { month, week };
};

const ObjectivesView = ({ objectives, actionItems, onToggleMilestone }: ObjectivesViewProps) => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<"week" | "month" | "all">("week");

  const current = getCurrentWeek();

  const clientGroups = useMemo(() => {
    const groups = new Map<string, { priority: number; objectives: ClientObjective[] }>();
    objectives.forEach(obj => {
      if (filterClient && obj.client_name !== filterClient) return;
      const existing = groups.get(obj.client_name);
      if (existing) {
        existing.objectives.push(obj);
      } else {
        groups.set(obj.client_name, { priority: obj.priority, objectives: [obj] });
      }
    });
    return Array.from(groups.entries()).sort((a, b) => b[1].priority - a[1].priority);
  }, [objectives, filterClient]);

  const clientNames = useMemo(() => 
    [...new Set(objectives.map(o => o.client_name))].sort(),
    [objectives]
  );

  const toggleClient = (name: string) => {
    setExpandedClients(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const filterMilestones = (milestones: WeeklyMilestone[]) => {
    if (viewScope === "all") return milestones;
    if (viewScope === "month") return milestones.filter(m => m.month === current.month);
    return milestones.filter(m => m.month === current.month && m.week_number === current.week);
  };

  const getClientPendingItems = (clientName: string) =>
    actionItems.filter(i => i.client === clientName && i.status !== "completado" && i.status !== "cancelado");

  const priorityColor = (p: number) => {
    if (p >= 5) return "bg-destructive/10 text-destructive border-destructive/30";
    if (p >= 4) return "bg-[hsl(25,100%,50%)]/10 text-[hsl(25,100%,50%)] border-[hsl(25,100%,50%)]/30";
    if (p >= 3) return "bg-[hsl(45,100%,55%)]/10 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-4">
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

        <span className="text-xs text-muted-foreground ml-auto">
          {MONTH_NAMES[current.month - 1]} · Semana {current.week}
        </span>
      </div>

      {/* Client groups */}
      <div className="space-y-3">
        {clientGroups.map(([clientName, { priority, objectives: clientObjs }], idx) => {
          const isExpanded = expandedClients.has(clientName);
          const pendingItems = getClientPendingItems(clientName);
          const allMilestones = clientObjs.flatMap(o => filterMilestones(o.milestones));
          const completedCount = allMilestones.filter(m => m.is_completed).length;
          const totalCount = allMilestones.length;

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
                
                <Badge variant="outline" className={`text-[10px] ${priorityColor(priority)}`}>
                  P{priority}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  {clientObjs.length} objetivo{clientObjs.length !== 1 ? "s" : ""}
                </span>

                {totalCount > 0 && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(142,71%,45%)] rounded-full transition-all"
                        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{completedCount}/{totalCount}</span>
                  </div>
                )}

                {pendingItems.length > 0 && (
                  <Badge variant="outline" className="text-[10px] border-coral/30 text-coral ml-2">
                    {pendingItems.length} pendientes
                  </Badge>
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {clientObjs.map(obj => {
                    const filtered = filterMilestones(obj.milestones);
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

                        {filtered.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/50 pl-5 italic">
                            Sin actividades para {viewScope === "week" ? "esta semana" : viewScope === "month" ? "este mes" : "el año"}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Pending action items */}
                  {pendingItems.length > 0 && (
                    <div className="border-t border-border/30 pt-2">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3 h-3" />
                        Pendientes activos
                      </p>
                      {pendingItems.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center gap-2 py-1 px-2">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.priority === "alta" ? "bg-destructive" :
                            item.priority === "media" ? "bg-[hsl(45,100%,55%)]" : "bg-muted-foreground"
                          }`} />
                          <span className="text-[11px] text-foreground truncate">{item.description}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">{item.responsible_name?.split(" ")[0]}</span>
                        </div>
                      ))}
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
