import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase-server';
import { flashScan, calculateBurnRate } from '@/lib/gemini';

// 🚀 Key Architecture Change: EDGE RUNTIME
// Bypasses the Vercel 10-second Node.js timeout limit.
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { jobId, imageUrls, branchId, model } = body;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // 1. FETCH FROM SUPABASE STORAGE
    // We get the raw bytes from the public URLs to feed to Gemini
    const imageParts = await Promise.all(
      imageUrls.map(async (url: string) => {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        // Convert to base64 for Gemini API inlineData
        const base64Data = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return {
          data: base64Data,
          mimeType: res.headers.get('content-type') || 'image/jpeg',
        };
      })
    );

    // 2. AI IDENTIFICATION
    const aiResult = await flashScan(imageParts);
    const scanCost = calculateBurnRate('flash', aiResult.usage);

    // 3. DATABASE INSERT
    // Note: We use the Supabase Storage URLs (imageUrls) instead of Drive IDs
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
        status: aiResult.data.needs_pro ? 'needs_review' : 'identified',
        metadata: {
          usage: aiResult.usage,
          confidence: aiResult.data.confidence,
          needs_pro: aiResult.data.needs_pro,
          drafts: aiResult.data.drafts || {},
          scan_history: [{
            timestamp: new Date().toISOString(),
            model: 'gemini-2.5-flash',
            data: aiResult.data
          }]
        }
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
