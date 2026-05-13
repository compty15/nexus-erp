# NEXUS ERP: Universal Inventory & Business Management

NEXUS is a high-end, mobile-first ERP system designed for managing complex inventory—from precision metrology tools to vintage industrial equipment. It leverages Gemini AI for multi-stage item identification and logistics automation.

## 🚀 Key Features

- **Intelligence Pipeline**: Two-stage identification using Gemini 1.5 Flash (Stage 1) and Pro (Stage 2).
- **Logistics Hub**: Automated shipping weight/box buffering with Metric/Imperial toggles.
- **Sales Ledger**: Internal P&L tracking, fee auto-calculation, and Time-on-Market analytics.
- **Multi-Site Listing Assistant**: Sequential clipboard for rapid posting to eBay, FB Marketplace, Etsy, and Shopify.
- **PWA Ready**: Installable on iPhone/Android for garage-mode reliability.
- **Cloud Integration**: Stores high-res media directly in Google Drive to save on database costs.

## 📂 Project Structure

- `/docs`: Implementation plans, task lists, and system walkthroughs.
- `/supabase`: Database schema definitions and SQL migrations.
- `/scripts`: Utility scripts for OAuth and refresh tokens.
- `/src/lib`: Core logic for AI, Logistics, and Cloud integrations.
- `/src/components`: Professional-grade UI components with Framer Motion animations.

## 🛠️ Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Configure `.env` with your Gemini, Supabase, and Google Cloud keys.

3. **Database Initialization**:
   Run the SQL in `/supabase/schema.sql` within your Supabase SQL Editor.

4. **Launch**:
   ```bash
   npm run dev
   ```

## 🔒 Security
Sensitive API keys are stored in `.env` and are excluded from version control via `.gitignore`. The system is designed to use client-side encryption for marketplace tokens in future updates.

---
Built by Antigravity AI for professional garage environments.
