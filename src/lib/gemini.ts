import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { supabase } from "./supabase";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Approximate costs per 1k tokens (USD)
const COSTS = {
  "gemini-2.0-flash": { input: 0.0001, output: 0.0004 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.00375 },
  "gemini-2.0-flash-thinking-preview-01-21": { input: 0.0001, output: 0.0004 },
};

export type ModelType = "flash" | "pro" | "thinking";

const MODEL_MAP: Record<ModelType, string> = {
  flash: "gemini-2.0-flash",
  pro: "gemini-1.5-pro",
  thinking: "gemini-2.0-flash-thinking-preview-01-21",
};

/**
 * Updates model statistics in Supabase for burn rate tracking
 */
export async function updateModelStats(model: ModelType, cost: number) {
  const modelId = MODEL_MAP[model];
  
  const { data: stats } = await supabase
    .from('model_stats')
    .select('*')
    .eq('model_id', modelId)
    .single();

  if (!stats) return;

  const newTotalCalls = stats.total_calls + 1;
  const newTotalCost = stats.total_cost + cost;
  const newAvgCost = newTotalCost / newTotalCalls;
  
  const updates: any = {
    total_calls: newTotalCalls,
    total_cost: newTotalCost,
    avg_cost: newAvgCost,
    updated_at: new Date().toISOString(),
  };

  if (cost > stats.all_time_high) updates.all_time_high = cost;
  if (cost < stats.all_time_low || stats.all_time_low === 0) updates.all_time_low = cost;

  await supabase.from('model_stats').update(updates).eq('model_id', modelId);
}

/**
 * Calculates the cost of a scan based on usage metadata
 */
export function calculateBurnRate(model: ModelType, usage: any) {
  const modelId = MODEL_MAP[model] as keyof typeof COSTS;
  const pricing = COSTS[modelId] || COSTS["gemini-2.0-flash"];
  
  const inputCost = (usage.promptTokenCount / 1000) * pricing.input;
  const outputCost = (usage.candidatesTokenCount / 1000) * pricing.output;
  
  const cost = parseFloat((inputCost + outputCost).toFixed(6));
  
  // Track stats in background
  updateModelStats(model, cost).catch(console.error);
  
  return cost;
}

/**
 * Stage 0: Group Photos
 * Uses Gemini Flash to suggest groupings for a batch of images
 */
export async function groupPhotos(images: { data: string; mimeType: string }[]) {
  const model = genAI.getGenerativeModel({ model: MODEL_MAP.flash });
  
  const prompt = `Analyze these images and group them by item. 
  Images are provided in sequence. Return a JSON mapping of item names to image indices.
  Example: { "groups": [ { "name": "Micrometer", "indices": [0, 2] }, { "name": "Lathe", "indices": [1] } ] }`;

  const parts = [
    prompt,
    ...images.map(img => ({ inlineData: img }))
  ];

  const result = await model.generateContent(parts);
  const response = await result.response;
  return JSON.parse(response.text());
}

/**
 * Stage 1: Flash Scan
 * Rapid identification with confidence scoring for escalation
 */
export async function flashScan(images: { data: string; mimeType: string }[]) {
  const model = genAI.getGenerativeModel({ model: MODEL_MAP.flash });
  
  const prompt = `Identify this tool/material based on the provided images. 
  Include a "confidence" score (0.0 to 1.0). If confidence is below 0.8 or critical info is missing, set "needs_pro" to true.
  
  Format as JSON: { 
    "name": "", "category": "", "brand": "", "price_range": {"min": 0, "max": 0}, 
    "condition": "", "confidence": 0.0, "needs_pro": false 
  }`;

  const result = await model.generateContent([
    prompt,
    ...images.map(img => ({ inlineData: img }))
  ]);

  const response = await result.response;
  return {
    data: JSON.parse(response.text()),
    usage: response.usageMetadata
  };
}

/**
 * Stage 2: Deep Dive (OCR & Metrology)
 */
export async function deepDive(images: { data: string; mimeType: string }[]) {
  const model = genAI.getGenerativeModel({ model: MODEL_MAP.pro });
  
  const prompt = `Perform high-precision analysis on these images:
  1. Extract ALL serial numbers.
  2. Interpret any visible metrology readings.
  
  Generate 4 PLATFORM DRAFTS for listing:
  - ebay: Technical, authoritative, keyword-dense.
  - fb: Casual, local pickup focus, benefits-first.
  - etsy: Narrative, artisan/vintage story, aesthetic tags.
  - shopify: Clean, professional, e-commerce formatted.
  
  Format as JSON: { 
    "serial_number": "", 
    "measurement": "", 
    "wear_report": "",
    "drafts": {
      "ebay": { "title": "", "description": "", "specs": "" },
      "fb": { "title": "", "description": "", "specs": "" },
      "etsy": { "title": "", "description": "", "specs": "" },
      "shopify": { "title": "", "description": "", "specs": "" }
    }
  }`;

  const result = await model.generateContent([
    prompt,
    ...images.map(img => ({ inlineData: img }))
  ]);

  const response = await result.response;
  return {
    data: JSON.parse(response.text()),
    usage: response.usageMetadata
  };
}
