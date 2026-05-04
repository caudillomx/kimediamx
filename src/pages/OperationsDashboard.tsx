import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useOperationsData, ActionItem } from "@/hooks/useOperationsData";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useDealsData, Deal } from "@/hooks/useDealsData";
import { useInteractionsData, Interaction } from "@/hooks/useInteractionsData";
import { useObjectivesData } from "@/hooks/useObjectivesData";
import TodayHome from "@/components/operations/TodayHome";
import ClientsHub from "@/components/operations/ClientsHub";
import ClientDetail from "@/components/operations/ClientDetail";
import KanbanBoard from "@/components/operations/KanbanBoard";
import ListView from "@/components/operations/ListView";
import PersonView from "@/components/operations/PersonView";
import CalendarView from "@/components/operations/CalendarView";
import PipelineBoard from "@/components/operations/PipelineBoard";
import InteractionsView from "@/components/operations/InteractionsView";
import ObjectivesView from "@/components/operations/ObjectivesView";
import FirefliesInbox from "@/components/operations/FirefliesInbox";
import ClientsManager from "@/components/operations/ClientsManager";
import MinuteUploader from "@/components/operations/MinuteUploader";
import ActionItemModal from "@/components/operations/ActionItemModal";
import DealModal from "@/components/operations/DealModal";
import InteractionModal from "@/components/operations/InteractionModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutGrid, List, Plus, Search, LogOut, RefreshCw, Filter, X,
  Users, Building2, CalendarDays, TrendingUp, MessageSquare, Sun, Moon, Target,
  Inbox, BookUser, Home, Briefcase, Settings,
} from "lucide-react";
import { CATEGORIES, CLIENTS } from "@/hooks/useOperationsData";

type Section = "hoy" | "trabajo" | "clientes" | "entradas";
type WorkView = "kanban" | "list" | "person" | "calendar" | "pipeline" | "interactions";
type ClientesView = "hub" | "objectives" | "catalog";

const SECTION_TABS: { value: Section; label: string; icon: any }[] = [
  { value: "hoy", label: "Hoy", icon: Home },
  { value: "trabajo", label: "Trabajo", icon: Briefcase },
  { value: "clientes", label: "Clientes", icon: Users },
  { value: "entradas", label: "Entradas", icon: Inbox },
];

const WORK_VIEWS: { value: WorkView; label: string; icon: any }[] = [
  { value: "kanban", label: "Kanban", icon: LayoutGrid },
  { value: "list", label: "Lista", icon: List },
  { value: "person", label: "Por persona", icon: Users },
  { value: "calendar", label: "Calendario", icon: CalendarDays },
  { value: "pipeline", label: "Pipeline", icon: TrendingUp },
  { value: "interactions", label: "Interacciones", icon: MessageSquare },
];

