import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useOperationsData, ActionItem } from "@/hooks/useOperationsData";
import { useDealsData, Deal } from "@/hooks/useDealsData";
import { useInteractionsData, Interaction } from "@/hooks/useInteractionsData";
import InteractionsView from "@/components/operations/InteractionsView";
import InteractionModal from "@/components/operations/InteractionModal";
import StatsBar from "@/components/operations/StatsBar";
import KanbanBoard from "@/components/operations/KanbanBoard";
import ListView from "@/components/operations/ListView";
import TeamPulse from "@/components/operations/TeamPulse";
import MinuteUploader from "@/components/operations/MinuteUploader";
import ActionItemModal from "@/components/operations/ActionItemModal";
import PipelineBoard from "@/components/operations/PipelineBoard";
import DealModal from "@/components/operations/DealModal";
import PersonView from "@/components/operations/PersonView";
import ClientView from "@/components/operations/ClientView";
import CalendarView from "@/components/operations/CalendarView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutGrid, List, Plus, Search, LogOut, RefreshCw, Filter, X,
  Users, Building2, CalendarDays, TrendingUp,
} from "lucide-react";
import { CATEGORIES, CLIENTS } from "@/hooks/useOperationsData";

type ViewMode = "kanban" | "list" | "person" | "client" | "calendar" | "pipeline";

const VIEW_TABS = [
  { value: "kanban" as ViewMode, label: "Kanban", icon: LayoutGrid },
  { value: "list" as ViewMode, label: "Lista", icon: List },
  { value: "person" as ViewMode, label: "Equipo", icon: Users },
  { value: "client" as ViewMode, label: "Clientes", icon: Building2 },
  { value: "calendar" as ViewMode, label: "Calendario", icon: CalendarDays },
  { value: "pipeline" as ViewMode, label: "Pipeline", icon: TrendingUp },
];

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const { actionItems, teamMembers, minutes, loading, updateActionItem, createActionItem, refetch } = useOperationsData();
  const { deals, createDeal, updateDeal, refetch: refetchDeals } = useDealsData();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isNewDeal, setIsNewDeal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setCheckingAuth(false);
      if (!session) navigate("/admin/operaciones/login");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
      if (!session) navigate("/admin/operaciones/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-coral animate-spin" />
      </div>
    );
  }

  const filtered = actionItems.filter(item => {
    if (searchQuery && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterMember && item.responsible_name !== filterMember) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterClient && item.client !== filterClient) return false;
    return true;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/operaciones/login");
  };

  const activeFilters = [filterMember, filterCategory, filterClient, searchQuery].filter(Boolean).length;
  const showFilters = !["pipeline", "person", "client"].includes(viewMode);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Operaciones <span className="text-gradient">KiMedia</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} actividades · {deals.length} oportunidades · {minutes.length} minutas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { refetch(); refetchDeals(); }} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsBar items={actionItems} />

        {/* Team + Upload row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <TeamPulse items={actionItems} teamMembers={teamMembers} onFilterByMember={setFilterMember} activeMember={filterMember} />
          <MinuteUploader onUploaded={refetch} />
        </div>

        {/* View tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-1 gap-0.5">
            {VIEW_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setViewMode(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === tab.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {viewMode !== "pipeline" && (
            <Button
              onClick={() => { setSelectedItem(null); setIsNewItem(true); }}
              className="bg-gradient-coral text-primary-foreground font-semibold ml-auto"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nueva
            </Button>
          )}
        </div>

        {/* Filters (only for task views) */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar actividades..."
                className="pl-10 bg-secondary border-border"
              />
            </div>

            <Select value={filterCategory || "all"} onValueChange={(v) => setFilterCategory(v === "all" ? null : v)}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterClient || "all"} onValueChange={(v) => setFilterClient(v === "all" ? null : v)}>
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {CLIENTS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchQuery(""); setFilterMember(null); setFilterCategory(null); setFilterClient(null); }}
                className="text-muted-foreground"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        )}

        {/* Main content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-coral animate-spin" />
            </motion.div>
          ) : viewMode === "kanban" ? (
            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <KanbanBoard items={filtered} teamMembers={teamMembers} onUpdateItem={updateActionItem} onSelectItem={(item) => { setSelectedItem(item); setIsNewItem(false); }} />
            </motion.div>
          ) : viewMode === "list" ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ListView items={filtered} teamMembers={teamMembers} onSelectItem={(item) => { setSelectedItem(item); setIsNewItem(false); }} onUpdateItem={updateActionItem} />
            </motion.div>
          ) : viewMode === "person" ? (
            <motion.div key="person" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PersonView items={actionItems} teamMembers={teamMembers} onSelectItem={(item) => { setSelectedItem(item); setIsNewItem(false); }} />
            </motion.div>
          ) : viewMode === "client" ? (
            <motion.div key="client" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ClientView items={actionItems} deals={deals} onSelectItem={(item) => { setSelectedItem(item); setIsNewItem(false); }} onFilterByClient={(client) => { setFilterClient(client); setViewMode("kanban"); }} />
            </motion.div>
          ) : viewMode === "calendar" ? (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CalendarView items={filtered} teamMembers={teamMembers} onSelectItem={(item) => { setSelectedItem(item); setIsNewItem(false); }} />
            </motion.div>
          ) : viewMode === "pipeline" ? (
            <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PipelineBoard deals={deals} teamMembers={teamMembers} onSelectDeal={(deal) => { setSelectedDeal(deal); setIsNewDeal(false); }} onUpdateDeal={updateDeal} onNewDeal={() => { setSelectedDeal(null); setIsNewDeal(true); }} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Action Item Modal */}
        <ActionItemModal
          item={isNewItem ? null : selectedItem}
          teamMembers={teamMembers}
          open={!!selectedItem || isNewItem}
          onClose={() => { setSelectedItem(null); setIsNewItem(false); }}
          onSave={updateActionItem}
          onCreate={createActionItem}
          isNew={isNewItem}
        />

        {/* Deal Modal */}
        <DealModal
          deal={isNewDeal ? null : selectedDeal}
          teamMembers={teamMembers}
          open={!!selectedDeal || isNewDeal}
          onClose={() => { setSelectedDeal(null); setIsNewDeal(false); }}
          onSave={updateDeal}
          onCreate={createDeal}
          isNew={isNewDeal}
        />
      </div>
    </div>
  );
};

export default OperationsDashboard;
