import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Calendar,
  Sparkles,
  Heart,
  Camera,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { AppView, InventoryItem } from '../types';
import { getExpiryStatus } from '../services/matching';
import { BrandLogo } from './BrandLogo';

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

  const navItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recipes' as AppView, label: 'Recipes', icon: BookOpen },
    { id: 'inventory' as AppView, label: 'My Kitchen', icon: ShoppingBag },
    { id: 'expiry' as AppView, label: 'Expiry', icon: Calendar, hasAlert: expiringCount > 0 },
    { id: 'assistant' as AppView, label: 'Chef RasoiAI', icon: Sparkles },
    { id: 'favorites' as AppView, label: 'Saved', icon: Heart, badge: favoritesCount > 0 ? favoritesCount : undefined },
  ];

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EBE6DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <BrandLogo />
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-bold text-base sm:text-lg text-stone-900 tracking-tight">
                  Rasoi
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold bg-[#F5EAD9] text-[#97602D] px-1.5 sm:px-2 py-0.5 rounded-md ml-1 sm:ml-1.5 uppercase">
                  AI
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium tracking-normal -mt-0.5 hidden xs:block">
                Culinary Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs transition-all select-none ${
                    isActive
                      ? 'bg-[#DDEAE1] text-[#163828] font-bold rounded-full shadow-xs'
                      : 'text-stone-700 hover:text-[#163828] hover:bg-stone-200/40 rounded-full font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#163828]' : 'text-stone-500'}`} />
                  <span>{item.label}</span>

                  {item.hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-[#E67E22] -ml-0.5" />
                  )}

                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Scan Ingredients Button */}
            <button
              onClick={() => handleNav('scanner')}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#163828] hover:bg-[#122D20] text-white text-xs font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-xs active:scale-95 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan Ingredients</span>
              <span className="sm:hidden">Scan</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => handleNav('expiry')}
              title="Notifications"
              className="relative p-2 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-200/50 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {expiringCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E67E22]" />
              )}
            </button>

            {/* Profile Avatar (No Auth Required) */}
            <div
              onClick={() => handleNav('settings')}
              className="flex items-center gap-1 cursor-pointer p-1 rounded-full hover:bg-stone-200/50 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=70"
                alt="Chef Profile"
                loading="lazy"
                decoding="async"
                className="w-7 h-7 rounded-full object-cover border border-stone-300"
              />
              <ChevronDown className="w-3 h-3 text-stone-500 hidden sm:block" />
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-200/50"
              aria-label="Menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-stone-800 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`w-full h-0.5 bg-stone-800 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-stone-800 transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EBE6DD] bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#DDEAE1] text-[#163828]'
                      : 'bg-white border border-[#EBE6DD] text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#163828]" />
                    <span>{item.label}</span>
                  </div>
                  {item.hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-[#E67E22]" />
                  )}
                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="pt-2">
            <button
              onClick={() => handleNav('scanner')}
              className="w-full flex items-center justify-center gap-2 bg-[#163828] text-white py-3 rounded-full text-xs font-semibold shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Ingredients</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
