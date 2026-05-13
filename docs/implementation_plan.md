# NEXUS ERP: Logistics & Commerce Hub Upgrade

This phase transforms NEXUS into a full-scale commerce engine. We are adding physical logistics (weight/dimensions), smart shipping calculation, a multi-site listing assistant, and an internal sales ledger.

## User Review Required

> [!IMPORTANT]
> **Shipping Rates**: I will implement "Mock" rate calculations for the MVP based on standard carrier formulas. Real-time live rates will require active API keys for UPS/USPS/FedEx which we can configure in the new Settings module.
> **Sequential Clipboard**: This uses the `navigator.clipboard` API. On some mobile browsers, this requires a clear "User Gesture" (click) per copy action, which we will handle with the sequential button UI.

## Proposed Changes

### [Component] Physical Specs & Smart Logistics
#### [MODIFY] [supabase_schema.sql](file:///C:/Users/compt/.gemini/antigravity/scratch/nexus-erp/supabase_schema.sql)
- **[MODIFY] `inventory` table**: 
    - Physical: `weight_raw`, `length_in`, `width_in`, `height_in`, `box_offset_override`.
    - Sales: `sold_at`, `sold_price`, `sold_proceeds`, `marketplace_source`.
- **[NEW] `user_settings` table**: Store `unit_system` (metric/imperial), `default_fee_percent`, and API placeholders for eBay, Etsy, Shopify.

#### [NEW] [lib/logistics.ts]
- **Weight Buffer**: `Math.max(2, weight * 0.1)` (Lbs).
- **Box Buffer**: `Math.min(4, Math.max(0.5, largest_dim * 0.2))` or the manual dropdown override.
- **Rate Estimator**: Logic to calculate "Standard" vs "Expedited" based on the buffered box size.

### [Component] The Multi-Site Listing Assistant
#### [NEW] [components/inventory/ListingAssistant.tsx]
- **Sequential Clipboard UI**: Buttons for [Title] -> [Price] -> [Description] -> [Specs].
- **Platform Selectors**: Toggle between eBay, Etsy, Facebook, and Shopify drafts.
#### [MODIFY] [lib/gemini.ts]
- Update `deepDive` to return platform-specific drafts (e.g., "Professional" for eBay, "Community-focused" for FB).

### [Component] Sales Ledger & "Sold" Flow
#### [NEW] [components/inventory/MarkAsSoldModal.tsx]
- Fields: Sold Amount, Proceeds (auto-calculated with fee estimate), Marketplace Source.
- **Metric**: Calculate "Time on Market" (Days between `created_at` and `sold_at`).
#### [NEW] [app/ledger/page.tsx]
- Internal P&L dashboard.
- Breakdown of profit by marketplace.
- Filterable list of "Sold" items.

### [Component] Settings & Configuration
#### [NEW] [app/settings/page.tsx]
- UI for Metric/Imperial toggle.
- Default Fee % adjustment.
- API Key management section (Placeholder fields for future "One-Click" automation).

---

## Verification Plan

### Automated Tests
- Verify `calculateBoxSize` returns correct buffered dimensions for a variety of tool shapes.
- Verify `calculateNetProfit` correctly handles fee overrides.

### Manual Verification
- **Clipboard Test**: Verify that clicking the "Sequential Clipboard" buttons correctly copies data to the phone's clipboard.
- **Metric Toggle**: Switch to Metric and verify that `Lbs` change to `Kg` and `Inches` change to `Cm` across the UI.
- **Sold Flow**: Mark an item as sold and verify it moves from "Inventory" to the "Ledger."
