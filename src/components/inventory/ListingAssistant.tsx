'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Store, 
  Facebook, 
  ShoppingBag, 
  ShoppingCart,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { useNotifications } from '@/lib/notifications';

interface ListingAssistantProps {
  item: any;
  drafts: {
    ebay: any;
    fb: any;
    etsy: any;
    shopify: any;
  };
}

export default function ListingAssistant({ item, drafts }: ListingAssistantProps) {
  const [platform, setPlatform] = useState<'ebay' | 'fb' | 'etsy' | 'shopify'>('ebay');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    addNotification({ 
      type: 'success', 
      title: 'Copied', 
      message: `${field} ready to paste on ${platform.toUpperCase()}` 
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const platforms = [
    { id: 'ebay', icon: Store, label: 'eBay', color: 'bg-blue-600' },
    { id: 'fb', icon: Facebook, label: 'Facebook', color: 'bg-blue-500' },
    { id: 'etsy', icon: ShoppingBag, label: 'Etsy', color: 'bg-orange-500' },
    { id: 'shopify', icon: ShoppingCart, label: 'Shopify', color: 'bg-green-600' }
  ];

  const currentDraft = drafts[platform] || drafts.ebay;

  return (
    <div className="rounded-[32px] border border-[#222] bg-[#111] overflow-hidden shadow-2xl">
      {/* Platform Tabs */}
      <div className="flex border-b border-[#222] bg-[#0a0a0a]/50 p-1">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id as any)}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
              platform === p.id 
                ? 'bg-[#222] text-white shadow-inner' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <p.icon className="h-4 w-4" />
            {p.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
            <ClipboardList className="h-4 w-4" />
            Sequential Clipboard
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
            <Check className="h-3 w-3" />
            Draft Optimized by Gemini
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid gap-4">
          {/* Title */}
          <div className="group relative rounded-2xl border border-[#222] bg-[#0a0a0a] p-4 transition-all hover:border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Title</span>
              <button
                onClick={() => handleCopy(currentDraft.title, 'Title')}
                className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-500"
              >
                {copiedField === 'Title' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm font-bold text-white line-clamp-1">{currentDraft.title}</p>
          </div>

          {/* Price */}
          <div className="group relative rounded-2xl border border-[#222] bg-[#0a0a0a] p-4 transition-all hover:border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Price</span>
              <button
                onClick={() => handleCopy(currentDraft.price.toString(), 'Price')}
                className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500"
              >
                {copiedField === 'Price' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xl font-black text-white">${currentDraft.price}</p>
          </div>

          {/* Description */}
          <div className="group relative rounded-2xl border border-[#222] bg-[#0a0a0a] p-4 transition-all hover:border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Description</span>
              <button
                onClick={() => handleCopy(currentDraft.description, 'Description')}
                className="rounded-lg bg-orange-600 p-2 text-white hover:bg-orange-500"
              >
                {copiedField === 'Description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{currentDraft.description}</p>
          </div>

          {/* Specs / Tags */}
          <div className="group relative rounded-2xl border border-[#222] bg-[#0a0a0a] p-4 transition-all hover:border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Tech Specs</span>
              <button
                onClick={() => handleCopy(currentDraft.specs, 'Specs')}
                className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-500"
              >
                {copiedField === 'Specs' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-[10px] text-gray-500 font-mono line-clamp-2">
              {currentDraft.specs}
            </div>
          </div>
        </div>

        <button 
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#333] bg-[#222] py-4 text-xs font-bold text-white hover:bg-[#333] transition-all"
          onClick={() => window.open(getPlatformUrl(platform, item), '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Open {platform.toUpperCase()} Listing Page
        </button>
      </div>
    </div>
  );
}

function getPlatformUrl(platform: string, item: any) {
  switch (platform) {
    case 'ebay': return 'https://www.ebay.com/sl/sell';
    case 'fb': return 'https://www.facebook.com/marketplace/create/item';
    case 'etsy': return 'https://www.etsy.com/your/shops/me/listings/create';
    case 'shopify': return 'https://admin.shopify.com/store/new-product';
    default: return '#';
  }
}
