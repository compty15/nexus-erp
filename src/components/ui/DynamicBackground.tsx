'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#030008]">
      {/* 1. Nebula Cosmic Dust Layer (Dark Purple & Emerald Green) */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(88, 28, 135, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(6, 95, 70, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(3, 0, 8, 1) 0%, transparent 100%)
          `
        }}
      />

      {/* 2. Gravitational Singularity (Black Hole Center) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer Accretion Glow */}
        <motion.div 
          className="absolute h-[500px] w-[500px] rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.45, 0.3],
            background: [
              'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(124, 58, 237, 0.15) 40%, transparent 70%)',
              'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(16, 185, 129, 0.15) 40%, transparent 70%)',
              'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(124, 58, 237, 0.15) 40%, transparent 70%)'
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* The Event Horizon (Dark Void) */}
        <div className="absolute h-[150px] w-[150px] rounded-full bg-[#020005] shadow-[0_0_80px_rgba(88,28,135,0.4),_inset_0_0_40px_rgba(6,95,70,0.5)] border border-purple-900/30 flex items-center justify-center">
          <div className="h-[90px] w-[90px] rounded-full bg-[#000000] shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
        </div>
      </div>

      {/* 3. Cosmic Geometry: Orbit Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-dashed border-purple-500/10"
            style={{
              width: `${250 + i * 150}px`,
              height: `${250 + i * 150}px`,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              borderColor: [
                'rgba(168, 85, 247, 0.05)',
                'rgba(16, 185, 129, 0.08)',
                'rgba(168, 85, 247, 0.05)'
              ]
            }}
            transition={{
              duration: 20 + i * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Sacred Geometry: Matrix Lines */}
        <motion.svg 
          className="absolute w-[800px] h-[800px] opacity-[0.06] text-emerald-500"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.05" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.05" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.05" />
          {[...Array(12)].map((_, idx) => {
            const angle = (idx * 30 * Math.PI) / 180;
            const x2 = 50 + 45 * Math.cos(angle);
            const y2 = 50 + 45 * Math.sin(angle);
            return (
              <line 
                key={idx} 
                x1="50" 
                y1="50" 
                x2={x2} 
                y2={y2} 
                stroke="currentColor" 
                strokeWidth="0.05" 
              />
            );
          })}
        </motion.svg>
      </div>

      {/* 4. Gravity Particles (Sucking toward the Singularity) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          return (
            <motion.div
              key={i}
              className={`absolute h-1 w-1 rounded-full ${i % 2 === 0 ? 'bg-emerald-400/30' : 'bg-purple-400/30'}`}
              initial={{ 
                left: `${startX}%`, 
                top: `${startY}%`, 
                scale: 1, 
                opacity: 0 
              }}
              animate={{ 
                left: '50%', 
                top: '50%',
                scale: [1, 0.2, 0],
                opacity: [0, 0.7, 0]
              }}
              transition={{ 
                duration: 6 + Math.random() * 6, 
                repeat: Infinity, 
                delay: i * 0.8,
                ease: "easeIn"
              }}
            />
          );
        })}
      </div>

      {/* 5. Vignette & Grain */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020005] via-transparent to-[#020005] opacity-80" />
    </div>
  );
}
