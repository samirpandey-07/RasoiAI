import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Clock,
  Flame,
  Heart,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  X,
  Plus,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  ChefHat,
  ShoppingBag,
} from 'lucide-react';
import { CuisineType, DifficultyLevel, RecipeMatchResult, InventoryItem } from '../types';

interface RecipeExplorerProps {
  matches: RecipeMatchResult[];
  favorites: string[];
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
  onAddMissingToInventory?: (items: InventoryItem[]) => void;
  onOpenAIGenerator?: () => void;
}

const ALL_CUISINES: CuisineType[] = [
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

const DIETARY_OPTIONS = [
  { id: 'Vegetarian', label: 'Vegetarian', desc: 'Plant-forward, meat-free' },
  { id: 'Vegan', label: 'Vegan', desc: '100% plant-based, no dairy/eggs' },
  { id: 'Gluten-Free', label: 'Gluten-Free', desc: 'No wheat or gluten grains' },
  { id: 'High-Protein', label: 'High-Protein', desc: '>= 20g protein per serving' },
  { id: 'Dairy-Free', label: 'Dairy-Free', desc: 'No lactose or dairy' },
];

const POPULAR_INGREDIENT_CHIPS = [
  'spinach',
  'paneer',
  'chicken',
  'tomato',
  'pasta',
  'rice',
  'egg',
  'chickpeas',
  'avocado',
  'garlic',
];

type MatchFilterLevel = 'all' | 'complete' | 'high' | 'rescue';
type SortOption = 'match' | 'expiry' | 'time' | 'calories' | 'alphabetical';

export const RecipeExplorer: React.FC<RecipeExplorerProps> = ({
  matches,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
  onAddMissingToInventory,
  onOpenAIGenerator,
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [maxTotalTime, setMaxTotalTime] = useState<number>(60);
  const [matchLevel, setMatchLevel] = useState<MatchFilterLevel>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [selectedIngredientFilter, setSelectedIngredientFilter] = useState<string | null>(null);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Toggle Cuisine (Multi-select)
  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  // Toggle Dietary Tag (Multi-select)
  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Count recipes per cuisine
  const cuisineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    matches.forEach((m) => {
      counts[m.recipe.cuisine] = (counts[m.recipe.cuisine] || 0) + 1;
    });
    return counts;
  }, [matches]);

  // Count recipes per dietary tag
  const dietaryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    matches.forEach((m) => {
      m.recipe.dietaryTags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [matches]);

  // Filter and Sort Logic
  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        const r = m.recipe;

        // 1. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = r.name.toLowerCase().includes(q);
          const matchesCuisine = r.cuisine.toLowerCase().includes(q);
          const matchesDesc = r.description.toLowerCase().includes(q);
          const matchesIng = r.ingredients.some((ing) => ing.name.toLowerCase().includes(q));
          if (!matchesName && !matchesCuisine && !matchesDesc && !matchesIng) return false;
        }

        // 2. Specific ingredient quick chip filter
        if (selectedIngredientFilter) {
          const chipNorm = selectedIngredientFilter.toLowerCase();
          const hasIng = r.ingredients.some(
            (ing) =>
              ing.normalizedName.includes(chipNorm) || ing.name.toLowerCase().includes(chipNorm)
          );
          if (!hasIng) return false;
        }

        // 3. Cuisine filter (matches any of the selected cuisines, or all if empty)
        if (selectedCuisines.length > 0) {
          if (!selectedCuisines.includes(r.cuisine)) return false;
        }

        // 4. Dietary tag filter (must satisfy ALL selected dietary tags)
        if (selectedDietary.length > 0) {
          const hasAllDietary = selectedDietary.every((tag) => r.dietaryTags.includes(tag));
          if (!hasAllDietary) return false;
        }

        // 5. Difficulty filter
        if (selectedDifficulty !== 'All' && r.difficulty !== selectedDifficulty) {
          return false;
        }

        // 6. Max Cooking Time
        if (r.totalMinutes > maxTotalTime) {
          return false;
        }

        // 7. Kitchen Match Readiness Level
        if (matchLevel === 'complete' && m.matchPercentage < 100) {
          return false;
        } else if (matchLevel === 'high' && m.matchPercentage < 70) {
          return false;
        } else if (matchLevel === 'rescue' && !m.hasExpiringIngredients) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return b.score - a.score;
        } else if (sortBy === 'expiry') {
          const aExp = a.hasExpiringIngredients ? 1 : 0;
          const bExp = b.hasExpiringIngredients ? 1 : 0;
          if (bExp !== aExp) return bExp - aExp;
          return b.matchPercentage - a.matchPercentage;
        } else if (sortBy === 'time') {
          return a.recipe.totalMinutes - b.recipe.totalMinutes;
        } else if (sortBy === 'calories') {
          return a.recipe.nutrition.calories - b.recipe.nutrition.calories;
        } else {
          return a.recipe.name.localeCompare(b.recipe.name);
        }
      });
  }, [
    matches,
    searchQuery,
    selectedIngredientFilter,
    selectedCuisines,
    selectedDietary,
    selectedDifficulty,
    maxTotalTime,
    matchLevel,
    sortBy,
  ]);

  // Active filter count
  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedIngredientFilter ? 1 : 0) +
    selectedCuisines.length +
    selectedDietary.length +
    (selectedDifficulty !== 'All' ? 1 : 0) +
    (maxTotalTime < 60 ? 1 : 0) +
    (matchLevel !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedIngredientFilter(null);
    setSelectedCuisines([]);
    setSelectedDietary([]);
    setSelectedDifficulty('All');
    setMaxTotalTime(60);
    setMatchLevel('all');
    setSortBy('match');
  };

  // Add missing ingredients to inventory
  const handleAddMissingItems = (missing: RecipeMatchResult['missingIngredients'], recipeName: string) => {
    if (!onAddMissingToInventory || missing.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newItems: InventoryItem[] = missing.map((m, idx) => ({
      id: `inv_missing_${Date.now()}_${idx}`,
      name: m.name,
      normalizedName: m.normalizedName,
      category: 'Pantry & Grains',
      quantity: m.amount || 1,
      unit: m.unit || 'unit',
      storageLocation: 'Pantry',
      purchaseDate: todayStr,
      notes: `Needed for ${recipeName}`,
    }));

    onAddMissingToInventory(newItems);
    setAddedNotice(`Added ${missing.length} missing items to your kitchen inventory!`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#1B4332] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-xs font-semibold text-[#1B4332]">
            <Tag className="w-3.5 h-3.5" />
            <span>Multi-Criteria Culinary Filtering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
            Recipe Catalog & Match Explorer
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Filter through authentic recipes by cuisine, dietary needs, duration, or ask Gemini to craft a custom dish from your pantry.
          </p>
        </div>

        {onOpenAIGenerator && (
          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-100" />
            <span>Ask Gemini for Custom Recipe</span>
          </button>
        )}
      </div>

      {/* Primary Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E2EBE5] shadow-xs space-y-4">
        {/* Top Row: Search Input + Sort Dropdown + Advanced Toggle */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients (e.g. spinach, paneer), or descriptions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort recipes by"
              className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 focus:outline-none"
            >
              <option value="match">Sort: Kitchen Match % (Highest)</option>
              <option value="expiry">Sort: Expiry Rescue First</option>
              <option value="time">Sort: Quickest Time</option>
              <option value="calories">Sort: Lowest Calories</option>
              <option value="alphabetical">Sort: Name (A to Z)</option>
            </select>

            {/* Advanced Filters Expand Toggle */}
            <button
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isAdvancedFiltersOpen || activeFilterCount > 0
                  ? 'bg-[#E7EFEA] border-[#1B4332] text-[#1B4332]'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Popular Ingredient Quick-Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-stone-500 font-semibold whitespace-nowrap">Quick Ingredient:</span>
          {POPULAR_INGREDIENT_CHIPS.map((chip) => {
            const isSelected = selectedIngredientFilter === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedIngredientFilter(isSelected ? null : chip)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#1B4332] text-white font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* SECTION 1: Cuisine Type Filtering (Multi-Select) */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Filter by Cuisine Type
            </span>
            {selectedCuisines.length > 0 && (
              <button
                onClick={() => setSelectedCuisines([])}
                className="text-[11px] text-[#1B4332] hover:underline font-semibold"
              >
                Reset Cuisines
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCuisines([])}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCuisines.length === 0
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              All Cuisines ({matches.length})
            </button>

            {ALL_CUISINES.map((cuisine) => {
              const isSelected = selectedCuisines.includes(cuisine);
              const count = cuisineCounts[cuisine] || 0;
              return (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1B4332] text-white shadow-xs ring-2 ring-[#1B4332]/30'
                      : 'bg-white border border-[#E2EBE5] text-stone-700 hover:bg-[#F0F4F1]'
                  }`}
                >
                  <span>{cuisine}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Dietary Tags Filtering */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Dietary Preferences & Requirements
            </span>
            {selectedDietary.length > 0 && (
              <button
                onClick={() => setSelectedDietary([])}
                className="text-[11px] text-[#1B4332] hover:underline font-semibold"
              >
                Reset Dietary
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(({ id, label }) => {
              const isSelected = selectedDietary.includes(id);
              const count = dietaryCounts[id] || 0;
              return (
                <button
                  key={id}
                  onClick={() => toggleDietary(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#E7EFEA] text-[#1B4332] border border-[#1B4332] shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-[#1B4332] text-white' : 'border border-stone-300'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{label}</span>
                  <span className="text-[10px] text-stone-400">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Advanced Collapsible Options (Time, Readiness, Difficulty) */}
        {isAdvancedFiltersOpen && (
          <div className="pt-4 border-t border-stone-200 grid sm:grid-cols-3 gap-6 bg-stone-50/70 p-4 rounded-2xl">
            {/* Kitchen Readiness Match Level */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800">
                Kitchen Readiness
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all' as MatchFilterLevel, label: 'All Recipes' },
                  { id: 'complete' as MatchFilterLevel, label: '100% Ready' },
                  { id: 'high' as MatchFilterLevel, label: '>= 70% In Pantry' },
                  { id: 'rescue' as MatchFilterLevel, label: 'Rescues Expiry' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setMatchLevel(lvl.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors ${
                      matchLevel === lvl.id
                        ? 'bg-[#1B4332] text-white'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Cook Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">Max Total Time</span>
                <span className="font-mono font-bold text-[#1B4332]">{maxTotalTime} mins</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={maxTotalTime}
                onChange={(e) => setMaxTotalTime(parseInt(e.target.value))}
                className="w-full accent-[#1B4332] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>10m</span>
                <span>25m</span>
                <span>40m</span>
                <span>60m</span>
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800">Difficulty Level</label>
              <div className="flex gap-1.5">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff as any)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-[#1B4332] text-white'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Bar */}
        {activeFilterCount > 0 && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-stone-500 font-medium">Active:</span>

              {selectedCuisines.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E7EFEA] text-[#1B4332] text-xs font-semibold"
                >
                  {c}
                  <button onClick={() => toggleCuisine(c)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedDietary.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-xs font-semibold"
                >
                  {d}
                  <button onClick={() => toggleDietary(d)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedIngredientFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-200 text-stone-800 text-xs font-semibold capitalize">
                  Contains: {selectedIngredientFilter}
                  <button onClick={() => setSelectedIngredientFilter(null)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {matchLevel !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-semibold">
                  {matchLevel === 'complete' ? '100% Ready' : matchLevel === 'high' ? '>= 70% Match' : 'Rescues Expiry'}
                  <button onClick={() => setMatchLevel('all')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {maxTotalTime < 60 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-200 text-stone-800 text-xs font-semibold">
                  &le; {maxTotalTime}m
                  <button onClick={() => setMaxTotalTime(60)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDifficulty !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-200 text-stone-800 text-xs font-semibold">
                  Level: {selectedDifficulty}
                  <button onClick={() => setSelectedDifficulty('All')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All ({activeFilterCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Count & Match Summary Bar */}
      <div className="flex items-center justify-between text-xs text-stone-600 font-semibold px-1">
        <span>
          Showing <strong className="text-stone-900">{filteredMatches.length}</strong> of{' '}
          {matches.length} recipes
        </span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-700">
            {matches.filter((m) => m.matchPercentage >= 70).length} ready with &ge;70% match
          </span>
          <span className="text-amber-700">
            {matches.filter((m) => m.hasExpiringIngredients).length} rescue recipes
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E2EBE5] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E7EFEA] text-[#1B4332] flex items-center justify-center mx-auto shadow-xs">
            <Filter className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-800">No matching recipes found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              We couldn&apos;t find any recipes matching your combination of cuisine, dietary preferences, and duration limits.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143628] shadow-sm transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Recipe Cards Grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(
            ({
              recipe,
              matchPercentage,
              availableIngredients,
              missingIngredients,
              hasExpiringIngredients,
              expiringItemNames,
            }) => {
              const isFav = favorites.includes(recipe.id);

              return (
                <div
                  key={recipe.id}
                  onClick={() => onSelectRecipe(recipe.id)}
                  className="group bg-white rounded-3xl border border-[#E2EBE5] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Hero Image */}
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/95 text-[#1B4332] shadow-xs">
                          {recipe.cuisine}
                        </span>
                        {hasExpiringIngredients && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Rescues: {expiringItemNames[0]}
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(recipe.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-xs"
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
                        />
                      </button>

                      {/* Match readiness pill */}
                      <div className="absolute bottom-2.5 right-2.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${
                            matchPercentage === 100
                              ? 'bg-emerald-600 text-white ring-2 ring-white/40'
                              : matchPercentage >= 70
                              ? 'bg-emerald-700 text-white'
                              : matchPercentage >= 40
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-800/80 text-white backdrop-blur-xs'
                          }`}
                        >
                          {matchPercentage}% Match
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-stone-800 text-base group-hover:text-[#1B4332] transition-colors line-clamp-1">
                          {recipe.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>

                      {/* Metrics: Time, Difficulty, Servings, Calories */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{recipe.totalMinutes}m</span>
                        </div>
                        <span>&bull;</span>
                        <span>{recipe.difficulty}</span>
                        <span>&bull;</span>
                        <span>{recipe.servings} serv</span>
                        <span>&bull;</span>
                        <span>{recipe.nutrition.calories} kcal</span>
                      </div>

                      {/* Coverage Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-medium text-stone-600">
                          <span>
                            {availableIngredients.length} of {recipe.ingredients.length} on-hand
                          </span>
                          <span className="font-semibold text-stone-800">{matchPercentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              matchPercentage >= 75
                                ? 'bg-emerald-600'
                                : matchPercentage >= 40
                                ? 'bg-amber-500'
                                : 'bg-stone-300'
                            }`}
                            style={{ width: `${matchPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Missing Ingredients or Complete Badge */}
                      {missingIngredients.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 line-clamp-1">
                            <span className="font-semibold">Missing:</span>{' '}
                            {missingIngredients.map((m) => m.name).join(', ')}
                          </p>

                          {/* Quick 1-click Add Missing to Kitchen button */}
                          {onAddMissingToInventory && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddMissingItems(missingIngredients, recipe.name);
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-[#E7EFEA] text-[11px] font-semibold text-stone-700 hover:text-[#1B4332] flex items-center justify-center gap-1 transition-colors"
                              title="Add missing ingredients to inventory"
                            >
                              <Plus className="w-3 h-3 text-[#1B4332]" />
                              <span>Add {missingIngredients.length} missing items to pantry</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200/60 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>100% Ready to cook right now!</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Dietary tags + Cook action */}
                  <div className="px-5 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1 max-w-[65%]">
                      {recipe.dietaryTags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#1B4332] group-hover:translate-x-0.5 transition-transform">
                      Cook &rarr;
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};
