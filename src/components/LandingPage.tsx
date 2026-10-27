import React from 'react';
import { AppView, Recipe } from '../types';
import { AiSparkleBadge, AiSparkleIcon } from './AiSparkleIcon';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  featuredRecipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  featuredRecipes,
  onSelectRecipe,
}) => {
  return (
    <div className="space-y-20 pb-24 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative pt-14 pb-16 md:pt-24 md:pb-28 overflow-hidden border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Mission & Clean Typography */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-bold text-amber-900">
                <AiSparkleIcon size={14} className="text-amber-600" />
                <span>Zero-Waste Culinary Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.08]">
                Turn everyday groceries into{' '}
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                  extraordinary meals.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                Smart Kitchen AI identifies ingredients from photos, tracks expiration timelines, prevents food waste, and curates chef-quality recipes with hands-free cooking guidance.
              </p>

              {/* Minimalist Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => onNavigate('scanner')}
                  className="px-6 py-3.5 rounded-xl bg-stone-900 text-white font-bold text-sm shadow-sm hover:bg-stone-800 active:scale-95 transition-all"
                >
                  Scan Ingredients
                </button>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-sm hover:from-amber-600 hover:to-orange-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <AiSparkleIcon size={16} className="text-white" />
                  <span>Open Dashboard</span>
                </button>

                <button
                  onClick={() => onNavigate('recipes')}
                  className="px-5 py-3.5 rounded-xl bg-white border border-black/[0.08] text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors"
                >
                  Browse Recipes &rarr;
                </button>
              </div>

              {/* Guarantees - Text First Minimalist */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/[0.06]">
                <div>
                  <p className="text-xs font-bold text-stone-900">Computer Vision</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">Multimodal recognition</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Deterministic Match</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">Exact missing items</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Waste Reduction</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">Prioritizes expiring food</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-white p-5 shadow-xl shadow-stone-200/50 border border-black/[0.06]">
                <div className="relative h-60 rounded-2xl overflow-hidden mb-4 bg-stone-100">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
                    alt="Fresh kitchen ingredients"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-md">
                      Smart Camera Scan
                    </span>
                    <span className="text-[11px] bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <AiSparkleIcon size={12} className="text-white" />
                      8 Identified
                    </span>
                  </div>
                </div>

                {/* Recognized Items Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-600">
                    <span>Recognized on Counter</span>
                    <span className="text-emerald-700 font-bold">Verified</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Roma Tomatoes', 'Paneer', 'Baby Spinach', 'Garlic', 'Yellow Onion', 'Olive Oil'].map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match Card */}
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-900">Palak Paneer &bull; 89% Match</p>
                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">Rescues spinach expiring in 1 day</p>
                  </div>
                  <button
                    onClick={() => onSelectRecipe('rec_palak_paneer')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    View &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section - Clean, Minimal Architectural Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Designed for Real Kitchens
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            No endless grocery guesswork. Practical culinary tools engineered for everyday home cooks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-xs hover:border-black/20 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">01</span>
            <h3 className="font-bold text-stone-900 mb-1 text-base">Visual Scan</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Snap photos of fridge produce or pantry shelves. Gemini AI extracts ingredients without guessing impossible gram weights.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-xs hover:border-black/20 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">02</span>
            <h3 className="font-bold text-stone-900 mb-1 text-base">Missing Items</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Instantly see which items you have and what single ingredient to grab before turning on the stove.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-xs hover:border-black/20 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">03</span>
            <h3 className="font-bold text-stone-900 mb-1 text-base">Waste Rescue</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Automatically prioritizes ingredients approaching expiration, ranking recipes that rescue them first.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-xs hover:border-black/20 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">04</span>
            <h3 className="font-bold text-stone-900 mb-1 text-base">Step-by-Step Timers</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Large, distraction-free typography for the kitchen counter, integrated timers, and interactive AI chef tips.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Recipe Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Curated Master Catalog</h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">Authentic culinary staples optimized for on-hand matching</p>
          </div>
          <button
            onClick={() => onNavigate('recipes')}
            className="text-xs sm:text-sm font-bold text-stone-900 hover:text-amber-600 transition-colors"
          >
            Explore 30+ Recipes &rarr;
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRecipes.slice(0, 3).map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="group bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-xs hover:border-black/20 hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-52 overflow-hidden bg-stone-100">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white/95 text-stone-900 shadow-xs">
                    {recipe.cuisine}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-900/80 text-white backdrop-blur-md">
                    {recipe.totalMinutes} min
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">
                    {recipe.ingredients.length} ingredients &bull; {recipe.difficulty}
                  </span>
                  <span className="font-bold text-stone-900 group-hover:translate-x-0.5 transition-transform">
                    Cook &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-amber-400">
              <AiSparkleIcon size={14} className="text-amber-400" />
              <span>Smart Kitchen Assistant</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to see what you can cook tonight?
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              Upload a snapshot of your pantry or fridge. In seconds, get matched recipes and save expiring food before it goes to waste.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('scanner')}
                className="px-6 py-3.5 rounded-xl bg-white text-stone-900 font-bold hover:bg-stone-100 transition-all active:scale-95 text-sm"
              >
                Scan Ingredients Now
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:from-amber-600 hover:to-orange-700 transition-all active:scale-95 text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
