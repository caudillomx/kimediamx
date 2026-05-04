import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionItem, TeamMember } from "@/hooks/useOperationsData";
import { Deal, DEAL_STAGES } from "@/hooks/useDealsData";
import { Interaction } from "@/hooks/useInteractionsData";
import { ClientObjective } from "@/hooks/useObjectivesData";
import { Target, CheckSquare, TrendingUp, MessageSquare, Plus, Check, Circle, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  clientName: string | null;
  open: boolean;
  onClose: () => void;
  items: ActionItem[];
  deals: Deal[];
  interactions: Interaction[];
  objectives: ClientObjective[];
  teamMembers: TeamMember[];
  onSelectItem: (item: ActionItem) => void;
  onNewItem: (clientName: string) => void;
  onSelectDeal: (deal: Deal) => void;
  onNewDeal: (clientName: string) => void;
  onSelectInteraction: (i: Interaction) => void;
  onNewInteraction: (clientName: string) => void;
  onToggleMilestone: (id: string, completed: boolean) => void;
}

const ClientDetail = ({
  clientName, open, onClose, items, deals, interactions, objectives,
  onSelectItem, onNewItem, onSelectDeal, onNewDeal, onSelectInteraction, onNewInteraction, onToggleMilestone,
}: Props) => {
  const clientItems = useMemo(
    () => items.filter(i => i.client === clientName),
    [items, clientName]
  );
  const clientDeals = useMemo(
    () => deals.filter(d => d.client_name === clientName),
    [deals, clientName]
  );
  const clientInteractions = useMemo(
    () => interactions.filter(i => i.client_name === clientName),
    [interactions, clientName]
  );
  const clientObjs = useMemo(
    () => objectives.filter(o => o.client_name === clientName),
    [objectives, clientName]
  );

  const activeItems = clientItems.filter(i => !["completado", "cancelado"].includes(i.status));
  const activeDeals = clientDeals.filter(d => !["cerrado_ganado", "cerrado_perdido"].includes(d.stage));
  const totalValue = clientDeals.reduce((s, d) => s + (d.estimated_value || 0), 0);
  const totalMilestones = clientObjs.flatMap(o => o.milestones);
  const doneMilestones = totalMilestones.filter(m => m.is_completed).length;

  if (!clientName) return null;

  const statusIcon = (status: string) => {
    if (status === "completado") return <CheckCircle2 className="w-3.5 h-3.5 text-lime" />;
    if (status === "en_progreso") return <Circle className="w-3.5 h-3.5 text-cyan fill-cyan/30" />;
    if (status === "bloqueado") return <Circle className="w-3.5 h-3.5 text-destructive" />;
    return <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">{clientName}</DialogTitle>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{activeItems.length} tareas activas</span>
            <span>·</span>
            <span>{activeDeals.length} deals · ${(totalValue / 1000).toFixed(0)}K</span>
            <span>·</span>
            <span>{doneMilestones}/{totalMilestones.length} hitos</span>
            <span>·</span>
            <span>{clientInteractions.length} interacciones</span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="resumen" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="resumen"><Target className="w-3.5 h-3.5 mr-1.5" />Objetivos</TabsTrigger>
            <TabsTrigger value="tareas"><CheckSquare className="w-3.5 h-3.5 mr-1.5" />Tareas</TabsTrigger>
            <TabsTrigger value="pipeline"><TrendingUp className="w-3.5 h-3.5 mr-1.5" />Pipeline</TabsTrigger>
            <TabsTrigger value="interacciones"><MessageSquare className="w-3.5 h-3.5 mr-1.5" />Interacciones</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pt-4">
            <TabsContent value="resumen" className="space-y-3 mt-0">
              {clientObjs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sin objetivos definidos para {clientName}.
                </p>
              )}
              {clientObjs.map(obj => (
                <div key={obj.id} className="bg-secondary/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-coral mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{obj.objective_text}</p>
                      {obj.business_unit && (
                        <Badge variant="outline" className="text-[9px] mt-1">{obj.business_unit}</Badge>
                      )}
                    </div>
                    <Badge className="text-[10px]">P{obj.priority}</Badge>
                  </div>
                  {obj.milestones.length > 0 && (
                    <div className="space-y-1 pl-6">
                      {obj.milestones.map(m => (
                        <label key={m.id} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-secondary/50">
                          <button
                            onClick={() => onToggleMilestone(m.id, !m.is_completed)}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              m.is_completed ? "bg-lime border-lime text-white" : "border-muted-foreground/40"
                            }`}
                          >
                            {m.is_completed && <Check className="w-3 h-3" />}
                          </button>
                          <span className={`text-xs flex-1 ${m.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {m.activity_text}
                          </span>
                          <span className="text-[9px] text-muted-foreground">M{m.month} S{m.week_number}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="tareas" className="space-y-1 mt-0">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">{clientItems.length} tareas en total</p>
                <Button size="sm" onClick={() => onNewItem(clientName)} className="bg-gradient-coral text-primary-foreground h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Nueva tarea
                </Button>
              </div>
              {clientItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin tareas registradas.</p>
              )}
              {clientItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-secondary/60 text-left"
                >
                  {statusIcon(item.status)}
                  <span className={`text-sm flex-1 truncate ${item.status === "completado" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.description}
                  </span>
                  {item.due_date && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {format(parseISO(item.due_date), "d MMM", { locale: es })}
                    </span>
                  )}
                  {item.responsible_name && (
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.responsible_name.split(" ")[0]}</span>
                  )}
                </button>
              ))}
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-2 mt-0">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  {clientDeals.length} oportunidades · ${totalValue.toLocaleString()} total
                </p>
                <Button size="sm" onClick={() => onNewDeal(clientName)} className="bg-gradient-coral text-primary-foreground h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Nueva oportunidad
                </Button>
              </div>
              {clientDeals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin oportunidades comerciales.</p>
              )}
              {clientDeals.map(deal => {
                const stage = DEAL_STAGES.find(s => s.value === deal.stage);
                return (
                  <button
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-secondary/60 text-left"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{deal.name}</p>
                      <p className="text-[10px] text-muted-foreground">{stage?.label}</p>
                    </div>
                    {deal.estimated_value && (
                      <span className="text-sm font-mono text-electric">${(deal.estimated_value / 1000).toFixed(0)}K</span>
                    )}
                  </button>
                );
              })}
            </TabsContent>

            <TabsContent value="interacciones" className="space-y-2 mt-0">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">{clientInteractions.length} interacciones</p>
                <Button size="sm" onClick={() => onNewInteraction(clientName)} className="bg-gradient-coral text-primary-foreground h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Nueva interacción
                </Button>
              </div>
              {clientInteractions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin interacciones registradas.</p>
              )}
              {clientInteractions.map(i => (
                <button
                  key={i.id}
                  onClick={() => onSelectInteraction(i)}
                  className="w-full flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-secondary/60 text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{i.subject}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {i.contact_name} · {i.interaction_type} · {format(parseISO(i.created_at), "d MMM", { locale: es })}
                    </p>
                  </div>
                </button>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetail;