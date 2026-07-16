import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 60; // Allow up to 60 seconds for AI processing (Vercel hobby max is 60s for standard Edge, but we use HTTP streaming so we bypass basic limits, this just ensures the container stays alive)

export async function POST(req: Request) {
  try {
    const { imageBase64, userContext } = await req.json();

    if (!imageBase64) {
      return new Response('No image provided', { status: 400 });
    }

    // Convert base64 string back to Uint8Array for the AI SDK
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await streamObject({
      // We use Gemini 1.5 Pro since it has the most advanced multimodal capabilities for complex items
      model: google('gemini-1.5-pro-latest'),
      schema: z.object({
        scientific: z.object({
          year: z.string().describe('The specific year, a year range (e.g. 1980-1985), or "Unknown" if it absolutely cannot be determined without guessing.'),
          material: z.string().describe('The primary materials this item is made of.'),
          specs: z.string().describe('Technical specifications, dimensions, or technical details.'),
        }),
        ebay: z.object({
          title: z.string().describe('An SEO-optimized title for eBay (max 80 chars).'),
          description: z.string().describe('A detailed eBay description highlighting condition, use cases, and specs for quick sales.'),
        }),
        etsy: z.object({
          title: z.string().describe('An aesthetic, descriptive title for Etsy.'),
          description: z.string().describe('A description focused on vintage appeal, industrial decor, or craft utility.'),
        }),
        facebook: z.object({
          title: z.string().describe('A casual, local-friendly title.'),
          description: z.string().describe('A casual description optimized for local pickup/sale, getting straight to the point.'),
        }),
        estimated_value: z.string().describe('An estimated monetary value or value range in USD (e.g. "$150 - $200"). Do your best to estimate based on current market trends for similar items.'),
        item_name: z.string().describe('A short, generic name for the item to save as the primary Title in the database.')
      }),
      messages: [
        {
          role: 'system',
          content: 'You are an elite enterprise ERP inventory analyzer and expert appraiser. Analyze the provided image of the item with intense scrutiny. Do not guess years if you are unsure; use a range or say Unknown. Be accurate. You must provide valuations based on the current market.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Please analyze this item. Additional context from the user: "${userContext || 'None'}"` },
            { type: 'image', image: buffer },
          ],
        },
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return new Response('Failed to analyze image', { status: 500 });
  }
}
