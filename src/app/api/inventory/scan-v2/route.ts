import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase-server';
import { flashScan, calculateBurnRate, ModelType } from '@/lib/gemini';

// 🚀 Standard Node.js runtime for better stability with large images and long AI calls
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { jobId, imageUrls, branchId, modelType = 'pro-1.5' } = body;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // 1. FETCH FROM SUPABASE STORAGE
    const mediaParts = await Promise.all(
      imageUrls.map(async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch media from ${url}`);
        const arrayBuffer = await res.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        return {
          data: base64Data,
          mimeType: res.headers.get('content-type') || 'application/octet-stream',
        };
      })
    );

    // 2. AI ANALYSIS
    const aiResult = await flashScan(mediaParts, (modelType as ModelType));
    const scanCost = calculateBurnRate((modelType as ModelType), aiResult.usage);

    // 2.5 GET NEXT ITEM NUMBER
    const { count } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId);
    
    const itemNumber = (count || 0) + 1;
    const itemCode = `#${itemNumber.toString().padStart(4, '0')}`;

    // 3. DATABASE INSERT
    const { data: item, error: invError } = await supabase
      .from('inventory')
      .insert({
        branch_id: branchId,
        name: aiResult.data.name,
        brand: aiResult.data.brand,
        category: aiResult.data.category,
        price_range: aiResult.data.price_range || { min: 0, max: 0, currency: 'USD' },
        weight_raw: aiResult.data.estimated_weight_lbs || 0,
        image_refs: imageUrls,
        cost_metadata: {
          last_scan_cost: scanCost,
          total_scan_cost: scanCost,
        },
        status: (aiResult.data.needs_pro || aiResult.data.multiple_items_detected) ? 'needs_review' : 'identified',
        metadata: {
          ...aiResult.data,
          item_code: itemCode,
          last_model: modelType,
          scan_history: [{
            timestamp: new Date().toISOString(),
            model: modelType,
            data: aiResult.data
          }]
        },
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (invError) throw invError;

    // 4. Update Job Status
    const resultPayload = { itemId: item.id, ai_data: aiResult.data, cost: scanCost };
    await supabase.from('jobs').update({
      status: 'completed',
      result: resultPayload
    }).eq('id', jobId);

    return NextResponse.json(resultPayload);

  } catch (error: any) {
    console.error('API /scan-v2 Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
