-- NEXUS ERP: Supabase Schema Definitions

-- 1. Branches & Locations
CREATE TABLE public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inventory Items
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id TEXT REFERENCES public.branches(id),
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    status TEXT DEFAULT 'identified',
    
    -- Physical Specs
    weight_raw NUMERIC(10, 2) DEFAULT 0,
    length_in NUMERIC(10, 2) DEFAULT 0,
    width_in NUMERIC(10, 2) DEFAULT 0,
    height_in NUMERIC(10, 2) DEFAULT 0,
    box_offset_override NUMERIC(4, 2), -- Manual dropdown override (0.5 to 4)
    
    -- Pricing
    price_range JSONB DEFAULT '{"min": 0, "max": 0, "currency": "USD"}'::jsonb,
    image_refs JSONB DEFAULT '[]'::jsonb, -- Array of Google Drive IDs
    
    -- Sales Tracking
    sold_at TIMESTAMPTZ,
    sold_price NUMERIC(12, 2),
    sold_proceeds NUMERIC(12, 2),
    marketplace_source TEXT, -- 'ebay', 'fb', 'etsy', 'shopify'
    
    -- Metadata
    cost_metadata JSONB DEFAULT '{"last_scan_cost": 0, "total_scan_cost": 0}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Financials Table (ERP Revenue/Expense Tracking)
CREATE TABLE public.financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('revenue', 'expense', 'fee', 'shipping', 'labor', 'utility', 'wear')),
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- carrier_info, marketplace_name, etc.
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. System Logs & AI Quotas (Health Monitoring)
CREATE TABLE public.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL, -- 'gemini_tokens', 'supabase_rows', 'api_cost'
    current_value NUMERIC DEFAULT 0,
    daily_limit NUMERIC,
    alert_threshold NUMERIC, -- Percentage (e.g. 0.8 for 80%)
    reset_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store token usage, model_id, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Background Jobs (For async AI processing)
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    type TEXT NOT NULL, -- 'flash_scan', 'pro_scan', 'grouping'
    payload JSONB DEFAULT '{}'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    user_id UUID, -- If auth is enabled later
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Model Usage Statistics (Burn Rate Guardrails)
CREATE TABLE public.model_stats (
    model_id TEXT PRIMARY KEY, -- 'gemini-1.5-flash', etc.
    total_calls INTEGER DEFAULT 0,
    all_time_high NUMERIC(10, 6) DEFAULT 0,
    all_time_low NUMERIC(10, 6) DEFAULT 999.99,
    avg_cost NUMERIC(10, 6) DEFAULT 0,
    total_cost NUMERIC(12, 6) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial seed for model stats
INSERT INTO public.model_stats (model_id) VALUES 
('gemini-1.5-flash'), ('gemini-1.5-pro'), ('gemini-2.0-flash-thinking-preview-01-21');

-- Indexes
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_type ON public.jobs(type);

-- 7. Supabase Storage (Direct-to-Cloud Uploads)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('raw_images', 'raw_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Allow public uploads (for now, but should be restricted to authenticated users)
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'raw_images');

CREATE POLICY "Public View"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'raw_images');

-- Enable RLS on core tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Temporary public policies while auth is being configured
CREATE POLICY "Public full access to inventory" ON public.inventory FOR ALL USING (true);
CREATE POLICY "Public full access to jobs" ON public.jobs FOR ALL USING (true);
