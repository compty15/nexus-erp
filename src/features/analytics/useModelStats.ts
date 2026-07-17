import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useToggleModelStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelId, isEnabled }: { modelId: string; isEnabled: boolean }) => {
      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_id: modelId, is_enabled: isEnabled }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update model status');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model_stats'] });
    },
  });
}
