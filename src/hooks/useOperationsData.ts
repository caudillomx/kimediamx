import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ActionItem = {
  id: string;
  minute_id: string | null;
  description: string;
  responsible_id: string | null;
  responsible_name: string | null;
  category: string;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  client: string | null;
  created_at: string;
  updated_at: string;
};

export const CLIENTS = [
  "Guanajuato", "Actinver", "El Diluvio", "Padre Sada",
  "Mario Doria - Urólogo", "MID Clinic", "FIMEME", "KiMedia",
  "Memeverso", "Mundo Empresarial", "Lidérate", "Strategos",
];

export type TeamMember = {
  id: string;
  full_name: string;
  role_title: string;
  category: string;
  avatar_color: string;
  is_active: boolean;
};

export type Minute = {
  id: string;
  title: string;
  meeting_date: string;
  parsed: boolean;
  file_name: string | null;
  created_at: string;
};

export const CATEGORIES = [
  { value: "tarea", label: "Tarea", icon: "CheckSquare", color: "coral" },
  { value: "llamada", label: "Llamada", icon: "Phone", color: "cyan" },
  { value: "evento", label: "Evento", icon: "Calendar", color: "magenta" },
  { value: "cotizacion", label: "Cotización", icon: "FileText", color: "electric" },
  { value: "reporte", label: "Reporte", icon: "BarChart3", color: "lime" },
  { value: "prospecto", label: "Prospecto", icon: "UserPlus", color: "coral" },
  { value: "proyecto", label: "Proyecto", icon: "Folder", color: "cyan" },
];

export const STATUSES = [
  { value: "pendiente", label: "Pendiente", color: "electric" },
  { value: "en_progreso", label: "En progreso", color: "cyan" },
  { value: "revision", label: "En revisión", color: "magenta" },
  { value: "completado", label: "Completado", color: "lime" },
  { value: "cancelado", label: "Cancelado", color: "destructive" },
];

export const PRIORITIES = [
  { value: "alta", label: "Alta", color: "destructive" },
  { value: "media", label: "Media", color: "electric" },
  { value: "baja", label: "Baja", color: "muted-foreground" },
];

export function useOperationsData() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [loading, setLoading] = useState(true);
  // Track pending local updates to avoid realtime overwriting them
  const pendingUpdates = useRef<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [itemsRes, teamRes, minutesRes] = await Promise.all([
      supabase.from("action_items").select("*").order("created_at", { ascending: false }),
      supabase.from("team_members").select("*").order("category").order("full_name"),
      supabase.from("minutes").select("*").order("meeting_date", { ascending: false }),
    ]);

    if (itemsRes.data) setActionItems(itemsRes.data);
    if (teamRes.data) setTeamMembers(teamRes.data as TeamMember[]);
    if (minutesRes.data) setMinutes(minutesRes.data as Minute[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("action_items_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "action_items" }, () => {
        // Only full-refetch on inserts (e.g. new minute parsed)
        fetchAll();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "action_items" }, (payload) => {
        const updated = payload.new as ActionItem;
        // Skip if we already applied this optimistically
        if (pendingUpdates.current.has(updated.id)) {
          pendingUpdates.current.delete(updated.id);
          return;
        }
        // Apply single-item update from another source
        setActionItems(prev => prev.map(item => item.id === updated.id ? updated : item));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const updateActionItem = useCallback(async (id: string, updates: Partial<ActionItem>) => {
    // Optimistic update
    pendingUpdates.current.add(id);
    setActionItems(prev =>
      prev.map(item => item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item)
    );

    const { error } = await supabase
      .from("action_items")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar");
      pendingUpdates.current.delete(id);
      fetchAll(); // rollback by refetching
    }
    // No toast on success for quick actions to reduce noise
  }, [fetchAll]);

  const createActionItem = useCallback(async (item: Omit<ActionItem, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("action_items").insert(item);
    if (error) {
      toast.error("Error al crear tarea");
    } else {
      toast.success("Tarea creada");
      // Realtime INSERT handler will refetch
    }
  }, []);

  return { actionItems, teamMembers, minutes, loading, updateActionItem, createActionItem, refetch: fetchAll };
}
