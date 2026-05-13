import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/shared/lib/supabase';
import { flashScan, calculateBurnRate } from '@/lib/gemini';
import { uploadToDrive, getOrCreateFolder } from '@/lib/google-drive';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, images, branchId, model } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // 1. AI IDENTIFICATION
    // We run the AI scan first because it's the most likely to fail or timeout.
    // If it fails, we don't pollute Google Drive with unidentified folders.
    const aiResult = await flashScan(images.map((img: any) => ({ 
      data: img.data, 
      mimeType: img.mimeType 
    })));
    
    const scanCost = calculateBurnRate('flash', aiResult.usage);

    // 2. STORAGE (Google Drive)
    const rootFolderId = await getOrCreateFolder('Nexus Inventory');
    const itemName = aiResult.data.name || 'Unknown Item';
    const itemFolderId = await getOrCreateFolder(itemName, rootFolderId);
    
    const driveFileRefs = await Promise.all(images.map(async (img: any) => {
      const buffer = Buffer.from(img.data, 'base64');
      const stream = Readable.from(buffer);
      const driveFile = await uploadToDrive(stream, img.name, img.mimeType, itemFolderId);
      return driveFile.id;
    }));

    // 3. DATABASE INSERT
    const { data: item, error: invError } = await supabase
      .from('inventory')
      .insert({
        branch_id: branchId,
        name: aiResult.data.name,
        brand: aiResult.data.brand,
        category: aiResult.data.category,
        price_range: aiResult.data.price_range || { min: 0, max: 0, currency: 'USD' },
        image_refs: driveFileRefs,
        cost_metadata: {
          last_scan_cost: scanCost,
          total_scan_cost: scanCost,
        },
        status: aiResult.data.needs_pro ? 'needs_review' : 'identified',
        metadata: {
          usage: aiResult.usage,
          confidence: aiResult.data.confidence,
          needs_pro: aiResult.data.needs_pro,
          drive_folder_id: itemFolderId,
          drafts: aiResult.data.drafts || {}
        }
      })
      .select()
      .single();

    if (invError) throw invError;

    // 4. Update Job Status on Server (Client also does this, but server ensures it)
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
