import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase-server';
import { flashScan, deepDive, calculateBurnRate, ModelType } from '@/lib/gemini';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { itemId, modelType } = body;

    if (!itemId || !modelType) {
      return NextResponse.json({ error: 'Missing itemId or modelType' }, { status: 400 });
    }

    // 1. Fetch item from DB
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const imageUrls = item.image_refs || [];
    if (imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images available to rescan' }, { status: 400 });
    }

    // 2. Download Images
    const imageParts = await Promise.all(
      imageUrls.map(async (url: string) => {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
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

    // 3. AI Analysis
    let aiResult;
    let scanCost = 0;
    
    if (modelType === 'flash') {
      aiResult = await flashScan(imageParts);
      scanCost = calculateBurnRate('flash', aiResult.usage);
    } else {
      aiResult = await deepDive(imageParts, modelType as ModelType);
      scanCost = calculateBurnRate(modelType as ModelType, aiResult.usage);
    }

    // 4. Merge Data
    const previousCost = item.cost_metadata?.total_scan_cost || 0;
    const newTotalCost = previousCost + scanCost;
    
    const existingMetadata = item.metadata || {};
    const existingHistory = existingMetadata.scan_history || [];
    
    const newHistoryEntry = {
      timestamp: new Date().toISOString(),
      model: modelType,
      data: aiResult.data
    };
    
    let updates: any = {
      cost_metadata: {
        ...item.cost_metadata,
        last_scan_cost: scanCost,
        total_scan_cost: newTotalCost,
      },
      updated_at: new Date().toISOString()
    };

    if (modelType === 'flash') {
      // Flash scan updates core fields
      updates = {
        ...updates,
        name: aiResult.data.name,
        brand: aiResult.data.brand,
        category: aiResult.data.category,
        weight_raw: aiResult.data.estimated_weight_lbs || item.weight_raw,
        price_range: aiResult.data.price_range || item.price_range,
        status: aiResult.data.needs_pro ? 'needs_review' : 'identified',
        metadata: {
          ...existingMetadata,
          confidence: aiResult.data.confidence,
          needs_pro: aiResult.data.needs_pro,
          model_number: aiResult.data.model_number,
          dimensions: aiResult.data.dimensions,
          materials: aiResult.data.materials,
          short_description: aiResult.data.short_description,
          drafts: aiResult.data.drafts || existingMetadata.drafts,
          scan_history: [...existingHistory, newHistoryEntry]
        }
      };
    } else {
      // Pro/Thinking deep dive appends metadata and drafts
      updates = {
        ...updates,
        status: 'identified', // clear needs_review
        metadata: {
          ...existingMetadata,
          needs_pro: false,
          serial_number: aiResult.data.serial_number,
          measurement: aiResult.data.measurement,
          wear_report: aiResult.data.wear_report,
          drafts: aiResult.data.drafts || existingMetadata.drafts,
          scan_history: [...existingHistory, newHistoryEntry]
        }
      };
    }

    // 5. Update DB
    const { data: updatedItem, error: updateError } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 6. Log Activity
    await supabase.from('activity_logs').insert({
      event_type: 'rescan',
      severity: 'info',
      message: `Rescanned ${item.name || 'item'} using ${modelType}`,
      metadata: { itemId, modelType, cost: scanCost }
    });

    return NextResponse.json({ success: true, item: updatedItem });

  } catch (error: any) {
    console.error('API /rescan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
