import React, { useState } from 'react';
import { AppView, InventoryItem } from '../types';
import { getExpiryStatus } from '../services/matching';
import { isSupabaseConfigured } from '../services/supabase';
import { AiSparkleBadge } from './AiSparkleIcon';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  inventory: InventoryItem[];
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  inventory,
  favoritesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count items expiring in <= 3 days
  const expiringCount = inventory.filter(
    (item) => getExpiryStatus(item.expiryDate).status === 'expiring_soon'
  ).length;

  const isSupabase = isSupabaseConfigured();

  const navItems: { id: AppView; label: string; badge?: number; alertDot?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'inventory', label: 'Kitchen', badge: inventory.length > 0 ? inventory.length : undefined },
    { id: 'expiry', label: 'Expiry', alertDot: expiringCount > 0 },
    { id: 'assistant', label: 'AI Chef' },
    { id: 'favorites', label: 'Saved', badge: favoritesCount > 0 ? favoritesCount : undefined },
  ];

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Mark */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <AiSparkleBadge size="md" className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-stone-900">
                  Smart Kitchen
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-stone-600 hidden md:inline tracking-normal font-medium">
                Culinary Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Minimalist Text Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100/70 p-1 rounded-xl border border-black/[0.04]">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 select-none ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
                  }`}
                >
                  <span>{item.label}</span>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.alertDot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Direct Scan CTA Button */}
            <button
              onClick={() => handleNav('scanner')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                currentView === 'scanner'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 active:scale-95'
              }`}
            >
              <span>+ Scan Food</span>
            </button>

            {/* Supabase Status Pill */}
            <button
              onClick={() => handleNav('settings')}
              title={isSupabase ? 'Cloud Sync Active (Supabase)' : 'Offline Local Storage (Click to connect Cloud)'}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-black/[0.06] bg-white text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabase ? 'bg-emerald-500' : 'bg-stone-400'
                }`}
              />
              <span>{isSupabase ? 'Cloud' : 'Local'}</span>
            </button>

            {/* Settings Link */}
            <button
              onClick={() => handleNav('settings')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                currentView === 'settings'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-black/[0.06] bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              Settings
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-lg border border-black/[0.06] bg-white text-stone-700 hover:bg-stone-100 transition-colors flex flex-col justify-center items-center w-9 h-9 gap-1"
            >
              <span
                className={`w-4 h-0.5 bg-stone-800 transition-transform ${
                  mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-stone-800 transition-opacity ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-stone-800 transition-transform ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-black/[0.06] bg-[#FBFBFA]/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-black/[0.05] text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.alertDot && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-2">
            <button
              onClick={() => handleNav('scanner')}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold text-center shadow-xs"
            >
              + Scan Food
            </button>
            <button
              onClick={() => handleNav('settings')}
              className="px-4 py-2.5 rounded-xl bg-white border border-black/[0.06] text-stone-700 text-xs font-semibold"
            >
              Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
