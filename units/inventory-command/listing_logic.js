/**
 * Inventory Command | Shanal Cavity
 * Listing Logic & Copy Generation Service
 */

const CONFIG = {
    EBAY_FEE_MULTIPLIER: 1.15,
    EBAY_SHIPPING_BUFFER: 15.00,
    FB_DISCOUNT: 0.90,
    PRICE_FLOOR: 4.94
};

/**
 * Generates tailored sales copy based on the tool's data
 */
function generateListingCopy(tool) {
    const { brand, model, range, era, condition, fair_market_price } = tool;
    
    // eBay: Industrial Technical Professional
    const ebayTitle = `${brand} No. ${model} ${range} ${era} - Tested & Accurate`;
    const ebayDescription = `
${brand} - PRECISE INSTRUMENTATION
MODEL: ${model}
RANGE: ${range}
ERA: ${era}

CONDITION: ${condition}. This vintage ${brand} tool has been visually inspected and movement is smooth. 
Surface finish is consistent with the era. Accuracy verified against standard.

A high-precision essential for any machine shop or technical professional.
Shipping is secured and tracked.
    `.trim();

    // FB Marketplace: Local Community Machinist
    const fbTitle = `${brand} ${range} Micrometer - Tested/Works`;
    const fbDescription = `
${brand} ${range} instrument.
Great condition, tested and works as intended.
Asking $${(fair_market_price * CONFIG.FB_DISCOUNT).toFixed(2)} cash for local pickup in MN.
Machinist to machinist - shoot me an offer if interested!
    `.trim();

    return {
        ebay: { title: ebayTitle, body: ebayDescription, price: (fair_market_price * CONFIG.EBAY_FEE_MULTIPLIER + CONFIG.EBAY_SHIPPING_BUFFER).toFixed(2) },
        fb: { title: fbTitle, body: fbDescription, price: (fair_market_price * CONFIG.FB_DISCOUNT).toFixed(2) }
    };
}

/**
 * Scans the 'units/inbox' folder (Placeholder for Agent Bridge)
 */
async function scanInbox() {
    console.log("Scanning units/inbox for new snapshots...");
    
    const inboxGrid = document.getElementById('inbox-grid');
    inboxGrid.innerHTML = `
        <div class="animate-pulse bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p class="text-[10px] text-zinc-500 lowercase tracking-widest">Analyzing snapshot...</p>
        </div>
    `;
    
    // Simulate multi-modal analysis (Vision ID + Auto-Grading)
    setTimeout(() => {
        inboxGrid.innerHTML = `
            <div class="tool-card border-zinc-500 animate-fade-in">
                <div class="brand-label starrett-text mb-1">AI Analysis Complete</div>
                <h3 class="text-sm font-bold">Starrett No. 436 (0-1")</h3>
                <div class="flex items-center gap-2 mt-1 mb-4">
                    <span class="badge badge-pinnacle">Pinnacle</span>
                    <span class="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Auto-Grade: Near Mint</span>
                </div>
                <p class="text-[10px] text-zinc-500 mb-4 italic">Detected: Satin chrome finish with original black wrinkle paint. No visible pitting.</p>
                <div class="flex gap-2">
                    <button class="flex-1 bg-zinc-100 text-zinc-950 text-[10px] font-bold py-2 rounded-lg">Confirm & List</button>
                    <button class="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-3 py-2 rounded-lg border border-zinc-700">Reject</button>
                </div>
            </div>
        `;
    }, 1200);
}

window.generateListingCopy = generateListingCopy;
window.scanInbox = scanInbox;
