-- NEXUS ERP: Add Model Enabled/Disabled Toggle Schema and Seed Models
-- Migration: 20260614000000_add_model_toggles.sql

-- 1. Add is_enabled column to public.model_stats
ALTER TABLE public.model_stats ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;

-- 2. Ensure all model IDs mapped in the frontend are seeded in the DB
INSERT INTO public.model_stats (model_id, is_enabled) VALUES
('gemini-flash-latest', true),
('gemini-2.5-flash', true),
('gemini-3.5-flash', true),
('gemini-pro-latest', true),
('gemini-2.5-pro', true),
('gemini-3.1-pro-preview', true)
ON CONFLICT (model_id) DO NOTHING;
