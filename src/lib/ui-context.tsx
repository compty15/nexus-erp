'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ViewMode = 'mobile' | 'desktop';

interface UIContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [primaryColor, setPrimaryColor] = useState<string>('#c084fc');
  const [secondaryColor, setSecondaryColor] = useState<string>('#022415');

  // Load from localStorage if available
  useEffect(() => {
    const savedMode = localStorage.getItem('nexus-view-mode') as ViewMode;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedMode) setViewMode(savedMode);

    const savedPrimary = localStorage.getItem('nexus-primary-color');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedPrimary) setPrimaryColor(savedPrimary);

    const savedSecondary = localStorage.getItem('nexus-secondary-color');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedSecondary) setSecondaryColor(savedSecondary);
  }, []);

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('nexus-view-mode', mode);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'desktop' ? 'mobile' : 'desktop';
    handleSetViewMode(newMode);
  };

  const handleSetPrimary = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('nexus-primary-color', color);
  };

  const handleSetSecondary = (color: string) => {
    setSecondaryColor(color);
    localStorage.setItem('nexus-secondary-color', color);
  };

  return (
    <UIContext.Provider value={{ 
      viewMode, 
      setViewMode: handleSetViewMode, 
      toggleViewMode,
      primaryColor,
      setPrimaryColor: handleSetPrimary,
      secondaryColor,
      setSecondaryColor: handleSetSecondary
    }}>
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
