import React, { useState } from 'react';
import {
  Check,
  Trash2,
  Plus,
  BookOpen,
  Refrigerator,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Edit2,
  Calendar,
} from 'lucide-react';
import { DetectedIngredient, IngredientCategory, InventoryItem, ScanResultData, StorageLocation } from '../types';
import { normalizeIngredientName } from '../services/matching';

interface ScanResultsProps {
  scanData: ScanResultData;
  onAddToInventory: (items: InventoryItem[]) => void;
  onFindRecipes: () => void;
  onScanAnother: () => void;
  onGenerateAIRecipe?: (ingredientNames: string[]) => void;
}

const CATEGORIES: IngredientCategory[] = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Pantry & Grains',
  'Herbs & Spices',
  'Condiments & Oils',
  'Bakery',
  'Frozen',
  'Other',
];

export const ScanResults: React.FC<ScanResultsProps> = ({
  scanData,
  onAddToInventory,
  onFindRecipes,
  onScanAnother,
  onGenerateAIRecipe,
}) => {
  const [ingredients, setIngredients] = useState<DetectedIngredient[]>(scanData.ingredients);
  const [newIngredientName, setNewIngredientName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<IngredientCategory>('Produce');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Toggle item selection
  const handleToggleSelect = (id: string) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Remove detected ingredient
  const handleRemove = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  // Add manual ingredient
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;

    const newItem: DetectedIngredient = {
      id: `manual_${Date.now()}`,
      name: newIngredientName.trim(),
      normalizedName: normalizeIngredientName(newIngredientName.trim()),
      category: newCategory,
      confidence: 'high',
      notes: 'Added manually by user',
      selected: true,
      quantity: 1,
      unit: 'unit',
    };

    setIngredients((prev) => [newItem, ...prev]);
    setNewIngredientName('');
  };

  // Save selected to inventory
  const handleSaveToInventory = () => {
    const selected = ingredients.filter((i) => i.selected);
    if (selected.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Estimate realistic best-by offset based on category (3-5 days produce, 7 days dairy, 90 days pantry)
    const getSuggestedExpiry = (cat: IngredientCategory) => {
      const d = new Date();
      if (cat === 'Produce') d.setDate(d.getDate() + 4);
      else if (cat === 'Dairy & Eggs') d.setDate(d.getDate() + 7);
      else if (cat === 'Meat & Seafood') d.setDate(d.getDate() + 2);
      else if (cat === 'Bakery') d.setDate(d.getDate() + 3);
      else d.setDate(d.getDate() + 90);
      return d.toISOString().split('T')[0];
    };

    const inventoryItems: InventoryItem[] = selected.map((item) => {
      let storageLocation: StorageLocation = 'Fridge';
      if (['Pantry & Grains', 'Herbs & Spices', 'Condiments & Oils'].includes(item.category)) {
        storageLocation = 'Pantry';
      }

      return {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: item.name,
        normalizedName: normalizeIngredientName(item.normalizedName || item.name),
        category: item.category,
        quantity: item.quantity || 1,
        unit: item.unit || 'unit',
        storageLocation,
        purchaseDate: todayStr,
        expiryDate: getSuggestedExpiry(item.category),
        notes: item.notes || 'Added from visual scan',
      };
    });

    onAddToInventory(inventoryItems);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const selectedCount = ingredients.filter((i) => i.selected).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EBE5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-xs font-semibold text-[#1B4332] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recognition Results</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
            Detected Ingredients
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {scanData.imageSummary}
          </p>
        </div>

        <button
          onClick={onScanAnother}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Scan Another</span>
        </button>
      </div>

      {/* Uncertainty Notice if any items were ambiguous */}
      {scanData.uncertainItems && scanData.uncertainItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <span className="font-bold">Items requiring visual verification: </span>
            <span>{scanData.uncertainItems.join(', ')}. Please review and edit below.</span>
          </div>
        </div>
      )}

      {/* Manual Add Quick Form */}
      <form
        onSubmit={handleAddManual}
        className="bg-white p-4 rounded-2xl border border-[#E2EBE5] shadow-xs flex flex-col sm:flex-row gap-3 items-center"
      >
        <input
          type="text"
          value={newIngredientName}
          onChange={(e) => setNewIngredientName(e.target.value)}
          placeholder="Add missed ingredient (e.g., 'Fresh Mint' or 'Olive Oil')"
          className="flex-1 w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as IngredientCategory)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143628] shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Ingredients List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500 px-1">
          <span>{ingredients.length} items detected ({selectedCount} selected)</span>
          <span className="text-stone-400">Click checkboxes to select / deselect</span>
        </div>

        {ingredients.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E2EBE5] text-center text-stone-500 text-sm">
            No ingredients currently listed. Add some above or scan another photo.
          </div>
        ) : (
          <div className="grid gap-3">
            {ingredients.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.selected ? 'border-[#1B4332]/40 shadow-xs' : 'border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => handleToggleSelect(item.id)}
                    className="mt-1 w-4 h-4 rounded text-[#1B4332] focus:ring-[#1B4332]"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800 text-sm">{item.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E7EFEA] text-[#1B4332]">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.confidence === 'high'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.confidence === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {item.confidence} confidence
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-stone-500">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls: Quick Edit & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-4 z-20 bg-[#FAF8F5]/95 backdrop-blur-md p-4 rounded-2xl border border-[#E2EBE5] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-stone-600">
          <span className="font-bold text-stone-800">{selectedCount}</span> ingredients ready to process
          {saveSuccess && (
            <span className="ml-2 text-emerald-700 font-semibold inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Added to kitchen inventory!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={handleSaveToInventory}
            disabled={selectedCount === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#E2EBE5] text-stone-800 text-xs font-semibold hover:bg-[#F0F4F1] disabled:opacity-50"
          >
            <Refrigerator className="w-4 h-4 text-[#1B4332]" />
            <span>Add to Kitchen</span>
          </button>

          {onGenerateAIRecipe && (
            <button
              onClick={() => {
                const names = ingredients.filter((i) => i.selected).map((i) => i.name);
                onGenerateAIRecipe(names);
              }}
              disabled={selectedCount === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <span>Ask Gemini to Create Recipe</span>
            </button>
          )}

          <button
            onClick={onFindRecipes}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold shadow-md hover:bg-[#143628] transition-all"
          >
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>Find Catalog Matches</span>
          </button>
        </div>
      </div>
    </div>
  );
};
