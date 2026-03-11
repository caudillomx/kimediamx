import { useState, useEffect } from "react";
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
  created_at: string;
  updated_at: string;
};

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

  const fetchAll = async () => {
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
  };

  useEffect(() => {
    fetchAll();

    // Realtime subscription
    const channel = supabase
      .channel("action_items_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "action_items" }, () => {
        fetchAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateActionItem = async (id: string, updates: Partial<ActionItem>) => {
    const { error } = await supabase
      .from("action_items")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Error al actualizar");
    }
  };

  const createActionItem = async (item: Omit<ActionItem, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("action_items").insert(item);
    if (error) {
      toast.error("Error al crear tarea");
    } else {
      toast.success("Tarea creada");
      fetchAll();
    }
  };

  return { actionItems, teamMembers, minutes, loading, updateActionItem, createActionItem, refetch: fetchAll };
}
