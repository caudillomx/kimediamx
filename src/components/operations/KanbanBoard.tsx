import { motion, AnimatePresence } from "framer-motion";
import { ActionItem, TeamMember, STATUSES, CATEGORIES, PRIORITIES } from "@/hooks/useOperationsData";
import { Clock, User, Tag, AlertCircle, GripVertical, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface KanbanBoardProps {
  items: ActionItem[];
  teamMembers: TeamMember[];
  onUpdateItem: (id: string, updates: Partial<ActionItem>) => void;
  onSelectItem: (item: ActionItem) => void;
}

const statusColors: Record<string, string> = {
  pendiente: "border-l-[hsl(45,100%,55%)]",
  en_progreso: "border-l-cyan",
  revision: "border-l-magenta",
  completado: "border-l-lime",
  cancelado: "border-l-muted-foreground",
};

const statusBgGlow: Record<string, string> = {
  pendiente: "from-[hsl(45,100%,55%)] to-transparent",
  en_progreso: "from-cyan to-transparent",
  revision: "from-magenta to-transparent",
  completado: "from-lime to-transparent",
  cancelado: "from-muted to-transparent",
};

const KanbanBoard = ({ items, teamMembers, onUpdateItem, onSelectItem }: KanbanBoardProps) => {
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());

  const activeStatuses = STATUSES.filter(s => s.value !== "cancelado");

  const toggleColumn = (status: string) => {
    setCollapsedColumns(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    onUpdateItem(itemId, {
      status: newStatus,
      ...(newStatus === "completado" ? { completed_at: new Date().toISOString() } : { completed_at: null }),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[500px]">
      {activeStatuses.map((status) => {
        const columnItems = items.filter(i => i.status === status.value);
        const isCollapsed = collapsedColumns.has(status.value);

        return (
          <div key={status.value} className="flex flex-col">
            {/* Column header */}
            <button
              onClick={() => toggleColumn(status.value)}
              className="flex items-center justify-between p-3 rounded-t-xl glass mb-2 group"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${statusBgGlow[status.value]}`} />
                <span className="font-display font-semibold text-sm text-foreground">{status.label}</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                  {columnItems.length}
                </span>
              </div>
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            </button>

            {/* Column cards */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-2 overflow-hidden flex-1"
                >
                  {columnItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-border/50 p-8 min-h-[120px]">
                      <p className="text-xs text-muted-foreground/50">Sin elementos</p>
                    </div>
                  ) : (
                    columnItems.map((item, idx) => (
                      <KanbanCard
                        key={item.id}
                        item={item}
                        index={idx}
                        teamMembers={teamMembers}
                        onSelect={() => onSelectItem(item)}
                        onStatusChange={handleStatusChange}
                        nextStatus={activeStatuses[activeStatuses.indexOf(status) + 1]?.value}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

function KanbanCard({
  item,
  index,
  teamMembers,
  onSelect,
  onStatusChange,
  nextStatus,
}: {
  item: ActionItem;
  index: number;
  teamMembers: TeamMember[];
  onSelect: () => void;
  onStatusChange: (id: string, status: string) => void;
  nextStatus?: string;
}) {
  const cat = CATEGORIES.find(c => c.value === item.category);
  const pri = PRIORITIES.find(p => p.value === item.priority);
  const isOverdue = item.due_date && isPast(new Date(item.due_date)) && item.status !== "completado";
  const isDueToday = item.due_date && isToday(new Date(item.due_date));

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onSelect}
      className={`group glass rounded-xl p-3 cursor-pointer border-l-4 ${statusColors[item.status]} hover:scale-[1.01] transition-all relative overflow-hidden`}
    >
      {item.priority === "alta" && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[hsl(0,84%,60%)/0.15] to-transparent rounded-bl-full" />
      )}

      <div className="relative z-10 space-y-2">
        {/* Client + Category + Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Quick complete toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const isCompleted = item.status === "completado";
                onStatusChange(item.id, isCompleted ? "pendiente" : "completado");
              }}
              className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
              title={item.status === "completado" ? "Marcar como pendiente" : "Marcar como completada"}
            >
              {item.status === "completado" ? (
                <CheckCircle2 className="w-4 h-4 text-lime" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
            {item.client && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-coral/10 text-coral font-medium truncate max-w-[80px]">
                {item.client}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {cat?.label || item.category}
            </span>
          </div>
          {pri && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              item.priority === "alta" ? "bg-destructive/20 text-destructive" :
              item.priority === "media" ? "bg-[hsl(45,100%,55%)/0.2] text-electric" :
              "bg-secondary text-muted-foreground"
            }`}>
              {pri.label}
            </span>
          )}
        </div>

        {/* Description */}
        <p className={`text-sm font-medium leading-snug line-clamp-3 ${item.status === "completado" ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {item.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground truncate max-w-[100px]">
              {item.responsible_name || "Sin asignar"}
            </span>
          </div>

          {item.due_date && (
            <div className={`flex items-center gap-1 text-[11px] ${
              isOverdue ? "text-destructive font-semibold" :
              isDueToday ? "text-electric font-semibold" :
              "text-muted-foreground"
            }`}>
              {isOverdue && <AlertCircle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {format(new Date(item.due_date), "d MMM", { locale: es })}
            </div>
          )}
        </div>

        {/* Quick advance button */}
        {nextStatus && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, nextStatus); }}
            className="w-full mt-1 text-[10px] py-1 rounded-md bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            Avanzar →
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default KanbanBoard;
