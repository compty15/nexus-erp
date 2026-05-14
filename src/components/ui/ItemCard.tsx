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
  Trash
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
      className={`relative overflow-hidden rounded-2xl border bg-[#1a1a1a] p-5 transition-all duration-300 ${
        isScanning ? 'animate-pulse-glow border-blue-500/50' : 
        isSuccess ? 'animate-ramp-up border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 
        isError ? 'animate-flash-red border-red-500/50' : 
        'border-[#333]'
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isScanning ? 'bg-blue-500/10' : 'bg-[#333]'}`}>
              <Package className={`h-5 w-5 ${isScanning ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {item?.name || (isScanning ? 'Identifying...' : 'New Entry')}
              </h3>
              <p className="text-xs text-gray-500">{item?.category || 'Ready for scan'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            {isError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {item?.id && (
              <button 
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-500 transition-colors ml-2"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Activity className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Item Images Gallery */}
        {(item?.image_refs && item.image_refs.length > 0) ? (
          <div className="relative z-0 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {item.image_refs.map((imgUrl, idx) => (
              <div key={idx} className="relative h-40 w-32 shrink-0 overflow-hidden rounded-xl border border-[#222] bg-[#0a0a0a] group/img">
                <img 
                  src={imgUrl} 
                  alt={`${item.name} ${idx + 1}`} 
                  className="h-full w-full object-cover opacity-90 transition-opacity group-hover/img:opacity-100"
                />
                {item?.id && (
                  <button
                    onClick={() => handleRemoveImage(imgUrl)}
                    disabled={removeImageMutation.isPending}
                    className="absolute top-2 right-2 p-1 rounded bg-black/50 text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500/80 backdrop-blur-sm"
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
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-[#222] bg-[#0a0a0a] group/img">
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-full w-full object-cover opacity-90 transition-opacity group-hover/img:opacity-100"
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
                <div className="h-2 w-full animate-pulse rounded-full bg-[#333]" />
                <div className="h-2 w-3/4 animate-pulse rounded-full bg-[#333]" />
              </motion.div>
            ) : item ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Brand</p>
                  <p className="text-sm font-medium text-white">{item.brand}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Value Est.</p>
                  <p className="text-sm font-medium text-blue-400">{item.price}</p>
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-gray-400">Drag images here or use camera</p>
            )}
          </AnimatePresence>
        </div>

        {/* Physical Specs */}
        {item && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-[#0a0a0a] p-2 border border-[#222]">
              <Scale className="h-3 w-3 text-gray-500" />
              <span className="text-[10px] font-bold text-white">
                {formatUnit(item.weight || 0, 'weight', unitSystem)}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#0a0a0a] p-2 border border-[#222]">
              <Box className="h-3 w-3 text-gray-500" />
              <span className="text-[10px] font-bold text-white">
                {item.length || 0}"x{item.width || 0}"x{item.height || 0}"
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {item && (
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowRescan(!showRescan)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600/10 py-2 text-[10px] font-bold text-purple-400 border border-purple-500/20 hover:bg-purple-600/20 transition-all"
              >
                {isRescanning ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Activity className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <BrainCircuit className="h-3 w-3" />
                )}
                {isRescanning ? 'Scanning...' : 'Rescan'}
              </button>
              <button 
                onClick={() => onList?.(item)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/10 py-2 text-[10px] font-bold text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 transition-all"
              >
                <ShoppingCart className="h-3 w-3" />
                List Item
              </button>
              <button 
                onClick={() => onSold?.(item)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/10 py-2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 transition-all"
              >
                <DollarSign className="h-3 w-3" />
                Mark Sold
              </button>
            </div>

            <AnimatePresence>
              {showRescan && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
                >
                  {[
                    { id: 'flash', label: '2.5 Flash' },
                    { id: 'pro-2.5', label: '2.5 Pro' },
                    { id: 'flash-3.0', label: '3.0 Flash' },
                    { id: 'pro-3.0', label: '3.0 Pro' },
                    { id: 'pro-3.1', label: '3.1 Pro' },
                  ].map((model) => (
                    <button
                      key={model.id}
                      disabled={isRescanning}
                      onClick={() => handleRescan(model.id)}
                      className="whitespace-nowrap rounded-lg bg-[#222] px-3 py-2 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-[#333] transition-all"
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
        <div className="flex items-center justify-between border-t border-[#333] pt-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500">Scan Cost:</span>
              <span className="text-[10px] font-mono text-emerald-400">{item?.cost || '$0.00'}</span>
            </div>
            {item?.totalCost && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500">Total Item Cost:</span>
                <span className="text-[10px] font-mono text-blue-400">{item.totalCost}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => onDetails?.(item)}
            className="flex items-center gap-1 text-[10px] font-medium text-blue-400 hover:underline"
          >
            <Info className="h-3 w-3" />
            Details
          </button>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 ${
        isScanning ? 'bg-blue-500' : 
        isSuccess ? 'bg-emerald-500' : 
        isError ? 'bg-red-500' : 
        'bg-transparent'
      }`} />
    </motion.div>
  );
}
