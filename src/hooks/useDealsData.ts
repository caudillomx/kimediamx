import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Deal = {
  id: string;
  name: string;
  client_name: string;
  contact_name: string | null;
  description: string | null;
  estimated_value: number | null;
  stage: string;
  estimated_start_date: string | null;
  closed_date: string | null;
  responsible_id: string | null;
  responsible_name: string | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export const DEAL_STAGES = [
  { value: "prospecto", label: "Prospecto", color: "electric", icon: "UserPlus" },
  { value: "propuesta_enviada", label: "Propuesta enviada", color: "cyan", icon: "Send" },
  { value: "negociacion", label: "Negociación", color: "magenta", icon: "MessageSquare" },
  { value: "cerrado_ganado", label: "Cerrado ✓", color: "lime", icon: "CheckCircle2" },
  { value: "cerrado_perdido", label: "Perdido", color: "destructive", icon: "XCircle" },
];

export function useDealsData() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDeals(data as Deal[]);
    if (error) console.error("Error fetching deals:", error);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();

    const channel = supabase
      .channel("deals_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => {
        fetchDeals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const createDeal = async (deal: Omit<Deal, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("deals").insert(deal as any);
    if (error) {
      toast.error("Error al crear oportunidad");
    } else {
      toast.success("Oportunidad creada");
      fetchDeals();
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const { error } = await supabase
      .from("deals")
      .update(updates as any)
      .eq("id", id);
    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Oportunidad actualizada");
      fetchDeals();
    }
  };

  return { deals, loading, createDeal, updateDeal, refetch: fetchDeals };
}
