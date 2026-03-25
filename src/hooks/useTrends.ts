import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TrendKeyword = {
  id: string;
  profile_id: string;
  keyword: string;
  source: string;
  is_active: boolean;
  created_at: string;
};

export type TrendResult = {
  id: string;
  profile_id: string;
  cycle_id: string | null;
  keyword: string;
  title: string | null;
  url: string | null;
  source_type: string;
  summary: string | null;
  relevance_score: number;
  raw_data: any;
  searched_at: string;
  created_at: string;
};

export function useTrendKeywords(profileId: string | null) {
  const [keywords, setKeywords] = useState<TrendKeyword[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKeywords = useCallback(async () => {
    if (!profileId) { setKeywords([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("client_trend_keywords")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_active", true)
      .order("created_at");
    if (error) console.error("Error fetching keywords:", error);
    else setKeywords((data || []) as TrendKeyword[]);
    setLoading(false);
  }, [profileId]);

  useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

  const addKeyword = useCallback(async (keyword: string, source = "manual") => {
    if (!profileId) return false;
    const { error } = await supabase.from("client_trend_keywords").insert({
      profile_id: profileId, keyword: keyword.trim(), source,
    } as any);
    if (error) { toast.error("Error agregando keyword"); return false; }
    fetchKeywords();
    return true;
  }, [profileId, fetchKeywords]);

  const removeKeyword = useCallback(async (id: string) => {
    const { error } = await supabase.from("client_trend_keywords").delete().eq("id", id);
    if (error) toast.error("Error eliminando keyword");
    else fetchKeywords();
  }, [fetchKeywords]);

  const bulkAddKeywords = useCallback(async (kws: string[], source = "ai_suggested") => {
    if (!profileId || kws.length === 0) return;
    const rows = kws.map(k => ({ profile_id: profileId, keyword: k.trim(), source }));
    const { error } = await supabase.from("client_trend_keywords").insert(rows as any[]);
    if (error) toast.error("Error agregando keywords");
    else fetchKeywords();
  }, [profileId, fetchKeywords]);

  return { keywords, loading, fetchKeywords, addKeyword, removeKeyword, bulkAddKeywords };
}

export function useTrendResults(profileId: string | null) {
  const [results, setResults] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [researching, setResearching] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!profileId) { setResults([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("client_trend_results")
      .select("*")
      .eq("profile_id", profileId)
      .order("searched_at", { ascending: false })
      .limit(50);
    if (error) console.error("Error fetching trend results:", error);
    else setResults((data || []) as TrendResult[]);
    setLoading(false);
  }, [profileId]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const research = useCallback(async (
    keywords: string[],
    opts: { industry?: string; networks?: string[]; profileName?: string; cycleId?: string | null }
  ) => {
    if (!profileId || keywords.length === 0) return false;
    setResearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("research-trends", {
        body: {
          keywords,
          industry: opts.industry,
          networks: opts.networks,
          profile_name: opts.profileName,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Error en la investigación");

      const rows = (data.results || []).map((r: any) => ({
        profile_id: profileId,
        cycle_id: opts.cycleId || null,
        keyword: r.keyword,
        title: r.title,
        url: r.url,
        source_type: r.source_type,
        summary: r.summary,
        relevance_score: r.relevance_score,
        raw_data: r.raw_data,
        searched_at: new Date().toISOString(),
      }));

      if (rows.length > 0) {
        const { error: insertErr } = await supabase
          .from("client_trend_results")
          .insert(rows as any[]);
        if (insertErr) console.error("Error saving results:", insertErr);
      }

      toast.success(`${data.total} tendencias encontradas para ${keywords.length} keywords`);
      fetchResults();
      return true;
    } catch (e: any) {
      toast.error(e.message || "Error investigando tendencias");
      return false;
    } finally {
      setResearching(false);
    }
  }, [profileId, fetchResults]);

  const clearResults = useCallback(async () => {
    if (!profileId) return;
    await supabase.from("client_trend_results").delete().eq("profile_id", profileId);
    fetchResults();
  }, [profileId, fetchResults]);

  return { results, loading, researching, fetchResults, research, clearResults };
}
