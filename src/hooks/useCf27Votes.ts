import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CF27, cf27Key } from '@/data/centroFox2027';
type Row = { question: string; option: string; voter: string };
const db = supabase as any;
const VOTER_KEY = `${CF27}:voter`;
export function cf27Voter() {
  const existing = localStorage.getItem(VOTER_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID(); localStorage.setItem(VOTER_KEY, id); return id;
}
export async function castCf27Vote(id: string, option: string) {
  const { error } = await db.from('cfl_votes').upsert({ question: cf27Key(id), option, voter: cf27Voter() }, { onConflict: 'question,voter' });
  return !error;
}
export function useCf27Votes() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reload = useCallback(async () => {
    const { data, error: e } = await db.from('cfl_votes').select('question,option,voter').like('question', `${CF27}:%`).limit(5000);
    setError(Boolean(e)); if (!e) setRows(data ?? []); setLoaded(true);
  }, []);
  useEffect(() => {
    reload(); const timer = setInterval(reload, 6000);
    const channel = supabase.channel(`cf27-votes-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'cfl_votes' }, reload).subscribe();
    return () => { clearInterval(timer); supabase.removeChannel(channel); };
  }, [reload]);
  const counts = useCallback((id: string) => rows.filter(r => r.question === cf27Key(id)).reduce<Record<string, number>>((m, r) => { m[r.option] = (m[r.option] ?? 0) + 1; return m; }, {}), [rows]);
  const mine = (id: string) => rows.find(r => r.question === cf27Key(id) && r.voter === localStorage.getItem(VOTER_KEY))?.option;
  return { counts, mine, reload, error, loaded };
}
