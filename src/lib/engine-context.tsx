'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Engine = 'flash-1.5' | 'flash' | 'flash-3.5' | 'pro-1.5' | 'pro-2.5' | 'pro-3.1';

interface EngineContextType {
  engine: Engine;
  setEngine: (engine: Engine) => void;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

export function EngineProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<Engine>('pro-2.5');

  return (
    <EngineContext.Provider value={{ engine, setEngine }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine() {
  const context = useContext(EngineContext);
  if (context === undefined) {
    throw new Error('useEngine must be used within an EngineProvider');
  }
  return context;
}
