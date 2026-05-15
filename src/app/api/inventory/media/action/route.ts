import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { action, sourceItemId, selectedPhotos, targetItemId, branchId } = await req.json();

    if (!action || !sourceItemId || !selectedPhotos || selectedPhotos.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch source item
    const { data: sourceItem, error: sourceError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', sourceItemId)
      .single();

    if (sourceError || !sourceItem) throw new Error('Source item not found');

    const remainingPhotos = sourceItem.image_refs.filter((url: string) => !selectedPhotos.includes(url));

    if (action === 'DELETE') {
      // Just update source item
      const { error } = await supabase
        .from('inventory')
        .update({ image_refs: remainingPhotos })
        .eq('id', sourceItemId);
      
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Photos deleted' });
    }

    if (action === 'MERGE') {
      if (!targetItemId) throw new Error('Target item ID required for merge');

      // Fetch target item
      const { data: targetItem, error: targetError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', targetItemId)
        .single();

      if (targetError || !targetItem) throw new Error('Target item not found');

      const updatedTargetPhotos = [...targetItem.image_refs, ...selectedPhotos];

      // Update both
      await supabase.from('inventory').update({ image_refs: remainingPhotos }).eq('id', sourceItemId);
      const { data: finalItem, error: mergeError } = await supabase
        .from('inventory')
        .update({ image_refs: updatedTargetPhotos })
        .eq('id', targetItemId)
        .select()
        .single();

      if (mergeError) throw mergeError;

      return NextResponse.json({ success: true, item: finalItem, message: 'Photos merged' });
    }

    if (action === 'SPLIT') {
      if (!branchId) throw new Error('Branch ID required for split');

      // 1. Get next item number
      const { count } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId);
      
      const itemNumber = (count || 0) + 1;
      const itemCode = `#${itemNumber.toString().padStart(4, '0')}`;

      // 2. Create new item (Draft)
      const { data: newItem, error: splitError } = await supabase
        .from('inventory')
        .insert({
          branch_id: branchId,
          name: `Split from ${sourceItem.name || 'Item'}`,
          status: 'draft',
          image_refs: selectedPhotos,
          metadata: { 
            item_code: itemCode,
            is_split: true,
            source_item_id: sourceItemId
          }
        })
        .select()
        .single();

      if (splitError) throw splitError;

      // 3. Remove from source
      await supabase.from('inventory').update({ image_refs: remainingPhotos }).eq('id', sourceItemId);

      return NextResponse.json({ success: true, newItem, message: 'Item split successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Media Action Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
