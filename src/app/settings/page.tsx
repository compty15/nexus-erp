'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Percent, 
  Key, 
  Save, 
  RotateCcw,
  ShieldCheck,
  Smartphone,
  UserPlus,
  Share2
} from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import { useNotifications } from '@/lib/notifications';

export default function SettingsPage() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    unit_system: 'imperial',
    default_fee_percent: 13.25,
    ebay_api_key: '',
    etsy_api_key: '',
    shopify_api_key: '',
    shopify_store_url: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (data) {
      setSettings(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        id: '00000000-0000-0000-0000-000000000000',
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      addNotification({ type: 'error', title: 'Save Failed', message: error.message });
    } else {
      addNotification({ type: 'success', title: 'Settings Saved', message: 'Your configuration has been updated.' });
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-500/10 p-3">
            <SettingsIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            <p className="text-gray-500">Configure global defaults and marketplace integrations.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-95"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid gap-8">
        {/* Localization */}
        <section className="rounded-3xl border border-[#222] bg-[#111] p-8">
          <div className="mb-6 flex items-center gap-3">
            <Globe className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Localization & Units</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Unit System</label>
              <div className="flex rounded-xl bg-[#0a0a0a] p-1">
                {['imperial', 'metric'].map((sys) => (
                  <button
                    key={sys}
                    onClick={() => setSettings({ ...settings, unit_system: sys })}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      settings.unit_system === sys ? 'bg-[#222] text-white shadow-lg' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {sys === 'imperial' ? 'Imperial (In/Lb)' : 'Metric (Cm/Kg)'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Default Fee Estimate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.default_fee_percent}
                  onChange={(e) => setSettings({ ...settings, default_fee_percent: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
                <Percent className="absolute right-4 top-3 h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace APIs */}
        <section className="rounded-3xl border border-[#222] bg-[#111] p-8">
          <div className="mb-6 flex items-center gap-3">
            <Key className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Marketplace Automations</h2>
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">eBay API Key</label>
                <input
                  type="password"
                  value={settings.ebay_api_key}
                  onChange={(e) => setSettings({ ...settings, ebay_api_key: e.target.value })}
                  placeholder="Enter eBay Developer Token..."
                  className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Etsy API Key</label>
                <input
                  type="password"
                  value={settings.etsy_api_key}
                  onChange={(e) => setSettings({ ...settings, etsy_api_key: e.target.value })}
                  placeholder="Enter Etsy App Key..."
                  className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 border-t border-[#222] pt-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Shopify Store URL</label>
                <input
                  type="text"
                  value={settings.shopify_store_url}
                  onChange={(e) => setSettings({ ...settings, shopify_store_url: e.target.value })}
                  placeholder="my-store.myshopify.com"
                  className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Shopify Admin API Key</label>
                <input
                  type="password"
                  value={settings.shopify_api_key}
                  onChange={(e) => setSettings({ ...settings, shopify_api_key: e.target.value })}
                  placeholder="shpat_..."
                  className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* User Invitations */}
        <section className="rounded-3xl border border-[#222] bg-[#111] p-8">
          <div className="mb-6 flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">User Invitations</h2>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 leading-relaxed">
                Invite friends or team members to join your Nexus environment. Each new user establishes their own intelligence node within the network.
              </p>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/signup`;
                navigator.clipboard.writeText(url);
                addNotification({
                  type: 'success',
                  title: 'Link Copied',
                  message: 'Invite link copied to clipboard. Share it with your friend!'
                });
              }}
              className="flex items-center gap-3 rounded-2xl bg-purple-600/10 border border-purple-500/20 px-8 py-4 text-xs font-black uppercase tracking-widest text-purple-400 hover:bg-purple-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Share2 className="h-4 w-4" />
              Copy Invite Link
            </button>
          </div>
        </section>

        {/* Security & System */}
        <div className="flex items-center justify-between rounded-2xl bg-[#111] p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Encryption Active</p>
              <p className="text-xs text-gray-500">Sensitive keys are masked and encrypted at rest.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
