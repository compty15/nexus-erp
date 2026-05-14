import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Brain, AlertCircle } from 'lucide-react';
import { JobOrchestrator } from '@/features/jobs/orchestrator';
import { useNotifications } from '@/lib/notifications';
import { useEngine } from '@/lib/engine-context';

interface AddByDescriptionModalProps {
  onClose: () => void;
}

export default function AddByDescriptionModal({ onClose }: AddByDescriptionModalProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();
  const { engine } = useEngine();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      addNotification({ 
        type: 'info', 
        title: 'Intelligence Stream Started', 
        message: 'Extrapolating item data from your description...',
        duration: 3000
      });

      // Use branch ID from a common source or hardcode for now as per current app pattern
      await JobOrchestrator.startTextExtrapolation(description, 'BRANCH_A_PROD', engine);
      
      onClose();
    } catch (err: any) {
      addNotification({ 
        type: 'error', 
        title: 'Extrapolation Failed', 
        message: err.message || 'An unexpected error occurred.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl rounded-[2.5rem] border border-[#333] bg-[#0a0a0a] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] bg-[#111] p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-500/10 p-3 border border-blue-500/20">
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Quick Add</h2>
              <p className="text-[10px] text-titanium-500 font-black uppercase tracking-[0.2em]">AI Text Extrapolation Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full bg-[#222] p-2 text-white hover:bg-[#333] transition-all hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-titanium-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Brain className="h-3 w-3" />
              Item Description
            </label>
            <textarea
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item (e.g., 'Vintage Starrett 436 Micrometer 1-2 inch, original box, light surface rust but smooth action...')"
              className="w-full h-48 rounded-3xl bg-[#111] border border-[#222] p-6 text-white text-lg placeholder:text-titanium-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none italic"
              required
            />
          </div>

          <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-4 flex gap-4 items-start">
            <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-300/70 leading-relaxed font-medium">
              Nexus will use the <span className="font-black text-blue-400">{engine.toUpperCase()}</span> model to identify the item, estimate its value, and generate multi-platform drafts. Detailed descriptions yield higher confidence scores.
            </p>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[#222] bg-[#111] py-4 text-xs font-black uppercase tracking-widest text-titanium-400 hover:text-white hover:bg-[#1a1a1a] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="flex-[2] rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-titanium-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              {isSubmitting ? 'Processing Neural Stream...' : 'Generate Intelligence'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
