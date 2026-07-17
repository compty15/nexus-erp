'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Check, ArrowRight, Layers } from 'lucide-react';

interface BatchGroup {
  name: string;
  indices: number[];
}

interface BatchConfirmationProps {
  images: string[]; // Base64 images
  initialGroups: BatchGroup[];
  onConfirm: (groups: BatchGroup[]) => void;
  onCancel: () => void;
}

export default function BatchConfirmation({ 
  images, 
  initialGroups, 
  onConfirm, 
  onCancel 
}: BatchConfirmationProps) {
  const [groups, setGroups] = useState<BatchGroup[]>(initialGroups);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="flex h-full max-h-[800px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#333] bg-[#1a1a1a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2">
              <Layers className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Review Groups</h2>
              <p className="text-sm text-gray-500">AI suggested {groups.length} distinct items from your photos.</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-[#333] transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatePresence>
              {groups.map((group, gIndex) => (
                <motion.div
                  key={gIndex}
                  layout
                  className="rounded-2xl border border-[#333] bg-[#252525] p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <input
                      value={group.name}
                      onChange={(e) => {
                        const newGroups = [...groups];
                        newGroups[gIndex].name = e.target.value;
                        setGroups(newGroups);
                      }}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    />
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      {group.indices.length} Photos
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {group.indices.map((i) => (
                      <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#333]">
                        <img 
                          src={images[i]} 
                          alt="Thumbnail" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#333] bg-[#1a1a1a] p-6 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Discard Batch
          </button>
          <button
            onClick={() => onConfirm(groups)}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-95"
          >
            Confirm & Scan All
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
