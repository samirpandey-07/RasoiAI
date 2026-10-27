import { InventoryItem, Recipe, RecipeMatchResult, ExpiryStatus, RecipeIngredient } from '../types';

/**
 * Common culinary synonyms and normalization dictionary.
 * Maps localized terms, variations, and compound names to standardized keys.
 */
const INGREDIENT_SYNONYMS: Record<string, string> = {
  // Vegetables & Herbs
  'cilantro': 'coriander',
  'fresh cilantro': 'coriander',
  'coriander leaves': 'coriander',
  'kothmir': 'coriander',
  'capsicum': 'bell pepper',
  'green bell pepper': 'bell pepper',
  'red bell pepper': 'bell pepper',
  'sweet pepper': 'bell pepper',
  'scallion': 'green onion',
  'scallions': 'green onion',
  'spring onion': 'green onion',
  'spring onions': 'green onion',
  'roma tomato': 'tomato',
  'cherry tomato': 'tomato',
  'tomatoes': 'tomato',
  'red onion': 'onion',
  'yellow onion': 'onion',
  'white onion': 'onion',
  'shallot': 'onion',
  'shallots': 'onion',
  'aubergine': 'eggplant',
  'brinjal': 'eggplant',
  'courgette': 'zucchini',
  'chilli': 'chili',
  'chilies': 'chili',
  'green chili': 'chili',
  'red chili': 'chili',
  'green chilli': 'chili',
  'red chilli': 'chili',
  'baby spinach': 'spinach',
  'palak': 'spinach',
  'potatoes': 'potato',
  'russet potato': 'potato',
  'sweet potato': 'potato',
  'avocados': 'avocado',

  // Dairy & Proteins
  'curd': 'yogurt',
  'dahi': 'yogurt',
  'greek yogurt': 'yogurt',
  'paneer': 'paneer',
  'cottage cheese': 'paneer',
  'cheddar cheese': 'cheese',
  'mozzarella': 'cheese',
  'mozzarella cheese': 'cheese',
  'parmesan': 'parmesan',
  'parmigiano': 'parmesan',
  'chicken breast': 'chicken',
  'chicken thighs': 'chicken',
  'minced chicken': 'chicken',
  'ground chicken': 'chicken',
  'shrimps': 'shrimp',
  'prawn': 'shrimp',
  'prawns': 'shrimp',
  'tofu': 'tofu',
  'firm tofu': 'tofu',
  'eggs': 'egg',
  'egg whites': 'egg',
  'egg yolk': 'egg',

  // Grains & Pantry
  'basmati rice': 'rice',
  'jasmine rice': 'rice',
  'white rice': 'rice',
  'brown rice': 'rice',
  'spaghetti': 'pasta',
  'fettuccine': 'pasta',
  'penne': 'pasta',
  'noodles': 'pasta',
  'all-purpose flour': 'flour',
  'wheat flour': 'flour',
  'maida': 'flour',
  'atta': 'flour',
  'garbanzo beans': 'chickpeas',
  'chole': 'chickpeas',
  'kabuli chana': 'chickpeas',
  'toor dal': 'lentils',
  'moong dal': 'lentils',
  'yellow lentils': 'lentils',
  'red lentils': 'lentils',
  'masoor dal': 'lentils',

  // Oils & Condiments
  'extra virgin olive oil': 'olive oil',
  'cooking oil': 'oil',
  'vegetable oil': 'oil',
  'sunflower oil': 'oil',
  'canola oil': 'oil',
  'ghee': 'butter',
  'unsalted butter': 'butter',
  'salted butter': 'butter',
  'tamari': 'soy sauce',
  'light soy sauce': 'soy sauce',
  'shoyu': 'soy sauce',
};

/**
 * Standardize an ingredient name for robust deterministic comparison
 */
export function normalizeIngredientName(rawName: string): string {
  if (!rawName) return '';
  const cleaned = rawName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove punctuation
    .replace(/\s+/g, ' ');

  // Direct synonym check
  if (INGREDIENT_SYNONYMS[cleaned]) {
    return INGREDIENT_SYNONYMS[cleaned];
  }

  // Substring matching against known synonyms
  for (const [synonym, standard] of Object.entries(INGREDIENT_SYNONYMS)) {
    if (cleaned.includes(synonym) || synonym.includes(cleaned)) {
      return standard;
    }
  }

  // Singularize common plurals
  if (cleaned.endsWith('ies')) return cleaned.slice(0, -3) + 'y';
  if (cleaned.endsWith('es') && !cleaned.endsWith('cheese')) return cleaned.slice(0, -2);
  if (cleaned.endsWith('s') && !cleaned.endsWith('ss')) return cleaned.slice(0, -1);

  return cleaned;
}

