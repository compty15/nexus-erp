'use client';

import React from 'react';
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
  DollarSign 
} from 'lucide-react';
import { formatUnit } from '@/lib/logistics';

interface ItemCardProps {
  status?: 'idle' | 'scanning' | 'success' | 'error';
  unitSystem?: 'imperial' | 'metric';
  item?: {
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
  };
}

export default function ItemCard({ status = 'idle', item, unitSystem = 'imperial' }: ItemCardProps) {
  const isScanning = status === 'scanning';
  const isSuccess = status === 'success';
  const isError = status === 'error';

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
        <div className="flex items-center justify-between">
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
          </div>
        </div>

        {/* Item Image */}
        {item?.image && (
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-[#222] bg-[#0a0a0a]">
            {/* Using standard img for now since we don't have domains configured in next.config.js for next/image */}
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
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
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/10 py-2 text-[10px] font-bold text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 transition-all">
              <ShoppingCart className="h-3 w-3" />
              List Item
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/10 py-2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 transition-all">
              <DollarSign className="h-3 w-3" />
              Mark Sold
            </button>
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
          <button className="flex items-center gap-1 text-[10px] font-medium text-blue-400 hover:underline">
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
