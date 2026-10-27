import React from 'react';
import {
  Camera,
  BookOpen,
  ArrowRight,
  Sparkles,
  FileText,
  Leaf,
  Check,
  Pencil,
  Clock,
  ChefHat,
  Users,
} from 'lucide-react';
import { AppView, Recipe } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  featuredRecipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectRecipe,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] relative overflow-hidden py-10 lg:py-16">
      {/* Decorative Basil Leaf (Left Side) */}
      <div className="absolute top-10 -left-6 pointer-events-none select-none opacity-85 hidden xl:block">
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=260&q=80"
          alt="Fresh herbs"
          className="w-44 h-44 object-contain rotate-[-20deg] drop-shadow-md"
        />
      </div>

      {/* Decorative Basil & Tomato (Bottom Left) */}
      <div className="absolute -bottom-8 -left-8 pointer-events-none select-none opacity-90 hidden xl:block">
        <img
          src="https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=280&q=80"
          alt="Culinary produce"
          className="w-56 h-56 object-contain rotate-[15deg] drop-shadow-lg"
        />
      </div>

      {/* Decorative Herb Sprig (Right Side) */}
      <div className="absolute top-1/2 -right-10 pointer-events-none select-none opacity-80 hidden xl:block">
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=260&q=80"
          alt="Fresh herbs"
          className="w-48 h-48 object-contain rotate-[45deg] drop-shadow-md"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Hero Copy & Calls to Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9F0E8] border border-[#D5E2D3] text-[#2D5A3D] text-xs font-bold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-[#2D5A3D]" />
              <span>Your Personal AI Kitchen</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-stone-900 tracking-tight leading-[1.12]">
              Cook <span className="text-[#163828] font-bold">smarter</span> with
              what you{' '}
              <span className="relative inline-block text-stone-900">
                already have.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#4E8D62] pointer-events-none"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 8C45 4 145 3 197 8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              Smart Kitchen AI identifies ingredients from photos, tracks expiration timelines, prevents food waste, and curates chef-quality recipes with hands-free cooking guidance.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary Green Pill Button */}
              <button
                onClick={() => onNavigate('scanner')}
                className="flex items-center gap-2.5 bg-[#163828] hover:bg-[#122D20] text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Scan ingredients</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              {/* Secondary White Pill Button */}
              <button
                onClick={() => onNavigate('recipes')}
                className="flex items-center gap-2 bg-white border border-[#DDD6CE] hover:border-stone-400 text-stone-800 px-6 py-3.5 rounded-full font-semibold text-sm shadow-xs hover:bg-stone-50 active:scale-95 transition-all"
              >
                <BookOpen className="w-4 h-4 text-stone-600" />
                <span>Explore recipes</span>
              </button>

              {/* Tertiary Underlined Link */}
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-[#163828] hover:text-[#0F241A] font-bold text-sm underline underline-offset-4 decoration-[#163828] flex items-center gap-1.5 transition-colors pl-2"
              >
                <span>Open dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Mini Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[#EBE6DD]">
              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E9F0E8] text-[#163828] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">AI ingredient scan</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Multimodal recognition</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F5EAD9] text-[#97602D] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">Exact recipe matching</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Find recipes you can make</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E9F0E8] text-[#163828] flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">Less food waste</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Prioritize expiring food</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[28px] p-5 shadow-[0_12px_45px_rgba(0,0,0,0.06)] border border-[#EBE6DD] space-y-4">
              {/* Scan Preview Image Bowl */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh kitchen ingredients bowl"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Overlays on image */}
                <div className="absolute top-3 left-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium bg-black/60 text-white backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Camera className="w-3.5 h-3.5" />
                    <span>AI scan preview</span>
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold bg-[#DDEAE1] text-[#163828] px-3 py-1.5 rounded-full shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>8 ingredients detected</span>
                  </span>
                </div>
              </div>

              {/* Identified Ingredients Header & Chips */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">Identified ingredients</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#163828] font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      Verified
                    </span>
                    <button
                      onClick={() => onNavigate('inventory')}
                      className="text-stone-400 hover:text-stone-700"
                      title="Edit ingredients"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-medium flex items-center gap-1">
                    <span>🍅</span> Tomatoes
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-medium flex items-center gap-1">
                    <span>🧀</span> Paneer
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-medium flex items-center gap-1">
                    <span>🥬</span> Spinach
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-medium flex items-center gap-1">
                    <span>🧄</span> Garlic
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-medium flex items-center gap-1">
                    <span>🧅</span> Onion
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-medium flex items-center gap-1">
                    <span>🫒</span> Olive oil
                  </span>
                  <button
                    onClick={() => onNavigate('inventory')}
                    className="text-xs px-2.5 py-1 rounded-full bg-stone-100/70 border border-dashed border-stone-300 text-stone-500 font-medium hover:border-stone-500 hover:text-stone-700 transition-colors"
                  >
                    + Add ingredient
                  </button>
                </div>
              </div>

              {/* Best Match Bottom Card */}
              <div
                onClick={() => onSelectRecipe('rec_palak_paneer')}
                className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE6DD] flex items-center justify-between gap-3 cursor-pointer group hover:border-[#163828]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80"
                    alt="Palak Paneer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#E67E22] uppercase tracking-wider">
                      <span>👑</span>
                      <span>Best Match &bull; 89%</span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-[#163828] transition-colors">
                      Palak Paneer
                    </h4>
                    <p className="text-[11px] text-[#2D5A3D] font-medium flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-[#2D5A3D]" />
                      <span>Uses spinach before it expires</span>
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> 30 mins
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5">
                        <ChefHat className="w-3 h-3" /> Easy
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" /> 2–3 servings
                      </span>
                    </div>
                  </div>
                </div>

                {/* Circular Arrow Button */}
                <div className="w-10 h-10 rounded-full bg-[#163828] text-white flex items-center justify-center shrink-0 group-hover:bg-[#122D20] group-hover:scale-105 transition-all shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
