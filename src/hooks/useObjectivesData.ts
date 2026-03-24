import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ClientObjective = {
  id: string;
  client_name: string;
  priority: number;
  objective_text: string;
  main_activities: string | null;
  business_unit: string | null;
  year: number;
  milestones: WeeklyMilestone[];
};

export type WeeklyMilestone = {
  id: string;
  objective_id: string;
  month: number;
  week_number: number;
  activity_text: string;
  is_completed: boolean;
  completed_at: string | null;
};

export const useObjectivesData = () => {
  const [objectives, setObjectives] = useState<ClientObjective[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchObjectives = useCallback(async () => {
    setLoading(true);
    const { data: objs, error: objErr } = await supabase
      .from("client_objectives")
      .select("*")
      .order("priority", { ascending: false })
      .order("client_name");

    if (objErr) {
      toast.error("Error cargando objetivos");
      setLoading(false);
      return;
    }

    const { data: milestones, error: milErr } = await supabase
      .from("client_weekly_milestones")
      .select("*")
      .order("month")
      .order("week_number");

    if (milErr) {
      toast.error("Error cargando hitos");
      setLoading(false);
      return;
    }

    const milestoneMap = new Map<string, WeeklyMilestone[]>();
    (milestones || []).forEach((m: any) => {
      const list = milestoneMap.get(m.objective_id) || [];
      list.push(m);
      milestoneMap.set(m.objective_id, list);
    });

    const combined: ClientObjective[] = (objs || []).map((o: any) => ({
      ...o,
      milestones: milestoneMap.get(o.id) || [],
    }));

    setObjectives(combined);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  const toggleMilestone = useCallback(async (milestoneId: string, completed: boolean) => {
    // Optimistic update
    setObjectives(prev =>
      prev.map(o => ({
        ...o,
        milestones: o.milestones.map(m =>
          m.id === milestoneId
            ? { ...m, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
            : m
        ),
      }))
    );

    const { error } = await supabase
      .from("client_weekly_milestones")
      .update({
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", milestoneId);

    if (error) {
      toast.error("Error actualizando hito");
      fetchObjectives();
    }
  }, [fetchObjectives]);

  return { objectives, loading, refetch: fetchObjectives, toggleMilestone };
};
