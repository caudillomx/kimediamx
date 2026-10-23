import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FOX_SESSION, foxQuestion } from '@/data/centroFoxSession';
type Row = { question: string; option: string; voter: string };
const db = supabase as any;
function foxVoter() {
  const key = `${FOX_SESSION}:voter`;
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID(); localStorage.setItem(key, id); return id;
}
export async function castFoxVote(key: string, option: string) {
  const { error } = await db.from('cfl_votes').upsert({ question: foxQuestion(key), option, voter: foxVoter() }, { onConflict: 'question,voter' });
  return !error;
}
export function useFoxVotes() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(false);
  const reload = useCallback(async () => {
    const { data, error: e } = await db.from('cfl_votes').select('question,option,voter').like('question', `${FOX_SESSION}:%`).limit(1000);
    setError(Boolean(e)); if (!e) setRows(data ?? []);
  }, []);
  useEffect(() => {
    reload(); const timer = setInterval(reload, 8000);
    const channel = supabase.channel('centro-fox-votes').on('postgres_changes', { event: '*', schema: 'public', table: 'cfl_votes', filter: `question=like.${FOX_SESSION}:%` }, reload).subscribe();
    return () => { clearInterval(timer); supabase.removeChannel(channel); };
  }, [reload]);
  const counts = (key: string) => rows.filter(r => r.question === foxQuestion(key)).reduce<Record<string, number>>((m, r) => { m[r.option] = (m[r.option] ?? 0) + 1; return m; }, {});
  const mine = (key: string) => rows.find(r => r.question === foxQuestion(key) && r.voter === localStorage.getItem(`${FOX_SESSION}:voter`))?.option;
  return { counts, mine, reload, error };
}