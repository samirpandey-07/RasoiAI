import { DetectedIngredient, ScanResultData } from '../types';

export interface RecognizeResponse {
  success: boolean;
  data?: ScanResultData;
  error?: string;
}

/**
 * Cleanly extract API key configured in client environment or localStorage
 */
export function getClientGeminiKey(): string | null {
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey !== 'MY_GEMINI_API_KEY' && envKey !== 'your_gemini_api_key_here') {
      return envKey;
    }
  } catch {
    // ignore
  }

  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Safely parse JSON from a fetch Response without throwing SyntaxError
 */
async function parseResponsePayload(res: Response): Promise<{ ok: boolean; status: number; json: any; rawText: string; error?: string }> {
  let rawText = '';
  try {
    rawText = await res.text();
  } catch (err: any) {
    return { ok: false, status: res.status, json: null, rawText: '', error: 'Failed to read response stream' };
  }

  let json: any = null;
  try {
    json = JSON.parse(rawText);
  } catch {
    // Not valid JSON (e.g. HTML 404/500/502/413)
  }

  if (!res.ok) {
    if (res.status === 404) {
      return {
        ok: false,
        status: res.status,
        json,
        rawText,
        error: 'Backend API route not found (404). Please ensure the Vercel serverless function or GEMINI_API_KEY is deployed.',
      };
    }
    if (res.status === 413) {
      return {
        ok: false,
        status: res.status,
        json,
        rawText,
        error: 'Uploaded photo is too large for the network gateway. Please upload a compressed or cropped photo.',
      };
    }
    if (res.status === 503) {
      return {
        ok: false,
        status: res.status,
        json,
        rawText,
        error: json?.error || 'Gemini AI service unavailable. Please configure GEMINI_API_KEY in your Vercel Project Environment Variables.',
      };
    }
    return {
      ok: false,
      status: res.status,
      json,
      rawText,
      error: json?.error || `Server returned error (${res.status}): ${rawText.slice(0, 150)}`,
    };
  }

  return { ok: true, status: res.status, json, rawText };
}

/**
 * Direct Client-Side Gemini Fallback via official Google Generative Language REST API
 */
async function callDirectGemini(
  prompt: string,
  imagePart?: { mimeType: string; data: string }
): Promise<string> {
  const apiKey = getClientGeminiKey();
  if (!apiKey) {
    throw new Error('No client Gemini API key available for direct fallback');
  }

  const parts: any[] = [];
  if (imagePart) {
    parts.push({
      inlineData: {
        mimeType: imagePart.mimeType,
        data: imagePart.data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, ''),
      },
    });
  }
  parts.push({ text: prompt });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Direct Gemini API failed (${res.status}): ${errText.slice(0, 120)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from direct Gemini call');
  return text;
}

/**
 * Recognize Ingredients from Image
 */
export async function recognizeIngredients(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  additionalNotes?: string
): Promise<RecognizeResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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

    const parsed = await parseResponsePayload(res);

    if (parsed.ok && parsed.json?.data) {
      const rawData = parsed.json.data;
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
    }

    // If server returned error or 404, check if client-side fallback is available
    const clientKey = getClientGeminiKey();
    if (clientKey) {
      try {
        const directPrompt = `
You are an expert culinary ingredient recognition engine for "Smart Kitchen AI".
Analyze this image of kitchen ingredients, produce, groceries, or pantry items.
Output strict JSON with:
1. "imageSummary": 1-sentence description.
2. "ingredients": Array of objects:
   - "name": Descriptive ingredient name
   - "normalizedName": Lowercase food name
   - "category": One of "Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry & Grains", "Herbs & Spices", "Condiments & Oils", "Bakery", "Other"
   - "confidence": "high", "medium", or "low"
   - "notes": Short note
3. "uncertainItems": Array of strings
${additionalNotes ? `User note: "${additionalNotes}"` : ''}
`.trim();

        const directResult = await callDirectGemini(directPrompt, { mimeType, data: imageBase64 });
        const clean = directResult.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        const rawData = JSON.parse(clean);

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
      } catch (directErr: any) {
        console.warn('Direct fallback also failed:', directErr);
      }
    }

    return {
      success: false,
      error: parsed.error || 'Failed to detect ingredients. Ensure the image is clear and well-lit.',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Recognition request timed out after 30s. The model was busy. Please try again or test with a sample.',
      };
    }
    return {
      success: false,
      error: err?.message || 'Network error communicating with Smart Kitchen AI server.',
    };
  }
}

/**
 * Ask Chef RasoiAI Cooking Assistant
 */
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

    const parsed = await parseResponsePayload(res);
    if (parsed.ok && parsed.json?.reply) {
      return { success: true, reply: parsed.json.reply };
    }

    // Direct fallback if client key configured
    const clientKey = getClientGeminiKey();
    if (clientKey) {
      try {
        const sysContext = context?.activeRecipe ? `Active recipe: ${context.activeRecipe.name}.` : '';
        const prompt = `You are Chef RasoiAI, a helpful, warm culinary mentor. ${sysContext} User question: "${message}"`;
        const reply = await callDirectGemini(prompt);
        return { success: true, reply };
      } catch {
        // fall through to error
      }
    }

    return { success: false, error: parsed.error || 'Failed to contact cooking assistant' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Cooking assistant connection error' };
  }
}

/**
 * Get Ingredient Substitutions
 */
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

    const parsed = await parseResponsePayload(res);
    if (parsed.ok && parsed.json?.data) {
      return { success: true, data: parsed.json.data };
    }

    return { success: false, error: parsed.error || 'Failed to get substitutions' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error fetching substitutions' };
  }
}

/**
 * Generate Personalized Recipe
 */
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

    const parsed = await parseResponsePayload(res);
    if (parsed.ok && parsed.json?.recipe) {
      return { success: true, recipe: parsed.json.recipe };
    }

    return { success: false, error: parsed.error || 'Failed to generate custom recipe' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error communicating with recipe generation engine' };
  }
}
