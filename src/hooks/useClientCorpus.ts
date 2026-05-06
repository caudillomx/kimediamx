import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CorpusEntryType = "nota" | "url" | "documento" | "minuta" | "brandbook";

export type CorpusEntry = {
  id: string;
  client_id: string;
  entry_type: CorpusEntryType | string;
  title: string;
  content: string | null;
  source_url: string | null;
  file_url: string | null;
  file_name: string | null;
  source_reference: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type NewCorpusEntry = {
  client_id: string;
  entry_type: CorpusEntryType | string;
  title: string;
  content?: string | null;
  source_url?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  source_reference?: string | null;
  tags?: string[];
};

export function useClientCorpus(clientId?: string | null) {
  const [entries, setEntries] = useState<CorpusEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!clientId) { setEntries([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("client_corpus")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setEntries((data || []) as CorpusEntry[]);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { refetch(); }, [refetch]);

  const addEntry = useCallback(async (payload: NewCorpusEntry) => {
    const optimistic: CorpusEntry = {
      id: `tmp-${Date.now()}`,
      client_id: payload.client_id,
      entry_type: payload.entry_type,
      title: payload.title,
      content: payload.content ?? null,
      source_url: payload.source_url ?? null,
      file_url: payload.file_url ?? null,
      file_name: payload.file_name ?? null,
      source_reference: payload.source_reference ?? null,
      tags: payload.tags ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEntries(prev => [optimistic, ...prev]);
    const { data, error } = await supabase
      .from("client_corpus")
      .insert({
        client_id: payload.client_id,
        entry_type: payload.entry_type,
        title: payload.title,
        content: payload.content ?? null,
        source_url: payload.source_url ?? null,
        file_url: payload.file_url ?? null,
        file_name: payload.file_name ?? null,
        source_reference: payload.source_reference ?? null,
        tags: payload.tags ?? [],
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      setEntries(prev => prev.filter(e => e.id !== optimistic.id));
      return null;
    }
    setEntries(prev => prev.map(e => e.id === optimistic.id ? (data as CorpusEntry) : e));
    return data as CorpusEntry;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const prev = entries;
    setEntries(p => p.filter(e => e.id !== id));
    const { error } = await supabase.from("client_corpus").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      setEntries(prev);
    }
  }, [entries]);

  return { entries, loading, addEntry, deleteEntry, refetch };
}

/** Idempotent helper: adds a corpus entry if no row exists with same source_reference for that client. */
export async function addCorpusEntryIfNew(payload: NewCorpusEntry & { source_reference: string }) {
  try {
    const { data: existing } = await supabase
      .from("client_corpus")
      .select("id")
      .eq("client_id", payload.client_id)
      .eq("source_reference", payload.source_reference)
      .maybeSingle();
    if (existing) return { created: false, id: existing.id };
    const { data, error } = await supabase.from("client_corpus").insert({
      client_id: payload.client_id,
      entry_type: payload.entry_type,
      title: payload.title,
      content: payload.content ?? null,
      source_url: payload.source_url ?? null,
      file_url: payload.file_url ?? null,
      file_name: payload.file_name ?? null,
      source_reference: payload.source_reference,
      tags: payload.tags ?? [],
    }).select("id").single();
    if (error) throw error;
    return { created: true, id: data.id };
  } catch (e) {
    console.error("[corpus] addCorpusEntryIfNew failed", e);
    return { created: false, error: e };
  }
}