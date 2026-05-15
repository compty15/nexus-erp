import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase-server';
import { extrapolateItemFromText, calculateBurnRate, ModelType } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { jobId, description, branchId, model } = body;

    if (!description) {
      return NextResponse.json({ error: 'No description provided' }, { status: 400 });
    }

    // 1.5 GET NEXT ITEM NUMBER
    const { count } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId);
    
    const itemNumber = (count || 0) + 1;
    const itemCode = `#${itemNumber.toString().padStart(4, '0')}`;

    // 2. DATABASE INSERT
    const { data: item, error: invError } = await supabase
      .from('inventory')
      .insert({
        branch_id: branchId,
        name: aiResult.data.name,
        brand: aiResult.data.brand,
        category: aiResult.data.category,
        price_range: aiResult.data.price_range || { min: 0, max: 0, currency: 'USD' },
        weight_raw: aiResult.data.estimated_weight_lbs || 0,
        image_refs: [], // No images for text-only extrapolation yet
        cost_metadata: {
          last_scan_cost: scanCost,
          total_scan_cost: scanCost,
        },
        status: aiResult.data.needs_pro ? 'needs_review' : 'identified',
        metadata: {
          item_code: itemCode,
          last_model: model,
          input_description: description,
          usage: aiResult.usage,
          confidence: aiResult.data.confidence,
          needs_pro: aiResult.data.needs_pro,
          drafts: aiResult.data.drafts || {},
          scan_history: [{
            timestamp: new Date().toISOString(),
            model: model || 'gemini-2.5-flash',
            data: aiResult.data
          }]
        }
      })
      .select()
      .single();

    if (invError) throw invError;

    // 3. Update Job Status
    const resultPayload = { itemId: item.id, ai_data: aiResult.data, cost: scanCost };
    await supabase.from('jobs').update({
      status: 'completed',
      result: resultPayload
    }).eq('id', jobId);

    return NextResponse.json(resultPayload);

  } catch (error: any) {
    console.error('API /extrapolate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