/**
 * Expiry Status Calculation with documented thresholds:
 * - Expired: Expiry date is before today (<= -1 day)
 * - Expiring Soon: Expiry date is within 0 to warningDays (default 3 days)
 * - Fresh: Expiry date is > warningDays in the future
 * - Unknown: No expiry date recorded
 */
export function getExpiryStatus(expiryDate?: string, warningDays: number = 3): {
  status: ExpiryStatus;
  daysRemaining: number | null;
  label: string;
} {
  if (!expiryDate) {
    return { status: 'unknown', daysRemaining: null, label: 'No Expiry Set' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      status: 'expired',
      daysRemaining: days,
      label: `Past Best By (${Math.abs(days)}d ago)`,
    };
  } else if (days <= warningDays) {
    return {
      status: 'expiring_soon',
      daysRemaining: days,
      label: days === 0 ? 'Expires Today!' : `Expires in ${days} ${days === 1 ? 'day' : 'days'}`,
    };
  } else {
    return {
      status: 'fresh',
      daysRemaining: days,
      label: `Fresh (${days}d left)`,
    };
  }
}

/**
 * Deterministically match recipes against user kitchen inventory
 */
export function matchRecipes(
  recipes: Recipe[],
  inventory: InventoryItem[],
  warningDays: number = 3
): RecipeMatchResult[] {
  // Pre-normalize inventory items and identify expiring items
  const inventoryNormalizedMap = new Map<string, { item: InventoryItem; isExpiringSoon: boolean }>();

  for (const item of inventory) {
    if (item.quantity <= 0) continue;
    const norm = normalizeIngredientName(item.normalizedName || item.name);
    const expiry = getExpiryStatus(item.expiryDate, warningDays);
    const isExpiring = expiry.status === 'expiring_soon' || expiry.status === 'expired';

    inventoryNormalizedMap.set(norm, {
      item,
      isExpiringSoon: isExpiring,
    });
  }

  const results: RecipeMatchResult[] = [];

  for (const recipe of recipes) {
    const availableIngredients: string[] = [];
    const missingIngredients: RecipeIngredient[] = [];
    const expiringItemNames: string[] = [];

    let requiredCount = 0;
    let matchedRequiredCount = 0;

    for (const recipeIng of recipe.ingredients) {
      const isOpt = !!recipeIng.isOptional;
      if (!isOpt) requiredCount++;

      const recipeNorm = normalizeIngredientName(recipeIng.normalizedName || recipeIng.name);

      let found = false;

      // Check direct match
      if (inventoryNormalizedMap.has(recipeNorm)) {
        found = true;
      } else {
        // Check partial match (e.g. "pasta" matches "spaghetti pasta")
        for (const [invNorm] of inventoryNormalizedMap.entries()) {
          if (invNorm.includes(recipeNorm) || recipeNorm.includes(invNorm)) {
            found = true;
            break;
          }
        }
      }

      if (found) {
        availableIngredients.push(recipeIng.name);
        if (!isOpt) matchedRequiredCount++;

        // Check if this matched item in inventory is expiring
        const invEntry = inventoryNormalizedMap.get(recipeNorm);
        if (invEntry?.isExpiringSoon) {
          expiringItemNames.push(invEntry.item.name);
        }
      } else {
        missingIngredients.push(recipeIng);
      }
    }

    const totalCalculated = requiredCount > 0 ? requiredCount : recipe.ingredients.length;
    const matchPercentage = Math.round((matchedRequiredCount / totalCalculated) * 100);

    const hasExpiring = expiringItemNames.length > 0;

    // Waste-reduction scoring algorithm:
    // Base: match percentage (0 - 100)
    // Bonus for recipes that consume expiring items: +25 points per expiring ingredient rescued!
    // This prioritizes saving food nearing expiration without hallucinating artificial stats.
    const wasteRescueBonus = expiringItemNames.length * 25;
    const score = matchPercentage + wasteRescueBonus;

    results.push({
      recipe,
      availableIngredients,
      missingIngredients,
      matchPercentage,
      hasExpiringIngredients: hasExpiring,
      expiringItemNames,
      score,
    });
  }

  // Sort by score descending (high match + expiring rescue priority first)
  return results.sort((a, b) => b.score - a.score);
}
