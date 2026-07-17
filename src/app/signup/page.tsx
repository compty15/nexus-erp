'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signUp } from './actions';
import { Activity, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/shared/lib/supabase';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    getUser();
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await signUp(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-purple-500/20 bg-[#111] p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-purple-600 shadow-2xl shadow-purple-500/20">
              <UserPlus className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Active Node Session</h2>
            <p className="mt-3 text-sm font-medium text-gray-500 uppercase tracking-widest text-center">
              Signed in as <span className="text-purple-400 font-mono block mt-1">{currentUser.email}</span>
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <Link
              href="/"
              className="flex w-full justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition-all hover:bg-gray-200 text-center uppercase tracking-widest"
            >
              Enter Dashboard
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setCurrentUser(null);
                window.location.reload();
              }}
              className="flex w-full justify-center rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-4 text-sm font-black text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest"
            >
              Log Out & Register New Node
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#222] bg-[#111] p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-600 shadow-2xl shadow-emerald-500/20">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Join Nexus</h2>
          <p className="mt-3 text-sm font-medium text-gray-500 uppercase tracking-widest">Create Your Intelligence Node</p>
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
                className="block w-full rounded-2xl border border-[#222] bg-[#0a0a0a] px-5 py-4 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
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
                autoComplete="new-password"
                required
                className="block w-full rounded-2xl border border-[#222] bg-[#0a0a0a] px-5 py-4 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
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
            {loading ? 'Initializing...' : 'Establish Node'}
          </button>
        </form>
        
        <div className="flex flex-col items-center gap-4">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Authorization
          </Link>
          <p className="text-center text-[10px] text-gray-600 font-medium">
            Subject to Terms of Intelligence Agreement
          </p>
        </div>
      </div>
    </div>
  );
}
