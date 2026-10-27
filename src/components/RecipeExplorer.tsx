import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Clock,
  ChefHat,
  ArrowRight,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { CuisineType, RecipeMatchResult, InventoryItem } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface RecipeExplorerProps {
  matches: RecipeMatchResult[];
  favorites: string[];
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
  onAddMissingToInventory?: (items: InventoryItem[]) => void;
  onOpenAIGenerator?: () => void;
}

const CUISINES: (CuisineType | 'All Cuisines')[] = [
  'All Cuisines',
  'Indian',
  'Italian',
  'Mexican',
  'Thai',
  'Chinese' as CuisineType,
  'Mediterranean',
  'American',
  'Japanese',
];

const DIETARY: string[] = [
  'All Diets',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'High-Protein',
  'Low-Carb',
  'Dairy-Free',
];

export const RecipeExplorer: React.FC<RecipeExplorerProps> = ({
  matches,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
  onOpenAIGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All Cuisines');
  const [selectedDiet, setSelectedDiet] = useState<string>('All Diets');
  const [sortBy, setSortBy] = useState<'match' | 'time' | 'alphabetical'>('match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtered & Sorted recipes
  const filtered = useMemo(() => {
    return matches.filter(({ recipe }) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = recipe.name.toLowerCase().includes(q);
        const matchesCuisine = recipe.cuisine.toLowerCase().includes(q);
        const matchesIngredient = recipe.ingredients.some((i) =>
          i.name.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCuisine && !matchesIngredient) return false;
      }

      // Cuisine
      if (selectedCuisine !== 'All Cuisines' && recipe.cuisine !== selectedCuisine) {
        return false;
      }

      // Diet
      if (selectedDiet !== 'All Diets') {
        if (!recipe.dietaryTags?.includes(selectedDiet)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchPercentage - a.matchPercentage;
      }
      if (sortBy === 'time') {
        return a.recipe.totalMinutes - b.recipe.totalMinutes;
      }
      return a.recipe.name.localeCompare(b.recipe.name);
    });
  }, [matches, searchQuery, selectedCuisine, selectedDiet, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6 animate-in fade-in duration-200">
      {/* Header with Promo Card on Right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="max-w-xl space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Recipe Catalog
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Discover delicious recipes from around the world or get personalized recommendations based on your available ingredients.
          </p>
        </div>

        {/* Promo Box: Find recipes from what you have */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE6DD] flex items-center justify-between gap-4 max-w-sm shrink-0 shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-stone-900">Find recipes from what you have</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Scan your ingredients to get personalized matches.
            </p>
            {onOpenAIGenerator && (
              <button
                onClick={onOpenAIGenerator}
                className="mt-2 text-[11px] font-bold text-[#163828] hover:underline flex items-center gap-1"
              >
                <span>AI Generator &rarr;</span>
              </button>
            )}
          </div>
          <OptimizedImage
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=70"
            alt="Produce bowl"
            widthParam={160}
            qualityParam={70}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
            containerClassName="w-14 h-14 rounded-xl shrink-0"
          />
        </div>
      </div>

      {/* Search Input & Sort Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes, ingredients, or cuisine (e.g. paneer, pasta, chicken...)"
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#EBE6DD] bg-white text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163828]/20 focus:border-[#163828] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-stone-500 hidden sm:inline whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2 rounded-full border border-[#EBE6DD] bg-white text-xs text-stone-800 focus:outline-none cursor-pointer"
          >
            <option value="match">Best Match</option>
            <option value="time">Fastest Prep</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Cuisine Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CUISINES.map((cuisine) => {
          const isActive = selectedCuisine === cuisine;
          return (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#163828] text-white shadow-xs'
                  : 'bg-white border border-[#EBE6DD] text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cuisine}
            </button>
          );
        })}
      </div>

      {/* Dietary Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DIETARY.map((diet) => {
          const isActive = selectedDiet === diet;
          return (
            <button
              key={diet}
              onClick={() => setSelectedDiet(diet)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#163828] text-white'
                  : 'bg-white border border-[#EBE6DD] text-stone-600 hover:bg-stone-50'
              }`}
            >
              {diet}
            </button>
          );
        })}
      </div>

      {/* Showing Count & Grid/List Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EBE6DD] text-xs text-stone-500">
        <span>
          Showing <span className="font-bold text-stone-800">{filtered.length}</span> of{' '}
          {matches.length} recipes
        </span>

        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-[#EBE6DD]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white text-[#163828] shadow-xs' : 'text-stone-500'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-white text-[#163828] shadow-xs' : 'text-stone-500'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recipe Grid (3 Columns) */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#EBE6DD] text-center space-y-3">
          <p className="text-sm font-semibold text-stone-700">No recipes matched your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCuisine('All Cuisines');
              setSelectedDiet('All Diets');
            }}
            className="text-xs font-bold text-[#163828] underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filtered.map(({ recipe, matchPercentage }) => {
            const isFav = favorites.includes(recipe.id);

            return (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="bg-white rounded-2xl border border-[#EBE6DD] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                {/* Thumbnail with Match Badge & Heart */}
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <OptimizedImage
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    widthParam={440}
                    qualityParam={65}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E9F0E8] text-[#163828] shadow-xs">
                      {matchPercentage}% Match
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(recipe.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-xs"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'text-red-500 fill-red-500' : 'text-stone-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-[#163828] transition-colors line-clamp-1">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 font-medium">
                      <span>{recipe.cuisine}</span>
                      <span>&bull;</span>
                      <span>{recipe.dietaryTags?.[0] || 'Vegetarian'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{recipe.totalMinutes} mins</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>{recipe.difficulty}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
