import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { supabase } from "@/shared/lib/supabase";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const COSTS = {
  "gemini-flash-latest": { input: 0.000075, output: 0.0003 },
  "gemini-2.5-flash": { input: 0.0001, output: 0.0004 },
  "gemini-3.5-flash": { input: 0.0001, output: 0.0004 },
  "gemini-pro-latest": { input: 0.00125, output: 0.00375 },
  "gemini-2.5-pro": { input: 0.00125, output: 0.00375 },
  "gemini-3.1-pro-preview": { input: 0.00125, output: 0.00375 },
};

export type ModelType = "flash-1.5" | "flash" | "flash-3.5" | "pro-1.5" | "pro-2.5" | "pro-3.1";

const MODEL_MAP: Record<ModelType, string> = {
  "flash-1.5": "gemini-flash-latest",
  "flash": "gemini-2.5-flash",
  "flash-3.5": "gemini-3.5-flash",
  "pro-1.5": "gemini-pro-latest",
  "pro-2.5": "gemini-2.5-pro",
  "pro-3.1": "gemini-3.1-pro-preview",
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

/**
 * Robust JSON parsing that handles Gemini markdown code blocks
 */
function safeParseJSON(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Failed to parse Gemini JSON:', text);
    throw new Error('Intelligence Engine returned malformed data.');
  }
}

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
  const pricing = COSTS[modelId] || COSTS["gemini-2.5-flash"];
  
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
  const model = genAI.getGenerativeModel({ 
    model: MODEL_MAP.flash,
    generationConfig: { responseMimeType: "application/json" },
    safetySettings: SAFETY_SETTINGS
  });
  
  const prompt = `CRITICAL MISSION: You are an expert inventory auditor. Your task is to CLUSTER these images by individual physical item.
  
  EACH PHYSICAL ITEM MUST HAVE ITS OWN CLUSTER. 
  
  STRICT AUDIT RULES:
  1. DO NOT group different items together. If an image shows a new object, start a NEW cluster immediately.
  2. LOOK FOR TRANSITIONS: A change in background, a change in tool type (e.g., from a wrench to a micrometer), or a change in packaging indicates a NEW ITEM.
  3. ISOLATION OVER GROUPING: It is a FAILURE to combine distinct items. It is acceptable to have many small clusters.
  4. IDENTIFY DUPLICATES: If multiple images show the EXACT same physical unit from different angles, group them.
  5. LABEL RECOGNITION: Different serial numbers or model labels mean DIFFERENT items.
  6. BACKGROUND CUES: If the surface or setting changes, it is almost certainly a different item.
  
  Return a JSON object with a "clusters" key containing an array of groups.
  Each group should have:
  - "item_name": A specific descriptive name (e.g., "Starrett Micrometer #1", "Caliper in Wood Box").
  - "indices": An array of numbers corresponding to the 0-indexed position of the images.
  
  Example: { "clusters": [ { "item_name": "Micrometer A", "indices": [0, 2] }, { "item_name": "Wrench B", "indices": [1] } ] }`;

  const parts = [
    prompt,
    ...images.map(img => ({ inlineData: img }))
  ];

  const result = await model.generateContent(parts);
  const response = await result.response;
  return safeParseJSON(response.text());
}

/**
 * Stage 1: Flash Scan
 * Rapid identification with deeper initial metadata extraction
 */
