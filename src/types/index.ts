/**
 * Core Type Definitions for Smart Kitchen AI
 */

export type StorageLocation = 'Fridge' | 'Pantry' | 'Freezer' | 'Spice Rack' | 'Countertop';

export type IngredientCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Pantry & Grains'
  | 'Herbs & Spices'
  | 'Condiments & Oils'
  | 'Bakery'
  | 'Frozen'
  | 'Beverages'
  | 'Other';

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'fresh' | 'unknown';

export interface InventoryItem {
  id: string;
  name: string;
  normalizedName: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  storageLocation: StorageLocation;
  purchaseDate?: string;
  expiryDate?: string; // YYYY-MM-DD
  notes?: string;
}

export interface RecipeIngredient {
  name: string;
  normalizedName: string;
  amount: number;
  unit: string;
  isOptional?: boolean;
  substituteNotes?: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerSeconds?: number;
  chefTip?: string;
}

export type CuisineType =
  | 'Indian'
  | 'Italian'
  | 'Mexican'
  | 'Thai'
  | 'Japanese'
  | 'French'
  | 'American'
  | 'Mediterranean'
  | 'Spanish'
  | 'Vietnamese'
  | 'Middle Eastern';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: CuisineType;
  difficulty: DifficultyLevel;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  servings: number;
  dietaryTags: string[]; // e.g. 'Vegetarian', 'Vegan', 'Gluten-Free', 'High-Protein', 'Dairy-Free'
  allergens: string[];   // e.g. 'Dairy', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Shellfish'
  imageUrl: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number;
  };
}

export interface RecipeMatchResult {
  recipe: Recipe;
  availableIngredients: string[];
  missingIngredients: RecipeIngredient[];
  matchPercentage: number;
  hasExpiringIngredients: boolean;
  expiringItemNames: string[];
  score: number; // calculated ranking score
}

export interface DetectedIngredient {
  id: string;
  name: string;
  normalizedName: string;
  category: IngredientCategory;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  selected: boolean;
  quantity?: number;
  unit?: string;
}

export interface ScanResultData {
  imageSummary: string;
  ingredients: DetectedIngredient[];
  uncertainItems: string[];
  scannedAt: string;
  imagePreviewUrl?: string;
}

export interface UserPreferences {
  dietaryPreferences: string[];
  allergies: string[];
  measurementUnit: 'metric' | 'imperial';
  defaultServings: number;
  expiryWarningDays: number;
  theme: 'kitchen-warm';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'scanner'
  | 'scan_results'
  | 'recipes'
  | 'recipe_details'
  | 'inventory'
  | 'expiry'
  | 'cooking_mode'
  | 'assistant'
  | 'favorites'
  | 'settings'
  | 'auth';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'view_recipe' | 'add_inventory' | 'substitute';
    targetId?: string;
    label: string;
  };
}
