'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Engine = 'flash' | 'pro-2.5' | 'flash-3.0' | 'pro-3.0';

interface EngineContextType {
  engine: Engine;
  setEngine: (engine: Engine) => void;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

export function EngineProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<Engine>('pro-3.0');

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