const CLIENTES_VIEWS: { value: ClientesView; label: string; icon: any }[] = [
  { value: "hub", label: "Lista", icon: Building2 },
  { value: "objectives", label: "Objetivos 2026", icon: Target },
  { value: "catalog", label: "Catálogo", icon: BookUser },
];

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const { actionItems, teamMembers, loading, updateActionItem, createActionItem, refetch } = useOperationsData();
  const { theme, toggle: toggleTheme, isDark } = useThemeToggle();
  const { deals, createDeal, updateDeal, refetch: refetchDeals } = useDealsData();
  const { interactions, createInteraction, updateInteraction, refetch: refetchInteractions } = useInteractionsData();
  const { objectives, refetch: refetchObjectives, toggleMilestone } = useObjectivesData();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [section, setSection] = useState<Section>("hoy");
  const [workView, setWorkView] = useState<WorkView>("kanban");
  const [clientesView, setClientesView] = useState<ClientesView>("hub");

  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [prefillClient, setPrefillClient] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isNewDeal, setIsNewDeal] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [isNewInteraction, setIsNewInteraction] = useState(false);

  const [openClient, setOpenClient] = useState<string | null>(null);
  const [firefliesPending, setFirefliesPending] = useState(0);

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

  // Fireflies pending count
  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from("fireflies_meetings")
        .select("id", { count: "exact", head: true })
        .eq("review_status", "needs_review");
      setFirefliesPending(count || 0);
    };
    load();
    const ch = supabase
      .channel("ff_count")
      .on("postgres_changes", { event: "*", schema: "public", table: "fireflies_meetings" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filteredItems = useMemo(() => actionItems.filter(item => {
    if (searchQuery && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterMember && item.responsible_name !== filterMember) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterClient && item.client !== filterClient) return false;
    return true;
  }), [actionItems, searchQuery, filterMember, filterCategory, filterClient]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/operaciones/login");
  };

  const openNewItem = (clientName?: string) => {
    setSelectedItem(null);
    setPrefillClient(clientName || null);
    setIsNewItem(true);
  };
  const openNewDeal = (clientName?: string) => {
    setSelectedDeal(clientName ? ({ client_name: clientName } as any) : null);
    setIsNewDeal(true);
  };
  const openNewInteraction = (clientName?: string) => {
    setSelectedInteraction(clientName ? ({ client_name: clientName } as any) : null);
    setIsNewInteraction(true);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-coral animate-spin" />
      </div>
    );
  }

  const showWorkFilters = section === "trabajo" && ["kanban", "list", "calendar"].includes(workView);
  const activeFilters = [filterMember, filterCategory, filterClient, searchQuery].filter(Boolean).length;

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
              {actionItems.filter(i => !["completado","cancelado"].includes(i.status)).length} tareas activas ·
              {" "}{deals.filter(d => !["cerrado_ganado","cerrado_perdido"].includes(d.stage)).length} oportunidades
              {firefliesPending > 0 && <> · <span className="text-coral">{firefliesPending} minutas por revisar</span></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}><span className="sr-only">Tema</span>{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
            <Button variant="ghost" size="sm" onClick={() => { refetch(); refetchDeals(); refetchInteractions(); refetchObjectives(); }}><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </motion.div>

        {/* Section tabs (top-level navigation) */}
        <div className="flex items-center gap-2 border-b border-border">
          {SECTION_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setSection(tab.value)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                section === tab.value
                  ? "border-coral text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.value === "entradas" && firefliesPending > 0 && (
                <span className="ml-1 text-[10px] bg-coral text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {firefliesPending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sub-views per section */}
        {section === "trabajo" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-secondary rounded-lg p-1 gap-0.5">
              {WORK_VIEWS.map(v => (
                <button
                  key={v.value}
                  onClick={() => setWorkView(v.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    workView === v.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
            {!["pipeline", "interactions"].includes(workView) && (
              <Button onClick={() => openNewItem()} className="bg-gradient-coral text-primary-foreground font-semibold ml-auto">
                <Plus className="w-4 h-4 mr-1.5" /> Nueva tarea
              </Button>
            )}
          </div>
        )}

        {section === "clientes" && (
          <div className="flex items-center bg-secondary rounded-lg p-1 gap-0.5 w-fit">
            {CLIENTES_VIEWS.map(v => (
              <button
                key={v.value}
                onClick={() => setClientesView(v.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  clientesView === v.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <v.icon className="w-3.5 h-3.5" /> {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Filters only for task views */}
        {showWorkFilters && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar tareas..." className="pl-10 bg-card border-border" />
            </div>
            <Select value={filterCategory || "all"} onValueChange={v => setFilterCategory(v === "all" ? null : v)}>
              <SelectTrigger className="w-[140px] bg-card border-border"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterClient || "all"} onValueChange={v => setFilterClient(v === "all" ? null : v)}>
              <SelectTrigger className="w-[180px] bg-card border-border"><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {CLIENTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterMember || "all"} onValueChange={v => setFilterMember(v === "all" ? null : v)}>
              <SelectTrigger className="w-[180px] bg-card border-border"><SelectValue placeholder="Responsable" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {teamMembers.map(m => <SelectItem key={m.id} value={m.full_name}>{m.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setFilterMember(null); setFilterCategory(null); setFilterClient(null); }}>
                <X className="w-3.5 h-3.5 mr-1" /> Limpiar
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
          ) : section === "hoy" ? (
            <motion.div key="hoy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TodayHome
                items={actionItems}
                teamMembers={teamMembers}
                deals={deals}
                objectives={objectives}
                firefliesPending={firefliesPending}
                onSelectItem={(it) => { setSelectedItem(it); setIsNewItem(false); }}
                onGoTo={(s) => setSection(s)}
              />
            </motion.div>
          ) : section === "trabajo" ? (
            <motion.div key={`trabajo-${workView}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {workView === "kanban" && <KanbanBoard items={filteredItems} teamMembers={teamMembers} onUpdateItem={updateActionItem} onSelectItem={(i) => { setSelectedItem(i); setIsNewItem(false); }} />}
              {workView === "list" && <ListView items={filteredItems} teamMembers={teamMembers} onSelectItem={(i) => { setSelectedItem(i); setIsNewItem(false); }} onUpdateItem={updateActionItem} />}
              {workView === "person" && <PersonView items={actionItems} teamMembers={teamMembers} onSelectItem={(i) => { setSelectedItem(i); setIsNewItem(false); }} />}
              {workView === "calendar" && <CalendarView items={filteredItems} teamMembers={teamMembers} onSelectItem={(i) => { setSelectedItem(i); setIsNewItem(false); }} />}
              {workView === "pipeline" && <PipelineBoard deals={deals} teamMembers={teamMembers} onSelectDeal={(d) => { setSelectedDeal(d); setIsNewDeal(false); }} onUpdateDeal={updateDeal} onNewDeal={() => openNewDeal()} />}
              {workView === "interactions" && <InteractionsView interactions={interactions} onSelectInteraction={(i) => { setSelectedInteraction(i); setIsNewInteraction(false); }} onNewInteraction={() => openNewInteraction()} onToggleFollowUp={(id, done) => updateInteraction(id, { follow_up_done: done })} />}
            </motion.div>
          ) : section === "clientes" ? (
            <motion.div key={`clientes-${clientesView}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {clientesView === "hub" && (
                <ClientsHub
                  items={actionItems}
                  deals={deals}
                  objectives={objectives}
                  interactions={interactions}
                  onOpenClient={setOpenClient}
                />
              )}
              {clientesView === "objectives" && (
                <ObjectivesView objectives={objectives} actionItems={actionItems} onToggleMilestone={toggleMilestone} onSelectItem={(i) => { setSelectedItem(i); setIsNewItem(false); }} />
              )}
              {clientesView === "catalog" && <ClientsManager />}
            </motion.div>
          ) : section === "entradas" ? (
            <motion.div key="entradas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <MinuteUploader onUploaded={refetch} />
              <FirefliesInbox onImported={refetch} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Client detail dialog */}
        <ClientDetail
          clientName={openClient}
          open={!!openClient}
          onClose={() => setOpenClient(null)}
          items={actionItems}
          deals={deals}
          interactions={interactions}
          objectives={objectives}
          teamMembers={teamMembers}
          onSelectItem={(i) => { setOpenClient(null); setSelectedItem(i); setIsNewItem(false); }}
          onNewItem={(c) => { setOpenClient(null); openNewItem(c); }}
          onSelectDeal={(d) => { setOpenClient(null); setSelectedDeal(d); setIsNewDeal(false); }}
          onNewDeal={(c) => { setOpenClient(null); openNewDeal(c); }}
          onSelectInteraction={(i) => { setOpenClient(null); setSelectedInteraction(i); setIsNewInteraction(false); }}
          onNewInteraction={(c) => { setOpenClient(null); openNewInteraction(c); }}
          onToggleMilestone={toggleMilestone}
        />

        {/* Modals */}
        <ActionItemModal
          item={isNewItem ? null : selectedItem}
          prefillClient={prefillClient}
          teamMembers={teamMembers}
          open={!!selectedItem || isNewItem}
          onClose={() => { setSelectedItem(null); setIsNewItem(false); setPrefillClient(null); }}
          onSave={updateActionItem}
          onCreate={createActionItem}
          isNew={isNewItem}
        />
        <DealModal
          deal={isNewDeal ? null : selectedDeal}
          teamMembers={teamMembers}
          open={!!selectedDeal || isNewDeal}
          onClose={() => { setSelectedDeal(null); setIsNewDeal(false); }}
          onSave={updateDeal}
          onCreate={createDeal}
          isNew={isNewDeal}
        />
        <InteractionModal
          interaction={isNewInteraction ? null : selectedInteraction}
          open={!!selectedInteraction || isNewInteraction}
          onClose={() => { setSelectedInteraction(null); setIsNewInteraction(false); }}
          onSave={updateInteraction}
          onCreate={createInteraction}
          isNew={isNewInteraction}
        />
      </div>
    </div>
  );
};

export default OperationsDashboard;
