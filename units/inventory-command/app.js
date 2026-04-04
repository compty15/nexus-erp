/** 
 * Inventory Command | Shanal Cavity 
 * Core App Logic & Mock Data
 */

const inventoryData = [
    {
        id: "INV-001",
        brand: "Starrett",
        model: "No. 436",
        name: "Outside Micrometer",
        range: "0-1\"",
        era: "1960s (Satin Chrome)",
        tier: "Pinnacle",
        condition: "Near Mint",
        fair_market_price: 65.00,
        status: "Identified"
    },
    {
        id: "INV-002",
        brand: "Mitutoyo",
        model: "103-129",
        name: "Outside Micrometer",
        range: "0-25mm",
        era: "1980s (Orange Accents)",
        tier: "Pinnacle",
        condition: "Excellent",
        fair_market_price: 55.00,
        status: "Queued"
    },
    {
        id: "INV-003",
        brand: "Brown & Sharpe",
        model: "599",
        name: "Slant/Line Micrometer",
        range: "0-1\"",
        era: "1970s",
        tier: "Industrial",
        condition: "Good",
        fair_market_price: 45.00,
        status: "Identified"
    },
    {
        id: "INV-004",
        brand: "Scherr-Tumico",
        model: "Dial Indicator",
        name: "Precision Indicator (.0001\")",
        range: ".025\"",
        era: "1960s-70s (USA)",
        tier: "Industrial",
        condition: "Excellent (Auto-Grade)",
        fair_market_price: 50.00,
        status: "AI-Identified"
    }
];

function calculateEbayPrice(fmp) {
    return (fmp * 1.15) + 15.00;
}

function calculateFBPrice(fmp) {
    return fmp * 0.90;
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;

    grid.innerHTML = inventoryData.map((item, index) => {
        const ebayPrice = (item.fair_market_price * CONFIG.EBAY_FEE_MULTIPLIER + CONFIG.EBAY_SHIPPING_BUFFER).toFixed(2);
        const fbPrice = (item.fair_market_price * CONFIG.FB_DISCOUNT).toFixed(2);
        const brandClass = item.brand.toLowerCase() === 'starrett' ? 'starrett-text' : 
                          item.brand.toLowerCase() === 'mitutoyo' ? 'mitutoyo-text' : 'text-zinc-300';
        
        // Trigger research in background after a slight "premium" offset
        setTimeout(async () => {
            const data = await researchMarketPrice(item);
            updateToolUIWithMarketData(item.id, data);
        }, 1000 + (index * 200));

        return `
            <div id="card-${item.id}" class="tool-card animate-fade-in" style="animation-delay: ${index * 100}ms">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <span class="brand-label ${brandClass}">${item.brand}</span>
                        <h3 class="text-lg font-outfit font-bold">${item.model}</h3>
                        <p class="text-zinc-500 text-xs">${item.name} (${item.range})</p>
                    </div>
                    <span class="badge badge-${item.tier.toLowerCase()}">${item.tier}</span>
                </div>
                
                <div class="space-y-2 mb-6">
                    <div class="flex justify-between text-[10px] uppercase tracking-wider">
                        <span class="text-zinc-500">Era</span>
                        <span class="text-zinc-300">${item.era}</span>
                    </div>
                    <div class="flex justify-between text-[10px] uppercase tracking-wider">
                        <span class="text-zinc-500">Condition</span>
                        <span class="text-zinc-300">${item.condition}</span>
                    </div>
                </div>

                <div class="pt-4 border-t border-zinc-800/50 flex items-end justify-between">
                    <div class="space-y-1">
                        <p class="text-[9px] text-zinc-500 uppercase">Est. Fair Market</p>
                        <p class="price-tag">$${item.fair_market_price.toFixed(2)}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        <div class="flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
                            <span class="w-1.2 h-1.2 bg-blue-500 rounded-full"></span>
                            eBay: $${ebayPrice}
                        </div>
                        <div class="flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
                            <span class="w-1.2 h-1.2 bg-green-500 rounded-full"></span>
                            FB: $${fbPrice}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // Artificial delay to feel "premium"
    setTimeout(renderInventory, 300);
});
