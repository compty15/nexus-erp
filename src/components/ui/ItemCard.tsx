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
  Scale, 
  Box, 
  ArrowUpRight, 
  ShoppingCart,
  DollarSign,
  Activity,
  BrainCircuit,
  Trash,
  FileText
} from 'lucide-react';
import { formatUnit } from '@/lib/logistics';
import { useNotifications } from '@/lib/notifications';
import { supabase } from '@/shared/lib/supabase';
import { useDeleteItem, useRemoveImage } from '@/features/inventory/useInventory';


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
  };
}

export default function ItemCard({ status = 'idle', item, unitSystem = 'imperial', onList, onSold, onDetails }: ItemCardProps) {
  const isScanning = status === 'scanning';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const [showRescan, setShowRescan] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const { addNotification } = useNotifications();
  const deleteMutation = useDeleteItem();
  const removeImageMutation = useRemoveImage();

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

  const handleRemoveImage = (imageUrl: string) => {
    if (!item?.id || !imageUrl) return;
    if (confirm('Are you sure you want to remove this photo?')) {
      removeImageMutation.mutate({ id: item.id, imageUrl }, {
        onSuccess: () => {
          addNotification({ type: 'success', title: 'Photo Removed', message: 'The image has been deleted.' });
        },
        onError: (err: any) => {
          addNotification({ type: 'error', title: 'Failed to Remove', message: err.message });
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
        message: `Successfully re-appraised with Gemini ${model.replace('-', ' ').toUpperCase()}`
      });
      setShowRescan(false);
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

  return (
    <motion.div
      layout
      whileHover={{ y: -5, boxShadow: '0 10px 40px -10px rgba(126, 34, 206, 0.3)' }}
      className={`group relative overflow-hidden rounded-3xl glass-panel p-5 transition-all duration-500 ${
        isScanning ? 'animate-pulse-glow border-white/20' : 
        isSuccess ? 'border-titanium-400/30' : 
        isError ? 'border-red-500/50' : 
        'border-white/5 hover:border-uv-purple/30'
      }`}
    >
      {/* Holographic Scanline */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#000_50%)] bg-[length:100%_4px] animate-scanline" />
      
      {/* Tech Corner Brackets */}
      <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/20 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/20 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/20 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/20 rounded-br-sm pointer-events-none" />
      <div className="flex flex-col gap-4">
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isScanning ? 'bg-white/10' : 'bg-black/40 border border-white/5'}`}>
              <Package className={`h-4 w-4 ${isScanning ? 'text-white' : 'text-titanium-400'}`} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white text-glow-uv">
                {item?.name || (isScanning ? 'Identifying...' : 'New Entry')}
              </h3>
              <p className="text-[10px] font-bold text-titanium-500 uppercase tracking-tighter italic">{item?.category || 'Ready for scan'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isSuccess && <CheckCircle2 className="h-4 w-4 text-white" />}
            {isError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {item?.id && (
              <button 
                onClick={handleDelete}
                className="text-titanium-600 hover:text-white transition-colors ml-2"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Activity className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <Trash className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Item Images Gallery */}
        {(item?.image_refs && item.image_refs.length > 0) ? (
          <div className="relative z-0 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {item.image_refs.map((imgUrl, idx) => (
              <div key={idx} className="relative h-44 w-36 shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-black/60 group/img shadow-2xl">
                <img 
                  src={imgUrl} 
                  alt={`${item.name} ${idx + 1}`} 
                  className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover/img:opacity-100 group-hover/img:scale-110"
                />
                {item?.id && (
                  <button
                    onClick={() => handleRemoveImage(imgUrl)}
                    disabled={removeImageMutation.isPending}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500 backdrop-blur-md"
                    title="Remove photo"
                  >
                    {removeImageMutation.isPending ? (
                      <Activity className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : item?.image && (
          <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-white/5 bg-black/60 group/img shadow-2xl">
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover/img:opacity-100 group-hover/img:scale-105"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[60px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="h-1.5 w-full animate-pulse rounded-full bg-white/5" />
                <div className="h-1.5 w-3/4 animate-pulse rounded-full bg-white/5" />
              </motion.div>
            ) : item ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-2"
              >
                <div className="titanium-panel p-2.5 rounded-xl">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-titanium-500">Origin</p>
                  <p className="text-[10px] font-bold text-white tracking-widest truncate">{item.brand}</p>
                </div>
                <div className="titanium-panel p-2.5 rounded-xl border-l-2 border-white/10">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-titanium-500">Qty</p>
                  <p className="text-[10px] font-bold text-white tracking-widest">{item.quantity || 1}</p>
                </div>
                <div className="titanium-panel p-2.5 rounded-xl border-l-2 border-white/20">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-titanium-500">Valuation</p>
                  <p className="text-[10px] font-bold text-white tracking-widest text-glow-emerald">{item.price}</p>
                </div>
              </motion.div>
            ) : (
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-titanium-600 text-center">Awaiting Data Streams...</p>
            )}
          </AnimatePresence>
        </div>

        {/* Physical Specs */}
        {item && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2.5 border border-white/5">
              <Scale className="h-3 w-3 text-titanium-500" />
              <span className="text-[10px] font-black text-white tracking-widest">
                {formatUnit(item.weight || 0, 'weight', unitSystem)}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2.5 border border-white/5">
              <Box className="h-3 w-3 text-titanium-500" />
              <span className="text-[10px] font-black text-white tracking-widest">
                {item.length || 0}x{item.width || 0}x{item.height || 0}
              </span>
            </div>
          </div>
        )}

        {/* eBay Description Preview */}
        {item?.ebay_description && (
          <div className="rounded-xl bg-black/40 p-3 border border-white/5 italic">
            <p className="text-[8px] uppercase text-titanium-500 font-black mb-2 flex items-center gap-1.5 tracking-[0.2em]">
              <FileText className="h-2.5 w-2.5" />
              Intelligence Brief
            </p>
            <p className="text-[10px] text-titanium-300 line-clamp-3 leading-relaxed">
              "{item.ebay_description}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {item && (
          <div className="relative z-10 flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowRescan(!showRescan)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-[9px] font-black uppercase tracking-widest text-titanium-300 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
              >
                {isRescanning ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Activity className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <BrainCircuit className="h-3 w-3" />
                )}
                Rescan
              </button>
              <button 
                onClick={() => onList?.(item)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-black py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-titanium-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <ShoppingCart className="h-3 w-3" />
                List
              </button>
              <button 
                onClick={() => onSold?.(item)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-titanium-800 text-white py-2.5 text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-titanium-700 transition-all"
              >
                <DollarSign className="h-3 w-3" />
                Sold
              </button>
            </div>

            <AnimatePresence>
              {showRescan && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 overflow-x-auto py-2 no-scrollbar"
                >
                  {[
                    { id: 'flash', label: 'FLS-2.5' },
                    { id: 'pro-2.5', label: 'PRO-2.5' },
                    { id: 'flash-3.0', label: 'FLS-3.0' },
                    { id: 'pro-3.0', label: 'PRO-3.0' },
                    { id: 'pro-3.1', label: 'PRO-3.1' },
                  ].map((model) => (
                    <button
                      key={model.id}
                      disabled={isRescanning}
                      onClick={() => handleRescan(model.id)}
                      className="whitespace-nowrap rounded-lg bg-black/60 border border-white/5 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-titanium-400 hover:text-white hover:border-white/20 transition-all"
                    >
                      {model.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer Metrics */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-titanium-600">Cycle Cost:</span>
              <span className="text-[10px] font-mono font-bold text-white">{item?.cost || '$0.00'}</span>
            </div>
          </div>
          <button 
            onClick={() => onDetails?.(item)}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
          >
            <Info className="h-3 w-3" />
            Specs
          </button>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[80px] opacity-10 ${
        isScanning ? 'bg-white' : 
        isSuccess ? 'bg-titanium-400' : 
        isError ? 'bg-red-500' : 
        'bg-transparent'
      }`} />
    </motion.div>
  );
}
