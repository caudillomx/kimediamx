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
  const [rows, setRows] = useState<{ question: string; option: string; voter: string }[]>([]);
  const load = useCallback(async () => {
    const { data } = await db.from("cfl_votes").select("question, option, voter").limit(5000);
    setRows(data ?? []);
  }, []);
  useEffect(() => {
    load();
    const ch = supabase.channel("cfl_votes_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "cfl_votes" }, () => load())
      .subscribe();
    const t = setInterval(load, 8000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, [load]);
  const counts = (q: string) => {
    const m: Record<string, number> = {};
    rows.filter((r) => r.question === q).forEach((r) => { m[r.option] = (m[r.option] ?? 0) + 1; });
    return m;
  };
  const mine = (q: string) => {
    const id = localStorage.getItem("cfl_voter");
    return rows.find((r) => r.question === q && r.voter === id)?.option ?? null;
  };
  return { counts, mine, reload: load };
}

export async function castVote(question: string, option: string) {
  const voter = voterId();
  const { error } = await db.from("cfl_votes").upsert({ question, option, voter }, { onConflict: "question,voter" });
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
