import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Interaction, INTERACTION_TYPES } from "@/hooks/useInteractionsData";
import { CLIENTS } from "@/hooks/useOperationsData";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Phone, Mail, Users, MessageCircle, Handshake,
  AlertTriangle, CheckCircle2, Clock, Search, Filter, Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = { Phone, Mail, Users, MessageCircle, Handshake };

interface InteractionsViewProps {
  interactions: Interaction[];
  onSelectInteraction: (interaction: Interaction) => void;
  onNewInteraction: () => void;
  onToggleFollowUp: (id: string, done: boolean) => void;
}

const InteractionsView = ({ interactions, onSelectInteraction, onNewInteraction, onToggleFollowUp }: InteractionsViewProps) => {
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);

  const today = startOfDay(new Date());

  const filtered = useMemo(() => {
    return interactions.filter(i => {
      if (search && !i.subject.toLowerCase().includes(search.toLowerCase()) && !i.contact_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterClient && i.client_name !== filterClient) return false;
      if (filterType && i.interaction_type !== filterType) return false;
      if (showPending && (i.follow_up_done || !i.follow_up_date)) return false;
      return true;
    });
  }, [interactions, search, filterClient, filterType, showPending]);

  const pendingFollowUps = interactions.filter(i => i.follow_up_date && !i.follow_up_done);
  const overdueCount = pendingFollowUps.filter(i => isBefore(new Date(i.follow_up_date!), today)).length;

  const getTypeInfo = (type: string) => INTERACTION_TYPES.find(t => t.value === type) || INTERACTION_TYPES[0];

  const isOverdue = (i: Interaction) => i.follow_up_date && !i.follow_up_done && isBefore(new Date(i.follow_up_date), today);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-display font-bold text-foreground">{interactions.length}</p>
          <p className="text-xs text-muted-foreground">Total registradas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-display font-bold text-foreground">{pendingFollowUps.length}</p>
          <p className="text-xs text-muted-foreground">Follow-ups pendientes</p>
        </div>
        <div
          className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${overdueCount > 0 ? "border-destructive" : "border-border"}`}
          onClick={() => setShowPending(!showPending)}
        >
          <p className={`text-2xl font-display font-bold ${overdueCount > 0 ? "text-destructive" : "text-foreground"}`}>{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Vencidos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-display font-bold text-foreground">
            {new Set(interactions.map(i => i.contact_name)).size}
          </p>
          <p className="text-xs text-muted-foreground">Contactos activos</p>
        </div>
      </div>

      {/* Filters + New */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por contacto o asunto..."
            className="pl-10 bg-secondary border-border"
          />
        </div>

        <Select value={filterClient || "all"} onValueChange={(v) => setFilterClient(v === "all" ? null : v)}>
          <SelectTrigger className="w-[160px] bg-secondary border-border">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {CLIENTS.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType || "all"} onValueChange={(v) => setFilterType(v === "all" ? null : v)}>
          <SelectTrigger className="w-[140px] bg-secondary border-border">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {INTERACTION_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showPending ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPending(!showPending)}
          className={showPending ? "bg-gradient-coral text-primary-foreground" : ""}
        >
          <Clock className="w-3.5 h-3.5 mr-1" />
          Pendientes
        </Button>

        <Button
          onClick={onNewInteraction}
          className="bg-gradient-coral text-primary-foreground font-semibold ml-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Registrar
        </Button>
      </div>

      {/* Interactions list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay interacciones registradas</p>
              <p className="text-xs mt-1">Registra llamadas, correos y acuerdos con contactos externos</p>
            </motion.div>
          ) : (
            filtered.map((interaction, idx) => {
              const typeInfo = getTypeInfo(interaction.interaction_type);
              const Icon = iconMap[typeInfo.icon] || Phone;
              const overdue = isOverdue(interaction);

              return (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => onSelectInteraction(interaction)}
                  className={`bg-card border rounded-xl p-4 cursor-pointer hover:border-foreground/20 transition-all group ${
                    overdue ? "border-destructive/50" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div className={`w-9 h-9 rounded-lg bg-${typeInfo.color}/10 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 text-${typeInfo.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-foreground truncate">{interaction.subject}</span>
                        {overdue && <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                        {interaction.follow_up_done && <CheckCircle2 className="w-3.5 h-3.5 text-lime flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{interaction.contact_name}</span>
                        <span>·</span>
                        <span>{interaction.client_name}</span>
                        <span>·</span>
                        <span>{format(new Date(interaction.created_at), "d MMM", { locale: es })}</span>
                      </div>
                      {interaction.outcome && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          → {interaction.outcome}
                        </p>
                      )}
                    </div>

                    {/* Follow-up badge */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-[10px]">{typeInfo.label}</Badge>
                      {interaction.follow_up_date && !interaction.follow_up_done && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleFollowUp(interaction.id, true); }}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                            overdue
                              ? "border-destructive text-destructive hover:bg-destructive/10"
                              : "border-border text-muted-foreground hover:border-foreground"
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {format(new Date(interaction.follow_up_date), "d MMM", { locale: es })}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InteractionsView;
