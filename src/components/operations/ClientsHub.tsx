import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ActionItem } from "@/hooks/useOperationsData";
import { Deal } from "@/hooks/useDealsData";
import { ClientObjective } from "@/hooks/useObjectivesData";
import { Interaction } from "@/hooks/useInteractionsData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Target, CheckSquare, TrendingUp, MessageSquare, AlertTriangle } from "lucide-react";
import { isPast, parseISO } from "date-fns";

interface Props {
  items: ActionItem[];
  deals: Deal[];
  objectives: ClientObjective[];
  interactions: Interaction[];
  onOpenClient: (name: string) => void;
}

type ClientRow = { id: string; name: string; is_active: boolean };

const ClientsHub = ({ items, deals, objectives, interactions, onOpenClient }: Props) => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("clients")
      .select("id, name, is_active")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setClients((data as ClientRow[]) || []));
  }, []);

  const stats = useMemo(() => {
    const map = new Map<string, {
      activeTasks: number; overdue: number; activeDeals: number; dealValue: number;
      milestones: number; doneMilestones: number; interactions: number;
    }>();
    clients.forEach(c => map.set(c.name, {
      activeTasks: 0, overdue: 0, activeDeals: 0, dealValue: 0,
      milestones: 0, doneMilestones: 0, interactions: 0,
    }));

    items.forEach(i => {
      if (!i.client) return;
      const s = map.get(i.client);
      if (!s) return;
      if (!["completado", "cancelado"].includes(i.status)) s.activeTasks++;
      if (i.due_date && isPast(parseISO(i.due_date)) && i.status !== "completado") s.overdue++;
    });

    deals.forEach(d => {
      const s = map.get(d.client_name);
      if (!s) return;
      if (!["cerrado_ganado", "cerrado_perdido"].includes(d.stage)) {
        s.activeDeals++;
        s.dealValue += d.estimated_value || 0;
      }
    });

    objectives.forEach(o => {
      const s = map.get(o.client_name);
      if (!s) return;
      s.milestones += o.milestones.length;
      s.doneMilestones += o.milestones.filter(m => m.is_completed).length;
    });

    interactions.forEach(i => {
      const s = map.get(i.client_name);
      if (!s) return;
      s.interactions++;
    });

    return map;
  }, [clients, items, deals, objectives, interactions]);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-10 bg-card border-border"
          />
        </div>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} clientes activos</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c, idx) => {
          const s = stats.get(c.name)!;
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onOpenClient(c.name)}
              className="text-left"
            >
              <Card className={`p-4 bg-card border-border hover:border-coral/50 hover:shadow-md transition-all border-l-4 ${
                s.overdue > 0 ? "border-l-destructive" : s.activeTasks > 0 ? "border-l-cyan" : "border-l-lime"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-foreground">{c.name}</h3>
                  {s.overdue > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-0.5" />{s.overdue}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckSquare className="w-3 h-3" /> {s.activeTasks} tareas
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="w-3 h-3" /> {s.doneMilestones}/{s.milestones} hitos
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="w-3 h-3" /> {s.activeDeals} deals
                    {s.dealValue > 0 && <span className="text-electric font-mono">${(s.dealValue / 1000).toFixed(0)}K</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="w-3 h-3" /> {s.interactions}
                  </div>
                </div>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ClientsHub;