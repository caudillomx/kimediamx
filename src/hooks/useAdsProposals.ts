import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AdsProposalStatus =
  | "borrador" | "revision" | "aprobado" | "activo" | "pausado" | "cerrado";

export type AdsProposal = {
  id: string;
  client_id: string;
  title: string;
  status: AdsProposalStatus | string;
  platforms: string[];
  business_objective: string | null;
  campaign_objectives: string[] | null;
  budget_total: number | null;
  budget_currency: string | null;
  flight_start: string | null;
  flight_end: string | null;
  target_audience_brief: string | null;
  proposal_data: any | null;
  internal_brief: any | null;
  generated_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useAdsProposals(clientId?: string | null) {
  const [proposals, setProposals] = useState<AdsProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!clientId) { setProposals([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("ads_proposals")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProposals((data || []) as AdsProposal[]);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { refetch(); }, [refetch]);

  const createProposal = useCallback(async (payload: Partial<AdsProposal> & { client_id: string; title: string }) => {
    const { data, error } = await supabase
      .from("ads_proposals")
      .insert({
        client_id: payload.client_id,
        title: payload.title,
        status: payload.status || "borrador",
        platforms: payload.platforms || [],
        business_objective: payload.business_objective ?? null,
        campaign_objectives: payload.campaign_objectives ?? null,
        budget_total: payload.budget_total ?? null,
        budget_currency: payload.budget_currency ?? "MXN",
        flight_start: payload.flight_start ?? null,
        flight_end: payload.flight_end ?? null,
        target_audience_brief: payload.target_audience_brief ?? null,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return null; }
    setProposals(prev => [data as AdsProposal, ...prev]);
    return data as AdsProposal;
  }, []);

  const updateProposal = useCallback(async (id: string, patch: Partial<AdsProposal>) => {
    const prev = proposals;
    setProposals(p => p.map(x => x.id === id ? { ...x, ...patch } as AdsProposal : x));
    const { data, error } = await supabase
      .from("ads_proposals")
      .update(patch as any)
      .eq("id", id)
      .select()
      .single();
    if (error) { toast.error(error.message); setProposals(prev); return null; }
    setProposals(p => p.map(x => x.id === id ? (data as AdsProposal) : x));
    return data as AdsProposal;
  }, [proposals]);

  const deleteProposal = useCallback(async (id: string) => {
    const prev = proposals;
    setProposals(p => p.filter(x => x.id !== id));
    const { error } = await supabase.from("ads_proposals").delete().eq("id", id);
    if (error) { toast.error(error.message); setProposals(prev); }
  }, [proposals]);

  return { proposals, loading, createProposal, updateProposal, deleteProposal, refetch };
}

export async function fetchProposalById(id: string): Promise<AdsProposal | null> {
  const { data, error } = await supabase.from("ads_proposals").select("*").eq("id", id).maybeSingle();
  if (error) { toast.error(error.message); return null; }
  return data as AdsProposal | null;
}

export type AdsPerformance = {
  id: string;
  proposal_id: string | null;
  client_id: string;
  platform: string;
  period_start: string | null;
  period_end: string | null;
  impressions: number | null;
  reach: number | null;
  clicks: number | null;
  conversions: number | null;
  spend: number | null;
  currency: string | null;
  ctr: number | null;
  cpm: number | null;
  cpc: number | null;
  roas: number | null;
  raw_metrics: any | null;
  notes: string | null;
  created_at: string;
};

export async function listProposalPerformance(proposalId: string): Promise<AdsPerformance[]> {
  const { data, error } = await supabase
    .from("ads_proposal_performance")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("period_start", { ascending: false });
  if (error) { toast.error(error.message); return []; }
  return (data || []) as AdsPerformance[];
}

export async function addProposalPerformance(payload: Omit<AdsPerformance, "id" | "created_at">): Promise<AdsPerformance | null> {
  const { data, error } = await supabase
    .from("ads_proposal_performance")
    .insert(payload as any)
    .select()
    .single();
  if (error) { toast.error(error.message); return null; }
  return data as AdsPerformance;
}