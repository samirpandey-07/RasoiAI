import React, { useState } from 'react';
import {
  Clock,
  Flame,
  ChefHat,
  Users,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  Plus,
  Info,
} from 'lucide-react';
import { Recipe, RecipeMatchResult, InventoryItem } from '../types';
import { getSubstitutions } from '../services/gemini';
import { OptimizedImage } from './OptimizedImage';

interface RecipeDetailsProps {
  recipe: Recipe;
  matchResult?: RecipeMatchResult;
  inventory: InventoryItem[];
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onStartCooking: (recipeId: string) => void;
  onBack: () => void;
  onAskChef: (initialQuestion: string) => void;
  onAddMissingToInventory?: (items: InventoryItem[]) => void;
}

export const RecipeDetails: React.FC<RecipeDetailsProps> = ({
  recipe,
  matchResult,
  inventory,
  isFavorite,
  onToggleFavorite,
  onStartCooking,
  onBack,
  onAskChef,
  onAddMissingToInventory,
}) => {
  const [servings, setServings] = useState<number>(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [subModalIngredient, setSubModalIngredient] = useState<string | null>(null);
  const [substitutionLoading, setSubstitutionLoading] = useState<boolean>(false);
  const [substitutionData, setSubstitutionData] = useState<any | null>(null);
  const [addedMissingSuccess, setAddedMissingSuccess] = useState<boolean>(false);

  // Proportional scaling multiplier
  const scale = servings / recipe.servings;

  const toggleCheck = (name: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Open substitution inquiry
  const handleOpenSubstitution = async (ingredientName: string) => {
    setSubModalIngredient(ingredientName);
    setSubstitutionLoading(true);
    setSubstitutionData(null);

    const onHandNames = inventory.map((i) => i.name);
    const result = await getSubstitutions(ingredientName, recipe.name, recipe.dietaryTags, onHandNames);

    setSubstitutionLoading(false);
    if (result.success && result.data) {
      setSubstitutionData(result.data);
    }
  };

  const availableSet = new Set(matchResult?.availableIngredients || []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Top Back & Action Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#1B4332] transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explorer</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => onStartCooking(recipe.id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold shadow-md hover:bg-[#143628] transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Cooking Mode</span>
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl border border-[#E2EBE5] overflow-hidden shadow-xs">
        <div className="grid md:grid-cols-12 gap-0">
          {/* Image */}
          <div className="md:col-span-5 relative h-72 md:h-auto min-h-[260px] sm:min-h-[300px] bg-stone-100">
            <OptimizedImage
              src={recipe.imageUrl}
              alt={recipe.name}
              widthParam={700}
              qualityParam={75}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
            <div className="absolute top-4 left-4 z-10">
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white/95 text-[#1B4332] shadow-sm">
                {recipe.cuisine} Cuisine
              </span>
            </div>
            {matchResult && (
              <div className="absolute bottom-4 left-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                    matchResult.matchPercentage >= 75
                      ? 'bg-emerald-700 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {matchResult.matchPercentage}% of Ingredients Ready
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {recipe.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#E7EFEA] text-[#1B4332]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
                {recipe.name}
              </h1>

              <p className="text-sm text-stone-600 leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* Time & Servings Metrics */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-stone-100 text-center">
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">Prep</span>
                <span className="text-sm font-bold text-stone-800">{recipe.prepMinutes}m</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">Cook</span>
                <span className="text-sm font-bold text-stone-800">{recipe.cookMinutes}m</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">Total</span>
                <span className="text-sm font-bold text-[#1B4332]">{recipe.totalMinutes}m</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">Level</span>
                <span className="text-sm font-bold text-stone-800">{recipe.difficulty}</span>
              </div>
            </div>

            {/* Allergen Alerts if present */}
            {recipe.allergens.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong className="font-semibold">Contains Known Allergens: </strong>
                  {recipe.allergens.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Scaling & Nutrition Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2EBE5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Servings Adjuster */}
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-semibold text-stone-700">Adjust Servings:</span>
          <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="px-3 py-1 font-bold text-stone-700 hover:bg-stone-200 transition-colors"
            >
              -
            </button>
            <span className="px-3 py-1 font-bold text-xs text-stone-800">{servings}</span>
            <button
              onClick={() => setServings((s) => Math.min(16, s + 1))}
              className="px-3 py-1 font-bold text-stone-700 hover:bg-stone-200 transition-colors"
            >
              +
            </button>
          </div>
          {servings !== recipe.servings && (
            <button
              onClick={() => setServings(recipe.servings)}
              className="text-xs text-stone-400 hover:text-stone-700 underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Nutritional Information (per serving) */}
        <div className="flex items-center gap-4 text-xs text-stone-600 divide-x divide-stone-200">
          <div>
            <span className="font-bold text-stone-800">{recipe.nutrition.calories}</span> kcal
          </div>
          <div className="pl-4">
            <span className="font-bold text-stone-800">{recipe.nutrition.proteinGrams}g</span> protein
          </div>
          <div className="pl-4">
            <span className="font-bold text-stone-800">{recipe.nutrition.carbsGrams}g</span> carbs
          </div>
          <div className="pl-4">
            <span className="font-bold text-stone-800">{recipe.nutrition.fatGrams}g</span> fat
          </div>
          {recipe.nutrition.fiberGrams !== undefined && (
            <div className="pl-4">
              <span className="font-bold text-stone-800">{recipe.nutrition.fiberGrams}g</span> fiber
            </div>
          )}
        </div>
      </div>

      {/* Nutritional Accuracy Disclaimer Notice */}
      <div className="px-5 py-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-[11px] text-stone-500 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 shrink-0 text-stone-400 mt-0.5" />
        <span>
          <strong>Nutritional Information Notice:</strong> Nutritional figures are calculated estimates based on standard USDA references. Actual values may vary based on exact ingredient brands, preparation technique, natural moisture loss, and precise portion sizes.
        </span>
      </div>

      {/* Main Content: Ingredients on Left, Steps on Right */}
      <div className="grid md:grid-cols-12 gap-8">
        {/* Ingredients Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800">Ingredients Checklist</h2>
            <span className="text-xs text-stone-500">Tap to cross off on counter</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2EBE5] divide-y divide-stone-100 overflow-hidden">
            {recipe.ingredients.map((ing, idx) => {
              const isChecked = !!checkedIngredients[ing.name];
              const isInKitchen = availableSet.has(ing.name);
              const scaledAmount = Number((ing.amount * scale).toFixed(1));

              return (
                <div
                  key={idx}
                  className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                    isChecked ? 'bg-stone-50/70' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div
                    onClick={() => toggleCheck(ing.name)}
                    className="flex items-start gap-3 flex-1 cursor-pointer select-none"
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-[#1B4332] border-[#1B4332] text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isChecked ? 'line-through text-stone-400' : 'text-stone-800'
                        }`}
                      >
                        {scaledAmount} {ing.unit} {ing.name}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5">
                        {isInKitchen ? (
                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> In your kitchen
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700">
                            Missing from kitchen
                          </span>
                        )}
                        {ing.isOptional && (
                          <span className="text-[10px] text-stone-400 italic">Optional</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Substitution Trigger */}
                  <button
                    onClick={() => handleOpenSubstitution(ing.name)}
                    className="p-1 text-stone-400 hover:text-[#1B4332] rounded hover:bg-stone-100 transition-colors"
                    title="Find substitutions for this ingredient"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Missing Ingredients Action Card */}
          {matchResult && matchResult.missingIngredients.length > 0 && (
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Missing {matchResult.missingIngredients.length} Ingredients</span>
                <span className="text-[11px] text-amber-700 font-normal">Not in your kitchen</span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-2">
                {matchResult.missingIngredients.map((m) => m.name).join(', ')}
              </p>
              {onAddMissingToInventory && (
                <button
                  onClick={() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const newItems: InventoryItem[] = matchResult.missingIngredients.map((m, idx) => ({
                      id: `inv_missing_${Date.now()}_${idx}`,
                      name: m.name,
                      normalizedName: m.normalizedName,
                      category: 'Pantry & Grains',
                      quantity: m.amount || 1,
                      unit: m.unit || 'unit',
                      storageLocation: 'Pantry',
                      purchaseDate: todayStr,
                      notes: `Required for ${recipe.name}`,
                    }));
                    onAddMissingToInventory(newItems);
                    setAddedMissingSuccess(true);
                    setTimeout(() => setAddedMissingSuccess(false), 3000);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  {addedMissingSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Added to Kitchen Inventory!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-amber-800" />
                      <span>Add All Missing to My Kitchen</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Quick AI Question */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E2EBE5] space-y-2">
            <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Cooking Questions?
            </span>
            <p className="text-xs text-stone-600">
              Need to substitute something or adjust for dietary requirements?
            </p>
            <button
              onClick={() => onAskChef(`Can you recommend tips or substitutions for cooking ${recipe.name}?`)}
              className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-white border border-[#E2EBE5] text-stone-700 hover:text-[#1B4332] hover:bg-stone-50 transition-colors text-left flex items-center justify-between"
            >
              <span>Ask Chef RasoiAI about this recipe</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Cooking Steps Column */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800">
              Step-by-Step Instructions ({recipe.instructions.length} steps)
            </h2>
            <button
              onClick={() => onStartCooking(recipe.id)}
              className="text-xs font-semibold text-[#1B4332] hover:underline"
            >
              Switch to Fullscreen Counter Mode &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {recipe.instructions.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-white p-5 rounded-2xl border border-[#E2EBE5] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white text-xs font-bold flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <h3 className="font-bold text-sm text-stone-800">{step.title}</h3>
                  </div>

                  {step.timerSeconds && step.timerSeconds > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(step.timerSeconds / 60)} min
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-8">
                  {step.instruction}
                </p>

                {step.chefTip && (
                  <div className="ml-8 p-3 rounded-xl bg-[#F0F4F1] border border-[#dce7e0] text-xs text-stone-700 flex items-start gap-2">
                    <ChefHat className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-[#1B4332]">Chef&apos;s Pro Tip: </strong>
                      {step.chefTip}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Big CTA */}
          <div className="pt-4">
            <button
              onClick={() => onStartCooking(recipe.id)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#1B4332] text-white font-bold shadow-md hover:bg-[#143628] transition-all text-sm sm:text-base"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Step-by-Step Cooking Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Substitution Modal */}
      {subModalIngredient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2EBE5] p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-800 text-base">
                Substitutes for &quot;{subModalIngredient}&quot;
              </h3>
              <button
                onClick={() => setSubModalIngredient(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            {substitutionLoading ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-500">Checking culinary substitutions...</p>
              </div>
            ) : substitutionData ? (
              <div className="space-y-3">
                <div className="space-y-2.5">
                  {substitutionData.substitutes.map((sub: any, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800">{sub.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {sub.ratio}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">{sub.flavorAndTexture}</p>
                      <span className="text-[10px] text-stone-400 block">Best for: {sub.bestFor}</span>
                    </div>
                  ))}
                </div>

                {substitutionData.chefTip && (
                  <p className="text-xs text-stone-600 bg-[#E7EFEA] p-2.5 rounded-xl">
                    <strong className="text-[#1B4332]">Chef Tip: </strong>
                    {substitutionData.chefTip}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-4">
                Could not retrieve substitutions. Please ask Chef RasoiAI directly in chat.
              </p>
            )}

            <button
              onClick={() => setSubModalIngredient(null)}
              className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
