import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { InventoryItem, UserPreferences } from '../types';

interface UserSettingsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  inventory: InventoryItem[];
  favorites: string[];
  onImportData: (data: { inventory: InventoryItem[]; favorites: string[]; preferences: UserPreferences }) => void;
  onResetDemo: () => void;
}

const ALL_DIETARY = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'High-Protein',
  'Keto-Friendly',
  'Low-Carb',
  'Pescatarian',
];

const ALL_ALLERGENS = [
  'Dairy',
  'Gluten',
  'Peanuts',
  'Tree Nuts',
  'Soy',
  'Eggs',
  'Shellfish',
  'Fish',
  'Sesame',
];

export const UserSettings: React.FC<UserSettingsProps> = ({
  preferences,
  onUpdatePreferences,
  inventory,
  favorites,
  onImportData,
  onResetDemo,
}) => {
  // Preference handlers
  const toggleDietary = (item: string) => {
    const current = preferences.dietaryPreferences || [];
    const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
    onUpdatePreferences({ ...preferences, dietaryPreferences: next });
  };

  const toggleAllergy = (item: string) => {
    const current = preferences.allergies || [];
    const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
    onUpdatePreferences({ ...preferences, allergies: next });
  };

  // Export JSON
  const handleExportJSON = () => {
    const state = {
      inventory,
      favorites,
      preferences,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_kitchen_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.inventory && Array.isArray(parsed.inventory)) {
          onImportData(parsed);
          alert('Kitchen data successfully imported!');
        } else {
          alert('Invalid kitchen data format.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Copy Supabase SQL schema snippet
  const handleCopySchema = () => {
    const sqlNotice = `-- Run this in your Supabase SQL Editor:
-- Find complete migration in supabase/schema.sql in this project.
-- Contains tables for profiles, user_preferences, recipes, recipe_ingredients,
-- recipe_steps, inventory_items, favorites, scan_history, and RLS policies.`;
    navigator.clipboard.writeText(sqlNotice);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
          Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Customize culinary dietary restrictions, food allergen alerts, and persistent Supabase database sync.
        </p>
      </div>

      {/* 1. Dietary Preferences */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2EBE5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#1B4332]" />
          <h2 className="text-lg font-bold text-stone-800">Dietary Preferences</h2>
        </div>
        <p className="text-xs text-stone-500">
          Recipes will automatically adapt recommendations and alert you if ingredients clash with these choices.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {ALL_DIETARY.map((item) => {
            const isSelected = preferences.dietaryPreferences?.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleDietary(item)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#E7EFEA] border-[#1B4332] text-[#1B4332]'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{item}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#1B4332]" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Severe Allergies to Avoid */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2EBE5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-stone-800">Allergen Safety Guard</h2>
        </div>
        <p className="text-xs text-stone-500">
          Chef RasoiAI will strictly flag and warn you whenever a recipe calls for any of these ingredients.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          {ALL_ALLERGENS.map((allergen) => {
            const isSelected = preferences.allergies?.includes(allergen);
            return (
              <button
                key={allergen}
                onClick={() => toggleAllergy(allergen)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{allergen}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-rose-600" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Kitchen Operational Thresholds */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2EBE5] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-800">Kitchen Display & Expiry Thresholds</h2>
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Measurement Units
            </label>
            <select
              value={preferences.measurementUnit}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  measurementUnit: e.target.value as 'metric' | 'imperial',
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
            >
              <option value="metric">Metric (g, ml, kg)</option>
              <option value="imperial">Imperial (cups, oz, tbsp)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Default Cooking Servings
            </label>
            <input
              type="number"
              min="1"
              max="16"
              value={preferences.defaultServings}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  defaultServings: parseInt(e.target.value) || 2,
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Expiry Warning Threshold (Days)
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={preferences.expiryWarningDays}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  expiryWarningDays: parseInt(e.target.value) || 3,
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>
        </div>
      </section>



      {/* 5. Data Backup, Export & Reset */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2EBE5] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-800">Kitchen Data Management</h2>
        <p className="text-xs text-stone-500">
          Export your kitchen inventory as a JSON backup or reset to our curated demo catalog anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset kitchen inventory to sample items with demo expiration dates?')) {
                onResetDemo();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Inventory</span>
          </button>
        </div>
      </section>
    </div>
  );
};
