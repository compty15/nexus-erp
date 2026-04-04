/**
 * Inventory Command | Shanal Cavity
 * eBay Drafting Bridge (Agent-to-Browser)
 */

async function stageEbayDraft(toolId) {
    // Fetch tool from our live inventoryData (now synced with Supabase)
    const tool = inventoryData.find(t => t.id === toolId);
    if (!tool) return;
    
    console.log(`[AI-BRIDGE] Preparing High-Fidelity eBay Payload for ${tool.brand} ${tool.model}...`);
    
    const statusMsg = document.getElementById(`status-${toolId}`);
    if (statusMsg) {
        statusMsg.innerHTML = `
            <span class="flex items-center gap-1.5 text-[9px] text-blue-400 font-semibold animate-pulse">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Preparing Payload...
            </span>
        `;
    }

    // High-Fidelity Payload for Shane + AI Assistant
    const payload = {
        title: tool.ebay_copy?.title || `Vintage ${tool.brand} ${tool.model} ${tool.range}`,
        description: tool.ebay_copy?.desc || `Professional ${tool.brand} precision tool.`,
        price: tool.fair_market_price,
        category: "Business & Industrial > Healthcare, Lab & Dental > Medical & Lab Equipment, Devices > Other Medical & Lab Equipment", // Default for metrology
        specifics: {
            brand: tool.brand,
            model: tool.model,
            range: tool.range,
            era: tool.era,
            condition: tool.condition || "Excellent"
        },
        images: tool.photos || []
    };

    console.log("[STAGING-DATA]:", JSON.stringify(payload, null, 2));

    // Update UI to "Data Ready"
    setTimeout(() => {
        if (statusMsg) {
            statusMsg.innerHTML = `
                <span class="flex items-center gap-1.5 text-[10px] text-zinc-300 font-bold bg-zinc-800/80 px-2 py-1 rounded-md border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><path d="M20 6 9 17l-5-5"/></svg>
                    Draft Payload Semi-Staged
                </span>
            `;
        }
        console.log(`[AI-READY] I am ready to use the browser subagent to populate your eBay draft with this payload.`);
    }, 1200);
}

window.stageEbayDraft = stageEbayDraft;
