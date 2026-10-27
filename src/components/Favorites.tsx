import React from 'react';
import { Heart, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { RecipeMatchResult, AppView } from '../types';

interface FavoritesProps {
  favorites: string[];
  matches: RecipeMatchResult[];
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
  onNavigate: (view: AppView) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  matches,
  onToggleFavorite,
  onSelectRecipe,
  onNavigate,
}) => {
  const favoriteMatches = matches.filter((m) => favorites.includes(m.recipe.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EBE5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-xs font-semibold text-rose-700 mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Saved Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
            Favorite Recipes ({favoriteMatches.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Your personal bookmarks with real-time inventory readiness.
          </p>
        </div>

        <button
          onClick={() => onNavigate('recipes')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2EBE5] text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4 text-stone-500" />
          <span>Explore More Recipes</span>
        </button>
      </div>

      {favoriteMatches.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E2EBE5] text-center space-y-3">
          <Heart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800">You haven&apos;t saved any favorites yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click the heart icon on any recipe card to save it for quick access anytime you enter the kitchen.
          </p>
          <button
            onClick={() => onNavigate('recipes')}
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143628]"
          >
            Browse 30+ Recipes
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteMatches.map(({ recipe, matchPercentage, missingIngredients }) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="group bg-white rounded-2xl border border-[#E2EBE5] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/95 text-[#1B4332]">
                      {recipe.cuisine}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(recipe.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </button>
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-xs">
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
                  {missingIngredients.length === 0
                    ? 'All ingredients ready'
                    : `Need ${missingIngredients.length} more`}
                </span>
                <span className="font-semibold text-[#1B4332] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Cook <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
