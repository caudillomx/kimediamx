import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Team } from '@/data/taller2027';
const db = supabase as any;
const TOKEN = 'cf27:team-token';
const COLS = 'id,nombre,estado,municipio,integrantes,ex1,ex2,ex3,ex4,created_at';
export const teamToken = () => { let t = localStorage.getItem(TOKEN); if (!t) { t = crypto.randomUUID().replace(/-/g, ''); localStorage.setItem(TOKEN, t); } return t; };
export const myTeamId = () => localStorage.getItem('cf27:team-id');
export async function registerTeam(f: { nombre: string; estado: string; municipio: string; integrantes: number }) {
  const { data, error } = await db.rpc('cf27_register_team', { p_token: teamToken(), p_nombre: f.nombre, p_estado: f.estado, p_municipio: f.municipio, p_integrantes: f.integrantes });
  if (!error && data) localStorage.setItem('cf27:team-id', data);
  return error ? null : (data as string);
}
export async function saveExercise(ex: 1 | 2 | 3 | 4, data: object) {
  const { error } = await db.rpc('cf27_save_exercise', { p_token: teamToken(), p_ex: ex, p_data: data });
  return !error;
}
export function useCf27Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loaded, setLoaded] = useState(false);
  const reload = useCallback(async () => {
    const { data, error } = await db.from('cf27_teams').select(COLS).order('created_at').limit(200);
    if (!error) setTeams(data ?? []); setLoaded(true);
  }, []);
  useEffect(() => {
    reload(); const t = setInterval(reload, 8000);
    const ch = supabase.channel('cf27-teams').on('postgres_changes', { event: '*', schema: 'public', table: 'cf27_teams' }, reload).subscribe();
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, [reload]);
  return { teams, loaded, reload };
}
