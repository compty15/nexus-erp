# Shanal Cavity Global Rules

These rules govern the behavior of the **Listing Command Center** and any AI agents assisting Shane with inventory, research, and sales operations.

## 1. Brand Standards & Tool Tiers

| Tier | Brands | Description | Eras |
| :--- | :--- | :--- | :--- |
| **Pinnacle** | Starrett, Mitutoyo | High-precision, collectible. | 1950s-1970s (rounded edges), modern (digital). |
| **Industrial** | Brown & Sharpe, Ames | Robust, reliable, specialty measurement. | 1960s-1990s. |
| **Consumer** | Fowler, InSize | Budget-friendly, non-collectible. | Digital focus. |
| **Reject** | Generic / No Brand | Do not research or draft unless requested. | N/A |

### Visual Cues for Identification:
1.  **Starrett**: Watch for the "No. [Number]" marking and satin chrome finishes. Wrinkle-finish black paint = 1970s-80s.
2.  **Mitutoyo**: Check for "Made in Japan". Satin finish with orange accents = 1980s.
3.  **Ames**: Distinctive large dial indicators with metal casings.

## 2. Pricing Matrices

| Platform | Formula | Context |
| :--- | :--- | :--- |
| **eBay** | `(Fair Market Price * 1.15) + $15.00 Shipping` | Fees (13-15%) plus safe-shipping buffer. |
| **FB Marketplace** | `(Fair Market Price * 0.90)` | Cash-in-hand local pickup. |
| **Local Premium** | `+ $10.00` | Applied to items over 5lbs (e.g., surface plates, large indicators) for local pickup. |
| **Price Floor** | `$4.94` | Absolute minimum listing price. If an item is worth less, mark it as "Lot" or "Bulk". |

## 3. Listing & Voice Guidelines

### **eBay: The Industrial Technical Professional**
- **Tone**: Technical, thorough, appreciative of quality.
- **Title**: Brand + Precise Model No + Measurement Range + Era ("Vintage Starrett No. 436 Micrometer 0-1''").
- **Key Features**: Accuracy check, movement smoothness, surface condition.

### **FB Marketplace: The Local Community Machinist**
- **Tone**: Friendly, direct, community-driven ("Machinist to Machinist").
- **Title**: Simple and direct ("Starrett Micrometer - Tested/Works").
- **Key Features**: "Tested & Works", local pickup available, "Shoot me an offer".

## 4. Operational Rules for AI Agents
- Always check the `units` directory for existing identified items before creating a new one.
- Use **Gemini 1.5 Flash** for initial tool ID (Vision).
- Use **PostgreSQL (Supabase)** for the master inventory list.
- All code must follow the project's styling: **Vanilla CSS + Dark Mode**.

## 5. Iteration & Deployment Workflow

All project development iterations must follow this lifecycle for production readiness:
1.  **Local Development**: Perform all iterations and changes on the local host from the latest version in GitHub.
2.  **Revision Review**: Once an iteration is stable and ready, verify it (using internal tests/browser).
3.  **GitHub Synchronization**: Stage all changes and commit with a milestone tag (e.g., `[RENDITION-X]`). Push to the master branch.
4.  **Production Deployment**: After the GitHub push, execute a production release to `suppository.vercel.app` to update the live site.
