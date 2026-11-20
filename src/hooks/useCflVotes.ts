import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export function voterId() {
  const k = "cfl_voter";
  let v = localStorage.getItem(k);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
  return v;
}

/** Conteos en vivo por pregunta (realtime). */
export function useCflVotes() {
  const [rows, setRows] = useState<{ question: string; option: string; n: number; mine: boolean }[]>([]);
  const load = useCallback(async () => {
    const { data } = await db.rpc("cfl_vote_tally", { p_prefix: "", p_voter: localStorage.getItem("cfl_voter") ?? "" });
    setRows(data ?? []);
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => { clearInterval(t); };
  }, [load]);
  const counts = (q: string) => {
    const m: Record<string, number> = {};
    rows.filter((r) => r.question === q).forEach((r) => { m[r.option] = (m[r.option] ?? 0) + Number(r.n); });
    return m;
  };
  const mine = (q: string) => {
    return rows.find((r) => r.question === q && r.mine)?.option ?? null;
  };
  return { counts, mine, reload: load };
}

export async function castVote(question: string, option: string) {
  const voter = voterId();
  const { error } = await db.rpc("cfl_cast_vote", { p_question: question, p_option: option, p_voter: voter });
  return !error;
}

/** Foto del personaje desde Wikipedia (licencias libres). */
const cache = new Map<string, string | null>();
export function useWikiPhoto(title: string) {
  const [src, setSrc] = useState<string | null>(cache.get(title) ?? null);
  useEffect(() => {
    if (cache.has(title)) { setSrc(cache.get(title)!); return; }
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((r) => r.json())
      .then((j) => { const u = j?.thumbnail?.source ?? null; cache.set(title, u); setSrc(u); })
      .catch(() => cache.set(title, null));
  }, [title]);
  return src;
}
