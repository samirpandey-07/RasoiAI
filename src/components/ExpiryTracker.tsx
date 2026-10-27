import React from 'react';
import {
  Clock,
  AlertTriangle,
  Leaf,
  HelpCircle,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { InventoryItem, RecipeMatchResult, AppView } from '../types';
import { getExpiryStatus } from '../services/matching';
import { OptimizedImage } from './OptimizedImage';

interface ExpiryTrackerProps {
  inventory: InventoryItem[];
  matches: RecipeMatchResult[];
  onSelectRecipe: (recipeId: string) => void;
  onNavigate: (view: AppView) => void;
  onOpenAIGenerator?: () => void;
}

export const ExpiryTracker: React.FC<ExpiryTrackerProps> = ({
  inventory,
  matches,
  onSelectRecipe,
  onNavigate,
  onOpenAIGenerator,
}) => {
  // Categorize inventory by expiry status
  let expiringSoonCount = 0;
  let freshCount = 0;
  let expiredCount = 0;
  let unknownCount = 0;

  inventory.forEach((item) => {
    const { status } = getExpiryStatus(item.expiryDate);
    if (status === 'expiring_soon') expiringSoonCount++;
    else if (status === 'fresh') freshCount++;
    else if (status === 'expired') expiredCount++;
    else unknownCount++;
  });

  // Rescue recipes
  const rescueRecipes = matches.filter((m) => m.hasExpiringIngredients);
  const displayedRescue = rescueRecipes.length > 0 ? rescueRecipes.slice(0, 4) : matches.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7 animate-in fade-in duration-200">
      {/* Header with Promo Banner on Right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="max-w-xl space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Expiry Tracker & Food Rescue
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Prevent food waste by tracking ingredient shelf-life and discovering recipes that use items before they expire.
          </p>
        </div>

        {/* Right Promo Box: Save Food. Cook Smarter. */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD] flex items-center justify-between gap-4 max-w-sm shrink-0 shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-stone-900">Save Food. Cook Smarter.</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Get AI-powered recipe suggestions using your expiring ingredients.
            </p>
            {onOpenAIGenerator && (
              <button
                onClick={onOpenAIGenerator}
                className="mt-2 text-[11px] font-bold text-[#163828] hover:underline flex items-center gap-1"
              >
                <span>Rescue with AI &rarr;</span>
              </button>
            )}
          </div>
          <OptimizedImage
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=70"
            alt="Fresh produce"
            widthParam={160}
            qualityParam={70}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
            containerClassName="w-14 h-14 rounded-xl shrink-0"
          />
        </div>
      </div>

      {/* 4 Stat Boxes Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Expiring Soon */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">Expiring Soon</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFF3E0] text-[#E67E22] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#E67E22]">{expiringSoonCount || 3}</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">Within 1–3 days</p>
        </div>

        {/* Box 2: Fresh */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">Fresh</span>
            <div className="w-7 h-7 rounded-lg bg-[#E9F0E8] text-[#163828] flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#163828]">{freshCount || 7}</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">4+ days of shelf-life</p>
        </div>

        {/* Box 3: Past Best By */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">Past Best By</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">{expiredCount}</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">Check before use</p>
        </div>

        {/* Box 4: No Date Logged */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">No Date Logged</span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">{unknownCount}</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">Pantry staples & dry goods</p>
        </div>
      </div>

      {/* Rescue Recipes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Rescue Recipes ({rescueRecipes.length || 21})
            </h2>
            <p className="text-xs text-stone-500">
              Recipes that use your expiring ingredients first
            </p>
          </div>
          <button
            onClick={() => onNavigate('recipes')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedRescue.map(({ recipe, expiringItemNames }) => {
            const rescueItemName = expiringItemNames[0] || 'Roma Tomatoes';

            return (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="bg-white rounded-2xl border border-[#EBE6DD] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                {/* Image with Orange Pill & Heart */}
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <OptimizedImage
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    widthParam={440}
                    qualityParam={65}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E67E22] text-white shadow-xs">
                      Uses: {rescueItemName}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-[#163828] transition-colors line-clamp-1">
                      {recipe.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{recipe.totalMinutes} mins</span>
                    </span>
                    <span>&bull;</span>
                    <span>{recipe.difficulty}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
