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

    try {
        const { error } = await _supabase
            .from('tools')
            .update({
                status: 'Staged',
                metadata: {
                    ...tool.metadata,
                    ebay_payload: payload,
                    ebay_staged_at: new Date().toISOString()
                }
            })
            .eq('id', toolId);

        if (error) throw error;
        console.log(`[AI-BRIDGE] Successfully staged payload to Supabase for tool ID ${toolId}`);
    } catch (err) {
        console.error("[AI-BRIDGE] Failed to stage to Supabase:", err);
    }
}

window.stageEbayDraft = stageEbayDraft;
