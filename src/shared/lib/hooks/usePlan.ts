import { create } from 'zustand';

export type PlanTier = 'standard' | 'pro' | 'elite';

export const MODEL_AVAILABILITY: Record<PlanTier, string[]> = {
  standard: ['flash-1.5', 'flash'],
  pro: ['flash-1.5', 'flash', 'flash-3.0', 'pro-1.5', 'pro-2.5'],
  elite: ['flash-1.5', 'flash', 'flash-3.0', 'pro-1.5', 'pro-2.5', 'pro-3.0'],
};

interface PlanState {
  tier: PlanTier;
  setTier: (tier: PlanTier) => void;
  isModelAllowed: (model: string) => boolean;
}

export const usePlan = create<PlanState>((set, get) => ({
  tier: 'elite', // Default to Elite for the current user as requested
  setTier: (tier) => set({ tier }),
  isModelAllowed: (model) => {
    const allowed = MODEL_AVAILABILITY[get().tier];
    return allowed.includes(model);
  },
}));
