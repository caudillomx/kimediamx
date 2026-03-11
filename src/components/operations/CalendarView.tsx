import { useState } from "react";
import { motion } from "framer-motion";
import { ActionItem, TeamMember, CATEGORIES } from "@/hooks/useOperationsData";
import { format, startOfWeek, addDays, isSameDay, isToday, isPast, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

interface CalendarViewProps {
  items: ActionItem[];
  teamMembers: TeamMember[];
  onSelectItem: (item: ActionItem) => void;
}

const CalendarView = ({ items, teamMembers, onSelectItem }: CalendarViewProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getItemsForDay = (date: Date) =>
    items.filter(item => item.due_date && isSameDay(new Date(item.due_date), date));

  const itemsWithoutDate = items.filter(i => !i.due_date && i.status !== "completado" && i.status !== "cancelado");

  const priorityBorder: Record<string, string> = {
    alta: "border-l-destructive",
    media: "border-l-[hsl(45,100%,55%)]",
    baja: "border-l-muted",
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentWeekStart(prev => subWeeks(prev, 1))}
          className="p-2 rounded-lg glass hover:bg-secondary/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="text-center">
          <h3 className="text-sm font-display font-bold text-foreground">
            Semana del {format(currentWeekStart, "d MMMM", { locale: es })}
          </h3>
          <button
            onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="text-[10px] text-coral hover:underline"
          >
            Hoy
          </button>
        </div>

        <button
          onClick={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}
          className="p-2 rounded-lg glass hover:bg-secondary/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const dayItems = getItemsForDay(day);
          const today = isToday(day);
          const past = isPast(day) && !today;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass rounded-xl min-h-[180px] flex flex-col ${
                today ? "ring-2 ring-coral/50" : ""
              } ${past ? "opacity-60" : ""}`}
            >
              {/* Day header */}
              <div className={`p-2 text-center border-b border-border/30 ${today ? "bg-coral/10" : ""}`}>
                <p className="text-[10px] uppercase text-muted-foreground">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p className={`text-lg font-display font-bold ${today ? "text-coral" : "text-foreground"}`}>
                  {format(day, "d")}
                </p>
              </div>

              {/* Items */}
              <div className="p-1.5 flex-1 space-y-1 overflow-y-auto">
                {dayItems.length === 0 && (
                  <p className="text-[9px] text-muted-foreground/30 text-center pt-4">—</p>
                )}
                {dayItems.map(item => {
                  const isOverdue = isPast(new Date(item.due_date!)) && item.status !== "completado";
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className={`w-full text-left p-1.5 rounded-md border-l-2 ${priorityBorder[item.priority] || ""} ${
                        item.status === "completado"
                          ? "bg-lime/5 line-through opacity-50"
                          : isOverdue
                          ? "bg-destructive/5"
                          : "bg-secondary/30 hover:bg-secondary/60"
                      } transition-colors`}
                    >
                      <p className="text-[10px] text-foreground leading-tight line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[8px] text-muted-foreground truncate max-w-[60px]">
                          {item.responsible_name?.split(" ")[0] || ""}
                        </span>
                        {item.client && (
                          <span className="text-[8px] text-coral truncate max-w-[50px]">{item.client}</span>
                        )}
                      </div>
                      {isOverdue && <AlertCircle className="w-2.5 h-2.5 text-destructive mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Items without date */}
      {itemsWithoutDate.length > 0 && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2 font-semibold">
            Sin fecha asignada ({itemsWithoutDate.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
            {itemsWithoutDate.slice(0, 15).map(item => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="text-left flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  item.priority === "alta" ? "bg-destructive" :
                  item.priority === "media" ? "bg-[hsl(45,100%,55%)]" :
                  "bg-muted-foreground"
                }`} />
                <span className="text-[11px] text-foreground truncate">{item.description}</span>
                {item.client && (
                  <span className="text-[9px] text-muted-foreground shrink-0">{item.client}</span>
                )}
              </button>
            ))}
            {itemsWithoutDate.length > 15 && (
              <p className="text-[10px] text-muted-foreground text-center col-span-full pt-1">
                +{itemsWithoutDate.length - 15} más sin fecha
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
