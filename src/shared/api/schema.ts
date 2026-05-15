import { z } from 'zod';

// Physical Specs Schema
export const PhysicalSpecsSchema = z.object({
  weight_raw: z.number().default(0),
  length_in: z.number().default(0),
  width_in: z.number().default(0),
  height_in: z.number().default(0),
  box_offset_override: z.number().nullable().optional(),
});

// Cost Metadata Schema
export const CostMetadataSchema = z.object({
  last_scan_cost: z.number().default(0),
  total_scan_cost: z.number().default(0),
});

// Price Range Schema
export const PriceRangeSchema = z.object({
  min: z.number().default(0),
  max: z.number().default(0),
  currency: z.string().default('USD'),
});

// Inventory Item Schema (Supabase)
export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  branch_id: z.string().nullable().optional(),
  name: z.string(),
  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  quantity: z.number().default(1),
  status: z.enum(['draft', 'identified', 'needs_review', 'listed', 'sold', 'archived', 'deleted']).default('identified'),
  
  // Specs spread
  weight_raw: z.number().nullable().optional(),
  length_in: z.number().nullable().optional(),
  width_in: z.number().nullable().optional(),
  height_in: z.number().nullable().optional(),
  box_offset_override: z.number().nullable().optional(),
  
  price_range: PriceRangeSchema.nullable().optional(),
  image_refs: z.array(z.string()).default([]),
  
  // Sales
  sold_at: z.string().nullable().optional(),
  sold_price: z.number().nullable().optional(),
  sold_proceeds: z.number().nullable().optional(),
  marketplace_source: z.string().nullable().optional(),
  
  cost_metadata: CostMetadataSchema.nullable().optional(),
  metadata: z.any().nullable().optional(),
  
  created_at: z.string(),
  updated_at: z.string(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

// Job Schema
export const JobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  type: z.string(),
  payload: z.any(),
  result: z.any().nullable().optional(),
  error: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Job = z.infer<typeof JobSchema>;

// User Settings Schema
export const UserSettingsSchema = z.object({
  id: z.string().uuid(),
  unit_system: z.enum(['imperial', 'metric']).default('imperial'),
  default_fee_percent: z.number().default(13.25),
  ebay_api_key: z.string().nullable().optional(),
  etsy_api_key: z.string().nullable().optional(),
  shopify_api_key: z.string().nullable().optional(),
  shopify_store_url: z.string().nullable().optional(),
  updated_at: z.string(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
