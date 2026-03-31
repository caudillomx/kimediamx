import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ContentProfile = {
  id: string;
  client_name: string;
  industry: string | null;
  target_audience: string | null;
  brand_tone: string | null;
  brand_essence: string | null;
  client_type: string | null;
  content_pillars: string[];
  preferred_networks: string[];
  posting_frequency: string | null;
  hashtag_groups: any;
  restrictions: string | null;
  notes: string | null;
  avatar_url: string | null;
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
  ads_budget: number;
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

export type ContentInput = {
  id: string;
  cycle_id: string;
  input_type: string;
  title: string | null;
  content: string | null;
  url: string | null;
  file_name: string | null;
  file_url: string | null;
  tags: string[];
  sort_order: number;
  created_at: string;
};

export type ContentAnalyticRow = {
  id: string;
  profile_id: string;
  piece_id: string | null;
  published_date: string | null;
  network: string | null;
  post_type: string | null;
  post_text: string | null;
  reach: number;
  impressions: number;
  engagement: number;
  reactions: number;
  comments: number;
  shares: number;
  clicks: number;
  video_views: number;
  engagement_rate: number;
  import_batch: string | null;
  raw_data: any;
  created_at: string;
};

export type AdCampaign = {
  id: string;
  profile_id: string;
  platform: string;
  campaign_name: string;
  campaign_id_external: string | null;
  objective: string | null;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  import_batch: string | null;
  created_at: string;
};

export type AdPerformanceRow = {
  id: string;
  campaign_id: string;
  ad_name: string | null;
  ad_set_name: string | null;
  report_date: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversion_value: number;
  cpc: number;
  cpm: number;
  ctr: number;
  roas: number;
  reach: number;
  frequency: number;
  raw_data: any;
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

  const deleteProfile = useCallback(async (id: string) => {
    // Delete related data first (cycles, pieces, inputs, learnings, analytics, campaigns)
    const { data: cycles } = await supabase.from("content_cycles").select("id").eq("profile_id", id);
    if (cycles && cycles.length > 0) {
      const cycleIds = cycles.map(c => c.id);
      await supabase.from("content_pieces").delete().in("cycle_id", cycleIds);
      await supabase.from("content_inputs").delete().in("cycle_id", cycleIds);
      await supabase.from("content_cycles").delete().eq("profile_id", id);
    }
    await supabase.from("content_learnings").delete().eq("profile_id", id);
    await supabase.from("content_analytics").delete().eq("profile_id", id);
    await supabase.from("client_trend_results").delete().eq("profile_id", id);
    await supabase.from("client_trend_keywords").delete().eq("profile_id", id);
    
    const { data: camps } = await supabase.from("ad_campaigns").select("id").eq("profile_id", id);
    if (camps && camps.length > 0) {
      await supabase.from("ad_performance").delete().in("campaign_id", camps.map(c => c.id));
      await supabase.from("ad_campaigns").delete().eq("profile_id", id);
    }
    await supabase.from("client_reports").delete().eq("profile_id", id);

    const { error } = await supabase.from("content_profiles").delete().eq("id", id);
    if (error) { toast.error("Error eliminando perfil"); return false; }
    toast.success("Perfil eliminado");
    fetchProfiles();
    return true;
  }, [fetchProfiles]);

  return { profiles, loading, fetchProfiles, createProfile, updateProfile, deleteProfile };
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

export function useContentInputs(cycleId: string | null) {
  const [inputs, setInputs] = useState<ContentInput[]>([]);

  const fetchInputs = useCallback(async () => {
    if (!cycleId) { setInputs([]); return; }
    const { data } = await supabase
      .from("content_inputs")
      .select("*")
      .eq("cycle_id", cycleId)
      .order("sort_order");
    setInputs((data || []) as ContentInput[]);
  }, [cycleId]);

  useEffect(() => { fetchInputs(); }, [fetchInputs]);

  const addInput = useCallback(async (input: Partial<ContentInput>) => {
    const { error } = await supabase.from("content_inputs").insert(input as any);
    if (error) { toast.error("Error agregando insumo"); return false; }
    fetchInputs();
    return true;
  }, [fetchInputs]);

  const removeInput = useCallback(async (id: string) => {
    const { error } = await supabase.from("content_inputs").delete().eq("id", id);
    if (error) toast.error("Error eliminando insumo");
    else fetchInputs();
  }, [fetchInputs]);

  const updateInput = useCallback(async (id: string, updates: Partial<ContentInput>) => {
    const { error } = await supabase.from("content_inputs").update(updates as any).eq("id", id);
    if (error) { toast.error("Error actualizando insumo"); return false; }
    fetchInputs();
    return true;
  }, [fetchInputs]);

  return { inputs, fetchInputs, addInput, removeInput, updateInput };
}

export function useContentAnalytics(profileId: string | null) {
  const [analytics, setAnalytics] = useState<ContentAnalyticRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!profileId) { setAnalytics([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("content_analytics")
      .select("*")
      .eq("profile_id", profileId)
      .order("published_date", { ascending: false });
    setAnalytics((data || []) as ContentAnalyticRow[]);
    setLoading(false);
  }, [profileId]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const bulkInsert = useCallback(async (rows: Partial<ContentAnalyticRow>[]) => {
    const { error } = await supabase.from("content_analytics").insert(rows as any[]);
    if (error) { toast.error("Error importando datos"); return false; }
    toast.success(`${rows.length} registros importados`);
    fetchAnalytics();
    return true;
  }, [fetchAnalytics]);

  return { analytics, loading, fetchAnalytics, bulkInsert };
}

export function useAdCampaigns(profileId: string | null) {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [performance, setPerformance] = useState<AdPerformanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!profileId) { setCampaigns([]); setPerformance([]); return; }
    setLoading(true);
    const [campRes, perfRes] = await Promise.all([
      supabase.from("ad_campaigns").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }),
      supabase.from("ad_performance").select("*, ad_campaigns!inner(profile_id)").eq("ad_campaigns.profile_id", profileId).order("report_date", { ascending: false }),
    ]);
    setCampaigns((campRes.data || []) as AdCampaign[]);
    setPerformance((perfRes.data || []) as AdPerformanceRow[]);
    setLoading(false);
  }, [profileId]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const importAds = useCallback(async (campaignData: Partial<AdCampaign>, performanceRows: Partial<AdPerformanceRow>[]) => {
    const { data: camp, error: campErr } = await supabase
      .from("ad_campaigns")
      .insert(campaignData as any)
      .select()
      .single();
    if (campErr || !camp) { toast.error("Error creando campaña"); return false; }

    const rows = performanceRows.map(r => ({ ...r, campaign_id: (camp as any).id }));
    const { error: perfErr } = await supabase.from("ad_performance").insert(rows as any[]);
    if (perfErr) { toast.error("Error importando performance"); return false; }

    toast.success(`Campaña importada con ${rows.length} registros`);
    fetchCampaigns();
    return true;
  }, [fetchCampaigns]);

  return { campaigns, performance, loading, fetchCampaigns, importAds };
}
