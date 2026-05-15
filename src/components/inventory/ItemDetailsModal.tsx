import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Clock, FileText, Cpu, Trash2, RotateCcw, Image as ImageIcon, Maximize2, CheckSquare, Square, Scissors, Merge, Trash } from 'lucide-react';
import { useDeleteItem, useInventory } from '@/features/inventory/useInventory';
import { useNotifications } from '@/lib/notifications';
import MergeTargetModal from './MergeTargetModal';

interface ItemDetailsModalProps {
  item: any;
  onClose: () => void;
}

export default function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'media'>('info');
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const deleteMutation = useDeleteItem();
  const { addNotification } = useNotifications();
  const history = item.metadata?.scan_history || [];

  const handleRestoreVersion = async (entry: any) => {
    if (!confirm('Apply this scan data to the main item record?')) return;
    
    const { supabase } = await import('@/shared/lib/supabase');
    const { error } = await supabase
      .from('inventory')
      .update({
        name: entry.data.name,
        brand: entry.data.brand,
        category: entry.data.category,
        price_range: entry.data.price_range,
        weight_raw: entry.data.estimated_weight_lbs,
        metadata: {
          ...item.metadata,
          short_description: entry.data.short_description,
          dimensions: entry.data.dimensions,
          materials: entry.data.materials,
          serial_number: entry.data.serial_number,
          measurement: entry.data.measurement,
          wear_report: entry.data.wear_report,
          drafts: entry.data.drafts || item.metadata.drafts
        }
      })
      .eq('id', item.id);

    if (error) {
      addNotification({ type: 'error', title: 'Restore Failed', message: error.message });
    } else {
      addNotification({ type: 'success', title: 'Restored', message: 'Item updated with data from past scan.' });
      onClose(); // Close to refresh
    }
  };

  const { refetch } = useInventory();

  const handleMediaAction = async (action: 'DELETE' | 'MERGE' | 'SPLIT', targetItemId?: string) => {
    if (selectedPhotos.length === 0) return;
    if (action === 'DELETE' && !confirm(`Delete ${selectedPhotos.length} photos?`)) return;
    if (action === 'SPLIT' && !confirm(`Create a new item card from these ${selectedPhotos.length} photos?`)) return;

    setIsProcessingMedia(true);
    try {
      const res = await fetch('/api/inventory/media/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          sourceItemId: item.id,
          selectedPhotos,
          targetItemId,
          branchId: item.branch_id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process media');

      addNotification({
        type: 'success',
        title: 'Media Updated',
        message: data.message
      });

      setSelectedPhotos([]);
      setIsMergeModalOpen(false);
      refetch();
      if (action === 'SPLIT' || (action === 'DELETE' && item.image_refs.length === selectedPhotos.length)) {
        onClose(); // Close if item is significantly changed or emptied
      }
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const togglePhotoSelection = (url: string) => {
    setSelectedPhotos(prev => 
      prev.includes(url) ? prev.filter(p => p !== url) : [...prev, url]
    );
  };

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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl rounded-[2.5rem] border border-[#333] bg-[#0a0a0a] overflow-hidden flex flex-col h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] bg-[#111] p-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{item.name}</h2>
            <p className="text-sm text-gray-500 font-medium">{item.brand} • {item.category}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-[#222] p-3 text-white hover:bg-[#333] transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222] px-8 bg-[#0d0d0d]">
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-6 py-5 text-xs uppercase tracking-widest font-black border-b-2 transition-all ${activeTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            Live Identity
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-5 text-xs uppercase tracking-widest font-black border-b-2 transition-all flex items-center gap-2 ${activeTab === 'history' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            <History className="h-4 w-4" />
            Scan History ({history.length})
          </button>
          <button 
            onClick={() => setActiveTab('media')}
            className={`px-6 py-5 text-xs uppercase tracking-widest font-black border-b-2 transition-all flex items-center gap-2 ${activeTab === 'media' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            <ImageIcon className="h-4 w-4" />
            Media Center ({item.image_refs?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
          {activeTab === 'info' && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="group rounded-3xl border border-[#222] bg-[#111] p-6 transition-all hover:border-blue-500/50">
                  <span className="text-[10px] uppercase text-gray-500 font-black tracking-tighter">Value Estimate</span>
                  <p className="text-2xl font-black text-white mt-1">
                    ${item.price_range?.min || 0} - ${item.price_range?.max || 0}
                  </p>
                </div>
                <div className="group rounded-3xl border border-[#222] bg-[#111] p-6 transition-all hover:border-purple-500/50">
                  <span className="text-[10px] uppercase text-gray-500 font-black tracking-tighter">Dimensions</span>
                  <p className="text-xl font-mono font-bold text-white mt-1">
                    {item.length_in || 0}" x {item.width_in || 0}" x {item.height_in || 0}"
                  </p>
                </div>
                <div className="group rounded-3xl border border-[#222] bg-[#111] p-6 transition-all hover:border-emerald-500/50">
                  <span className="text-[10px] uppercase text-gray-500 font-black tracking-tighter">Weight</span>
                  <p className="text-xl font-mono font-bold text-white mt-1">
                    {item.weight_raw || 0} lbs
                  </p>
                </div>
                <div className="group rounded-3xl border border-[#222] bg-[#111] p-6 transition-all hover:border-blue-400/50">
                  <span className="text-[10px] uppercase text-gray-500 font-black tracking-tighter">Total AI Investment</span>
                  <p className="text-2xl font-black text-blue-400 mt-1">
                    ${item.cost_metadata?.total_scan_cost?.toFixed(4) || '0.0000'}
                  </p>
                </div>
              </div>

              {item.metadata?.short_description && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Active Description
                  </h3>
                  <div className="rounded-3xl border border-[#222] bg-[#111] p-8 text-gray-300 leading-relaxed text-lg italic shadow-inner">
                    "{item.metadata.short_description}"
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
              {/* Scan List */}
              <div className="md:col-span-4 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-[#111] rounded-3xl border border-[#222]">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm">No history yet</p>
                  </div>
                ) : (
                  [...history].reverse().map((entry: any, i: number) => {
                    const originalIndex = history.length - 1 - i;
                    return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedHistoryIndex(originalIndex)}
                        className={`w-full text-left rounded-2xl border p-4 transition-all ${selectedHistoryIndex === originalIndex ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-[#222] bg-[#111] hover:bg-[#1a1a1a] opacity-60 hover:opacity-100'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase text-purple-400 tracking-tighter">{entry.model}</span>
                          <span className="text-[10px] text-gray-600 font-mono">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white truncate">{entry.data?.name || 'Scan identification'}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleDateString()}</p>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Scan Detail View */}
              <div className="md:col-span-8">
                <AnimatePresence mode="wait">
                  {selectedHistoryIndex !== null ? (
                    <motion.div 
                      key={selectedHistoryIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="rounded-[2rem] border border-[#333] bg-[#0d0d0d] p-8 h-full flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h4 className="text-xl font-black text-white">{history[selectedHistoryIndex].data?.name || 'Scan Result'}</h4>
                          <p className="text-xs text-gray-500 font-mono mt-1">{new Date(history[selectedHistoryIndex].timestamp).toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => handleRestoreVersion(history[selectedHistoryIndex])}
                          className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-xs font-black text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Apply to Live Item
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="rounded-2xl bg-[#1a1a1a] p-4 border border-[#222]">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Price Appraised</span>
                          <p className="text-lg font-black text-emerald-400">
                            ${history[selectedHistoryIndex].data?.price_range?.min || 0} - ${history[selectedHistoryIndex].data?.price_range?.max || 0}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#1a1a1a] p-4 border border-[#222]">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Category</span>
                          <p className="text-lg font-black text-white">
                            {history[selectedHistoryIndex].data?.category || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div>
                          <h5 className="text-[10px] font-black text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                            <FileText className="h-3 w-3" />
                            Scan Description
                          </h5>
                          <p className="text-gray-300 text-sm leading-relaxed bg-[#111] p-4 rounded-xl border border-[#222]">
                            {history[selectedHistoryIndex].data?.short_description || 'No description captured in this scan.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-[10px] font-black text-gray-500 uppercase mb-2">Metrics Identified</h5>
                            <ul className="text-xs space-y-2 text-gray-400">
                              <li className="flex justify-between border-b border-[#222] pb-1">
                                <span>Confidence</span>
                                <span className="text-blue-400 font-mono">{(history[selectedHistoryIndex].data?.confidence * 100).toFixed(0)}%</span>
                              </li>
                              <li className="flex justify-between border-b border-[#222] pb-1">
                                <span>Weight</span>
                                <span className="text-white">{history[selectedHistoryIndex].data?.estimated_weight_lbs || '0'} lbs</span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-[10px] font-black text-gray-500 uppercase mb-2">Technical Info</h5>
                            <ul className="text-xs space-y-2 text-gray-400">
                              <li className="flex justify-between border-b border-[#222] pb-1">
                                <span>Model #</span>
                                <span className="text-white">{history[selectedHistoryIndex].data?.model_number || 'N/A'}</span>
                              </li>
                              <li className="flex justify-between border-b border-[#222] pb-1">
                                <span>Serial #</span>
                                <span className="text-white">{history[selectedHistoryIndex].data?.serial_number || 'N/A'}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 border-2 border-dashed border-[#222] rounded-[2rem]">
                      <Cpu className="h-12 w-12 mb-4 opacity-10" />
                      <p className="font-bold">Select a scan to view details</p>
                      <p className="text-xs mt-1">Review captured metadata and platform drafts</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Image Vault</h3>
                  <p className="text-xs text-gray-500 font-bold">Manage photos for this item cluster</p>
                </div>
                {selectedPhotos.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl"
                  >
                    <span className="text-[10px] font-black text-blue-400 uppercase">{selectedPhotos.length} Selected</span>
                    <div className="h-4 w-[1px] bg-blue-500/20 mx-2" />
                    <button 
                      onClick={() => handleMediaAction('SPLIT')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-titanium-300 hover:text-white transition-all flex items-center gap-2"
                      title="Split into new item"
                    >
                      <Scissors className="h-4 w-4" />
                      <span className="text-[9px] font-black uppercase">Split</span>
                    </button>
                    <button 
                      onClick={() => setIsMergeModalOpen(true)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-titanium-300 hover:text-white transition-all flex items-center gap-2"
                      title="Merge into another item"
                    >
                      <Merge className="h-4 w-4" />
                      <span className="text-[9px] font-black uppercase">Merge</span>
                    </button>
                    <button 
                      onClick={() => handleMediaAction('DELETE')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-500 transition-all flex items-center gap-2"
                      title="Delete photos"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="text-[9px] font-black uppercase">Delete</span>
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-20">
                {item.image_refs?.map((url: string, idx: number) => {
                  const isSelected = selectedPhotos.includes(url);
                  return (
                    <div 
                      key={idx}
                      className={`group relative aspect-square rounded-3xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-[#222] hover:border-[#444]'}`}
                    >
                      <img 
                        src={url} 
                        alt={`Photo ${idx + 1}`}
                        className={`h-full w-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                        onClick={() => togglePhotoSelection(url)}
                      />
                      
                      {/* Controls Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomPhoto(url);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-500 hover:border-blue-400"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>

                      <div 
                        className={`absolute top-3 left-3 p-1.5 rounded-lg border transition-all ${isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'bg-black/40 border-white/10 text-white/40'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelection(url);
                        }}
                      >
                        {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      </div>

                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                          #{idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
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

      {/* Photo Lightbox */}
      <AnimatePresence>
        {zoomPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomPhoto(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={zoomPhoto} 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
              alt="Zoomed"
            />
            <button className="absolute top-8 right-8 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
              <X className="h-8 w-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Merge Destination Selector */}
      <AnimatePresence>
        {isMergeModalOpen && (
          <MergeTargetModal 
            excludeId={item.id}
            onClose={() => setIsMergeModalOpen(false)}
            onSelect={(target) => handleMediaAction('MERGE', target.id)}
          />
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessingMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4" />
            <p className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Reconfiguring Intelligence...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
