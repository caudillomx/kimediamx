import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Client = {
  id: string;
  name: string;
  industry: string | null;
  client_type: "activo" | "probono" | "prospecto" | "inactivo" | string;
  is_probono: boolean;
  is_active: boolean;
  logo_url: string | null;
  website_url: string | null;
  notes: string | null;
  aliases: string[];
  created_at: string;
};

export const CLIENT_TYPE_META: Record<string, { label: string; badgeClass: string }> = {
  activo:    { label: "Activo",    badgeClass: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  probono:   { label: "Pro bono",  badgeClass: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  prospecto: { label: "Prospecto", badgeClass: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  inactivo:  { label: "Inactivo",  badgeClass: "bg-muted text-muted-foreground border-border" },
};

export function useClientsData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clients").select("*").order("name");
    if (error) toast.error(error.message);
    else setClients((data || []) as Client[]);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createClient = useCallback(async (payload: Partial<Client> & { name: string }) => {
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: payload.name,
        industry: payload.industry ?? null,
        client_type: payload.client_type ?? "activo",
        is_probono: payload.is_probono ?? false,
        logo_url: payload.logo_url ?? null,
        website_url: payload.website_url ?? null,
        notes: payload.notes ?? null,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return null; }
    setClients(prev => [...prev, data as Client].sort((a, b) => a.name.localeCompare(b.name)));
    return data as Client;
  }, []);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const { error } = await supabase.from("clients").update(updates).eq("id", id);
    if (error) { toast.error(error.message); refetch(); }
  }, [refetch]);

  const getClientNames = useCallback(() => clients.map(c => c.name), [clients]);

  return { clients, loading, createClient, updateClient, refetch, getClientNames };
}