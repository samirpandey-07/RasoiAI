import React from 'react';
import { BrandLogo } from './BrandLogo';
import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#EBE6DD] bg-[#FAF7F2] text-stone-600 pt-14 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#EBE6DD]">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <BrandLogo />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-extrabold text-xl text-stone-900 tracking-tight">
                    RasoiAI
                  </span>
                  <span className="text-[10px] font-bold bg-[#F5EAD9] text-[#97602D] px-2 py-0.5 rounded-md ml-2 uppercase">
                    Culinary Intelligence
                  </span>
                </div>
                <span className="text-xs text-stone-500 font-medium tracking-normal">
                  Zero-Waste Smart Kitchen System
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 max-w-sm leading-relaxed">
              Transform everyday groceries into extraordinary meals. Instant visual ingredient scanning, deterministic recipe matching, automated expiry tracking, and live culinary guidance.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse" />
              <span className="text-xs font-semibold text-stone-700">
                RasoiAI Vision & Engine Operational
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Explore Kitchen
            </h4>
            <ul className="space-y-2 text-xs font-medium text-stone-600">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-[#163828] hover:underline transition-colors"
                >
                  Kitchen Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('recipes')}
                  className="hover:text-[#163828] hover:underline transition-colors"
                >
                  Recipe Catalog (30+ Dishes)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="hover:text-[#163828] hover:underline transition-colors"
                >
                  My Kitchen Inventory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('expiry')}
                  className="hover:text-[#163828] hover:underline transition-colors"
                >
                  Expiry Tracker & Food Rescue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="hover:text-[#163828] hover:underline transition-colors"
                >
                  Chef RasoiAI Live Chat
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Capabilities */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Key Capabilities
            </h4>
            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="p-3 rounded-2xl bg-white border border-[#EBE6DD]">
                <span className="font-bold text-stone-900 block text-xs">Visual Grocery Scanner</span>
                <span className="text-[11px] text-stone-500">Multimodal ingredient recognition without guesswork</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#EBE6DD]">
                <span className="font-bold text-stone-900 block text-xs">Zero-Waste Engine</span>
                <span className="text-[11px] text-stone-500">Ranks recipes prioritizing ingredients near expiration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-stone-800">RasoiAI</strong>. All rights reserved. Made for passionate home cooks.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Zero Food Waste Initiative</span>
            <span>&bull;</span>
            <span>Local & Private Storage</span>
            <span>&bull;</span>
            <span>Culinary Companion</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
