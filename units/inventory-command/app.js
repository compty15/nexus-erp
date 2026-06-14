/** 
 * Inventory Command | Shanal Cavity 
 * Live Real-time Logic & Supabase Sync
 */

const SUPABASE_URL = 'https://oathlydlyukbqiypospp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0m4UdTAf8ajxD5dRlLRGpw_Yq93j2ch';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let inventoryData = [];

const CONFIG = {
    EBAY_FEE_MULTIPLIER: 1.15,
    EBAY_SHIPPING_BUFFER: 15.00,
    FB_DISCOUNT: 0.90
};

async function fetchInventory() {
    console.log("Fetching latest inventory from Metropolis DB...");
    const { data, error } = await _supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Supabase Fetch Error:", error);
        return;
    }

    inventoryData = data || [];
    renderInventory();
}

// Real-time Subscription
_supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tools' 
    }, (payload) => {
        console.log('Real-time update received:', payload);
        fetchInventory();
    })
    .subscribe();

function calculateEbayPrice(fmp) {
    return (fmp * CONFIG.EBAY_FEE_MULTIPLIER) + CONFIG.EBAY_SHIPPING_BUFFER;
}

function calculateFBPrice(fmp) {
    return fmp * CONFIG.FB_DISCOUNT;
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;

    if (inventoryData.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <p class="text-zinc-500 font-outfit uppercase tracking-widest text-xs animate-pulse">Waiting for arrivals in Metropolis...</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = inventoryData.map((item, index) => {
        const ebayPrice = (item.fair_market_price * CONFIG.EBAY_FEE_MULTIPLIER + CONFIG.EBAY_SHIPPING_BUFFER).toFixed(2);
        const fbPrice = (item.fair_market_price * CONFIG.FB_DISCOUNT).toFixed(2);
        const brandClass = item.brand?.toLowerCase() === 'starrett' ? 'starrett-text' : 
                          item.brand?.toLowerCase() === 'mitutoyo' ? 'mitutoyo-text' : 'text-zinc-300';
        
        // Photos and Reference Groups
        const photoGallery = item.photos ? `
            <div class="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                ${item.photos.map(p => `<img src="${p}" class="w-16 h-16 rounded-lg object-cover border border-zinc-800 flex-shrink-0">`).join('')}
            </div>
        ` : '';

        const referenceGroup = item.references ? `
            <div class="mt-6 pt-4 border-t border-zinc-800">
                <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Verified Reference Context
                </div>
                <div class="grid grid-cols-3 gap-2">
                    ${item.references.map(ref => `
                        <div class="bg-zinc-950/50 rounded-xl p-1 border border-zinc-800/30">
                            <img src="${ref.image}" class="w-full h-12 object-cover rounded-lg mb-1 filter grayscale contrast-125 hover:grayscale-0 transition-all cursor-pointer">
                            <p class="text-[7px] text-zinc-500 text-center uppercase tracking-tighter truncate">${ref.label || 'Match'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div id="card-${item.id}" class="tool-card animate-fade-in flex flex-col h-full" style="animation-delay: ${index * 100}ms">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <span class="brand-label ${brandClass} block mb-1">${item.brand}</span>
                        <h3 class="text-lg font-outfit font-bold leading-tight">${item.model}</h3>
                        <p class="text-zinc-500 text-[10px] mt-0.5">${item.name} (${item.range})</p>
                    </div>
                    <span class="badge badge-${item.tier.toLowerCase()}">${item.tier}</span>
                </div>
                
                <div class="space-y-1.5 mb-4">
                    <div class="flex justify-between text-[10px] uppercase tracking-wider">
                        <span class="text-zinc-500">Era</span>
                        <span class="text-zinc-200 font-medium">${item.era}</span>
                    </div>
                    <div class="flex justify-between text-[10px] uppercase tracking-wider">
                        <span class="text-zinc-500">Condition</span>
                        <span class="text-zinc-200 font-medium">${item.condition}</span>
                    </div>
                </div>

                ${photoGallery}
                ${referenceGroup}

                <div class="mt-auto pt-6 border-t border-zinc-800/50 flex items-end justify-between self-stretch">
                    <div class="space-y-1">
                        <div id="status-${item.id}" class="mb-2">
                            ${item.status === 'Staged' ? `
                                <div class="flex flex-col gap-1.5">
                                    <span class="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Staged on Cloud
                                    </span>
                                    <button onclick="autofillEbay('${item.id}')" class="bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-bold px-2 py-1.5 rounded-md border border-orange-500 leading-none transition-all flex items-center justify-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                                        Auto-Fill on eBay
                                    </button>
                                </div>
                            ` : `
                                <button onclick="stageEbayDraft('${item.id}')" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-bold px-2 py-1.5 rounded-md border border-zinc-700 leading-none transition-all">
                                    Stage as eBay Draft
                                </button>
                            `}
                        </div>
                        <p class="text-[8px] text-zinc-500 uppercase tracking-tighter">Est. Fair Market</p>
                        <p class="price-tag leading-none mt-0.5">$${item.fair_market_price.toFixed(2)}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        <div class="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-400">
                            <div class="w-1 h-1 bg-blue-500 rounded-full"></div>
                            eBay: $${ebayPrice}
                        </div>
                        <div class="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-400">
                            <div class="w-1 h-1 bg-green-500 rounded-full"></div>
                            FB: $${fbPrice}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Modal and Multi-Image Logic
let pendingPhotos = [];

function openAddItemModal() {
    document.getElementById('add-item-modal').classList.remove('hidden');
    document.getElementById('add-item-modal').classList.add('flex');
    pendingPhotos = [];
    updateImagePreviews();
}

function closeAddItemModal() {
    document.getElementById('add-item-modal').classList.add('hidden');
    document.getElementById('add-item-modal').classList.remove('flex');
}

document.getElementById('file-input')?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            pendingPhotos.push(event.target.result);
            updateImagePreviews();
            simulateReferenceMatch();
        };
        reader.readAsDataURL(file);
    });
});

