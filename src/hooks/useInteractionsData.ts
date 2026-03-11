import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Interaction = {
  id: string;
  contact_name: string;
  client_name: string;
  interaction_type: string;
  subject: string;
  notes: string | null;
  outcome: string | null;
  follow_up_date: string | null;
  follow_up_done: boolean;
  logged_by: string | null;
  created_at: string;
  updated_at: string;
};

export const INTERACTION_TYPES = [
  { value: "llamada", label: "Llamada", icon: "Phone", color: "cyan" },
  { value: "correo", label: "Correo", icon: "Mail", color: "electric" },
  { value: "reunion", label: "Reunión", icon: "Users", color: "magenta" },
  { value: "whatsapp", label: "WhatsApp", icon: "MessageCircle", color: "lime" },
  { value: "acuerdo", label: "Acuerdo", icon: "Handshake", color: "coral" },
];

export function useInteractionsData() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("interactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInteractions(data as Interaction[]);
    if (error) console.error("Error fetching interactions:", error);
    setLoading(false);
  };

  useEffect(() => {
    fetchInteractions();

    const channel = supabase
      .channel("interactions_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "interactions" }, () => {
        fetchInteractions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const createInteraction = async (interaction: Omit<Interaction, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("interactions").insert(interaction as any);
    if (error) {
      toast.error("Error al registrar interacción");
    } else {
      toast.success("Interacción registrada");
      fetchInteractions();
    }
  };

  const updateInteraction = async (id: string, updates: Partial<Interaction>) => {
    const { error } = await supabase
      .from("interactions")
      .update(updates as any)
      .eq("id", id);
    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Interacción actualizada");
      fetchInteractions();
    }
  };

  return { interactions, loading, createInteraction, updateInteraction, refetch: fetchInteractions };
}