export async function flashScan(images: { data: string; mimeType: string }[], modelType: ModelType = "flash-1.5") {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_MAP[modelType],
    generationConfig: { responseMimeType: "application/json" },
    safetySettings: SAFETY_SETTINGS
  });
  
  const prompt = `Perform a detailed analysis of this item based on the provided media.
  
  CRITICAL: If the provided images appear to contain MULTIPLE DISTINCT ITEMS (e.g., a hammer AND a wrench), set "multiple_items_detected" to true.
  
  Extract deep metadata. Generate 4 PLATFORM DRAFTS: ebay, fb, etsy, and shopify.
  Include a "confidence" score (0.0 to 1.0). If confidence is below 0.8, set "needs_pro" to true.
  Estimate weight in lbs and size in inches.
  
  Format as JSON: { 
    "name": "", 
    "category": "", 
    "brand": "", 
    "model_number": "",
    "quantity": 1,
    "multiple_items_detected": false,
    "short_description": "",
    "dimensions": "",
    "estimated_weight_lbs": 0.0,
    "materials": "",
    "price_range": {"min": 0, "max": 0}, 
    "condition": "", 
    "confidence": 0.0, 
    "needs_pro": false,
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
    data: safeParseJSON(response.text()),
    usage: response.usageMetadata
  };
}

/**
 * Stage 2: Deep Dive (OCR & Metrology)
 */
export async function deepDive(images: { data: string; mimeType: string }[], modelType: ModelType = "pro-1.5") {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_MAP[modelType],
    generationConfig: { responseMimeType: "application/json" },
    safetySettings: SAFETY_SETTINGS
  });
  
  const prompt = `Perform high-precision analysis on this media:
  1. Extract ALL serial numbers, model names, and technical specs.
  2. Interpret any visible metrology readings or data tables (especially from PDFs).
  3. If video, report on the mechanical state or functional integrity.
  
  Generate 4 PLATFORM DRAFTS for listing:
  - ebay: Technical, authoritative, keyword-dense.
  - fb: Casual, local pickup focus, benefits-first.
  - etsy: Narrative, artisan/vintage story, aesthetic tags.
  - shopify: Clean, professional, e-commerce formatted.
  
  Format as JSON: { 
    "name": "", 
    "brand": "", 
    "category": "", 
    "quantity": 1,
    "price_range": {"min": 0, "max": 0}, 
    "estimated_weight_lbs": 0.0,
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
    data: safeParseJSON(response.text()),
    usage: response.usageMetadata
  };
}

/**
 * Stage 3: Text Extrapolation
 * Creates a structured item record from raw text description.
 */
export async function extrapolateItemFromText(description: string, modelType: ModelType = "flash") {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_MAP[modelType],
    generationConfig: { responseMimeType: "application/json" },
    safetySettings: SAFETY_SETTINGS
  });
  
  const prompt = `Perform a detailed analysis of this item based on the provided text description.
  Extrapolate and generate structured metadata.
  Generate 4 PLATFORM DRAFTS for listing: ebay, fb, etsy, and shopify.
  Include a "confidence" score (0.0 to 1.0) based on how detailed the input text is.
  Estimate the physical weight in lbs and size in inches based on common knowledge for this type of item if not specified.
  
  Description provided: "${description}"
  
  Format as JSON: { 
    "name": "", 
    "category": "", 
    "brand": "", 
    "model_number": "",
    "quantity": 1,
    "short_description": "",
    "dimensions": "",
    "estimated_weight_lbs": 0.0,
    "materials": "",
    "price_range": {"min": 0, "max": 0}, 
    "condition": "", 
    "confidence": 0.0, 
    "needs_pro": false,
    "drafts": {
      "ebay": { "title": "", "description": "", "specs": "" },
      "fb": { "title": "", "description": "", "specs": "" },
      "etsy": { "title": "", "description": "", "specs": "" },
      "shopify": { "title": "", "description": "", "specs": "" }
    }
  }`;

  const result = await model.generateContent([prompt]);

  const response = await result.response;
  return {
    data: safeParseJSON(response.text()),
    usage: response.usageMetadata
  };
}

/**
 * Stage 4: Metadata Adjustment
 * Refines drafts and titles based on manual user edits to core fields.
 */
export async function adjustItemMetadata(currentItem: any, updates: any, modelType: ModelType = "flash") {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_MAP[modelType],
    generationConfig: { responseMimeType: "application/json" },
    safetySettings: SAFETY_SETTINGS
  });
  
  const prompt = `Refine the listing intelligence for this item based on manual user updates.
  The user has edited some fields. Please update the platform drafts (ebay, fb, etsy, shopify) 
  and other metadata to be consistent with these new values.
  
  CURRENT DATA:
  ${JSON.stringify(currentItem, null, 2)}
  
  USER UPDATES:
  ${JSON.stringify(updates, null, 2)}
  
  Generate updated PLATFORM DRAFTS. Keep any technical specs that are still valid.
  
  Format as JSON: { 
    "name": "", 
    "category": "", 
    "brand": "", 
    "model_number": "",
    "short_description": "",
    "dimensions": "",
    "materials": "",
    "price_range": {"min": 0, "max": 0}, 
    "condition": "", 
    "drafts": {
      "ebay": { "title": "", "description": "", "specs": "" },
      "fb": { "title": "", "description": "", "specs": "" },
      "etsy": { "title": "", "description": "", "specs": "" },
      "shopify": { "title": "", "description": "", "specs": "" }
    }
  }`;

  const result = await model.generateContent([prompt]);

  const response = await result.response;
  return {
    data: safeParseJSON(response.text()),
    usage: response.usageMetadata
  };
}
