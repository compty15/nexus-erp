/**
 * Shared database row types for Nexx-Top.
 * Single source of truth — import from here instead of using `any`.
 */

export interface InventoryItem {
  id: string;
  user_id: string;
  team_id?: string;
  name: string;
  description?: string;
  price_range?: { min: number; max: number };
  quantity?: number;
  category?: string;
  brand?: string;
  condition?: string;
  image_refs?: string[];
  metadata?: {
    listings?: {
      ebay?: Record<string, unknown>;
      etsy?: Record<string, unknown>;
      facebook?: Record<string, unknown>;
      scientific?: Record<string, unknown>;
    };
    [key: string]: unknown;
  };
  created_at: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  status: "active" | "inactive" | "archived";
  created_at: string;
}

export interface Shipment {
  id: string;
  team_id: string;
  tracking_id?: string | null;
  carrier: string;
  origin?: string | null;
  destination: string;
  status: "pending" | "in_transit" | "delayed" | "delivered";
  eta?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  team_id: string;
  type: "b2b" | "b2c";
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  status: "active" | "inactive" | "archived";
  total_volume: number;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  role?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface Invite {
  id: string;
  team_id: string;
  token: string;
  email?: string | null;
  status: "pending" | "accepted" | "expired";
  created_by?: string | null;
  accepted_by?: string | null;
  expires_at: string;
  created_at: string;
}
