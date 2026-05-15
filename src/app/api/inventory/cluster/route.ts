import { NextRequest, NextResponse } from 'next/server';
import { groupPhotos } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return NextResponse.json({ error: 'Invalid imageUrls' }, { status: 400 });
    }

    const mediaParts = await Promise.all(
      imageUrls.map(async (url) => {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch image: ${url}`);
        
        const mimeType = resp.headers.get('content-type') || 'image/jpeg';
        const buffer = await resp.arrayBuffer();
        
        return {
          data: Buffer.from(buffer).toString('base64'),
          mimeType
        };
      })
    );

    const result = await groupPhotos(mediaParts);
    
    // Result should already be { clusters: [...] } based on updated groupPhotos prompt
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Clustering API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
