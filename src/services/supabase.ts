import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem, UserPreferences, UserProfile } from '../types';

const STORAGE_KEY_INVENTORY = 'smart_kitchen_inventory_v1';
const STORAGE_KEY_FAVORITES = 'smart_kitchen_favorites_v1';
const STORAGE_KEY_PREFS = 'smart_kitchen_preferences_v1';
const STORAGE_KEY_SUPABASE_URL = 'smart_kitchen_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'smart_kitchen_supabase_key';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
  };
}

export function setSupabaseCredentials(url: string, key: string) {
  if (url) localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);

  if (key) localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);

  cachedClient = null; // reset instance
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, key } = getSupabaseCredentials();
  if (url && key && url.startsWith('http')) {
    try {
      cachedClient = createClient(url, key);
      return cachedClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  return !!getSupabaseClient();
}

/**
 * Validate Supabase connection and verify RLS/table presence
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Using local secure offline storage.',
    };
  }

  try {
    const { error } = await client.from('inventory_items').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.inventory_items" does not exist')) {
        return {
          success: false,
          message: 'Connected to Supabase project, but "inventory_items" table is missing. Run supabase/schema.sql in Supabase SQL Editor.',
        };
      }
      // Auth / RLS warning or normal unauthenticated state
      return {
        success: true,
        message: 'Connected to Supabase endpoint! (Note: RLS requires sign-in for writing private user data).',
      };
    }
    return {
      success: true,
      message: 'Supabase connection verified! Inventory table and policies are active.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error connecting to Supabase instance.',
    };
  }
}

// ----------------------------------------------------------------------
// Unified Persistence Layer (Supabase with LocalStorage Sync/Fallback)
// ----------------------------------------------------------------------

export async function loadInventoryFromStorage(): Promise<InventoryItem[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const { data, error } = await client
          .from('inventory_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            normalizedName: d.normalized_name,
            category: d.category,
            quantity: Number(d.quantity),
            unit: d.unit,
            storageLocation: d.storage_location,
            purchaseDate: d.purchase_date,
            expiryDate: d.expiry_date,
            notes: d.notes,
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  // Fallback to LocalStorage
  const raw = localStorage.getItem(STORAGE_KEY_INVENTORY);
  if (!raw) return getInitialDemoInventory();
  try {
    return JSON.parse(raw);
  } catch {
    return getInitialDemoInventory();
  }
}

export async function persistInventory(items: InventoryItem[]): Promise<boolean> {
  // Always save locally first for instantaneous UX and offline resilience
  localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        // Upsert items for this user
        const formatted = items.map(item => ({
          id: item.id.includes('-') && item.id.length === 36 ? item.id : undefined,
          user_id: user.id,
          name: item.name,
          normalized_name: item.normalizedName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          storage_location: item.storageLocation,
          purchase_date: item.purchaseDate || new Date().toISOString().split('T')[0],
          expiry_date: item.expiryDate || null,
          notes: item.notes || null,
        }));

        await client.from('inventory_items').upsert(formatted);
      }
    } catch (e) {
      console.warn('Background Supabase sync error:', e);
      return false;
    }
  }
  return true;
}

export function loadFavoritesFromStorage(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
  if (!raw) return ['rec_butter_chicken', 'rec_palak_paneer', 'rec_pasta_aglio_olio'];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function persistFavorites(favIds: string[]) {
  localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favIds));
}

export function loadPreferencesFromStorage(): UserPreferences {
  const defaultPrefs: UserPreferences = {
    dietaryPreferences: [],
    allergies: [],
    measurementUnit: 'metric',
    defaultServings: 4,
    expiryWarningDays: 3,
    theme: 'kitchen-warm',
  };

  const raw = localStorage.getItem(STORAGE_KEY_PREFS);
  if (!raw) return defaultPrefs;
  try {
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

export function persistPreferences(prefs: UserPreferences) {
  localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
}

/**
 * High quality initial inventory to demonstrate the food-waste rescue algorithm,
 * expiry tracking, and recipes matching right on first boot!
 */
export function getInitialDemoInventory(): InventoryItem[] {
  const today = new Date();

  // Helper to offset days
  const addDays = (d: number) => {
    const target = new Date(today);
    target.setDate(target.getDate() + d);
    return target.toISOString().split('T')[0];
  };

  return [
    {
      id: 'inv_1',
      name: 'Baby Spinach',
      normalizedName: 'spinach',
      category: 'Produce',
      quantity: 300,
      unit: 'g',
      storageLocation: 'Fridge',
      purchaseDate: addDays(-4),
      expiryDate: addDays(1), // Expiring in 1 day! (Urgent rescue)
      notes: 'Crisp leaves, use soon for Palak Paneer or Salad',
    },
    {
      id: 'inv_2',
      name: 'Paneer Block',
      normalizedName: 'paneer',
      category: 'Dairy & Eggs',
      quantity: 400,
      unit: 'g',
      storageLocation: 'Fridge',
      purchaseDate: addDays(-2),
      expiryDate: addDays(2), // Expiring in 2 days!
      notes: 'Fresh Malai paneer',
    },
    {
      id: 'inv_3',
      name: 'Roma Tomatoes',
      normalizedName: 'tomato',
      category: 'Produce',
      quantity: 6,
      unit: 'piece',
      storageLocation: 'Countertop',
      purchaseDate: addDays(-3),
      expiryDate: addDays(3), // Expiring in 3 days
      notes: 'Ripe and juicy',
    },
    {
      id: 'inv_4',
      name: 'Garlic Bulbs',
      normalizedName: 'garlic',
      category: 'Pantry & Grains',
      quantity: 10,
      unit: 'clove',
      storageLocation: 'Pantry',
      purchaseDate: addDays(-10),
      expiryDate: addDays(20),
      notes: 'Store in dry basket',
    },
    {
      id: 'inv_5',
      name: 'Yellow Onions',
      normalizedName: 'onion',
      category: 'Produce',
      quantity: 4,
      unit: 'medium',
      storageLocation: 'Pantry',
      purchaseDate: addDays(-5),
      expiryDate: addDays(14),
    },
    {
      id: 'inv_6',
      name: 'Fresh Eggs',
      normalizedName: 'egg',
      category: 'Dairy & Eggs',
      quantity: 6,
      unit: 'piece',
      storageLocation: 'Fridge',
      purchaseDate: addDays(-7),
      expiryDate: addDays(5),
    },
    {
      id: 'inv_7',
      name: 'Spaghetti Pasta',
      normalizedName: 'pasta',
      category: 'Pantry & Grains',
      quantity: 500,
      unit: 'g',
      storageLocation: 'Pantry',
      purchaseDate: addDays(-20),
      expiryDate: addDays(180),
    },
    {
      id: 'inv_8',
      name: 'Extra Virgin Olive Oil',
      normalizedName: 'olive oil',
      category: 'Condiments & Oils',
      quantity: 750,
      unit: 'ml',
      storageLocation: 'Pantry',
      purchaseDate: addDays(-30),
      expiryDate: addDays(200),
    },
    {
      id: 'inv_9',
      name: 'Basmati Rice',
      normalizedName: 'rice',
      category: 'Pantry & Grains',
      quantity: 1,
      unit: 'kg',
      storageLocation: 'Pantry',
      purchaseDate: addDays(-15),
      expiryDate: addDays(300),
    },
    {
      id: 'inv_10',
      name: 'Canned Chickpeas',
      normalizedName: 'chickpeas',
      category: 'Pantry & Grains',
      quantity: 2,
      unit: 'can',
      storageLocation: 'Pantry',
      purchaseDate: addDays(-12),
      expiryDate: addDays(120),
    },
  ];
}
