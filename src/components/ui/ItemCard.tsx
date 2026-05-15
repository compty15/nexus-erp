'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Package, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Clock, 
  Box, 
  ArrowUpRight, 
  ShoppingCart,
  DollarSign,
  Activity,
  BrainCircuit,
  Trash,
  FileText,
  Edit3,
  Check,
  X as CloseIcon
} from 'lucide-react';
import { formatUnit } from '@/lib/logistics';
import { useNotifications } from '@/lib/notifications';
import { supabase } from '@/shared/lib/supabase';
import { useDeleteItem, useRemoveImage, useInventory } from '@/features/inventory/useInventory';
import { useEngine } from '@/lib/engine-context';


interface ItemCardProps {
  status?: 'idle' | 'scanning' | 'success' | 'error';
  unitSystem?: 'imperial' | 'metric';
  onList?: (item: any) => void;
  onSold?: (item: any) => void;
  onDetails?: (item: any) => void;
  item?: {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: string;
    cost: string;
    totalCost?: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    image?: string | null;
    image_refs?: string[];
    ebay_description?: string;
    quantity?: number;
    price_range?: { min: number; max: number; currency: string };
  };
}

export default function ItemCard({ status = 'idle', item, unitSystem = 'imperial', onList, onSold, onDetails }: ItemCardProps) {
  const isScanning = status === 'scanning';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const [showRescan, setShowRescan] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [editValues, setEditValues] = useState<any>({});
  
  const { addNotification } = useNotifications();
  const { engine } = useEngine();
  const deleteMutation = useDeleteItem();
  const removeImageMutation = useRemoveImage();
  const { refetch } = useInventory();

  // Initialize edit values when entering edit mode
  const startEditing = () => {
    if (!item) return;
    setEditValues({
      name: item.name,
      brand: item.brand,
      category: item.category,
      quantity: item.quantity || 1,
      price: item.price,
      weight: item.weight || 0,
      length: item.length || 0,
      width: item.width || 0,
      height: item.height || 0,
      ebay_description: item.ebay_description || ''
    });
    setIsEditing(true);
  };

  const handleAdjust = async () => {
    if (!item?.id) return;
    setIsAdjusting(true);
    try {
      addNotification({ 
        type: 'info', 
        title: 'Adjusting Intelligence', 
        message: 'Gemini is refining drafts based on your edits...',
        duration: 2000
      });

      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: item.id, 
          updates: editValues,
          modelType: engine
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust');

      addNotification({
        type: 'success',
        title: 'Intelligence Refined',
        message: 'Title and descriptions adjusted successfully.'
      });
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Adjustment Failed',
        message: err.message
      });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDelete = () => {
    if (!item?.id) return;
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(item.id, {
        onSuccess: () => {
          addNotification({ type: 'success', title: 'Deleted', message: 'Item deleted.' });
        },
        onError: (err: any) => {
          addNotification({ type: 'error', title: 'Delete Failed', message: err.message });
        }
      });
    }
  };

  const handleRescan = async (model: string) => {
    if (!item?.id) return;
    setIsRescanning(true);
    try {
      const res = await fetch('/api/inventory/rescan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, modelType: model })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rescan');

      addNotification({
        type: 'success',
        title: 'Rescan Complete',
        message: `Successfully re-appraised with Gemini ${model.toUpperCase()}`
      });
      setShowRescan(false);
      refetch();
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Rescan Failed',
        message: err.message
      });
    } finally {
      setIsRescanning(false);
    }
  };

  const itemCode = (item as any)?.metadata?.item_code || '#0000';
  const lastModel = (item as any)?.metadata?.last_model || 'none';

  return (
    <motion.div
      layout
      className={`group relative overflow-hidden rounded-2xl glass-panel p-4 transition-all duration-300 ${
        isScanning || isAdjusting ? 'animate-pulse-glow' : 
        isEditing ? 'border-blue-500/40 ring-1 ring-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]' :
        'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Header: ID + Name + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-titanium-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {itemCode}
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <BrainCircuit className="h-2.5 w-2.5 text-blue-400" />
                <span className="text-[8px] font-black uppercase text-blue-400 tracking-wider">
                  {lastModel.replace('gemini-', '').toUpperCase()}
                </span>
              </div>
            </div>
            
            {isEditing ? (
              <input 
                value={editValues.name}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                className="w-full bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500"
                placeholder="Item Name"
              />
            ) : (
              <h3 className="text-xs font-black uppercase tracking-widest text-white truncate group-hover:text-glow-uv">
                {item?.name || (isScanning ? 'Identifying...' : 'New Entry')}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isEditing ? (
              <div className="flex gap-1">
                <button 
                  onClick={handleAdjust}
                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                  title="Flash Rescan & Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-titanium-500 hover:bg-white/10 transition-all"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            ) : item?.id ? (
              <>
                <button 
                  onClick={startEditing}
                  className="p-1.5 rounded-lg bg-white/5 text-titanium-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg bg-white/5 text-titanium-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Compact Media + Details Grid */}
        <div className="flex gap-3 h-32">
          {/* Image Thumbnail */}
          <div className="w-24 h-full shrink-0 relative rounded-xl overflow-hidden bg-black/40 border border-white/5">
            {item?.image_refs?.[0] ? (
              <img src={item.image_refs[0]} className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-titanium-700" />
              </div>
            )}
            {item?.image_refs && item.image_refs.length > 1 && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[8px] font-black text-white backdrop-blur-md">
                +{item.image_refs.length - 1}
              </div>
            )}
          </div>

          {/* Quick Specs */}
          <div className="flex-1 grid grid-cols-2 gap-2 overflow-hidden">
            <div className="flex flex-col justify-center rounded-xl bg-white/5 p-2 border border-white/5">
              <span className="text-[7px] font-black uppercase tracking-widest text-titanium-500">Brand</span>
              {isEditing ? (
                <input 
                  value={editValues.brand}
                  onChange={(e) => setEditValues({ ...editValues, brand: e.target.value })}
                  className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-white focus:ring-0"
                />
              ) : (
                <span className="text-[10px] font-bold text-white truncate">{item?.brand || '-'}</span>
              )}
            </div>
            <div className="flex flex-col justify-center rounded-xl bg-white/5 p-2 border border-white/5">
              <span className="text-[7px] font-black uppercase tracking-widest text-titanium-500">Valuation</span>
              {isEditing ? (
                <input 
                  value={editValues.price}
                  onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                  className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-emerald-400 focus:ring-0"
                />
              ) : (
                <span className="text-[10px] font-bold text-emerald-400 truncate">{item?.price || '-'}</span>
              )}
            </div>
            <div className="flex flex-col justify-center rounded-xl bg-white/5 p-2 border border-white/5">
              <span className="text-[7px] font-black uppercase tracking-widest text-titanium-500">Category</span>
              {isEditing ? (
                <input 
                  value={editValues.category}
                  onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                  className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-white focus:ring-0"
                />
              ) : (
                <span className="text-[10px] font-bold text-white truncate">{item?.category || '-'}</span>
              )}
            </div>
            <div className="flex flex-col justify-center rounded-xl bg-white/5 p-2 border border-white/5">
              <span className="text-[7px] font-black uppercase tracking-widest text-titanium-500">Weight</span>
              <span className="text-[10px] font-bold text-white truncate">
                {formatUnit(item?.weight || 0, 'weight', unitSystem)}
              </span>
            </div>
          </div>
        </div>

        {/* Full Description Section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <FileText className="h-2.5 w-2.5 text-titanium-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-titanium-500">Intelligence Stream</span>
          </div>
          {isEditing ? (
            <textarea 
              value={editValues.ebay_description}
              onChange={(e) => setEditValues({ ...editValues, ebay_description: e.target.value })}
              className="w-full bg-black/40 border border-blue-500/30 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
              placeholder="Detailed item description..."
            />
          ) : (
            <div className="rounded-xl bg-black/40 p-3 border border-white/5">
              <p className="text-[10px] text-titanium-300 leading-relaxed max-h-[60px] overflow-y-auto no-scrollbar italic">
                {item?.ebay_description || 'No description generated.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-titanium-600" />
              <span className="text-[10px] font-mono text-titanium-400">{item?.cost || '$0.00'}</span>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            {!isEditing && item?.id && (
              <>
                <button 
                  onClick={() => setShowRescan(!showRescan)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-titanium-300 hover:text-white transition-all"
                >
                  Rescan
                </button>
                <button 
                  onClick={() => onList?.(item)}
                  className="px-4 py-1.5 rounded-lg bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-titanium-200 transition-all"
                >
                  List
                </button>
              </>
            )}
          </div>
        </div>

        {/* Rescan Options Popover */}
        <AnimatePresence>
          {showRescan && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar mt-1"
            >
              {['flash', 'pro-2.5', 'flash-3.0', 'pro-3.0', 'pro-3.1'].map((m) => (
                <button
                  key={m}
                  onClick={() => handleRescan(m)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-md bg-black/60 border border-white/5 text-[8px] font-black uppercase text-titanium-400 hover:text-white hover:border-white/20 transition-all"
                >
                  {m.replace('gemini-', '').toUpperCase()}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
