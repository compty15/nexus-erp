'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ViewMode = 'mobile' | 'desktop';

interface UIContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');

  // Load from localStorage if available
  useEffect(() => {
    const savedMode = localStorage.getItem('nexus-view-mode') as ViewMode;
    if (savedMode) setViewMode(savedMode);
  }, []);

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('nexus-view-mode', mode);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'desktop' ? 'mobile' : 'desktop';
    handleSetViewMode(newMode);
  };

  return (
    <UIContext.Provider value={{ viewMode, setViewMode: handleSetViewMode, toggleViewMode }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
