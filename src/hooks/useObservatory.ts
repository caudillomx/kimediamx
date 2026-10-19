import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export function useObservatory() {
  return useQuery({ queryKey: ['observatory'], staleTime: 60000, queryFn: async () => {
    const [v,s,k] = await Promise.all([
      supabase.from('observatory_verticals').select('*').order('sort_order'),
      supabase.from('observatory_signals').select('*').order('relevance', { ascending: false }).limit(500),
      supabase.from('observatory_keywords').select('*'),
    ]);
    if(v.error || s.error || k.error) throw v.error || s.error || k.error;
    return { verticals: v.data || [], signals: s.data || [], keywords: k.data || [] };
  }});
}