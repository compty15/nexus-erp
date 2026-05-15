import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase-server';
import { adjustItemMetadata, calculateBurnRate, ModelType } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { itemId, updates, modelType = 'flash' } = body;

    if (!itemId || !updates) {
      return NextResponse.json({ error: 'Missing itemId or updates' }, { status: 400 });
    }

    // 1. Fetch current item from DB
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // 2. AI Adjustment
    const aiResult = await adjustItemMetadata(item, updates, modelType as ModelType);
    const scanCost = calculateBurnRate(modelType as ModelType, aiResult.usage);

    // 3. Merge Data
    const previousCost = item.cost_metadata?.total_scan_cost || 0;
    const newTotalCost = previousCost + scanCost;
    
    const existingMetadata = item.metadata || {};
    const existingHistory = existingMetadata.scan_history || [];
    
    const newHistoryEntry = {
      timestamp: new Date().toISOString(),
      model: `${modelType}-adjustment`,
      data: {
        ...aiResult.data,
        applied_updates: updates
      }
    };
    
    let dbUpdates: any = {
      name: updates.name || aiResult.data.name || item.name,
      brand: updates.brand || aiResult.data.brand || item.brand,
      category: updates.category || aiResult.data.category || item.category,
      weight_raw: updates.weight_raw !== undefined ? updates.weight_raw : (aiResult.data.estimated_weight_lbs || item.weight_raw),
      price_range: updates.price_range || aiResult.data.price_range || item.price_range,
      length_in: updates.length_in !== undefined ? updates.length_in : item.length_in,
      width_in: updates.width_in !== undefined ? updates.width_in : item.width_in,
      height_in: updates.height_in !== undefined ? updates.height_in : item.height_in,
      quantity: updates.quantity !== undefined ? updates.quantity : item.quantity,
      cost_metadata: {
        ...item.cost_metadata,
        last_scan_cost: scanCost,
        total_scan_cost: newTotalCost,
      },
      metadata: {
        ...existingMetadata,
        ...aiResult.data,
        last_model: modelType,
        drafts: aiResult.data.drafts || existingMetadata.drafts,
        scan_history: [...existingHistory, newHistoryEntry]
      },
      updated_at: new Date().toISOString()
    };

    // 4. Update DB
    const { data: updatedItem, error: updateError } = await supabase
      .from('inventory')
      .update(dbUpdates)
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Log Activity
    await supabase.from('activity_logs').insert({
      event_type: 'adjustment',
      severity: 'info',
      message: `Adjusted metadata for ${item.name || 'item'}`,
      metadata: { itemId, updates, cost: scanCost }
    });

    return NextResponse.json({ success: true, item: updatedItem });

  } catch (error: any) {
    console.error('API /adjust Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
