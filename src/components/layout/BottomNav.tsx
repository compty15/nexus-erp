'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  ShoppingCart, 
  BookOpen, 
  Truck, 
  Settings,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    async function checkAdmin() {
      const { supabase } = await import('@/shared/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const email = user.email || '';
        const role = user.user_metadata?.role || '';
        if (email.includes('admin') || email === 'compt15@gmail.com' || email === 'compty15@gmail.com' || email === 'compton248@gmail.com' || role === 'admin') {
          setIsAdmin(true);
        }
      }
    }
    checkAdmin();
  }, []);

  const navItems = [
    { label: 'Active', icon: Home, href: '/' },
    { label: 'Sold', icon: ShoppingCart, href: '/inventory/sold' },
    { label: 'Ledger', icon: BookOpen, href: '/ledger' },
    { label: 'Logistics', icon: Truck, href: '/shipping' },
    { label: 'Settings', icon: Settings, href: '/settings' },
    ...(isAdmin ? [{ label: 'Admin', icon: ShieldAlert, href: '/admin' }] : []),
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 z-[100] flex w-[90%] -translate-x-1/2 items-center justify-between gap-1 rounded-[2.5rem] border border-white/10 bg-black/60 p-2 backdrop-blur-2xl shadow-2xl md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex flex-1 flex-col items-center justify-center gap-1 py-2"
          >
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 rounded-[2rem] bg-white/5"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={`relative flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
              <Icon 
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-white' : 'text-titanium-500 group-hover:text-titanium-300'
                }`} 
              />
              {isActive && (
                <motion.div 
                  layoutId="active-dot"
                  className="absolute -top-1 -right-1 h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                />
              )}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${
              isActive ? 'text-white' : 'text-titanium-600 group-hover:text-titanium-400'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
