'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import FinanceGauge from '../components/FinanceGauge';
import { LayoutDashboard, ShieldCheck, Zap, Globe, Coins, ReceiptText, Brain, Search, LogOut, FileText, Users, Eye, Check, Calendar } from 'lucide-react';
import BudgetTicker from '../components/BudgetTicker';
import StatusBanner from '../components/StatusBanner';
import { motion, AnimatePresence } from 'framer-motion';

interface BillingStatus {
  total_budget: number;
  remaining_balance: number;
  total_spent: number;
  last_usage: string;
}

interface SystemStatus {
  state: 'Active' | 'Locked';
  reason?: string;
  last_updated: string;
}

export default function FinanceHub() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [projectId] = useState('shanalcavityspace');
  const [mounted, setMounted] = useState(false);

  // Auth state
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Role and Tab state
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'admin-console' | 'user-inventory'>('dashboard');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [selectedUserInventory, setSelectedUserInventory] = useState<any[] | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  // User personal inventory stats
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [personalStats, setPersonalStats] = useState({ itemsCount: 0, queryCount: 0 });

  const fetchUserRoleAndProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      const userRole = profile?.role || 'user';
      setRole(userRole);
      
      if (userRole === 'user') {
        setCurrentTab('user-inventory');
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setRole('user');
      setCurrentTab('user-inventory');
    }
  };

  const fetchUserPersonalData = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUserInventory(data || []);
      
      const queryCount = data?.reduce((acc: number, item: any) => acc + (item.gemini_metadata?.last_scan_cost ? 1 : 0), 0) || 0;
      setPersonalStats({
        itemsCount: data?.length || 0,
        queryCount
      });
    } catch (err) {
      console.error("Error fetching personal data:", err);
    }
  };

  useEffect(() => {
    // Session sanitization on mount to prevent token bleed
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('invite') || window.location.hash.includes('type=invite')) {
      supabase.auth.signOut().then(() => {
        setSession(null);
        setRole(null);
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setMounted(true);
        fetchUserRoleAndProfile(session.user.id);
        fetchUserPersonalData();
        fetchBillingAndSystemStatus();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setMounted(true);
        fetchUserRoleAndProfile(session.user.id);
        fetchUserPersonalData();
        fetchBillingAndSystemStatus();
      } else {
        setRole(null);
        setCurrentTab('dashboard');
        setUserInventory([]);
        setPersonalStats({ itemsCount: 0, queryCount: 0 });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBillingAndSystemStatus = async () => {
    // Fetch Billing
    const { data: bData } = await supabase
      .from('app_config')
      .select('config_value')
      .eq('id', 'billing_status')
      .single();
    if (bData) setBilling(bData.config_value);

    // Fetch System Status
    const { data: sData } = await supabase
      .from('app_config')
      .select('config_value')
      .eq('id', 'system_status')
      .single();
    if (sData) setSystemStatus(sData.config_value);
  };

  useEffect(() => {
    if (!session) return;

    const sub = supabase
      .channel('config_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_config' }, (payload) => {
        if (payload.new.id === 'billing_status') setBilling(payload.new.config_value);
        if (payload.new.id === 'system_status') setSystemStatus(payload.new.config_value);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [session]);

  async function fetchAdminData() {
    if (role !== 'admin') return;
    try {
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*');
      if (pError) throw pError;

      const { data: items, error: iError } = await supabase
        .from('inventory')
        .select('user_id, gemini_metadata');
      if (iError) throw iError;

      const countsMap: { [key: string]: { itemsCount: number, queryCount: number } } = {};
      items?.forEach(item => {
        const uid = item.user_id || 'null';
        if (!countsMap[uid]) {
          countsMap[uid] = { itemsCount: 0, queryCount: 0 };
        }
        countsMap[uid].itemsCount++;
        countsMap[uid].queryCount += item.gemini_metadata?.last_scan_cost ? 1 : 0;
      });

      const list = profiles.map(p => ({
        ...p,
        itemsCount: countsMap[p.id]?.itemsCount || 0,
        queryCount: countsMap[p.id]?.queryCount || 0
      }));

      setUsersList(list);
    } catch (err) {
      console.error("Failed fetching admin stats:", err);
    }
  }

  async function viewUserInventory(targetUserId: string, targetEmail: string) {
    setSelectedUserEmail(targetEmail);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSelectedUserInventory(data);
    } catch (err: any) {
      console.error("Failed to view other user's inventory:", err);
      alert("Failed to access inventory. RLS / authorization restriction.");
    }
  }

  useEffect(() => {
    if (session && role === 'admin' && currentTab === 'admin-console') {
      fetchAdminData();
    }
  }, [session, role, currentTab]);

  const getGeminiEstimate = () => {
    if (!billing) return 'Calculating...';
    let avg = 0.10; 
    if (selectedModel.includes('pro')) avg = 1.25;
    const count = Math.floor(billing.remaining_balance / avg);
    return `≈ ${count.toLocaleString()} ${selectedModel.includes('pro') ? 'Pro' : 'Flash'} Scans`;
  };

  const handleManualHeartbeat = async () => {
    console.log('Manual heartbeat triggered...');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verification email sent or account created! Please sign in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setCurrentTab('dashboard');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-400 p-4 flex items-center justify-center font-sans selection:bg-orange-500/30 overflow-hidden relative">
        <div className="fixed inset-0 bg-grid pointer-events-none opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-zinc-950/60 backdrop-blur-xl border border-zinc-900 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_50px_rgba(249,115,22,0.05)] relative z-10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.4)] mx-auto mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2">Metropolis Authentication</h4>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-8">
            {isSignUp ? 'Create ' : 'Vault '}<span className="text-orange-500 underline decoration-zinc-800 underline-offset-4">{isSignUp ? 'Account' : 'Locked'}</span>
          </h1>

          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950/80 border border-zinc-900 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all font-bold"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950/80 border border-zinc-900 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all font-bold tracking-widest"
              />
            </div>
            
            {authError && (
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest text-center animate-pulse">{authError}</p>
            )}

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-4 rounded-2xl border border-orange-400/20 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all text-xs font-black uppercase tracking-widest italic"
            >
              {authLoading ? 'Authorizing...' : isSignUp ? 'Sign Up' : 'Verify & Unlock'}
            </button>
          </form>
          
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError('');
            }}
            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-all uppercase mt-6 block mx-auto underline underline-offset-4"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto space-y-12 pb-24 relative z-10 selection:bg-orange-500/30">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                <LayoutDashboard className="w-5 h-5 text-white" />
             </div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Metropolis Intelligence</h4>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
            Finance <span className="text-orange-500 underline decoration-zinc-800 underline-offset-8">Hub</span>
          </h1>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-white/5">
             <Globe className="w-4 h-4 text-zinc-700" />
             <span className="text-xs font-mono text-zinc-400">{projectId}</span>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-3 h-3" /> Secure Accounting Tunnel Active
          </p>
        </div>
      </header>

      {/* Role Navigation Tab Controls (Only shown for Admin users) */}
      {role === 'admin' && (
        <div className="flex gap-4 bg-zinc-950 p-1 rounded-2xl border border-white/5 w-fit">
          <button 
            onClick={() => {
              setCurrentTab('dashboard');
              setSelectedUserInventory(null);
            }}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${
              currentTab === 'dashboard' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Financial Dashboard
          </button>
          <button 
            onClick={() => {
              setCurrentTab('admin-console');
              setSelectedUserInventory(null);
            }}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${
              currentTab === 'admin-console' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            User Telemetry
          </button>
        </div>
      )}

      {/* Main Switch Panels */}
      {currentTab === 'admin-console' && role === 'admin' ? (
        /* ADMIN VIEW: USER TELEMETRY PANEL */
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full max-w-xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search user accounts..." 
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800 italic font-bold"
              />
            </div>
            <button 
              onClick={fetchAdminData}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-4 rounded-2xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest italic"
            >
              Refresh Stats
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-950/80">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">User Account</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Role</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Items</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Queries</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(user => (user.email || '').toLowerCase().includes(adminSearchQuery.toLowerCase()))
                      .map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-6 text-sm font-bold text-white">{user.email}</td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              user.role === 'admin' ? 'bg-orange-950/80 text-orange-500 border border-orange-500/30' : 'bg-zinc-900 text-zinc-400 border border-white/5'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-mono text-zinc-300 font-bold">{user.itemsCount}</td>
                          <td className="px-8 py-6 text-sm font-mono text-zinc-300 font-bold">{user.queryCount}</td>
                          <td className="px-8 py-6">
                            <button 
                              onClick={() => viewUserInventory(user.id, user.email)}
                              className="bg-zinc-900 hover:bg-orange-600 hover:text-white text-zinc-400 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest italic transition-all flex items-center gap-1"
                            >
                              <Eye size={10} /> View Items
                            </button>
                          </td>
                        </tr>
                      ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-20 text-xs font-mono text-zinc-700 uppercase tracking-widest">
                          Awaiting registry heartbeat...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected User Inventory Inspection */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-sm h-fit">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Assets Inspector</h4>
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                  {selectedUserEmail ? "User Inventory" : "No Account Selected"}
                </h2>
                {selectedUserEmail && (
                  <p className="text-[9px] font-mono text-zinc-500 truncate">{selectedUserEmail}</p>
                )}
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                {selectedUserInventory ? (
                  selectedUserInventory.map((item) => (
                    <div key={item.id} className="p-4 bg-zinc-950/80 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">{item.brand || 'Unbranded'}</p>
                        <p className="text-xs font-bold text-white uppercase">{item.name || 'Metrology Tool'}</p>
                        <p className="text-[9px] text-zinc-500 font-mono italic mt-0.5">{item.condition || 'Used'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        item.status === 'Sold' ? 'bg-green-950 text-green-400 border border-green-500/20' : 'bg-zinc-900 text-zinc-500'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center py-10 italic">
                    Select a user to inspect their RLS-isolated metrology uploads.
                  </p>
                )}
                {selectedUserInventory && selectedUserInventory.length === 0 && (
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center py-10 italic">
                    This user inventory is empty.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : currentTab === 'user-inventory' ? (
          /* STANDARD USER VIEW: MY ISOLATED INVENTORY */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass metropolis-glow p-8 rounded-[2rem] border border-white/5 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Personal Usage Telemetry</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">My Assets</p>
                    <p className="text-3xl font-black text-white italic mt-1">{personalStats.itemsCount} <span className="text-[10px] font-bold text-zinc-700 uppercase">Items</span></p>
                  </div>
                  <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">AI Queries</p>
                    <p className="text-3xl font-black text-white italic mt-1">{personalStats.queryCount} <span className="text-[10px] font-bold text-zinc-700 uppercase">Scans</span></p>
                  </div>
                </div>
              </div>
              <div className="glass metropolis-glow p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Active Session</h4>
                <p className="text-sm font-bold text-white">{session.user.email}</p>
                <p className="text-[9px] font-mono text-zinc-500">Secure RLS Isolation Boundary: Active</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-500" />
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">My Uploaded Metrology Tools</h2>
                </div>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-zinc-950/80">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Name</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Brand / Model</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Condition</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Fair Value</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userInventory.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-6 text-sm font-bold text-white">{item.name || 'Metrology Tool'}</td>
                          <td className="px-8 py-6 text-xs text-zinc-400">{item.brand || 'Unspecified'} {item.model || ''}</td>
                          <td className="px-8 py-6 text-xs text-zinc-400">{item.condition || 'Auto-Detected'}</td>
                          <td className="px-8 py-6 text-xs font-mono text-zinc-300 font-bold">${parseFloat(item.fair_market_price || 0).toFixed(2)}</td>
                          <td className="px-8 py-6">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              item.status === 'Sold' ? 'bg-green-950 text-green-400 border border-green-500/20' : 
                              item.status === 'Scanning' ? 'bg-orange-950 text-orange-500 animate-pulse border border-orange-500/20' : 'bg-zinc-900 text-zinc-500'
                            }`}>
                              {item.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {userInventory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-20 text-xs font-mono text-zinc-700 uppercase tracking-widest">
                            No assets in your secure vault.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
            </div>
          </div>
        </div>
      </div>
    ) : (
          /* ADMIN VIEW: METROPOLIS FINANCIAL HUB */
          <>
            <StatusBanner 
              status={systemStatus?.state || 'Active'} 
              reason={systemStatus?.reason} 
              onRefresh={handleManualHeartbeat}
            />

            {/* Primary Gauges */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FinanceGauge 
                title="Gemini API Studio"
                type="funds"
                current={billing?.remaining_balance || 0}
                total={billing?.total_budget}
                subtext={getGeminiEstimate()}
                project="Default Project"
                status={systemStatus?.state === 'Locked' ? 'critical' : 'active'}
              />
              
              <FinanceGauge 
                title="Google Cloud Platform"
                type="cost"
                current={1.15} 
                subtext="April 2026 Accrual"
                project="shanalcavityspace"
              />

              <FinanceGauge 
                title="Intelligence Pool"
                type="funds"
                current={0}
                total={0}
                status="warning"
                subtext="Connect Anthropic/OpenAI"
                project="External APIs"
              />
            </section>

            {/* Sustained Run Projection */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass metropolis-glow p-8 rounded-[2rem] border border-white/5 space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap className="w-24 h-24 text-orange-500" />
                 </div>
                 
                 <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Sustainability Forecast</h4>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">24-Hour <span className="text-orange-500">Burn</span></h2>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efficiency Mode (Flash)</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-2xl font-black text-white italic">$0.72</span>
                             <span className="text-[10px] font-bold text-zinc-700 uppercase">/ 24 hrs</span>
                          </div>
                       </div>
                       <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="w-full h-full bg-emerald-500/30"></div>
                       </div>
                       <p className="text-[10px] font-bold text-emerald-500 uppercase">{(billing?.remaining_balance || 0) > 0.72 ? "Sustained" : "Insufficient funds"}</p>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Precision Mode (Pro)</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-2xl font-black text-white italic">$9.00</span>
                             <span className="text-[10px] font-bold text-zinc-700 uppercase">/ 24 hrs</span>
                          </div>
                       </div>
                       <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="w-1/4 h-full bg-rose-500/30"></div>
                       </div>
                       <p className="text-[10px] font-bold text-rose-500 uppercase">
                          {Math.floor(((billing?.remaining_balance || 0) / 0.375)).toLocaleString()} Min Runway
                       </p>
                    </div>
                 </div>
              </div>

              <div className="glass metropolis-glow p-8 rounded-[2rem] border border-white/5 flex flex-col justify-between">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Infrastructure Capacity</h4>
                       <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Data Flow Estimates</span>
                       </div>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Max Identification Rate</p>
                             <p className="text-2xl font-black text-white tracking-tighter">1,440 <span className="text-zinc-600 italic font-bold text-sm">Tools / Day</span></p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Projected Traffic</p>
                             <p className="text-2xl font-black text-white tracking-tighter">~8.6 <span className="text-zinc-600 italic font-bold text-sm">GB / Day</span></p>
                          </div>
                       </div>

                       <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-orange-500 blur-[2px] animate-pulse"></div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-relaxed">
                                Your current balance of <span className="text-white">${billing?.remaining_balance?.toFixed(2)}</span> provides approximately 
                                <span className="text-white ml-1">{Math.floor((billing?.remaining_balance || 0) / (0.375 / 60)).toLocaleString()} hours</span> of continuous high-precision processing.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* Budget Forecast Ticker */}
            <BudgetTicker balance={billing?.remaining_balance || 0} />

            {/* Detailed Cost Breakdown */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <ReceiptText className="w-5 h-5 text-zinc-500" />
                 <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Cost Breakdown</h2>
              </div>

              <div className="glass metropolis-glow rounded-3xl overflow-hidden border border-white/5">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/50">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Service SKU</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Unit Type</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Pricing (In/Out)</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 text-right">Est. Yield</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5 font-bold text-white">Gemini 1.5 Pro</td>
                        <td className="px-6 py-5 text-zinc-400">1M Tokens</td>
                        <td className="px-6 py-5 text-zinc-400 font-mono italic text-xs">$1.25 / $5.00</td>
                        <td className="px-6 py-5 text-right font-black text-white italic">≈ 700 Snaps</td>
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5 font-bold text-white">Gemini 1.5 Flash</td>
                        <td className="px-6 py-5 text-zinc-400">1M Tokens</td>
                        <td className="px-6 py-5 text-zinc-400 font-mono italic text-xs">$0.075 / $0.30</td>
                        <td className="px-6 py-5 text-right font-black text-white italic">≈ 11,000 Snaps</td>
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5 font-bold text-white">Cloud Storage</td>
                        <td className="px-6 py-5 text-zinc-400">Standard (GB-month)</td>
                        <td className="px-6 py-5 text-zinc-400 font-mono italic text-xs">$0.02 per GB</td>
                        <td className="px-6 py-5 text-right font-black text-zinc-500 italic">Unlimited</td>
                      </tr>
                    </tbody>
                 </table>
              </div>
              
              <div className="flex items-center justify-between px-6">
                 <div className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-zinc-700" />
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Pricing data sourced from live billing link provided</p>
                 </div>
                 {mounted && (
                    <p className="text-[10px] text-zinc-500 italic">Last Refreshed: {new Date().toLocaleTimeString()}</p>
                 )}
              </div>
            </section>
          </>
        )}
      
      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 py-4 px-8 flex justify-between items-center z-50">
         <div className="flex gap-8">
           <button className={`text-[10px] font-black uppercase transition-colors ${currentTab === 'dashboard' ? 'text-white border-b-2 border-orange-600 pb-1' : 'text-zinc-600 hover:text-white'}`} onClick={() => { if (role === 'admin') setCurrentTab('dashboard'); }}>Accounting Dash</button>
           {role === 'admin' && (
             <button className={`text-[10px] font-black uppercase transition-colors ${currentTab === 'admin-console' ? 'text-white border-b-2 border-orange-600 pb-1' : 'text-zinc-600 hover:text-white'}`} onClick={() => setCurrentTab('admin-console')}>User Telemetry</button>
           )}
           {session && (
             <button className={`text-[10px] font-black uppercase transition-colors ${currentTab === 'user-inventory' ? 'text-white border-b-2 border-orange-600 pb-1' : 'text-zinc-600 hover:text-white'}`} onClick={() => setCurrentTab('user-inventory')}>My Inventory</button>
           )}
         </div>
         <button onClick={handleLogout} className="text-[10px] font-bold uppercase text-zinc-500 hover:text-rose-500 transition-all flex items-center gap-1">
            <LogOut size={12} /> Exit Hub
         </button>
      </footer>
    </main>
  );
}
