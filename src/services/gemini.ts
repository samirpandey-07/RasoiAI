import { DetectedIngredient, ScanResultData } from '../types';

export interface RecognizeResponse {
  success: boolean;
  data?: ScanResultData;
  error?: string;
}

export async function recognizeIngredients(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  additionalNotes?: string
): Promise<RecognizeResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch('/api/gemini/recognize-ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        additionalNotes,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.error || `Recognition failed with status ${res.status}`,
      };
    }

    const rawData = json.data;
    const formattedIngredients: DetectedIngredient[] = (rawData.ingredients || []).map(
      (ing: any, idx: number) => ({
        id: `detected_${Date.now()}_${idx}`,
        name: ing.name,
        normalizedName: ing.normalizedName,
        category: ing.category || 'Other',
        confidence: ing.confidence || 'high',
        notes: ing.notes || '',
        selected: true,
        quantity: 1,
        unit: 'unit',
      })
    );

    return {
      success: true,
      data: {
        imageSummary: rawData.imageSummary || 'Detected ingredients from photo.',
        ingredients: formattedIngredients,
        uncertainItems: rawData.uncertainItems || [],
        scannedAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Recognition request timed out after 25s. The model was busy. Please try again or test with a sample.',
      };
    }
    return {
      success: false,
      error: err.message || 'Network error communicating with Smart Kitchen AI server.',
    };
  }
}

export async function askAssistant(
  message: string,
  conversationHistory: { role: 'user' | 'model'; text: string }[],
  context?: {
    activeRecipe?: any;
    currentStep?: number;
    inventory?: string[];
    dietaryPreferences?: string[];
    allergies?: string[];
  }
): Promise<{ success: boolean; reply?: string; error?: string }> {
  try {
    const res = await fetch('/api/gemini/cooking-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationHistory,
        context,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to contact cooking assistant' };
    }

    return { success: true, reply: json.reply };
  } catch (err: any) {
    return { success: false, error: err.message || 'Cooking assistant connection error' };
  }
}

export async function getSubstitutions(
  ingredient: string,
  recipeName?: string,
  dietaryPreferences: string[] = [],
  inventory: string[] = []
): Promise<{
  success: boolean;
  data?: {
    originalIngredient: string;
    substitutes: Array<{
      name: string;
      ratio: string;
      flavorAndTexture: string;
      bestFor: string;
      inInventory: boolean;
    }>;
    chefTip: string;
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/gemini/substitutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredient,
        recipeName,
        dietaryPreferences,
        inventory,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to get substitutions' };
    }

    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error fetching substitutions' };
  }
}

export async function generateCustomRecipe(params: {
  ingredients: string[];
  expiringIngredients?: string[];
  cuisine?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  maxTimeMinutes?: number;
  servings?: number;
}): Promise<{ success: boolean; recipe?: any; error?: string }> {
  try {
    const res = await fetch('/api/gemini/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to generate custom recipe' };
    }

    return { success: true, recipe: json.recipe };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error communicating with recipe generation engine' };
  }
}
