'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { login } from './actions';
import { Activity, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the server action will redirect automatically
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#222] bg-[#111] p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-blue-600 shadow-2xl shadow-blue-500/20">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white">NEXUS ERP</h2>
          <p className="mt-3 text-sm font-medium text-gray-500">Inventory Intelligence & Commerce</p>
        </div>

        <form action={handleSubmit} className="mt-10 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-2xl border border-[#222] bg-[#0a0a0a] px-5 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1" htmlFor="password">
                Security Key
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-2xl border border-[#222] bg-[#0a0a0a] px-5 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 text-sm font-medium text-red-400 border border-red-500/20"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition-all hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
            </span>
            {loading ? 'Authorizing...' : 'Enter Nexus'}
          </button>
        </form>
        
        <p className="text-center text-[10px] text-gray-600 font-medium">
          Secure Cloud Deployment via Vercel & Supabase
        </p>
      </div>
    </div>
  );
}
