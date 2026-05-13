import { NextRequest, NextResponse } from 'next/server';
import { flashScan, deepDive, calculateBurnRate, ModelType } from '@/lib/gemini';
import { uploadToDrive, getOrCreateFolder } from '@/lib/google-drive';
import { supabase } from '@/lib/supabase';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    const branchId = formData.get('branch_id') as string;
    const requestedModel = formData.get('model') as ModelType || 'flash';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // 1. Create a Background Job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        status: 'processing',
        type: 'inventory_scan',
        payload: { fileCount: files.length, requestedModel }
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Start background processing (do not await)
    processInventoryJob(job.id, files, branchId, requestedModel).catch(async (err) => {
      console.error('Job Processing Failed:', err);
      await supabase.from('jobs').update({ status: 'failed', error: err.message }).eq('id', job.id);
    });

    return NextResponse.json({ success: true, jobId: job.id });

  } catch (error: any) {
    console.error('Scan Request Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Orchestrates the background identification and storage
 */
async function processInventoryJob(jobId: string, files: File[], branchId: string, modelType: ModelType) {
  // Convert files to buffers
  const images = await Promise.all(files.map(async (file) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      buffer,
      data: buffer.toString('base64'),
      mimeType: file.type,
      name: file.name
    };
  }));

  // 1. AI IDENTIFICATION (Flash First)
  const aiResult = await flashScan(images.map(img => ({ data: img.data, mimeType: img.mimeType })));
  const scanCost = calculateBurnRate('flash', aiResult.usage);

  // 2. STORAGE (Google Drive)
  const rootFolderId = await getOrCreateFolder('Nexus Inventory');
  const itemName = aiResult.data.name || 'Unknown Item';
  const itemFolderId = await getOrCreateFolder(itemName, rootFolderId);
  
  const driveFileRefs = await Promise.all(images.map(async (img) => {
    const stream = Readable.from(img.buffer);
    const driveFile = await uploadToDrive(stream, img.name, img.mimeType, itemFolderId);
    return driveFile.id;
  }));

  // 3. DATABASE (Supabase)
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
        total_scan_cost: scanCost, // Cumulative cost
      },
      status: aiResult.data.needs_pro ? 'needs_review' : 'identified',
      metadata: {
        usage: aiResult.usage,
        confidence: aiResult.data.confidence,
        needs_pro: aiResult.data.needs_pro,
        drive_folder_id: itemFolderId
      }
    })
    .select()
    .single();

  if (invError) throw invError;

  // 4. Update Job Status
  await supabase.from('jobs').update({
    status: 'completed',
    result: { itemId: item.id, ai_data: aiResult.data, cost: scanCost }
  }).eq('id', jobId);

  // 5. Activity Log
  await supabase.from('activity_logs').insert({
    event_type: 'inventory_scan_complete',
    severity: 'info',
    message: `Identified ${itemName} (${aiResult.data.confidence * 100}%)`,
    metadata: { itemId: item.id, cost: scanCost }
  });
}
