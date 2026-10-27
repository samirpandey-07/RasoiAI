import React, { useState } from 'react';
import {
  Plus,
  Search,
  Camera,
  Trash2,
  Pencil,
  X,
  Check,
} from 'lucide-react';
import {
  IngredientCategory,
  InventoryItem,
  StorageLocation,
} from '../types';
import { getExpiryStatus, normalizeIngredientName } from '../services/matching';

interface KitchenInventoryProps {
  inventory: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onNavigateToScanner: () => void;
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
  'Beverages',
  'Other',
];

const INGREDIENT_EMOJIS: Record<string, string> = {
  spinach: '🥬',
  paneer: '🧀',
  tomato: '🍅',
  onion: '🧅',
  garlic: '🧄',
  rice: '🌾',
  'olive oil': '🫒',
  egg: '🥚',
  chicken: '🍗',
  pasta: '🍝',
  chickpeas: '🫘',
  potato: '🥔',
  ginger: '🫚',
  milk: '🥛',
  butter: '🧈',
};

function getIngredientEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '🥗';
}

export const KitchenInventory: React.FC<KitchenInventoryProps> = ({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onNavigateToScanner,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Fridge' | 'Pantry' | 'Freezer'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<IngredientCategory>('Produce');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formUnit, setFormUnit] = useState('g');
  const [formStorage, setFormStorage] = useState<StorageLocation>('Fridge');
  const [formExpiryDays, setFormExpiryDays] = useState(5);

  const counts = {
    All: inventory.length,
    Fridge: inventory.filter((i) => i.storageLocation === 'Fridge').length,
    Pantry: inventory.filter((i) => i.storageLocation === 'Pantry').length,
    Freezer: inventory.filter((i) => i.storageLocation === 'Freezer').length,
  };

  const filteredItems = inventory.filter((item) => {
    // Location Tab
    if (activeTab !== 'All' && item.storageLocation !== activeTab) {
      return false;
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q)) return false;
    }

    // Category
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Produce');
    setFormQuantity(1);
    setFormUnit('piece');
    setFormStorage(activeTab === 'All' ? 'Fridge' : activeTab);
    setFormExpiryDays(7);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormStorage(item.storageLocation);

    const diffDays = item.expiryDate
      ? Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 5;
    setFormExpiryDays(diffDays > 0 ? diffDays : 1);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + Number(formExpiryDays));
    const expiryDateStr = expDate.toISOString().split('T')[0];

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: formName.trim(),
        normalizedName: normalizeIngredientName(formName),
        category: formCategory,
        quantity: Number(formQuantity),
        unit: formUnit,
        storageLocation: formStorage,
        expiryDate: expiryDateStr,
      });
    } else {
      onAddItem({
        id: `inv_${Date.now()}`,
        name: formName.trim(),
        normalizedName: normalizeIngredientName(formName),
        category: formCategory,
        quantity: Number(formQuantity),
        unit: formUnit,
        storageLocation: formStorage,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: expiryDateStr,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            My Kitchen Inventory
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track your ingredients, quantities and expiry dates across your fridge, pantry and freezer.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-[#163828] hover:bg-[#122D20] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>

          <button
            onClick={onNavigateToScanner}
            className="flex items-center gap-1.5 bg-white border border-[#EBE6DD] hover:bg-stone-50 text-stone-800 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors"
          >
            <Camera className="w-4 h-4 text-stone-600" />
            <span>Scan from Photo</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: All, Fridge, Pantry, Freezer */}
      <div className="flex items-center gap-2 border-b border-[#EBE6DD] pb-3">
        {(['All', 'Fridge', 'Pantry', 'Freezer'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = counts[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#163828] text-white shadow-xs'
                  : 'bg-white border border-[#EBE6DD] text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full pl-11 pr-4 py-2 rounded-full border border-[#EBE6DD] bg-white text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163828]/20 focus:border-[#163828]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-full border border-[#EBE6DD] bg-white text-xs text-stone-800 focus:outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="All Categories">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Items List / Table */}
      <div className="bg-white rounded-3xl border border-[#EBE6DD] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-[#EBE6DD]">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-stone-700">No items found in this section.</p>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-bold text-[#163828] underline"
            >
              + Add an ingredient now
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const exp = getExpiryStatus(item.expiryDate);
            const emoji = getIngredientEmoji(item.name);

            const daysLeft = exp.daysRemaining ?? 30;
            let badgeText = `Fresh (${daysLeft} days)`;
            let badgeClass = 'bg-[#E8F8F5] text-[#27AE60]';

            if (exp.daysRemaining === null) {
              badgeText = 'No Expiry Set';
              badgeClass = 'bg-stone-100 text-stone-600';
            } else if (daysLeft <= 0) {
              badgeText = 'Expires Today!';
              badgeClass = 'bg-[#FFF3E0] text-[#E67E22]';
            } else if (daysLeft === 1) {
              badgeText = 'Expires in 1 day';
              badgeClass = 'bg-[#FFF3E0] text-[#E67E22]';
            } else if (daysLeft === 2) {
              badgeText = 'Expires in 2 days';
              badgeClass = 'bg-[#FFF3E0] text-[#E67E22]';
            } else if (daysLeft <= 3) {
              badgeText = `Expires in ${daysLeft} days`;
              badgeClass = 'bg-[#FFF3E0] text-[#E67E22]';
            }

            return (
              <div
                key={item.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors"
              >
                {/* Left: Emoji Icon, Name & Category */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EBE6DD] flex items-center justify-center text-xl shrink-0">
                    {emoji}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-stone-900 text-sm truncate">{item.name}</h4>
                    <p className="text-[11px] text-stone-500 font-medium">{item.category}</p>
                  </div>
                </div>

                {/* Right Group: Quantity, Expiry Badge, Actions */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-stone-900 text-xs sm:text-sm">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  {/* Expiry Status Badge */}
                  <div>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${badgeClass}`}
                    >
                      {badgeText}
                    </span>
                  </div>

                  {/* Edit & Delete Icons */}
                  <div className="flex items-center gap-1 text-stone-400">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Edit item"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EBE6DD] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-lg">
                {editingItem ? 'Edit Ingredient' : 'Add New Ingredient'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Baby Spinach, Roma Tomatoes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#163828]/20 focus:border-[#163828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#163828]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="g, piece, ml"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#163828]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Storage</label>
                  <select
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none"
                  >
                    <option value="Fridge">Fridge</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Countertop">Countertop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Shelf Life Remaining: <span className="text-[#163828] font-extrabold">{formExpiryDays} days</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={formExpiryDays}
                  onChange={(e) => setFormExpiryDays(Number(e.target.value))}
                  className="w-full accent-[#163828]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#163828] text-white text-xs font-bold shadow-xs hover:bg-[#122D20]"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
