import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  Square, 
  Scissors, 
  Merge, 
  Trash,
  Maximize2
} from 'lucide-react';
import { useNotifications } from '@/lib/notifications';
import { useInventory } from '@/features/inventory/useInventory';
import MergeTargetModal from './MergeTargetModal';

interface PhotoGalleryModalProps {
  item: any;
  onClose: () => void;
  initialIndex?: number;
}

export default function PhotoGalleryModal({ item, onClose, initialIndex = 0 }: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { addNotification } = useNotifications();
  const { refetch } = useInventory();
  
  const photos = item.image_refs || [];
  const currentPhoto = photos[currentIndex];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % photos.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const toggleSelection = (url: string) => {
    setSelectedPhotos(prev => 
      prev.includes(url) ? prev.filter(p => p !== url) : [...prev, url]
    );
  };

  const handleMediaAction = async (action: 'DELETE' | 'MERGE' | 'SPLIT', targetItemId?: string) => {
    if (selectedPhotos.length === 0) return;
    setIsProcessing(true);
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
      if (!res.ok) throw new Error(data.error || 'Action failed');

      addNotification({ type: 'success', title: 'Success', message: data.message });
      setSelectedPhotos([]);
      setIsMergeModalOpen(false);
      refetch();
      if (action === 'SPLIT' || photos.length === selectedPhotos.length) {
        onClose();
      }
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-xl overflow-hidden">
      {/* Action Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
            <X className="h-6 w-6" />
          </button>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">{item.name || 'Photo Gallery'}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{currentIndex + 1} / {photos.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedPhotos.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-2xl mr-4"
            >
              <span className="text-xs font-black text-blue-400 mr-2">{selectedPhotos.length} SELECTED</span>
              <button onClick={() => handleMediaAction('SPLIT')} className="p-2 rounded-lg hover:bg-white/10 text-white flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase">Split</span>
              </button>
              <button onClick={() => setIsMergeModalOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-white flex items-center gap-2">
                <Merge className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase">Merge</span>
              </button>
              <button onClick={() => handleMediaAction('DELETE')} className="p-2 rounded-lg hover:bg-white/10 text-red-400 flex items-center gap-2">
                <Trash className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase">Delete</span>
              </button>
            </motion.div>
          )}
          <button 
            onClick={() => toggleSelection(currentPhoto)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition-all ${selectedPhotos.includes(currentPhoto) ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            {selectedPhotos.includes(currentPhoto) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {selectedPhotos.includes(currentPhoto) ? 'SELECTED' : 'SELECT PHOTO'}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-12">
        <button 
          onClick={handlePrev}
          className="absolute left-8 z-10 p-4 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all border border-white/5"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="relative h-full w-full flex items-center justify-center"
          >
            <img 
              src={currentPhoto} 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/5"
              alt="Item"
            />
          </motion.div>
        </AnimatePresence>

        <button 
          onClick={handleNext}
          className="absolute right-8 z-10 p-4 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all border border-white/5"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>

      {/* Thumbnail Filmstrip */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar max-w-7xl mx-auto">
          {photos.map((url: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-blue-500 scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              <img src={url} className="w-full h-full object-cover" alt="" />
              {selectedPhotos.includes(url) && (
                <div className="absolute inset-0 bg-blue-500/40 flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Merge Modal */}
      <AnimatePresence>
        {isMergeModalOpen && (
          <MergeTargetModal 
            excludeId={item.id}
            onClose={() => setIsMergeModalOpen(false)}
            onSelect={(target) => handleMediaAction('MERGE', target.id)}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[210] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4" />
          <p className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Processing Intelligence...</p>
        </div>
      )}
    </div>
  );
}
