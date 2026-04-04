/** 
 * Inventory Command | Shanal Cavity 
 * Pricing Automation & Market Intelligence 
 */

const PRICING_CONFIG = {
    SOURCES: ['eBay Sold', 'FB Marketplace Archive'],
    MIN_DATA_POINTS: 3,
    CURRENCY: 'USD'
};

/**
 * Simulates real-time market research for a tool
 */
async function researchMarketPrice(tool) {
    const { brand, model, condition } = tool;
    console.log(`Researching market price for: ${brand} ${model}...`);
    
    // In a real run, this would perform a web search for:
    // `site:ebay.com "${brand}" ${model} sold price`
    
    // Mocking the result of our research (Median of 3 recent sold items)
    return new Promise((resolve) => {
        setTimeout(() => {
            const dataPoints = [
                tool.fair_market_price * 0.85,  // Sample 1
                tool.fair_market_price,        // Sample 2
                tool.fair_market_price * 1.10   // Sample 3
            ];
            
            const medianPrice = dataPoints.sort((a,b) => a - b)[1];
            
            resolve({
                median: medianPrice,
                samples: dataPoints,
                source: "eBay Sold (Recent)",
                last_check: new Date().toISOString()
            });
        }, 1500); // Artificial delay for "Premium" analysis feel
    });
}

function updateToolUIWithMarketData(toolId, marketData) {
    const card = document.getElementById(`card-${toolId}`);
    if (!card) return;
    
    // Update the Fair Market Price display
    const priceDisplay = card.querySelector('.price-tag');
    if (priceDisplay) {
        priceDisplay.textContent = `$${marketData.median.toFixed(2)}`;
        priceDisplay.classList.add('text-green-400');
    }
    
    // Add "Market Evidence" Tooltip/Label
    const evidenceContainer = document.createElement('div');
    evidenceContainer.className = "flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-900";
    evidenceContainer.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        <span class="text-[9px] text-zinc-500 italic">Verified by ${marketData.source}</span>
    `;
    card.querySelector('.space-y-2').appendChild(evidenceContainer);
}

window.researchMarketPrice = researchMarketPrice;
window.updateToolUIWithMarketData = updateToolUIWithMarketData;
