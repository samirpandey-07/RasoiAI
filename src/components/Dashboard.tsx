import React from 'react';
import { AppView, InventoryItem, RecipeMatchResult } from '../types';
import { getExpiryStatus } from '../services/matching';
import { AiSparkleIcon } from './AiSparkleIcon';

interface DashboardProps {
  inventory: InventoryItem[];
  matches: RecipeMatchResult[];
  onNavigate: (view: AppView) => void;
  onSelectRecipe: (recipeId: string) => void;
  onOpenAIGenerator?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  inventory,
  matches,
  onNavigate,
  onSelectRecipe,
  onOpenAIGenerator,
}) => {
  // Identify expiring items
  const expiringItems = inventory.filter((item) => {
    const status = getExpiryStatus(item.expiryDate).status;
    return status === 'expiring_soon' || status === 'expired';
  });

  // Zero-Waste Rescue Recipes (contain at least 1 expiring ingredient)
  const rescueRecipes = matches.filter((m) => m.hasExpiringIngredients).slice(0, 3);

  // Ready to cook (high match percentage >= 60%)
  const readyToCook = matches.filter((m) => m.matchPercentage >= 60).slice(0, 4);

  // Storage breakdown
  const fridgeCount = inventory.filter((i) => i.storageLocation === 'Fridge').length;
  const pantryCount = inventory.filter((i) => i.storageLocation === 'Pantry').length;
  const freezerCount = inventory.filter((i) => i.storageLocation === 'Freezer').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              Live Kitchen Hub
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Kitchen Dashboard
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            {inventory.length > 0 ? (
              <>
                <span className="font-semibold text-stone-800">{inventory.length} items</span> in kitchen &bull;{' '}
                {expiringItems.length > 0 ? (
                  <span className="text-amber-700 font-semibold">{expiringItems.length} require attention</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">All inventory fresh</span>
                )}{' '}
                &bull; <span className="text-stone-800 font-semibold">{readyToCook.length} recipes</span> ready to cook.
              </>
            ) : (
              'Scan or add your groceries to unlock personalized zero-waste recipe matching.'
            )}
          </p>
        </div>

        {/* Minimal Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenAIGenerator && (
            <button
              onClick={onOpenAIGenerator}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-xs hover:from-amber-600 hover:to-orange-700 active:scale-95 transition-all"
            >
              <AiSparkleIcon size={16} className="text-white" />
              <span>Generate AI Recipe</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('scanner')}
            className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 active:scale-95 transition-all shadow-xs"
          >
            Scan Ingredients
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-stone-700 text-xs font-semibold hover:bg-stone-50 active:scale-95 transition-all"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Inventory */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-xs hover:border-black/20 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Total Inventory
            </span>
            <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
              Manage &rarr;
            </span>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
            {inventory.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-600 mt-2 font-medium">
            <span>{fridgeCount} Fridge</span>
            <span>&bull;</span>
            <span>{pantryCount} Pantry</span>
            <span>&bull;</span>
            <span>{freezerCount} Freezer</span>
          </div>
        </div>

        {/* Metric 2: Expiring Soon */}
        <div
          onClick={() => onNavigate('expiry')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
            expiringItems.length > 0
              ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400 hover:shadow-md'
              : 'bg-white border-black/[0.06] hover:border-black/20 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Freshness & Expiry
            </span>
            {expiringItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div
            className={`text-3xl font-extrabold tracking-tight ${
              expiringItems.length > 0 ? 'text-amber-950' : 'text-stone-900'
            }`}
          >
            {expiringItems.length}
          </div>
          <p className="text-[11px] font-medium text-stone-600 mt-2">
            {expiringItems.length > 0 ? 'Expiring in \u2264 3 days' : '100% of items are fresh'}
          </p>
        </div>

        {/* Metric 3: Ready to Cook */}
        <div
          onClick={() => onNavigate('recipes')}
          className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-xs hover:border-black/20 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Cookable Today
            </span>
            <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
              Explore &rarr;
            </span>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 tracking-tight">
            {readyToCook.length}
          </div>
          <p className="text-[11px] font-medium text-stone-600 mt-2">
            Recipes with &ge; 60% on-hand items
          </p>
        </div>

        {/* Metric 4: AI Sous-Chef */}
        <div
          onClick={() => onNavigate('assistant')}
          className="bg-stone-900 p-5 rounded-2xl text-white shadow-xs hover:bg-stone-800 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AiSparkleIcon size={13} className="text-amber-400" />
              <span>Chef Gemini</span>
            </span>
            <span className="text-xs font-semibold text-stone-400 group-hover:text-white transition-colors">
              Chat &rarr;
            </span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            Ask Chef AI
          </div>
          <p className="text-[11px] text-stone-400 mt-2 line-clamp-1">
            Substitutions, pairings & tips
          </p>
        </div>
      </div>

      {/* Food Waste Rescue Alert Banner */}
      {expiringItems.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-300/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                Action Required
              </span>
              <span className="text-xs font-semibold text-amber-900">
                {expiringItems.length} {expiringItems.length === 1 ? 'ingredient needs' : 'ingredients need'} rescue
              </span>
            </div>
            <p className="text-xs text-stone-700 max-w-2xl">
              Expiring soon:{' '}
              <span className="font-bold text-stone-900">
                {expiringItems.map((i) => i.name).join(', ')}
              </span>
              . Cook one of the suggested rescue recipes below to eliminate grocery waste.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAIGenerator && (
              <button
                onClick={onOpenAIGenerator}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Create Rescue Recipe
              </button>
            )}
            <button
              onClick={() => onNavigate('expiry')}
              className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-stone-800 text-xs font-semibold hover:bg-amber-50 transition-colors"
            >
              View Timeline
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: Zero-Waste Rescue Recipes */}
      {rescueRecipes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                Zero-Waste Rescue
              </h2>
              <p className="text-xs text-stone-500">
                Tailored recipes specifically utilizing your expiring ingredients
              </p>
            </div>
            <button
              onClick={() => onNavigate('recipes')}
              className="text-xs font-bold text-stone-700 hover:text-stone-950 transition-colors"
            >
              See All &rarr;
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rescueRecipes.map(({ recipe, matchPercentage, expiringItemNames, missingIngredients }) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="group bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-xs hover:border-black/20 hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white shadow-xs">
                      Rescues: {expiringItemNames[0]}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-stone-900/80 text-white backdrop-blur-md">
                      {matchPercentage}% Match
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      {recipe.cuisine} &bull; {recipe.totalMinutes}m &bull; {recipe.difficulty}
                    </div>
                    <h3 className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors text-base line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-600 font-medium">
                      {missingIngredients.length === 0
                        ? 'All ingredients ready'
                        : `Need ${missingIngredients.length} more item${missingIngredients.length > 1 ? 's' : ''}`}
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
      )}

      {/* SECTION 2: Ready to Cook Today */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Ready to Cook
            </h2>
            <p className="text-xs text-stone-500">
              Dishes with at least 60% of ingredients currently in your kitchen
            </p>
          </div>
          <button
            onClick={() => onNavigate('recipes')}
            className="text-xs font-bold text-stone-700 hover:text-stone-950 transition-colors"
          >
            Browse Catalog &rarr;
          </button>
        </div>

        {readyToCook.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-black/[0.06] text-center space-y-4">
            <h3 className="font-bold text-stone-800 text-base">No high-match recipes found yet</h3>
            <p className="text-stone-500 text-xs max-w-md mx-auto">
              Scan your pantry ingredients or add items manually to find recipes you can make tonight without a grocery run.
            </p>
            <button
              onClick={() => onNavigate('scanner')}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              Scan Ingredients
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {readyToCook.map(({ recipe, matchPercentage, availableIngredients, missingIngredients }) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="group bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-xs hover:border-black/20 hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="relative h-40 overflow-hidden bg-stone-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-900/85 text-white backdrop-blur-md">
                      {matchPercentage}%
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 text-stone-800 backdrop-blur-md">
                      {recipe.totalMinutes}m &bull; {recipe.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-[11px] text-stone-600 mt-1">
                      {availableIngredients.length} of {recipe.ingredients.length} ingredients ready
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-600 truncate max-w-[130px] font-medium">
                      {missingIngredients.length > 0
                        ? `Missing: ${missingIngredients[0].name}`
                        : 'Complete'}
                    </span>
                    <span className="font-bold text-stone-900">Cook &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
