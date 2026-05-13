import { NextRequest, NextResponse } from 'next/server';
import { groupPhotos } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const images = await Promise.all(files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        data: buffer.toString('base64'),
        mimeType: file.type
      };
    }));

    const grouping = await groupPhotos(images);

    return NextResponse.json(grouping);

  } catch (error: any) {
    console.error('Grouping Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
