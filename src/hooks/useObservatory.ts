import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export function useObservatory() {
  return useQuery({ queryKey: ['observatory'], staleTime: 60000, queryFn: async () => {
    const [v,s,k,r] = await Promise.all([
      supabase.from('observatory_verticals').select('*').order('sort_order'),
      supabase.from('observatory_signals').select('*').order('is_reference').order('created_at', { ascending: false }).limit(500),
      supabase.from('observatory_keywords').select('*'),
      supabase.from('observatory_monitor_runs').select('*').order('started_at', {ascending:false}).limit(50),
    ]);
    if(v.error || s.error || k.error || r.error) throw v.error || s.error || k.error || r.error;
    return { verticals: v.data || [], signals: s.data || [], keywords: k.data || [], runs: r.data || [] };
  }});
}