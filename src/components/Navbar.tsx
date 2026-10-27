import React from 'react';
import {
  ChefHat,
  Camera,
  BookOpen,
  Refrigerator,
  Clock,
  Sparkles,
  Heart,
  Settings,
  Database,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AppView, InventoryItem } from '../types';
import { getExpiryStatus } from '../services/matching';
import { isSupabaseConfigured } from '../services/supabase';

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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Count items expiring in <= 3 days
  const expiringCount = inventory.filter(
    (item) => getExpiryStatus(item.expiryDate).status === 'expiring_soon'
  ).length;

  const isSupabase = isSupabaseConfigured();

  const navItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: ChefHat },
    { id: 'scanner' as AppView, label: 'Scan Food', icon: Camera, highlight: true },
    { id: 'recipes' as AppView, label: 'Recipes', icon: BookOpen },
    {
      id: 'inventory' as AppView,
      label: 'My Kitchen',
      icon: Refrigerator,
      badge: inventory.length > 0 ? inventory.length : undefined,
    },
    {
      id: 'expiry' as AppView,
      label: 'Expiry Tracker',
      icon: Clock,
      alertBadge: expiringCount > 0 ? expiringCount : undefined,
    },
    { id: 'assistant' as AppView, label: 'AI Chef', icon: Sparkles },
    {
      id: 'favorites' as AppView,
      label: 'Saved',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
  ];

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E2EBE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-sm group-hover:bg-[#143628] transition-colors">
              <ChefHat className="w-6 h-6 text-[#E7EFEA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#1B4332] tracking-tight">Smart Kitchen</span>
                <span className="text-[10px] font-semibold bg-[#E7EFEA] text-[#1B4332] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">Zero-Waste Culinary Intelligence</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : item.highlight
                      ? 'text-[#1B4332] bg-[#E7EFEA] hover:bg-[#d8e4dc]'
                      : 'text-stone-700 hover:text-[#1B4332] hover:bg-[#F0F4F1]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#1B4332]' : 'text-stone-500'}`} />
                  <span>{item.label}</span>

                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#E7EFEA] text-[#1B4332]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.alertBadge !== undefined && (
                    <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full font-bold bg-amber-500 text-white animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      {item.alertBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Database state & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav('settings')}
              title={isSupabase ? 'Supabase Postgres Connected' : 'Local Storage Mode (Click to configure Supabase)'}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-[#E2EBE5] bg-white text-stone-600 hover:bg-[#F0F4F1] transition-colors"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabase ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span className="font-medium">{isSupabase ? 'Supabase' : 'Local DB'}</span>
            </button>

            <button
              onClick={() => handleNav('settings')}
              className={`p-2 rounded-lg text-stone-600 hover:text-[#1B4332] hover:bg-[#F0F4F1] transition-colors ${
                currentView === 'settings' ? 'bg-[#E7EFEA] text-[#1B4332]' : ''
              }`}
              title="Settings & Preferences"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-[#F0F4F1]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2EBE5] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#1B4332] text-white'
                    : 'text-stone-700 hover:bg-[#F0F4F1] hover:text-[#1B4332]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.alertBadge !== undefined && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                      <AlertTriangle className="w-3 h-3" />
                      {item.alertBadge} Expiring
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          <div className="pt-2 border-t border-stone-200">
            <button
              onClick={() => handleNav('settings')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-[#F0F4F1]"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-stone-500" />
                <span>Settings & Database</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-stone-100 rounded text-stone-600">
                {isSupabase ? 'Supabase Active' : 'Local Mode'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
