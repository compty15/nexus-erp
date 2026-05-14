import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { InventoryItem, InventoryItemSchema } from '@/shared/api/schema';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // We don't strictly parse through Zod here to avoid crashing the whole UI 
      // if one row is bad, but we could filter bad rows in a production app.
      return data as InventoryItem[];
    },
  });
}

export function useMarkAsSold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryItem> }) => {
      const { error } = await supabase
        .from('inventory')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory')
        .update({ status: 'deleted' })
        .eq('id', id);

      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useRemoveImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl: string }) => {
      const { data: item, error: fetchError } = await supabase
        .from('inventory')
        .select('image_refs')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const newRefs = (item.image_refs || []).filter((url: string) => url !== imageUrl);
      
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ image_refs: newRefs })
        .eq('id', id);
        
      if (updateError) throw updateError;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
