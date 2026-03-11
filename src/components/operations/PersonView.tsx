import { motion } from "framer-motion";
import { ActionItem, TeamMember, STATUSES } from "@/hooks/useOperationsData";
import { User, CheckCircle2, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { isPast } from "date-fns";

interface PersonViewProps {
  items: ActionItem[];
  teamMembers: TeamMember[];
  onSelectItem: (item: ActionItem) => void;
}

const PersonView = ({ items, teamMembers, onSelectItem }: PersonViewProps) => {
  const activeMembers = teamMembers.filter(m => m.is_active);

  const getMemberStats = (member: TeamMember) => {
    const memberItems = items.filter(i => i.responsible_id === member.id || i.responsible_name === member.full_name);
    const pending = memberItems.filter(i => i.status === "pendiente").length;
    const inProgress = memberItems.filter(i => i.status === "en_progreso").length;
    const completed = memberItems.filter(i => i.status === "completado").length;
    const overdue = memberItems.filter(i => i.due_date && isPast(new Date(i.due_date)) && i.status !== "completado").length;
    return { total: memberItems.length, pending, inProgress, completed, overdue, items: memberItems };
  };

  const sortedMembers = [...activeMembers]
    .map(m => ({ member: m, stats: getMemberStats(m) }))
    .sort((a, b) => b.stats.total - a.stats.total);

  const getLoadColor = (pending: number, overdue: number) => {
    if (overdue > 3) return "text-destructive";
    if (pending > 15) return "text-destructive";
    if (pending > 8) return "text-electric";
    return "text-lime";
  };

  const getLoadLabel = (pending: number, overdue: number) => {
    if (overdue > 3 || pending > 15) return "Sobrecargado";
    if (pending > 8) return "Carga alta";
    if (pending > 3) return "Normal";
    return "Baja carga";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sortedMembers.map(({ member, stats }, i) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="glass rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-${member.avatar_color || "coral"}/20 flex items-center justify-center`}>
                  <span className="text-sm font-bold text-foreground">
                    {member.full_name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{member.full_name}</p>
                  <p className="text-[10px] text-muted-foreground">{member.role_title}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${getLoadColor(stats.pending, stats.overdue)} bg-secondary`}>
                {getLoadLabel(stats.pending, stats.overdue)}
              </span>
            </div>

            {/* Mini stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[hsl(45,100%,55%)]" />
                <span className="text-xs text-muted-foreground">{stats.pending} pend.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-cyan" />
                <span className="text-xs text-muted-foreground">{stats.inProgress} prog.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-lime" />
                <span className="text-xs text-muted-foreground">{stats.completed}</span>
              </div>
              {stats.overdue > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                  <span className="text-xs text-destructive font-semibold">{stats.overdue} venc.</span>
                </div>
              )}
            </div>

            {/* Load bar */}
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden flex">
              {stats.total > 0 && (
                <>
                  <div className="bg-lime h-full" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
                  <div className="bg-cyan h-full" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }} />
                  <div className="bg-[hsl(45,100%,55%)] h-full" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />
                </>
              )}
            </div>
          </div>

          {/* Recent pending items */}
          <div className="p-3 max-h-[200px] overflow-y-auto space-y-1">
            {stats.items
              .filter(i => i.status !== "completado" && i.status !== "cancelado")
              .slice(0, 6)
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.priority === "alta" ? "bg-destructive" :
                    item.priority === "media" ? "bg-[hsl(45,100%,55%)]" :
                    "bg-muted-foreground"
                  }`} />
                  <span className="text-xs text-foreground truncate flex-1">{item.description}</span>
                  {item.client && (
                    <span className="text-[9px] text-muted-foreground shrink-0">{item.client}</span>
                  )}
                </button>
              ))}
            {stats.items.filter(i => i.status !== "completado" && i.status !== "cancelado").length > 6 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                +{stats.items.filter(i => i.status !== "completado" && i.status !== "cancelado").length - 6} más
              </p>
            )}
            {stats.total === 0 && (
              <p className="text-xs text-muted-foreground/50 text-center py-4">Sin actividades asignadas</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PersonView;
