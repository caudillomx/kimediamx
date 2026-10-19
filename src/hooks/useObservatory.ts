import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export function useObservatory(vertical?: string, enabled = true) {
  return useQuery({ queryKey: ['observatory', vertical || 'panorama'], enabled, staleTime: 60000, queryFn: async () => {
    const vq = supabase.from('observatory_verticals').select('*').order('sort_order');
    const sq = supabase.from('observatory_signals').select('*').order('is_reference').order('created_at', { ascending: false }).limit(500);
    const kq = supabase.from('observatory_keywords').select('*');
    const rq = supabase.from('observatory_monitor_runs').select('*').order('started_at', {ascending:false}).limit(50);
    const [v,s,k,r] = await Promise.all([
      vertical ? vq.eq('slug', vertical) : vq,
      vertical ? sq.eq('vertical_slug', vertical) : sq,
      vertical ? kq.eq('vertical_slug', vertical) : kq,
      vertical ? rq.eq('vertical_slug', vertical) : rq,
    ]);
    if(v.error || s.error || k.error || r.error) throw v.error || s.error || k.error || r.error;
    return { verticals: v.data || [], signals: s.data || [], keywords: k.data || [], runs: r.data || [] };
  }});
}