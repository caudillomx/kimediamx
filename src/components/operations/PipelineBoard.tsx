import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Deal, DEAL_STAGES } from "@/hooks/useDealsData";
import { TeamMember } from "@/hooks/useOperationsData";
import { DollarSign, User, Calendar, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PipelineBoardProps {
  deals: Deal[];
  teamMembers: TeamMember[];
  onSelectDeal: (deal: Deal) => void;
  onUpdateDeal: (id: string, updates: Partial<Deal>) => void;
  onNewDeal: () => void;
}

const PipelineBoard = ({ deals, teamMembers, onSelectDeal, onUpdateDeal, onNewDeal }: PipelineBoardProps) => {
  const activeStages = DEAL_STAGES.filter(s => s.value !== "cerrado_perdido");

  const stageColorMap: Record<string, string> = {
    prospecto: "from-[hsl(var(--electric))] to-transparent",
    propuesta_enviada: "from-[hsl(var(--cyan))] to-transparent",
    negociacion: "from-[hsl(var(--magenta))] to-transparent",
    cerrado_ganado: "from-[hsl(var(--lime))] to-transparent",
    cerrado_perdido: "from-[hsl(var(--destructive))] to-transparent",
  };

  const borderColorMap: Record<string, string> = {
    prospecto: "border-l-[hsl(45,100%,55%)]",
    propuesta_enviada: "border-l-cyan",
    negociacion: "border-l-magenta",
    cerrado_ganado: "border-l-lime",
    cerrado_perdido: "border-l-destructive",
  };

  const handleAdvance = (deal: Deal) => {
    const stageOrder = DEAL_STAGES.map(s => s.value);
    const currentIdx = stageOrder.indexOf(deal.stage);
    if (currentIdx < stageOrder.length - 2) { // don't auto-advance to "perdido"
      const nextStage = stageOrder[currentIdx + 1];
      onUpdateDeal(deal.id, {
        stage: nextStage,
        ...(nextStage === "cerrado_ganado" ? { closed_date: new Date().toISOString().split("T")[0] } : {}),
      });
    }
  };

  const getTotalValue = (stageDeals: Deal[]) =>
    stageDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-foreground">Pipeline Comercial</h2>
        <button
          onClick={onNewDeal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-coral text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nueva oportunidad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[300px]">
        {activeStages.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.value);
          const totalValue = getTotalValue(stageDeals);

          return (
            <div key={stage.value} className="flex flex-col">
              <div className="flex items-center justify-between p-3 rounded-t-xl glass mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${stageColorMap[stage.value] || ""}`} />
                  <span className="font-display font-semibold text-sm text-foreground">{stage.label}</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                    {stageDeals.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <span className="text-xs font-mono text-electric">{formatMoney(totalValue)}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-border/50 p-8 min-h-[100px]">
                    <p className="text-xs text-muted-foreground/50">Sin oportunidades</p>
                  </div>
                ) : (
                  stageDeals.map((deal, idx) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => onSelectDeal(deal)}
                      className={`group glass rounded-xl p-3 cursor-pointer border-l-4 ${borderColorMap[deal.stage]} hover:scale-[1.01] transition-all relative overflow-hidden`}
                    >
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground leading-snug">{deal.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-coral/10 text-coral font-medium">
                          {deal.client_name}
                        </span>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                              {deal.responsible_name || "Sin asignar"}
                            </span>
                          </div>
                          {deal.estimated_value && (
                            <div className="flex items-center gap-1 text-[11px] text-electric font-mono">
                              <DollarSign className="w-3 h-3" />
                              {formatMoney(deal.estimated_value)}
                            </div>
                          )}
                        </div>

                        {deal.estimated_start_date && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Inicio: {format(new Date(deal.estimated_start_date), "d MMM", { locale: es })}
                          </div>
                        )}

                        {stage.value !== "cerrado_ganado" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAdvance(deal); }}
                            className="w-full mt-1 text-[10px] py-1 rounded-md bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1"
                          >
                            Avanzar <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lost deals summary */}
      {deals.filter(d => d.stage === "cerrado_perdido").length > 0 && (
        <div className="glass rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-2">
            Perdidos ({deals.filter(d => d.stage === "cerrado_perdido").length})
          </p>
          <div className="flex flex-wrap gap-2">
            {deals.filter(d => d.stage === "cerrado_perdido").map(d => (
              <button
                key={d.id}
                onClick={() => onSelectDeal(d)}
                className="text-[11px] px-2 py-1 rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                {d.client_name}: {d.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineBoard;
