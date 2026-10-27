import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  Clock,
  Refrigerator,
  Package,
  Snowflake,
  Sparkles,
  Check,
  X,
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

const STORAGE_LOCATIONS: (StorageLocation | 'All')[] = [
  'All',
  'Fridge',
  'Pantry',
  'Freezer',
  'Spice Rack',
  'Countertop',
];

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

export const KitchenInventory: React.FC<KitchenInventoryProps> = ({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onNavigateToScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<IngredientCategory>('Produce');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('piece');
  const [formLocation, setFormLocation] = useState<StorageLocation>('Fridge');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormCategory('Produce');
    setFormQuantity(1);
    setFormUnit('piece');
    setFormLocation('Fridge');
    setFormExpiryDate('');
    setFormNotes('');
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormLocation(item.storageLocation);
    setFormExpiryDate(item.expiryDate || '');
    setFormNotes(item.notes || '');
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: formName.trim(),
        normalizedName: normalizeIngredientName(formName.trim()),
        category: formCategory,
        quantity: formQuantity,
        unit: formUnit,
        storageLocation: formLocation,
        expiryDate: formExpiryDate || undefined,
        notes: formNotes.trim() || undefined,
      });
    } else {
      const newItem: InventoryItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: formName.trim(),
        normalizedName: normalizeIngredientName(formName.trim()),
        category: formCategory,
        quantity: formQuantity,
        unit: formUnit,
        storageLocation: formLocation,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: formExpiryDate || undefined,
        notes: formNotes.trim() || undefined,
      };
      onAddItem(newItem);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleQuantityAdjust = (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    if (newQty === 0) {
      if (confirm(`Remove ${item.name} from inventory?`)) {
        onDeleteItem(item.id);
      }
    } else {
      onUpdateItem({ ...item, quantity: newQty });
    }
  };

  // Filter items
  const filteredItems = inventory.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (selectedLocation !== 'All' && item.storageLocation !== selectedLocation) {
      return false;
    }

    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EBE5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143628] tracking-tight">
            Kitchen Inventory
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track ingredients across your fridge, pantry, and freezer with expiry management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToScanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
          >
            <span>Scan from Photo</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold shadow-sm hover:bg-[#143628] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Search and Storage Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search kitchen inventory by name or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Storage Location Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STORAGE_LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLocation === loc
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-white border border-[#E2EBE5] text-stone-700 hover:bg-[#F0F4F1]'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2EBE5] text-center space-y-3">
          <Refrigerator className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-bold text-stone-800">No items match your criteria</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query, or tap &quot;Add Item&quot; to log new groceries into your kitchen.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold"
          >
            Add New Item
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const exp = getExpiryStatus(item.expiryDate);

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-[#E2EBE5] shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-stone-800 text-base">{item.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E7EFEA] text-[#1B4332]">
                          {item.storageLocation}
                        </span>
                        <span className="text-[10px] text-stone-500">{item.category}</span>
                      </div>
                    </div>

                    {/* Expiry Badge */}
                    {item.expiryDate ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${
                          exp.status === 'expired'
                            ? 'bg-rose-100 text-rose-800'
                            : exp.status === 'expiring_soon'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {exp.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">No expiry</span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-stone-500 italic line-clamp-1">{item.notes}</p>
                  )}
                </div>

                {/* Bottom Row: Quantity increment/decrement and edit/delete */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {/* Quantity Counter */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityAdjust(item, -1)}
                      className="w-7 h-7 rounded-lg border border-stone-200 text-stone-700 flex items-center justify-center font-bold hover:bg-stone-100"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-stone-800 font-mono">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => handleQuantityAdjust(item, 1)}
                      className="w-7 h-7 rounded-lg border border-stone-200 text-stone-700 flex items-center justify-center font-bold hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Edit item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2EBE5] p-6 max-w-md w-full space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-800 text-base">
                {editingItem ? 'Edit Kitchen Item' : 'Add Ingredient to Kitchen'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Greek Yogurt, Roma Tomatoes"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as IngredientCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Storage Location
                  </label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value as StorageLocation)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Fridge">Fridge</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Spice Rack">Spice Rack</option>
                    <option value="Countertop">Countertop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="g, ml, piece, can, etc."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Expiry / Best-By Date (Optional)
                </label>
                <input
                  type="date"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. 'Crisp, bought from farmers market'"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143628]"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
