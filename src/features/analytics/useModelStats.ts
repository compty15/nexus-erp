import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';

export function useModelStats() {
  return useQuery({
    queryKey: ['model_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_stats')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds for live burn rate
  });
}
