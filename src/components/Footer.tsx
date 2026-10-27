import React from 'react';
import { BrandLogo } from './BrandLogo';
import { AppView } from '../types';
import { Sparkles, Utensils, Shield, Heart, ArrowUpRight, Github, Zap } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative bg-gradient-to-br from-[#0B2016] via-[#133825] to-[#081710] text-stone-200 pt-16 pb-12 overflow-hidden border-t border-[#1C4C33]">
      {/* Ambient colorful glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#27AE60]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E67E22]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Bar with colorful pill badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-12 border-b border-[#23583C]/70">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xs border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block">Visual Scanner</span>
              <span className="text-[10px] text-emerald-300/80">Instant recognition</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xs border border-amber-500/20 hover:border-amber-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block">Chef RasoiAI</span>
              <span className="text-[10px] text-amber-300/80">Live culinary mentor</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xs border border-rose-500/20 hover:border-rose-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block">Zero Waste</span>
              <span className="text-[10px] text-rose-300/80">Rescue expiring food</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xs border border-sky-500/20 hover:border-sky-500/40 transition-all">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block">Private & Local</span>
              <span className="text-[10px] text-sky-300/80">Offline-first storage</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 py-12 border-b border-[#23583C]/70">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <BrandLogo className="w-10 h-10 ring-2 ring-emerald-500/30" />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-extrabold text-2xl text-white tracking-tight">
                    Rasoi
                  </span>
                  <span className="text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 text-stone-950 px-2 py-0.5 rounded-md ml-1.5 shadow-xs">
                    AI
                  </span>
                </div>
                <span className="text-xs text-emerald-300/80 font-medium tracking-wide">
                  Culinary Intelligence & Kitchen Companion
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 max-w-sm leading-relaxed">
              Transform everyday groceries into extraordinary meals. Instant visual ingredient scanning, deterministic recipe matching, automated expiry tracking, and live culinary guidance.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                RasoiAI Engine Online & Ready
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Explore Kitchen</span>
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-stone-300 hover:text-emerald-300 transition-colors flex items-center gap-1 group"
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400 group-hover:w-2 transition-all" />
                  <span>Kitchen Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('recipes')}
                  className="text-stone-300 hover:text-emerald-300 transition-colors flex items-center gap-1 group"
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400 group-hover:w-2 transition-all" />
                  <span>Recipe Catalog (30+ Dishes)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="text-stone-300 hover:text-emerald-300 transition-colors flex items-center gap-1 group"
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400 group-hover:w-2 transition-all" />
                  <span>My Kitchen Inventory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('expiry')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-1 group"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-400 group-hover:w-2 transition-all" />
                  <span>Expiry Tracker & Rescue</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-1 group"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-400 group-hover:w-2 transition-all" />
                  <span>Chef RasoiAI Live Chat</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & GitHub */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Open Source & Community
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              RasoiAI is crafted for modern home cooks, sustainable zero-waste meal preppers, and culinary enthusiasts worldwide.
            </p>

            <div className="pt-2">
              <a
                href="https://github.com/samirpandey-07/RasoiAI"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Github className="w-4 h-4 text-emerald-400" />
                <span>Star on GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="flex items-center gap-1.5">
            &copy; {new Date().getFullYear()} <strong className="text-white">RasoiAI</strong>. Crafted with
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
            by <span className="text-amber-300 font-semibold">khushi</span>.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span className="hover:text-emerald-300 transition-colors">Zero-Waste Architecture</span>
            <span>&bull;</span>
            <span className="hover:text-emerald-300 transition-colors">Local-First Privacy</span>
            <span>&bull;</span>
            <span className="hover:text-emerald-300 transition-colors">Deterministic Matching</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
