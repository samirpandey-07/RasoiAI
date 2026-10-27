import React from 'react';
import {
  Refrigerator,
  Clock,
  Sparkles,
  Camera,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
  Flame,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { AppView, InventoryItem, RecipeMatchResult } from '../types';
import { getExpiryStatus } from '../services/matching';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2EBE5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
            Kitchen Dashboard
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Real-time inventory intelligence, waste alerts, and recipe recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenAIGenerator && (
            <button
              onClick={onOpenAIGenerator}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-100" />
              <span>Create AI Recipe</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('scanner')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold shadow-sm hover:bg-[#143628] transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>Scan Ingredients</span>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#E2EBE5] text-stone-700 text-xs font-semibold hover:bg-[#F0F4F1] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#1B4332]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Inventory */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-[#E2EBE5] shadow-xs hover:border-[#1B4332]/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Inventory
            </span>
            <div className="p-2 rounded-lg bg-[#E7EFEA] text-[#1B4332]">
              <Refrigerator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-800">{inventory.length}</div>
          <p className="text-xs text-stone-500 mt-1">Tracked pantry & fridge items</p>
        </div>

        {/* Metric 2: Expiring Soon */}
        <div
          onClick={() => onNavigate('expiry')}
          className={`p-5 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            expiringItems.length > 0
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
              : 'bg-white border-[#E2EBE5]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Expiry Alert
            </span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-800">{expiringItems.length}</div>
          <p className="text-xs text-stone-500 mt-1">
            {expiringItems.length > 0 ? 'Expiring in <= 3 days' : 'All items fresh'}
          </p>
        </div>

        {/* Metric 3: Cookable Matches */}
        <div
          onClick={() => onNavigate('recipes')}
          className="bg-white p-5 rounded-2xl border border-[#E2EBE5] shadow-xs hover:border-[#1B4332]/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              High Match
            </span>
            <div className="p-2 rounded-lg bg-[#E7EFEA] text-[#1B4332]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-800">{readyToCook.length}</div>
          <p className="text-xs text-stone-500 mt-1">&gt;= 60% ingredients on-hand</p>
        </div>

        {/* Metric 4: AI Sous-Chef */}
        <div
          onClick={() => onNavigate('assistant')}
          className="bg-[#1B4332] p-5 rounded-2xl text-white shadow-xs hover:bg-[#143628] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              AI Sous-Chef
            </span>
            <div className="p-2 rounded-lg bg-white/10 text-emerald-200">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-white">Ask Chef Gemini</div>
          <p className="text-xs text-emerald-100/80 mt-1">Substitutions & cooking tips</p>
        </div>
      </div>

      {/* Food Waste Rescue Alert Banner */}
      {expiringItems.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#FFF9F2] border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                Food Waste Prevention: {expiringItems.length} {expiringItems.length === 1 ? 'ingredient needs' : 'ingredients need'} attention
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Approaching best-by date:{' '}
                <span className="font-semibold text-amber-900">
                  {expiringItems.map((i) => i.name).join(', ')}
                </span>
                . Cook one of the rescue recipes below to make the most of your groceries.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('expiry')}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
          >
            View Expiry Timeline &rarr;
          </button>
        </div>
      )}

      {/* SECTION 1: Zero-Waste Rescue Recipes */}
      {rescueRecipes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">
                Rescue Tonight (Uses Expiring Items)
              </h2>
            </div>
            <button
              onClick={() => onNavigate('recipes')}
              className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rescueRecipes.map(({ recipe, matchPercentage, expiringItemNames, missingIngredients }) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="group bg-white rounded-2xl border border-amber-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Rescues: {expiringItemNames[0]}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                      {matchPercentage}% Match
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-800 group-hover:text-[#1B4332] transition-colors text-base line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">
                        {missingIngredients.length === 0
                          ? 'All ingredients ready'
                          : `Need ${missingIngredients.length} more`}
                      </span>
                      <span className="font-semibold text-[#1B4332] group-hover:translate-x-0.5 transition-transform flex items-center">
                        Cook &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Ready to Cook (High Match %) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-stone-800">
              Highest Kitchen Match (60%+ On-Hand)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('recipes')}
            className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center gap-1"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {readyToCook.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E2EBE5] text-center space-y-3">
            <p className="text-stone-600 text-sm">
              No recipes currently reach a 60% match with your inventory.
            </p>
            <button
              onClick={() => onNavigate('scanner')}
              className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold"
            >
              Scan more ingredients to unlock recipes
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {readyToCook.map(({ recipe, matchPercentage, availableIngredients, missingIngredients }) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="group bg-white rounded-2xl border border-[#E2EBE5] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="relative h-36 overflow-hidden bg-stone-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-xs">
                      {matchPercentage}%
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-white">
                      {recipe.totalMinutes}m &bull; {recipe.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-800 text-sm group-hover:text-[#1B4332] transition-colors line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                      {availableIngredients.length} of {recipe.ingredients.length} ingredients ready
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 truncate max-w-[130px]">
                      {missingIngredients.length > 0
                        ? `Missing: ${missingIngredients[0].name}`
                        : 'Complete!'}
                    </span>
                    <span className="font-semibold text-[#1B4332]">View &rarr;</span>
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
