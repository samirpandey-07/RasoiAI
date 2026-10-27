import React, { useState } from 'react';
import {
  Sparkles,
  ChefHat,
  X,
  Clock,
  Flame,
  Leaf,
  AlertCircle,
  Play,
  BookmarkPlus,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Recipe, InventoryItem, UserPreferences, CuisineType } from '../types';
import { generateCustomRecipe } from '../services/gemini';
import { getExpiryStatus } from '../services/matching';

interface AIRecipeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  preselectedIngredients?: string[];
  preferences: UserPreferences;
  onRecipeGenerated: (recipe: Recipe) => void;
  onStartCooking: (recipeId: string) => void;
}

const CUISINE_OPTIONS: (CuisineType | 'Any')[] = [
  'Any',
  'Indian',
  'Italian',
  'Mexican',
  'Thai',
  'Japanese',
  'Mediterranean',
  'French',
  'Spanish',
  'American',
  'Middle Eastern',
  'Vietnamese',
];

export const AIRecipeGeneratorModal: React.FC<AIRecipeGeneratorModalProps> = ({
  isOpen,
  onClose,
  inventory,
  preselectedIngredients,
  preferences,
  onRecipeGenerated,
  onStartCooking,
}) => {
  // Extract on-hand ingredients and identify expiring items
  const expiringOnes = inventory
    .filter((i) => {
      const s = getExpiryStatus(i.expiryDate).status;
      return s === 'expiring_soon' || s === 'expired';
    })
    .map((i) => i.name);

  const allAvailableNames = inventory.map((i) => i.name);
  const initialSelected = preselectedIngredients && preselectedIngredients.length > 0
    ? preselectedIngredients
    : allAvailableNames.slice(0, 10);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialSelected);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Any');
  const [maxMinutes, setMaxMinutes] = useState<number>(30);
  const [servings, setServings] = useState<number>(preferences.defaultServings || 4);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      setErrorMessage('Please select at least 1 ingredient for Chef Gemini to work with.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedRecipe(null);

    const expiringToRescue = expiringOnes.filter((e) => selectedIngredients.includes(e));

    const result = await generateCustomRecipe({
      ingredients: selectedIngredients,
      expiringIngredients: expiringToRescue,
      cuisine: selectedCuisine,
      dietaryPreferences: preferences.dietaryPreferences,
      allergies: preferences.allergies,
      maxTimeMinutes: maxMinutes,
      servings: servings,
    });

    setIsLoading(false);

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
      onRecipeGenerated(result.recipe);
    } else {
      setErrorMessage(result.error || 'Failed to craft custom recipe. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E2EBE5] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-xs font-semibold text-[#1B4332]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI Dynamic Recipe Studio</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#143628] tracking-tight">
            Craft a Recipe with Chef Gemini
          </h2>
          <p className="text-xs text-stone-600">
            Select what you have in your kitchen. Gemini creates a fully structured recipe tailored to your exact ingredients, expiring items, and dietary needs.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!generatedRecipe ? (
          /* Step 1: Configuration Form */
          <div className="space-y-5">
            {/* Ingredients Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>Select Ingredients to Cook With ({selectedIngredients.length} selected):</span>
                {expiringOnes.length > 0 && (
                  <span className="text-amber-800 flex items-center gap-1 font-semibold text-[11px]">
                    <Leaf className="w-3 h-3 text-amber-600" /> {expiringOnes.length} Expiring Items Available
                  </span>
                )}
              </div>

              {allAvailableNames.length === 0 ? (
                <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl">
                  No inventory items logged. Enter ingredients below or add items in My Kitchen.
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto p-3 bg-[#FAF8F5] rounded-2xl border border-stone-200 flex flex-wrap gap-1.5">
                  {allAvailableNames.map((name) => {
                    const isSelected = selectedIngredients.includes(name);
                    const isExpiring = expiringOnes.includes(name);

                    return (
                      <button
                        key={name}
                        onClick={() => toggleIngredient(name)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                          isSelected
                            ? isExpiring
                              ? 'bg-amber-500 text-white font-bold shadow-xs'
                              : 'bg-[#1B4332] text-white font-semibold shadow-xs'
                            : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {isExpiring && <span>⚡</span>}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cuisine & Duration Controls */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Cuisine Style</label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none"
                >
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>Target Time</span>
                  <span className="font-mono text-[#1B4332]">{maxMinutes}m</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(parseInt(e.target.value))}
                  className="w-full accent-[#1B4332] cursor-pointer mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Servings</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>
            </div>

            {/* Active Constraints Summary */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between">
              <div>
                <strong className="text-stone-800">Dietary Preferences Applied: </strong>
                <span>
                  {preferences.dietaryPreferences?.length
                    ? preferences.dietaryPreferences.join(', ')
                    : 'None specified'}
                </span>
                {preferences.allergies?.length > 0 && (
                  <span className="text-rose-700 ml-2 font-semibold">
                    (Excluding: {preferences.allergies.join(', ')})
                  </span>
                )}
              </div>
            </div>

            {/* Generate CTA Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || selectedIngredients.length === 0}
              className="w-full py-3.5 rounded-2xl bg-[#1B4332] text-white text-sm font-bold shadow-md hover:bg-[#143628] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Chef Gemini is creating your recipe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate Personalized Recipe</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Step 2: Generated Recipe Preview */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2EBE5] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1B4332] text-white">
                      {generatedRecipe.cuisine}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {generatedRecipe.totalMinutes} mins
                    </span>
                    {generatedRecipe.wasteRescueNote && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        Zero-Waste Rescued
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-[#143628]">{generatedRecipe.name}</h3>
                  <p className="text-xs text-stone-600 mt-1">{generatedRecipe.description}</p>
                </div>
              </div>

              {/* Nutrition Estimates with Accuracy Caveat */}
              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span>Estimated Nutrition (per serving):</span>
                  <span className="font-mono text-[#1B4332]">
                    {generatedRecipe.nutrition?.calories} kcal
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-stone-600 border-t border-stone-100 pt-2">
                  <div>
                    <span className="font-bold text-stone-800">
                      {generatedRecipe.nutrition?.proteinGrams}g
                    </span>{' '}
                    protein
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">
                      {generatedRecipe.nutrition?.carbsGrams}g
                    </span>{' '}
                    carbs
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">
                      {generatedRecipe.nutrition?.fatGrams}g
                    </span>{' '}
                    fat
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">
                      {generatedRecipe.nutrition?.fiberGrams || 0}g
                    </span>{' '}
                    fiber
                  </div>
                </div>

                {/* Nutritional Accuracy Caveat */}
                <div className="flex items-start gap-1.5 text-[10px] text-stone-500 pt-1 border-t border-stone-100 italic">
                  <Info className="w-3.5 h-3.5 shrink-0 text-stone-400 mt-0.5" />
                  <span>
                    {generatedRecipe.nutritionalCaveat ||
                      'Nutritional values are estimates based on average USDA reference data. Real values vary with specific brands and cooking loss.'}
                  </span>
                </div>
              </div>

              {/* Ingredients List Summary */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-800 block">Ingredients:</span>
                <div className="flex flex-wrap gap-1.5">
                  {generatedRecipe.ingredients?.map((ing: any, i: number) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700"
                    >
                      {ing.amount} {ing.unit} {ing.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Start Cooking or Close */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  onStartCooking(generatedRecipe.id);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B4332] text-white text-xs font-bold shadow-md hover:bg-[#143628] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Cooking Mode Now</span>
              </button>

              <button
                onClick={() => setGeneratedRecipe(null)}
                className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Craft Another
              </button>

              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
