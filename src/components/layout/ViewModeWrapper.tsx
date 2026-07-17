'use client';

import React, { useEffect } from 'react';
import { useUI } from '@/lib/ui-context';

export default function ViewModeWrapper({ children }: { children: React.ReactNode }) {
  const { viewMode, primaryColor, secondaryColor } = useUI();

  useEffect(() => {
    if (viewMode === 'mobile') {
      document.body.classList.add('mobile-mode');
    } else {
      document.body.classList.remove('mobile-mode');
    }
  }, [viewMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-uv-glow', `${primaryColor}40`);
    document.documentElement.style.setProperty('--color-emerald-glow', `${secondaryColor}33`);
  }, [primaryColor, secondaryColor]);

  return (
    <div className="layout-container mx-auto transition-all duration-500 ease-in-out">
      {children}
    </div>
  );
}
