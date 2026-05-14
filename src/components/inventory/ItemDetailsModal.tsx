import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Clock, FileText, Cpu, Trash2, RotateCcw } from 'lucide-react';
import { useDeleteItem } from '@/features/inventory/useInventory';
import { useNotifications } from '@/lib/notifications';

interface ItemDetailsModalProps {
  item: any;
  onClose: () => void;
}

export default function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const deleteMutation = useDeleteItem();
  const { addNotification } = useNotifications();

  const isDeleted = item.status === 'deleted';

  const handleDelete = () => {
    if (confirm('Are you sure you want to move this item to the Trash?')) {
      deleteMutation.mutate(item.id, {
        onSuccess: () => {
          addNotification({ type: 'success', title: 'Moved to Trash', message: 'Item deleted.' });
          onClose();
        }
      });
    }
  };

  const history = item.metadata?.scan_history || [];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl rounded-[2rem] border border-[#333] bg-[#0a0a0a] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] bg-[#111] p-6">
          <div>
            <h2 className="text-2xl font-black text-white">{item.name}</h2>
            <p className="text-sm text-gray-500">{item.brand} • {item.category}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-[#222] p-2 text-white hover:bg-[#333] transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222] px-6">
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            Item Details
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            <History className="h-4 w-4" />
            Scan History ({history.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
          {activeTab === 'info' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Estimated Value</span>
                  <p className="text-xl font-bold text-white mt-1">
                    ${item.price_range?.min || 0} - ${item.price_range?.max || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Physical Size</span>
                  <p className="text-lg font-mono text-white mt-1">
                    {item.length_in || 0}" x {item.width_in || 0}" x {item.height_in || 0}"
                  </p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Weight</span>
                  <p className="text-lg font-mono text-white mt-1">
                    {item.weight_raw || 0} lbs
                  </p>
                </div>
                <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Total AI Cost</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    ${item.cost_metadata?.total_scan_cost?.toFixed(4) || '0.0000'}
                  </p>
                </div>
              </div>

              {item.metadata?.short_description && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </h3>
                  <div className="rounded-2xl border border-[#222] bg-[#111] p-6 text-gray-300 leading-relaxed">
                    {item.metadata.short_description}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No scan history available for this item.</p>
                </div>
              ) : (
                history.map((entry: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-[#222] bg-[#111] p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#222]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#222]">
                          <Cpu className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white capitalize">{entry.model.replace('-', ' ')}</h4>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name Identified:</span>
                        <p className="text-white font-medium">{entry.data?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <p className="text-blue-400 font-mono">{(entry.data?.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#222] bg-[#111] p-4 flex justify-between items-center">
          {!isDeleted ? (
            <button 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Move to Trash'}
            </button>
          ) : (
            <button 
              onClick={async () => {
                const { supabase } = await import('@/shared/lib/supabase');
                await supabase.from('inventory').update({ status: 'identified' }).eq('id', item.id);
                addNotification({ type: 'success', title: 'Restored', message: 'Item restored to active inventory.' });
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-6 py-3 text-sm font-bold text-blue-500 hover:bg-blue-500/20 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Restore Item
            </button>
          )}
          
          <button 
            onClick={onClose}
            className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-black hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
