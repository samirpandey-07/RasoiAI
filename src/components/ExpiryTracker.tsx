import React from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Flame,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Info,
  Leaf,
} from 'lucide-react';
import { InventoryItem, RecipeMatchResult, AppView } from '../types';
import { getExpiryStatus } from '../services/matching';

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
  // Group inventory by status
  const expiredItems: InventoryItem[] = [];
  const expiringSoonItems: InventoryItem[] = [];
  const freshItems: InventoryItem[] = [];
  const unknownExpiryItems: InventoryItem[] = [];

  inventory.forEach((item) => {
    const { status } = getExpiryStatus(item.expiryDate);
    if (status === 'expired') expiredItems.push(item);
    else if (status === 'expiring_soon') expiringSoonItems.push(item);
    else if (status === 'fresh') freshItems.push(item);
    else unknownExpiryItems.push(item);
  });

  // Rescue recipes that specifically consume items in expiringSoon or expired
  const rescueRecipes = matches.filter((m) => m.hasExpiringIngredients);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-xs font-semibold text-amber-900 mb-2">
            <Leaf className="w-3.5 h-3.5 text-amber-700" />
            <span>Food Waste Prevention Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
            Expiry Tracker & Food Rescue
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Track ingredient shelf-life, prevent grocery spoilage, and craft tailored recipes that prioritize ingredients nearing their best-by date.
          </p>
        </div>

        {onOpenAIGenerator && (
          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm shrink-0 self-start md:self-auto"
          >
            <Flame className="w-4 h-4 text-amber-100" />
            <span>Ask Gemini for Zero-Waste Recipe</span>
          </button>
        )}
      </div>

      {/* Food Safety & Expiry Thresholds Documentation Banner */}
      <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-amber-200/80 text-xs text-stone-700 space-y-2">
        <div className="flex items-center gap-2 text-stone-900 font-bold">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Documented Shelf-Life Thresholds & Safety Principles</span>
        </div>
        <p className="leading-relaxed">
          <strong>Threshold Rules:</strong> Ingredients with &le; 0 days are categorized as <em>Past Best By</em>. Items between 0 and 3 days are categorized as <em>Expiring Soon</em> (urgent rescue priority). Items &gt; 3 days are marked <em>Fresh</em>.
        </p>
        <p className="leading-relaxed text-stone-500">
          <strong>Important Safety Notice:</strong> Best-by and expiration dates indicate peak culinary quality. An expiry date alone does not prove that food is safe or unsafe. Always use sensory inspection: check for unusual odors, discoloration, slime, or mold before consuming.
        </p>
      </div>

      {/* Status Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expiring Soon */}
        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Expiring Soon
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-amber-950">{expiringSoonItems.length}</div>
          <p className="text-[11px] text-amber-800 mt-1">Within 1-3 days (Rescue now)</p>
        </div>

        {/* Fresh */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Fresh
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-800">{freshItems.length}</div>
          <p className="text-[11px] text-stone-500 mt-1">4+ days of shelf-life</p>
        </div>

        {/* Past Best By */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Past Best By
            </span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-stone-800">{expiredItems.length}</div>
          <p className="text-[11px] text-stone-500 mt-1">Inspect senses before cooking</p>
        </div>

        {/* Undated */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EBE5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              No Date Logged
            </span>
            <HelpCircle className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-black text-stone-800">{unknownExpiryItems.length}</div>
          <p className="text-[11px] text-stone-500 mt-1">Pantry staples & non-perishables</p>
        </div>
      </div>

      {/* ZERO-WASTE RESCUE RECIPES SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-800">
              Zero-Waste Rescue Recipes ({rescueRecipes.length})
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            Automatically prioritized by algorithm
          </span>
        </div>

        {rescueRecipes.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E2EBE5] text-center space-y-2">
            <p className="text-stone-600 text-sm">
              Great news! None of your active inventory ingredients are currently facing imminent expiration.
            </p>
            <button
              onClick={() => onNavigate('recipes')}
              className="text-xs font-semibold text-[#1B4332] hover:underline"
            >
              Browse all recipes &rarr;
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rescueRecipes.map(({ recipe, matchPercentage, expiringItemNames, missingIngredients }) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="group bg-white rounded-2xl border border-amber-300 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                        Rescues: {expiringItemNames.join(', ')}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                        {matchPercentage}% Match
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-stone-800 text-base group-hover:text-[#1B4332] transition-colors line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    {missingIngredients.length > 0
                      ? `Missing ${missingIngredients.length} items`
                      : 'All ingredients on-hand'}
                  </span>
                  <span className="font-semibold text-[#1B4332] group-hover:translate-x-0.5 transition-transform">
                    Rescue Now &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Expiring Soon Inventory Breakdown */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-stone-800">
          Items Needing Attention ({expiringSoonItems.length + expiredItems.length})
        </h2>

        {expiringSoonItems.length === 0 && expiredItems.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-[#E2EBE5] text-center text-xs text-stone-500">
            No ingredients approaching expiration.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...expiringSoonItems, ...expiredItems].map((item) => {
              const exp = getExpiryStatus(item.expiryDate);
              const isPast = exp.status === 'expired';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border bg-white flex items-start justify-between gap-3 shadow-xs ${
                    isPast ? 'border-rose-200' : 'border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-stone-800">{item.name}</h4>
                    <p className="text-[11px] text-stone-500">
                      {item.quantity} {item.unit} &bull; Stored in {item.storageLocation}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPast ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exp.label}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('recipes')}
                    className="text-xs font-semibold text-[#1B4332] hover:underline whitespace-nowrap self-center"
                  >
                    Find Recipe &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Culinary Storage Pro Tips (Food Waste Reduction Education) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2EBE5] shadow-xs space-y-4">
        <h3 className="font-bold text-stone-800 text-base flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-700" />
          <span>Chef&apos;s Food Waste Preservation Handbook</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-stone-600">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <strong className="text-stone-800 font-semibold block">Reviving Wilted Greens:</strong>
            <p>Soak limp spinach, cilantro, or parsley in an ice-water bath for 10 minutes. The cells absorb water and turn crisp again!</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <strong className="text-stone-800 font-semibold block">Dairy & Cheese Longevity:</strong>
            <p>Keep paneer submerged in fresh cold water inside an airtight container in the fridge; replace water every 2 days to maintain freshness.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <strong className="text-stone-800 font-semibold block">Freezer Rescue:</strong>
            <p>If herbs or tomatoes are about to turn, blitz them with a splash of olive oil and freeze in ice cube trays for instant soup and curry bases.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
