import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return NextResponse.json({ error: 'Invalid imageUrls' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an inventory specialist. I am giving you a list of image URLs.
      Identify which images belong to the same physical item.
      
      Return a JSON array of groups. Each group should have:
      - "item_name": A short descriptive name for the item.
      - "indices": An array of numbers corresponding to the index of the image in the input list.
      
      Example Input: [url0, url1, url2]
      Example Output: [{"item_name": "Digital Micrometer", "indices": [0, 1]}, {"item_name": "Calipers", "indices": [2]}]
      
      CRITICAL: Return ONLY valid JSON. No markdown blocks.
    `;

    const mediaParts = await Promise.all(
      imageUrls.map(async (url) => {
        const resp = await fetch(url);
        const buffer = await resp.arrayBuffer();
        return {
          inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType: 'image/jpeg'
          }
        };
      })
    );

    const result = await model.generateContent([prompt, ...mediaParts]);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const clusters = JSON.parse(text);

    return NextResponse.json({ clusters });

  } catch (error: any) {
    console.error('Clustering Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
