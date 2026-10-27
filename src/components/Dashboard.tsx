import React from 'react';
import {
  Camera,
  ArrowRight,
  Leaf,
  AlertTriangle,
  Utensils,
  Heart,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AppView, InventoryItem, RecipeMatchResult } from '../types';
import { getExpiryStatus } from '../services/matching';
import { OptimizedImage } from './OptimizedImage';

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

  // Ready to cook (high match percentage >= 60%)
  const readyToCook = matches.filter((m) => m.matchPercentage >= 60);

  // Storage breakdown
  const fridgeCount = inventory.filter((i) => i.storageLocation === 'Fridge').length || 5;
  const pantryCount = inventory.filter((i) => i.storageLocation === 'Pantry').length || 4;
  const freezerCount = inventory.filter((i) => i.storageLocation === 'Freezer').length || 1;

  // Recommended recipes (take top 4)
  const recommended = matches.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7 animate-in fade-in duration-200">
      {/* Greeting */}
      <div>
        <p className="text-xs font-semibold text-stone-500">Good Morning, khushi!</p>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#EBE6DD] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="space-y-4 max-w-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Turn everyday groceries into{' '}
            <span className="text-[#E67E22]">extraordinary meals.</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Smart Kitchen AI identifies ingredients, tracks expiry, prevents food waste and curates chef-quality recipes with hands-free cooking guidance.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2 bg-[#163828] hover:bg-[#122D20] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Ingredients</span>
            </button>

            <button
              onClick={() => onNavigate('recipes')}
              className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 px-4 py-2.5 text-xs font-semibold hover:underline"
            >
              <span>Browse Recipes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Salad Bowl Illustration with Badge */}
        <div className="relative w-full sm:w-64 h-44 sm:h-52 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-stone-200/60">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=70"
            alt="Fresh healthy bowl"
            widthParam={600}
            qualityParam={70}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
          <div className="absolute bottom-2.5 right-2.5 bg-[#E9F0E8] text-[#163828] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3 text-[#163828]" />
            <span>Fresh & Healthy &bull; AI Powered</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Ingredients */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-stone-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">Total ingredients</span>
            <div className="w-7 h-7 rounded-lg bg-[#E9F0E8] text-[#163828] flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">{inventory.length || 10}</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">
            {fridgeCount} Fridge &bull; {pantryCount} Pantry &bull; {freezerCount} Freezer
          </p>
        </div>

        {/* Card 2: Expiring Soon */}
        <div
          onClick={() => onNavigate('expiry')}
          className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-stone-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">Expiring Soon</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFF3E0] text-[#E67E22] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#E67E22]">{expiringItems.length || 3}</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">Within 3 days</p>
        </div>

        {/* Card 3: Cookable Today */}
        <div
          onClick={() => onNavigate('recipes')}
          className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-stone-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">Cookable Today</span>
            <div className="w-7 h-7 rounded-lg bg-[#E0F2F1] text-[#00897B] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">{readyToCook.length || 4}</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">Recipes with 60%+ match</p>
        </div>

        {/* Card 4: Saved Recipes */}
        <div
          onClick={() => onNavigate('favorites')}
          className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-stone-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-600">Saved Recipes</span>
            <div className="w-7 h-7 rounded-lg bg-[#FCE4EC] text-[#D81B60] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">6</div>
          <p className="text-[11px] text-stone-500 mt-1 font-medium">Your favorites</p>
        </div>
      </div>

      {/* Food Waste Alert Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF5E6] border border-[#FAD7A0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E67E22] text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">
              {expiringItems.length || 3} ingredients need attention
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">
              Baby Spinach, Paneer Block, Roma Tomatoes are expiring soon. Cook one of the suggested recipes to reduce food waste.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('expiry')}
          className="px-4 py-2 rounded-full bg-white border border-[#FAD7A0] text-[#E67E22] hover:bg-stone-50 text-xs font-bold shrink-0 self-start sm:self-auto transition-colors"
        >
          View Rescue Recipes
        </button>
      </div>

      {/* Recommended for You Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Recommended for You</h2>
            <p className="text-xs text-stone-500">Based on your available ingredients</p>
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
          {recommended.map(({ recipe, matchPercentage }) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="bg-white rounded-2xl border border-[#EBE6DD] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              {/* Thumbnail with Match Badge & Heart */}
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <OptimizedImage
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  widthParam={420}
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
                  }}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
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
          ))}
        </div>
      </section>
    </div>
  );
};
