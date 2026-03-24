import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ContentProfile = {
  id: string;
  client_name: string;
  industry: string | null;
  target_audience: string | null;
  brand_tone: string | null;
  content_pillars: string[];
  preferred_networks: string[];
  posting_frequency: string | null;
  hashtag_groups: any;
  restrictions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentCycle = {
  id: string;
  profile_id: string;
  title: string;
  cycle_type: string;
  start_date: string;
  end_date: string;
  status: string;
  briefing_data: any;
  ai_recommendations: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentPiece = {
  id: string;
  cycle_id: string;
  scheduled_date: string | null;
  network: string;
  format: string;
  pillar: string | null;
  objective: string | null;
  draft_copy: string | null;
  final_copy: string | null;
  hashtags: string[];
  cta: string | null;
  design_prompt: string | null;
  tone: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContentLearning = {
  id: string;
  profile_id: string;
  cycle_id: string | null;
  category: string;
  insight: string;
  confidence: number;
  source: string | null;
  is_active: boolean;
  created_at: string;
};

export function useContentEngine() {
  const [profiles, setProfiles] = useState<ContentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_profiles")
      .select("*")
      .order("client_name");
    if (error) toast.error("Error cargando perfiles");
    else setProfiles((data || []) as ContentProfile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const createProfile = useCallback(async (profile: Partial<ContentProfile>) => {
    const { data, error } = await supabase
      .from("content_profiles")
      .insert(profile as any)
      .select()
      .single();
    if (error) { toast.error("Error creando perfil"); return null; }
    toast.success("Perfil creado");
    fetchProfiles();
    return data as ContentProfile;
  }, [fetchProfiles]);

  const updateProfile = useCallback(async (id: string, updates: Partial<ContentProfile>) => {
    const { error } = await supabase
      .from("content_profiles")
      .update(updates as any)
      .eq("id", id);
    if (error) toast.error("Error actualizando perfil");
    else fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, fetchProfiles, createProfile, updateProfile };
}

export function useContentCycles(profileId: string | null) {
  const [cycles, setCycles] = useState<ContentCycle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCycles = useCallback(async () => {
    if (!profileId) { setCycles([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("content_cycles")
      .select("*")
      .eq("profile_id", profileId)
      .order("start_date", { ascending: false });
    if (error) toast.error("Error cargando ciclos");
    else setCycles((data || []) as ContentCycle[]);
    setLoading(false);
  }, [profileId]);

  useEffect(() => { fetchCycles(); }, [fetchCycles]);

  const createCycle = useCallback(async (cycle: Partial<ContentCycle>) => {
    const { data, error } = await supabase
      .from("content_cycles")
      .insert(cycle as any)
      .select()
      .single();
    if (error) { toast.error("Error creando ciclo"); return null; }
    toast.success("Ciclo creado");
    fetchCycles();
    return data as ContentCycle;
  }, [fetchCycles]);

  const updateCycle = useCallback(async (id: string, updates: Partial<ContentCycle>) => {
    const { error } = await supabase
      .from("content_cycles")
      .update(updates as any)
      .eq("id", id);
    if (error) toast.error("Error actualizando ciclo");
    else fetchCycles();
  }, [fetchCycles]);

  return { cycles, loading, fetchCycles, createCycle, updateCycle };
}

export function useContentPieces(cycleId: string | null) {
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPieces = useCallback(async () => {
    if (!cycleId) { setPieces([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("content_pieces")
      .select("*")
      .eq("cycle_id", cycleId)
      .order("scheduled_date")
      .order("sort_order");
    if (error) toast.error("Error cargando piezas");
    else setPieces((data || []) as ContentPiece[]);
    setLoading(false);
  }, [cycleId]);

  useEffect(() => { fetchPieces(); }, [fetchPieces]);

  const updatePiece = useCallback(async (id: string, updates: Partial<ContentPiece>) => {
    const { error } = await supabase
      .from("content_pieces")
      .update(updates as any)
      .eq("id", id);
    if (error) toast.error("Error actualizando pieza");
    else fetchPieces();
  }, [fetchPieces]);

  const bulkInsertPieces = useCallback(async (newPieces: Partial<ContentPiece>[]) => {
    const { error } = await supabase
      .from("content_pieces")
      .insert(newPieces as any[]);
    if (error) { toast.error("Error insertando piezas"); return false; }
    fetchPieces();
    return true;
  }, [fetchPieces]);

  return { pieces, loading, fetchPieces, updatePiece, bulkInsertPieces };
}

export function useContentLearnings(profileId: string | null) {
  const [learnings, setLearnings] = useState<ContentLearning[]>([]);

  const fetchLearnings = useCallback(async () => {
    if (!profileId) { setLearnings([]); return; }
    const { data } = await supabase
      .from("content_learnings")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_active", true)
      .order("confidence", { ascending: false });
    setLearnings((data || []) as ContentLearning[]);
  }, [profileId]);

  useEffect(() => { fetchLearnings(); }, [fetchLearnings]);

  return { learnings, fetchLearnings };
}
