import { NextRequest, NextResponse } from 'next/server';
import { groupPhotos, fetchImageWithRetry } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return NextResponse.json({ error: 'Invalid imageUrls' }, { status: 400 });
    }

    const fetchResults = await Promise.all(
      imageUrls.map(async (url, idx) => {
        const resp = await fetchImageWithRetry(url);
        if (!resp) return null;
        
        const mimeType = resp.headers.get('content-type') || 'image/jpeg';
        const buffer = await resp.arrayBuffer();
        
        return {
          data: Buffer.from(buffer).toString('base64'),
          mimeType,
          originalIndex: idx
        };
      })
    );

    const mediaParts: { data: string; mimeType: string }[] = [];
    const indexMapping: number[] = [];

    for (const res of fetchResults) {
      if (res) {
        mediaParts.push({ data: res.data, mimeType: res.mimeType });
        indexMapping.push(res.originalIndex);
      }
    }

    if (mediaParts.length === 0) {
      return NextResponse.json({ error: 'All images failed to download.' }, { status: 500 });
    }

    const result = await groupPhotos(mediaParts);
    
    // Map Gemini indices back to original indices
    if (result && Array.isArray(result.clusters)) {
      result.clusters = result.clusters.map((c: any) => ({
        item_name: c.item_name,
        indices: c.indices.map((idx: number) => indexMapping[idx]).filter((idx: number) => idx !== undefined)
      }));
    }
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Clustering API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
