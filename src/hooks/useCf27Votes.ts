import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CF27, cf27Key } from '@/data/centroFox2027';
type Row = { question: string; option: string; n: number; mine: boolean };
const db = supabase as any;
const VOTER_KEY = `${CF27}:voter`;
export function cf27Voter() {
  const existing = localStorage.getItem(VOTER_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID(); localStorage.setItem(VOTER_KEY, id); return id;
}
export async function castCf27Vote(id: string, option: string) {
  const { error } = await db.rpc('cfl_cast_vote', { p_question: cf27Key(id), p_option: option, p_voter: cf27Voter() });
  return !error;
}
export function useCf27Votes() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reload = useCallback(async () => {
    const { data, error: e } = await db.rpc('cfl_vote_tally', { p_prefix: `${CF27}:`, p_voter: localStorage.getItem(VOTER_KEY) ?? '' });
    setError(Boolean(e)); if (!e) setRows(data ?? []); setLoaded(true);
  }, []);
  useEffect(() => {
    reload(); const timer = setInterval(reload, 3000);
    return () => clearInterval(timer);
  }, [reload]);
  const counts = useCallback((id: string) => rows.filter(r => r.question === cf27Key(id)).reduce<Record<string, number>>((m, r) => { m[r.option] = (m[r.option] ?? 0) + Number(r.n); return m; }, {}), [rows]);
  const mine = (id: string) => rows.find(r => r.question === cf27Key(id) && r.mine)?.option;
  return { counts, mine, reload, error, loaded };
}
