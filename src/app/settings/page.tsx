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
  Share2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import { useNotifications } from '@/lib/notifications';
import { useUI } from '@/lib/ui-context';

export default function SettingsPage() {
  const { addNotification } = useNotifications();
  const { primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor } = useUI();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    unit_system: 'imperial',
    default_fee_percent: 13.25,
    ebay_api_key: '',
    etsy_api_key: '',
    shopify_api_key: '',
    shopify_store_url: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  async function handlePasswordUpdate() {
    if (!currentPassword) {
      addNotification({ type: 'error', title: 'Error', message: 'Current password cannot be empty.' });
      return;
    }
    if (!newPassword) {
      addNotification({ type: 'error', title: 'Error', message: 'New password cannot be empty.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addNotification({ type: 'error', title: 'Error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      addNotification({ type: 'error', title: 'Error', message: 'New password must be at least 6 characters.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      addNotification({
        type: 'success',
        title: 'Password Updated',
        message: 'Your account security key has been updated successfully.'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: err.message
      });
    } finally {
      setUpdatingPassword(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        window.location.href = '/login';
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setSettings(data);
      } else {
        // Auto-initialize settings for new users if they don't exist
        const defaultSettings = {
          id: user.id,
          unit_system: 'imperial',
          default_fee_percent: 13.25,
          updated_at: new Date().toISOString()
        };
        
        const { error: initError } = await supabase.from('user_settings').insert(defaultSettings);
        if (!initError) {
          setSettings(defaultSettings as any);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: 'Could not communicate with the database node.'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addNotification({ type: 'error', title: 'Unauthorized', message: 'You must be logged in to save settings.' });
      return;
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        id: user.id,
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
                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                const url = `${baseUrl}/signup`;
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

        {/* Security & Password Reset */}
        <section className="rounded-3xl border border-[#222] bg-[#111] p-8">
          <div className="mb-6 flex items-center gap-3">
            <Key className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Security & Password</h2>
          </div>
          <div className="space-y-6">
            <p className="text-sm text-gray-400 leading-relaxed">
              Update the security key for your active node session.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current security key"
                  className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify new security key"
                    className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handlePasswordUpdate}
              disabled={updatingPassword}
              className="flex items-center gap-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 px-8 py-4 text-xs font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </section>

        {/* Theme Customization */}
        <section className="rounded-3xl border border-[#222] bg-[#111] p-8">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Theme & Cosmological Aesthetics</h2>
          </div>
          <p className="mb-6 text-sm text-gray-400 leading-relaxed">
            Adjust the system colors for the cosmic geometry abyss black hole engine. Adjusting these colors changes the primary UI accent color and the secondary background space glow.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Primary Accent Color */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Primary Accent Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { name: 'Quantum Violet', value: '#c084fc' },
                  { name: 'Emerald Horizon', value: '#34d399' },
                  { name: 'Solar Gold', value: '#fb923c' },
                  { name: 'Nebula Pink', value: '#f472b6' },
                  { name: 'Hyper Cyan', value: '#22d3ee' },
                  { name: 'Starlight Silver', value: '#cbd5e1' }
                ].map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    title={color.name}
                    className={`h-10 w-full rounded-xl transition-all relative ${
                      primaryColor === color.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111] scale-105' 
                        : 'opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {primaryColor === color.value && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black drop-shadow-md">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                Active Primary: <span className="font-mono text-gray-300">{primaryColor}</span>
              </div>
            </div>

            {/* Secondary Space Glow */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Secondary Space Glow
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { name: 'Abyss Violet', value: '#581c87' },
                  { name: 'Abyss Green', value: '#022415' },
                  { name: 'Abyss Blue', value: '#1e3a8a' },
                  { name: 'Abyss Gold', value: '#7c2d12' },
                  { name: 'Abyss Cyan', value: '#083344' }
                ].map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSecondaryColor(color.value)}
                    title={color.name}
                    className={`h-10 w-full rounded-xl transition-all relative ${
                      secondaryColor === color.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111] scale-105' 
                        : 'opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {secondaryColor === color.value && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                Active Secondary: <span className="font-mono text-gray-300">{secondaryColor}</span>
              </div>
            </div>
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
