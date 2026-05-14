'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#050505]">
      {/* 1. Base Atmospheric Layer - Realistic Smoke & Titanium */}
      <div 
        className="absolute inset-0 opacity-80 mix-blend-screen animate-smoke-flow"
        style={{
          backgroundImage: `url('/realistic_smoke.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.2) brightness(1.1) sepia(1) hue-rotate(90deg) saturate(3) brightness(0.4)',
        }}
      />

      {/* 2. Realistic Precision Machinery Layer */}
      <motion.div 
        className="absolute inset-0 opacity-40 mix-blend-screen"
        animate={{
          scale: [1, 1.015, 1],
          opacity: [0.35, 0.45, 0.35]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage: `url('/realistic_machinery.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.1) brightness(1.0) grayscale(0.2)',
        }}
      />

      {/* 3. Realistic Laser Optic Breadboard */}
      <motion.div 
        className="absolute inset-0 opacity-30 mix-blend-additive"
        animate={{
          x: [-3, 3, -3],
          y: [-3, 3, -3],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `url('/realistic_optics.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.2) brightness(1.1)',
        }}
      />

      {/* 4. Animated Laser Beams - Subtle & Sharp */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-[1px] w-full ${i % 2 === 0 ? 'bg-uv-purple/40' : 'bg-emerald-500/20'}`}
            initial={{ top: `${15 + i * 12}%`, left: '-100%', opacity: 0 }}
            animate={{ 
              left: '100%', 
              opacity: [0, 0.4, 0],
              scaleY: [1, 2, 1]
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* 5. Dynamic Energy Pulsing - Reduced Radius (75%) and Brightness (50%) */}
      <motion.div 
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            'radial-gradient(circle at 10% 20%, rgba(126, 34, 206, 0.15) 0%, transparent 15%), radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 15%)',
            'radial-gradient(circle at 90% 20%, rgba(5, 150, 105, 0.15) 0%, transparent 15%), radial-gradient(circle at 10% 80%, rgba(126, 34, 206, 0.1) 0%, transparent 15%)',
            'radial-gradient(circle at 10% 20%, rgba(126, 34, 206, 0.15) 0%, transparent 15%), radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 15%)',
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* 6. Texture & Vignette */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 opacity-50" />
    </div>
  );
}
