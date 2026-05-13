import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Branch = {
  id: string;
  name: string;
  type: 'production' | 'sales' | 'storage';
  config: any;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  branch_id: string;
  name: string;
  brand: string;
  category: string;
  serial_number: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  condition: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  listing_content: {
    ebay_title: string;
    ebay_desc: string;
    fb_title: string;
    fb_desc: string;
  };
  image_refs: string[];
  cost_metadata: {
    last_scan_cost: number;
    lifetime_item_cost: number;
  };
  status: 'draft' | 'identified' | 'listed' | 'sold' | 'archived' | 'in_use';
  created_at: string;
  updated_at: string;
};
