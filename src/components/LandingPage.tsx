import React from 'react';
import {
  Camera,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Leaf,
  Layers,
  UtensilsCrossed,
} from 'lucide-react';
import { AppView, Recipe } from '../types';

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
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#E2EBE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#d2e0d7] text-xs font-semibold text-[#1B4332]">
                <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                Zero-Waste Kitchen Intelligence
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#143628] tracking-tight leading-[1.12]">
                Turn your fridge ingredients into{' '}
                <span className="text-[#2D6A4F] underline decoration-[#C3D5C8] underline-offset-8">
                  masterpiece meals.
                </span>
              </h1>

              <p className="text-lg text-stone-600 max-w-2xl leading-relaxed">
                Smart Kitchen AI identifies ingredients from photos, detects missing items, tracks food expiration dates, and guides you through chef-crafted recipes with interactive timers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('scanner')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1B4332] text-white font-semibold shadow-md hover:bg-[#143628] transition-all transform hover:-translate-y-0.5"
                >
                  <Camera className="w-5 h-5 text-emerald-200" />
                  <span>Scan Ingredients</span>
                </button>

                <button
                  onClick={() => onNavigate('recipes')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#E2EBE5] text-stone-800 font-semibold shadow-sm hover:bg-[#F0F4F1] hover:text-[#1B4332] transition-all"
                >
                  <BookOpen className="w-5 h-5 text-stone-500" />
                  <span>Browse 30+ Recipes</span>
                </button>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-1.5 px-4 py-3.5 text-stone-600 font-medium hover:text-[#1B4332] transition-colors"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Core Quality Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Visual AI Scan</p>
                    <p className="text-[11px] text-stone-500">Gemini multimodal vision</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Zero Guesswork</p>
                    <p className="text-[11px] text-stone-500">Deterministic matching</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Expiry Rescue</p>
                    <p className="text-[11px] text-stone-500">Prioritize expiring food</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl bg-white p-5 shadow-xl border border-[#E2EBE5]">
                {/* Visual Snapshot Card */}
                <div className="relative h-56 rounded-xl overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
                    alt="Fresh kitchen ingredients"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded">
                      Live Kitchen Scanner
                    </span>
                    <span className="text-xs bg-emerald-700/90 text-white font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 8 Detected
                    </span>
                  </div>
                </div>

                {/* Detected Ingredients Preview */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                    <span>Recognized in Basket</span>
                    <span className="text-emerald-700 font-semibold">100% Verified</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Roma Tomatoes', 'Paneer', 'Baby Spinach', 'Garlic', 'Yellow Onion', 'Extra Virgin Olive Oil'].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#F0F4F1] border border-[#d6e3db] text-stone-700 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match Callout */}
                <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">Palak Paneer Match: 89%</p>
                      <p className="text-[11px] text-amber-700 font-medium">Rescues spinach expiring in 1 day!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectRecipe('rec_palak_paneer')}
                    className="text-xs font-semibold text-[#1B4332] hover:underline"
                  >
                    View &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#143628] tracking-tight">
            Designed for real cooks facing real kitchens
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Deterministic logic for ingredient mathematics, paired with Gemini 3.8 Flash for vision and culinary advice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2EBE5] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#E7EFEA] text-[#1B4332] flex items-center justify-center mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 mb-1">Visual Recognition</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload or snap produce and pantry shelves. Gemini identifies distinct ingredients without fabricating impossible gram estimates.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2EBE5] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#E7EFEA] text-[#1B4332] flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 mb-1">Exact Missing Items</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              See precisely which ingredients you already possess and what you need to pick up or substitute before firing up the stove.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2EBE5] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 mb-1">Expiry Rescue Engine</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Ranks recipes higher when they consume ingredients reaching their best-by date, preventing unnecessary grocery waste.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2EBE5] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#E7EFEA] text-[#1B4332] flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 mb-1">Counter Cooking Mode</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Oversized typography designed to be read while chopping, paired with integrated countdown timers and live substitution advice.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Recipe Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#143628]">Curated Recipes</h2>
            <p className="text-xs sm:text-sm text-stone-600">30+ authentic Indian and international culinary staples</p>
          </div>
          <button
            onClick={() => onNavigate('recipes')}
            className="text-xs sm:text-sm font-semibold text-[#1B4332] hover:underline flex items-center gap-1"
          >
            <span>View All 30+</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRecipes.slice(0, 3).map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="group bg-white rounded-2xl border border-[#E2EBE5] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white/95 text-[#1B4332] shadow-xs">
                    {recipe.cuisine}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                    {recipe.totalMinutes} min
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-800 group-hover:text-[#1B4332] transition-colors line-clamp-1">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>{recipe.ingredients.length} ingredients</span>
                    <span>&bull;</span>
                    <span>{recipe.difficulty}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#1B4332] group-hover:translate-x-0.5 transition-transform flex items-center">
                    Cook &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#143628] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to take inventory of your kitchen?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Snap a picture of your crisper drawer or pantry now. Discover what you can cook in 25 minutes without a trip to the supermarket.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('scanner')}
                className="px-6 py-3 rounded-xl bg-white text-[#143628] font-bold hover:bg-stone-100 transition-colors shadow-md"
              >
                Start Ingredient Scan
              </button>
              <button
                onClick={() => onNavigate('inventory')}
                className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Manage Inventory
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