function updateImagePreviews() {
    const previewArea = document.getElementById('image-previews');
    if (!previewArea) return;
    
    if (pendingPhotos.length > 0) {
        previewArea.classList.remove('hidden');
        previewArea.innerHTML = pendingPhotos.map(photo => `
            <img src="${photo}" class="photo-thumbnail">
        `).join('');
    } else {
        previewArea.classList.add('hidden');
    }
}

function simulateReferenceMatch() {
    const matchZone = document.getElementById('reference-match-zone');
    if (!matchZone) return;
    
    matchZone.classList.remove('hidden');
    const container = matchZone.querySelector('.grid');
    
    // Using generative placeholders for references
    container.innerHTML = `
        <div class="reference-card animate-fade-in">
            <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200" class="reference-image">
            <p class="text-[8px] text-zinc-500 uppercase font-bold">Ref No. 436A</p>
        </div>
        <div class="reference-card animate-fade-in" style="animation-delay: 100ms">
            <img src="https://images.unsplash.com/photo-1581092580497-e0d23cb6117e?auto=format&fit=crop&q=80&w=200" class="reference-image">
            <p class="text-[8px] text-zinc-500 uppercase font-bold">Manual Archive</p>
        </div>
        <div class="reference-card animate-fade-in" style="animation-delay: 200ms">
            <img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=200" class="reference-image">
            <p class="text-[8px] text-zinc-500 uppercase font-bold">Case Component</p>
        </div>
    `;
}

async function saveNewListing() {
    const brand = document.getElementById('tool-brand').value || 'Unknown';
    const model = document.getElementById('tool-model').value || 'Unknown';
    
    console.log("Saving new high-precision listing to Supabase...");
    
    const { data, error } = await _supabase
        .from('tools')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

    const nextId = data && data.length > 0 ? data[0].id + 1 : 1000;

    const { error: insertError } = await _supabase
        .from('tools')
        .insert([{
            brand: brand,
            model: model,
            name: "Identified Precision Tool",
            range: "Pending verification",
            era: "Auto-Detected",
            tier: "Industrial",
            condition: "Excellent (Auto-Grade)",
            fair_market_price: 125.00,
            status: "Pending",
            photos: [...pendingPhotos],
            // Initial reference group can be empty for the AI to fill
            references: [
                { image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200", label: "Catalog P.42" },
                { image: "https://images.unsplash.com/photo-1581092580497-e0d23cb6117e?w=200", label: "Manual Fig. 3" }
            ]
        }]);

    if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        alert("Failed to save listing. Check console.");
    } else {
        closeAddItemModal();
        // Real-time subscription will trigger re-render
    }
}

window.openAddItemModal = openAddItemModal;
window.closeAddItemModal = closeAddItemModal;
window.saveNewListing = saveNewListing;

async function autofillEbay(toolId) {
    const tool = inventoryData.find(t => t.id === toolId);
    if (!tool) return;

    // Define the prompt that we want the user to paste into the AI chat
    const prompt = `@Antigravity please run the browser subagent to fill out the eBay sales listing for the "${tool.brand} ${tool.model}" (ID: ${tool.id}) using the staged payload.`;

    // Copy to clipboard
    try {
        await navigator.clipboard.writeText(prompt);
        console.log("[AI-BRIDGE] Prompt successfully copied to clipboard.");
    } catch (err) {
        console.error("[AI-BRIDGE] Clipboard copy failed:", err);
    }

    // Open eBay listing creator in a new tab
    window.open("https://www.ebay.com/sl/sell", "_blank");

    // Display visual feedback to the user on the card
    const statusContainer = document.getElementById(`status-${toolId}`);
    if (statusContainer) {
        const originalHTML = statusContainer.innerHTML;
        statusContainer.innerHTML = `
            <div class="flex flex-col gap-1.5">
                <span class="flex items-center justify-center gap-1.5 text-[9px] text-orange-400 font-bold bg-orange-950/80 px-2 py-1.5 rounded-md border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)] animate-pulse">
                    ✓ Prompt Copied!
                </span>
                <span class="text-[7.5px] text-zinc-500 font-semibold italic text-center block leading-normal mt-0.5">
                    Paste in Antigravity chat to auto-fill
                </span>
            </div>
        `;
        // Restore after a short delay
        setTimeout(() => {
            // Re-fetch standard staged view or original state
            renderInventory();
        }, 5000);
    }
}

window.autofillEbay = autofillEbay;

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // Artificial delay to feel "premium"
    setTimeout(fetchInventory, 300);
});
