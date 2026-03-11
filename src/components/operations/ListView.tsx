import { motion } from "framer-motion";
import { ActionItem, TeamMember, CATEGORIES, STATUSES, PRIORITIES } from "@/hooks/useOperationsData";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface ListViewProps {
  items: ActionItem[];
  teamMembers: TeamMember[];
  onSelectItem: (item: ActionItem) => void;
  onUpdateItem: (id: string, updates: Partial<ActionItem>) => void;
}

type SortKey = "due_date" | "priority" | "created_at" | "responsible_name";

const priorityOrder: Record<string, number> = { alta: 0, media: 1, baja: 2 };

const ListView = ({ items, teamMembers, onSelectItem, onUpdateItem }: ListViewProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("due_date");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "priority") {
      cmp = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    } else if (sortKey === "due_date") {
      const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const db = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      cmp = da - db;
    } else if (sortKey === "created_at") {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      cmp = (a.responsible_name || "").localeCompare(b.responsible_name || "");
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKeyVal)}
      className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_100px_100px_90px] gap-2 p-3 border-b border-border/50 bg-secondary/30">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Actividad</span>
        <SortHeader label="Responsable" sortKeyVal="responsible_name" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Categoría</span>
        <SortHeader label="Entrega" sortKeyVal="due_date" />
        <SortHeader label="Prioridad" sortKeyVal="priority" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/30">
        {sorted.map((item, i) => {
          const cat = CATEGORIES.find(c => c.value === item.category);
          const isOverdue = item.due_date && isPast(new Date(item.due_date)) && item.status !== "completado";
          const isDueToday = item.due_date && isToday(new Date(item.due_date));

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSelectItem(item)}
              className="grid grid-cols-[1fr_120px_100px_100px_90px] gap-2 p-3 hover:bg-secondary/30 cursor-pointer transition-colors items-center group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={item.status === "completado"}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateItem(item.id, {
                      status: item.status === "completado" ? "pendiente" : "completado",
                      completed_at: item.status === "completado" ? null : new Date().toISOString(),
                    });
                  }}
                  className="rounded border-border accent-coral shrink-0"
                />
                <span className={`text-sm truncate ${item.status === "completado" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {item.description}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">{item.responsible_name || "—"}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{cat?.label}</span>
              <span className={`text-xs flex items-center gap-1 ${
                isOverdue ? "text-destructive font-semibold" :
                isDueToday ? "text-electric font-semibold" :
                "text-muted-foreground"
              }`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                {item.due_date ? format(new Date(item.due_date), "d MMM", { locale: es }) : "—"}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded text-center font-mono ${
                item.priority === "alta" ? "bg-destructive/20 text-destructive" :
                item.priority === "media" ? "bg-[hsl(45,100%,55%)/0.2] text-electric" :
                "bg-secondary text-muted-foreground"
              }`}>
                {item.priority}
              </span>
            </motion.div>
          );
        })}
        {sorted.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No hay actividades</div>
        )}
      </div>
    </div>
  );
};

export default ListView;
