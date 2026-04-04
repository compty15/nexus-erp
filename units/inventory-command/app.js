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
    },
    {
        id: "INV-005",
        brand: "Acu-Rite",
        model: "Acu-Tip",
        name: "3D Edge Finder",
        range: "Precision Probing",
        era: "Modern Industrial",
        tier: "Pinnacle",
        condition: "Excellent (Auto-Grade)",
        fair_market_price: 200.00,
        status: "AI-Identified"
    },
    {
        id: "INV-006",
        brand: "Mahr",
        model: "Elmillimess",
        name: "Dial Comparator (.0001\")",
        range: "0-20 (Comparator)",
        era: "Vintage (Germany)",
        tier: "Pinnacle",
        condition: "Very Good (Auto-Grade)",
        fair_market_price: 250.00,
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
                            <button onclick="stageEbayDraft('${item.id}')" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-bold px-2 py-1.5 rounded-md border border-zinc-700 leading-none transition-all">
                                Stage as eBay Draft
                            </button>
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

function saveNewListing() {
    const brand = document.getElementById('tool-brand').value || 'Unknown';
    const model = document.getElementById('tool-model').value || 'Unknown';
    
    const newTool = {
        id: "INV-" + Math.floor(Math.random() * 1000),
        brand: brand,
        model: model,
        name: "Identified Precision Tool",
        range: "Pending verification",
        era: "Auto-Detected",
        tier: "Industrial",
        condition: "Excellent (Auto-Grade)",
        fair_market_price: 125.00,
        status: "Active",
        photos: [...pendingPhotos],
        references: [
            { image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200", label: "Catalog P.42" },
            { image: "https://images.unsplash.com/photo-1581092580497-e0d23cb6117e?w=200", label: "Manual Fig. 3" },
            { image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200", label: "Model Match" }
        ]
    };
    
    inventoryData.unshift(newTool);
    renderInventory();
    closeAddItemModal();
}

window.openAddItemModal = openAddItemModal;
window.closeAddItemModal = closeAddItemModal;
window.saveNewListing = saveNewListing;

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // Artificial delay to feel "premium"
    setTimeout(renderInventory, 300);
});
