import { motion } from "framer-motion";
import { ActionItem, CLIENTS } from "@/hooks/useOperationsData";
import { Deal } from "@/hooks/useDealsData";
import { CheckCircle2, Clock, AlertTriangle, DollarSign, Briefcase } from "lucide-react";
import { isPast } from "date-fns";

interface ClientViewProps {
  items: ActionItem[];
  deals: Deal[];
  onSelectItem: (item: ActionItem) => void;
  onFilterByClient: (client: string) => void;
}

const ClientView = ({ items, deals, onSelectItem, onFilterByClient }: ClientViewProps) => {
  // Get all unique clients from items + deals + CLIENTS list
  const allClients = Array.from(new Set([
    ...CLIENTS,
    ...items.map(i => i.client).filter(Boolean) as string[],
    ...deals.map(d => d.client_name),
  ])).sort();

  const getClientData = (client: string) => {
    const clientItems = items.filter(i => i.client === client);
    const clientDeals = deals.filter(d => d.client_name === client);
    const pending = clientItems.filter(i => i.status === "pendiente").length;
    const inProgress = clientItems.filter(i => i.status === "en_progreso").length;
    const completed = clientItems.filter(i => i.status === "completado").length;
    const overdue = clientItems.filter(i => i.due_date && isPast(new Date(i.due_date)) && i.status !== "completado").length;
    const activeDeals = clientDeals.filter(d => !["cerrado_ganado", "cerrado_perdido"].includes(d.stage)).length;
    const dealValue = clientDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
    return { total: clientItems.length, pending, inProgress, completed, overdue, activeDeals, dealValue, items: clientItems };
  };

  const clientData = allClients
    .map(client => ({ client, data: getClientData(client) }))
    .filter(c => c.data.total > 0 || c.data.activeDeals > 0)
    .sort((a, b) => (b.data.pending + b.data.inProgress) - (a.data.pending + a.data.inProgress));

  const getHealthColor = (data: ReturnType<typeof getClientData>) => {
    if (data.overdue > 3) return "border-l-destructive";
    if (data.overdue > 0) return "border-l-[hsl(45,100%,55%)]";
    if (data.inProgress > 0 || data.pending > 0) return "border-l-cyan";
    return "border-l-lime";
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    if (val > 0) return `$${val.toLocaleString()}`;
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {clientData.map(({ client, data }, i) => (
        <motion.div
          key={client}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onFilterByClient(client)}
          className={`glass rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-all border-l-4 ${getHealthColor(data)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-display font-bold text-foreground">{client}</h3>
            {data.activeDeals > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-magenta">
                <Briefcase className="w-3 h-3" />
                {data.activeDeals} deal{data.activeDeals > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[hsl(45,100%,55%)]" />
              <span className="text-xs text-muted-foreground">{data.pending}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan" />
              <span className="text-xs text-muted-foreground">{data.inProgress}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-lime" />
              <span className="text-xs text-muted-foreground">{data.completed}</span>
            </div>
            {data.overdue > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-destructive" />
                <span className="text-xs text-destructive font-semibold">{data.overdue}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden flex mb-2">
            {data.total > 0 && (
              <>
                <div className="bg-lime h-full" style={{ width: `${(data.completed / data.total) * 100}%` }} />
                <div className="bg-cyan h-full" style={{ width: `${(data.inProgress / data.total) * 100}%` }} />
                <div className="bg-[hsl(45,100%,55%)] h-full" style={{ width: `${(data.pending / data.total) * 100}%` }} />
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{data.total} actividades</span>
            {formatMoney(data.dealValue) && (
              <span className="text-[10px] font-mono text-electric flex items-center gap-0.5">
                <DollarSign className="w-3 h-3" />{formatMoney(data.dealValue)}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ClientView;
