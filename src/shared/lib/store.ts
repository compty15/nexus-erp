import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job } from '@/shared/api/schema';

interface QueueState {
  pendingJobs: Job[];
  activeJobId: string | null;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  setActiveJob: (id: string | null) => void;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set) => ({
      pendingJobs: [],
      activeJobId: null,
      addJob: (job) => set((state) => ({ pendingJobs: [...state.pendingJobs, job] })),
      updateJob: (id, updates) => set((state) => ({
        pendingJobs: state.pendingJobs.map(job => 
          job.id === id ? { ...job, ...updates, updated_at: new Date().toISOString() } : job
        )
      })),
      removeJob: (id) => set((state) => ({
        pendingJobs: state.pendingJobs.filter(job => job.id !== id),
        activeJobId: state.activeJobId === id ? null : state.activeJobId
      })),
      setActiveJob: (id) => set({ activeJobId: id }),
    }),
    {
      name: 'nexus-queue-storage',
    }
  )
);
