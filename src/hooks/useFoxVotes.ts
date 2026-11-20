import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FOX_SESSION, foxQuestion } from '@/data/centroFoxSession';
type Row = { question: string; option: string; n: number; mine: boolean };
const db = supabase as any;
function foxVoter() {
  const key = `${FOX_SESSION}:voter`;
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID(); localStorage.setItem(key, id); return id;
}
export async function castFoxVote(key: string, option: string) {
  const { error } = await db.rpc('cfl_cast_vote', { p_question: foxQuestion(key), p_option: option, p_voter: foxVoter() });
  return !error;
}
export function useFoxVotes() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(false);
  const reload = useCallback(async () => {
    const { data, error: e } = await db.rpc('cfl_vote_tally', { p_prefix: `${FOX_SESSION}:`, p_voter: localStorage.getItem(`${FOX_SESSION}:voter`) ?? '' });
    setError(Boolean(e)); if (!e) setRows(data ?? []);
  }, []);
  useEffect(() => {
    reload(); const timer = setInterval(reload, 3000);
    return () => clearInterval(timer);
  }, [reload]);
  const counts = (key: string) => rows.filter(r => r.question === foxQuestion(key)).reduce<Record<string, number>>((m, r) => { m[r.option] = (m[r.option] ?? 0) + Number(r.n); return m; }, {});
  const mine = (key: string) => rows.find(r => r.question === foxQuestion(key) && r.mine)?.option;
  return { counts, mine, reload, error };
}