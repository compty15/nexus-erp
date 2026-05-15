'use client';

import React, { useEffect } from 'react';
import { useUI } from '@/lib/ui-context';

export default function ViewModeWrapper({ children }: { children: React.ReactNode }) {
  const { viewMode } = useUI();

  useEffect(() => {
    if (viewMode === 'mobile') {
      document.body.classList.add('mobile-mode');
    } else {
      document.body.classList.remove('mobile-mode');
    }
  }, [viewMode]);

  return (
    <div className="layout-container mx-auto transition-all duration-500 ease-in-out">
      {children}
    </div>
  );
}
