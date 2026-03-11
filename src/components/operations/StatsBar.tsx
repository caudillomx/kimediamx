import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { ActionItem } from "@/hooks/useOperationsData";

interface StatsBarProps {
  items: ActionItem[];
}

const StatsBar = ({ items }: StatsBarProps) => {
  const total = items.length;
  const pending = items.filter(i => i.status === "pendiente").length;
  const inProgress = items.filter(i => i.status === "en_progreso").length;
  const completed = items.filter(i => i.status === "completado").length;
  const overdue = items.filter(i => {
    if (!i.due_date || i.status === "completado") return false;
    return new Date(i.due_date) < new Date();
  }).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Total", value: total, icon: Zap, gradient: "from-coral to-coral-light" },
    { label: "Pendientes", value: pending, icon: Clock, gradient: "from-[hsl(45,100%,55%)] to-[hsl(35,95%,55%)]" },
    { label: "En progreso", value: inProgress, icon: TrendingUp, gradient: "from-cyan to-[hsl(200,90%,50%)]" },
    { label: "Completados", value: completed, icon: CheckCircle2, gradient: "from-lime to-[hsl(100,85%,45%)]" },
    { label: "Vencidos", value: overdue, icon: AlertTriangle, gradient: "from-[hsl(0,84%,60%)] to-magenta" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass rounded-xl p-4 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-default"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</span>
            </div>
            <motion.p
              key={stat.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-3xl font-display font-bold text-foreground"
            >
              {stat.value}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsBar;
