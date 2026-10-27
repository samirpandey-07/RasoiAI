/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AppView, InventoryItem, Recipe, ScanResultData, UserPreferences } from './types';
import { RECIPES } from './data/recipes';
import { matchRecipes } from './services/matching';
import {
  loadInventoryFromStorage,
  persistInventory,
  loadFavoritesFromStorage,
  persistFavorites,
  loadPreferencesFromStorage,
  persistPreferences,
  getInitialDemoInventory,
} from './services/supabase';

// Components
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { IngredientScanner } from './components/IngredientScanner';
import { ScanResults } from './components/ScanResults';
import { RecipeExplorer } from './components/RecipeExplorer';
import { RecipeDetails } from './components/RecipeDetails';
import { KitchenInventory } from './components/KitchenInventory';
import { ExpiryTracker } from './components/ExpiryTracker';
import { CookingMode } from './components/CookingMode';
import { AICookingAssistant } from './components/AICookingAssistant';
import { Favorites } from './components/Favorites';
import { UserSettings } from './components/UserSettings';
import { AuthModal } from './components/AuthModal';
import { AIRecipeGeneratorModal } from './components/AIRecipeGeneratorModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferencesFromStorage());
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [currentScanResult, setCurrentScanResult] = useState<ScanResultData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);
  const [aiGeneratorPreselected, setAiGeneratorPreselected] = useState<string[]>([]);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Load persisted inventory, favorites and preferences on start
  useEffect(() => {
    async function init() {
      const storedInv = await loadInventoryFromStorage();
      setInventory(storedInv);
      const storedFavs = loadFavoritesFromStorage();
      setFavorites(storedFavs);
      setInitialLoading(false);
    }
    init();
  }, []);

  // Combined master recipes (curated catalog + AI dynamically generated recipes)
  const allRecipes = useMemo(() => {
    return [...customRecipes, ...RECIPES];
  }, [customRecipes]);

  // Deterministic recipe matching engine
  const matches = useMemo(() => {
    return matchRecipes(allRecipes, inventory, preferences.expiryWarningDays || 3);
  }, [allRecipes, inventory, preferences.expiryWarningDays]);

  // Currently active selected recipe
  const activeRecipe = useMemo(() => {
    if (!selectedRecipeId) return null;
    return allRecipes.find((r) => r.id === selectedRecipeId) || null;
  }, [allRecipes, selectedRecipeId]);

  const activeRecipeMatch = useMemo(() => {
    if (!selectedRecipeId) return undefined;
    return matches.find((m) => m.recipe.id === selectedRecipeId);
  }, [matches, selectedRecipeId]);

  // Inventory CRUD handlers
  const handleAddItem = (item: InventoryItem) => {
    const updated = [item, ...inventory];
    setInventory(updated);
    persistInventory(updated);
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    const updated = inventory.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    setInventory(updated);
    persistInventory(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = inventory.filter((i) => i.id !== id);
    setInventory(updated);
    persistInventory(updated);
  };

  const handleAddBatchToInventory = (items: InventoryItem[]) => {
    const updated = [...items, ...inventory];
    setInventory(updated);
    persistInventory(updated);
  };

  // Favorites handler
  const handleToggleFavorite = (recipeId: string) => {
    const next = favorites.includes(recipeId)
      ? favorites.filter((id) => id !== recipeId)
      : [...favorites, recipeId];
    setFavorites(next);
    persistFavorites(next);
  };

  // Preferences handler
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    persistPreferences(newPrefs);
  };

  // Scanner handler
  const handleScanComplete = (result: ScanResultData, previewUrl?: string) => {
    setCurrentScanResult({
      ...result,
      imagePreviewUrl: previewUrl,
    });
    setCurrentView('scan_results');
  };

  // Navigation handlers
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setCurrentView('recipe_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCooking = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setCurrentView('cooking_mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Data import & Reset
  const handleImportData = (data: { inventory: InventoryItem[]; favorites: string[]; preferences: UserPreferences }) => {
    if (data.inventory) {
      setInventory(data.inventory);
      persistInventory(data.inventory);
    }
    if (data.favorites) {
      setFavorites(data.favorites);
      persistFavorites(data.favorites);
    }
    if (data.preferences) {
      setPreferences(data.preferences);
      persistPreferences(data.preferences);
    }
  };

  const handleResetDemo = () => {
    const demoItems = getInitialDemoInventory();
    setInventory(demoItems);
    persistInventory(demoItems);
    alert('Kitchen inventory reset to demo produce and groceries.');
  };

  const handleOpenAIGenerator = (preselected?: string[]) => {
    if (preselected && preselected.length > 0) {
      setAiGeneratorPreselected(preselected);
    } else {
      setAiGeneratorPreselected([]);
    }
    setIsAIGeneratorOpen(true);
  };

  const handleRecipeGenerated = (newRecipe: Recipe) => {
    setCustomRecipes((prev) => [newRecipe, ...prev]);
    setSelectedRecipeId(newRecipe.id);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Loading Smart Kitchen AI...</p>
        </div>
      </div>
    );
  }

  // Fullscreen Cooking Mode has its own counter layout
  if (currentView === 'cooking_mode' && activeRecipe) {
    return (
      <CookingMode
        recipe={activeRecipe}
        onExit={() => handleNavigate('recipe_details')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between text-stone-900 selection:bg-[#E7EFEA]">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        inventory={inventory}
        favoritesCount={favorites.length}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            featuredRecipes={allRecipes}
            onSelectRecipe={handleSelectRecipe}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            inventory={inventory}
            matches={matches}
            onNavigate={handleNavigate}
            onSelectRecipe={handleSelectRecipe}
            onOpenAIGenerator={() => handleOpenAIGenerator()}
          />
        )}

        {currentView === 'scanner' && (
          <IngredientScanner onScanComplete={handleScanComplete} />
        )}

        {currentView === 'scan_results' && currentScanResult && (
          <ScanResults
            scanData={currentScanResult}
            onAddToInventory={handleAddBatchToInventory}
            onFindRecipes={() => handleNavigate('recipes')}
            onScanAnother={() => handleNavigate('scanner')}
            onGenerateAIRecipe={(names) => handleOpenAIGenerator(names)}
          />
        )}

        {currentView === 'recipes' && (
          <RecipeExplorer
            matches={matches}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipe={handleSelectRecipe}
            onAddMissingToInventory={handleAddBatchToInventory}
            onOpenAIGenerator={() => handleOpenAIGenerator()}
          />
        )}

        {currentView === 'recipe_details' && activeRecipe && (
          <RecipeDetails
            recipe={activeRecipe}
            matchResult={activeRecipeMatch}
            inventory={inventory}
            isFavorite={favorites.includes(activeRecipe.id)}
            onToggleFavorite={handleToggleFavorite}
            onStartCooking={handleStartCooking}
            onBack={() => handleNavigate('recipes')}
            onAskChef={(q) => {
              handleNavigate('assistant');
            }}
            onAddMissingToInventory={handleAddBatchToInventory}
          />
        )}

        {currentView === 'inventory' && (
          <KitchenInventory
            inventory={inventory}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onNavigateToScanner={() => handleNavigate('scanner')}
          />
        )}

        {currentView === 'expiry' && (
          <ExpiryTracker
            inventory={inventory}
            matches={matches}
            onSelectRecipe={handleSelectRecipe}
            onNavigate={handleNavigate}
            onOpenAIGenerator={() => handleOpenAIGenerator()}
          />
        )}

        {currentView === 'assistant' && (
          <AICookingAssistant
            inventory={inventory}
            activeRecipe={activeRecipe}
            preferences={preferences}
            onSelectRecipe={handleSelectRecipe}
          />
        )}

        {currentView === 'favorites' && (
          <Favorites
            favorites={favorites}
            matches={matches}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipe={handleSelectRecipe}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'settings' && (
          <UserSettings
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            inventory={inventory}
            favorites={favorites}
            onImportData={handleImportData}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2EBE5] bg-white py-8 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-semibold text-stone-700">Smart Kitchen AI &bull; Food Waste Reduction & Culinary Companion</p>
          <p className="text-stone-400">
            Powered by Google Gemini 3.8 Flash Vision & TypeScript Deterministic Matching Engine
          </p>
        </div>
      </footer>

      {/* Supabase / Guest Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(email) => setUserEmail(email)}
      />

      {/* AI Recipe Generator Modal (On-the-fly personalized recipe from ingredients & preferences) */}
      <AIRecipeGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        inventory={inventory}
        preselectedIngredients={aiGeneratorPreselected}
        preferences={preferences}
        onRecipeGenerated={handleRecipeGenerated}
        onStartCooking={handleStartCooking}
      />
    </div>
  );
}
