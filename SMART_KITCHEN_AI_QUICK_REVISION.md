# 🍲 Smart Kitchen AI (RasoiAI) — Quick Revision & Viva Cheat-Sheet

> **Note:** Yeh guide specifically mobile par fast revision aur college viva/demonstration ke liye banayi gayi hai. Isko 10 minute me padh kar aap project ke saare concepts aur questions explain kar sakte ho.

---

## 📌 1. Project at a Glance (Quick Summary)

* **Project Name:** Smart Kitchen AI (RasoiAI)
* **Domain:** Artificial Intelligence, Computer Vision, Full-Stack Web Development, Zero-Waste Cooking
* **Main Concept:** Fridge ya countertop par rakhe raw ingredients ki photo lo ➔ Google Gemini Multimodal AI se ingredients pehchano ➔ Inventory me add karo ➔ Deterministic algorithm se matching recipes dekho ➔ Jo samaan jaldi expire hone wala hai, uski recipe ko priority milegi taaki khana kharab na ho.

---

## ⏱️ 2. Viva Pitch (Examiner ke samne bolne ke liye)

### 30-Second Quick Pitch (English):

> *"Good morning, sir. My project is Smart Kitchen AI, an autonomous culinary intelligence platform designed to eliminate household food waste. It uses Google Gemini's multimodal computer vision to recognize raw groceries from photos, organizes them into an automated shelf-life tracker, and uses a deterministic algorithm to recommend recipes—giving highest priority to ingredients nearing expiration. It bridges the gap between what you have in your kitchen and what you can cook right now."*

### 1-Minute Pitch (Hinglish):

> *"Sir, traditional recipe platforms me sabse badi problem yeh hai ki woh dish ke naam se search karti hain, user ke paas jo samaan hai usse nahi. Doosri problem yeh hai ki fridge ke kone me rakhi sabziyan aur dairy products expire ho kar dustbin me chali jaati hain.
> Smart Kitchen AI me user apne ingredients ki photo click karta hai. Hamara Express server Gemini Vision model se structured JSON extract karta hai. Phir hamara custom matching algorithm bina kisi AI hallucination ke calculate karta hai ki aapke ingredients se kaunsi dish ban sakti hai. Aur jo cheez 1 se 3 din me expire hone wali hai, usko +25 points ka boost milta hai taaki user pehle usko cook kare. Iske alawa isme real-time cooking mode, smart timers aur AI Sous-Chef assistant bhi diya gaya hai."*

---

## 🛠️ 3. Technology Stack (Kyu aur Kaha use hua?)

| Technology                     | Project me Kaha Use Hua?                      | Kyu Choose Kiya? (Advantage)                                                                      |
| :----------------------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **React 19 & Vite 8**    | Frontend SPA (Single Page App)                | Super fast rendering, modern component state, instant hot reload.                                 |
| **TypeScript**           | Pure project (Client + Server)                | Type-safety, zero runtime type errors, strict interface definitions.                              |
| **Tailwind CSS v4**      | UI Styling & Design Tokens                    | Modern aesthetic, zero-bloat CSS, responsive design.                                              |
| **Node.js & Express**    | Backend API Proxy (`server.ts`)             | Gemini API key ko secure rakhna, rate limiting lagana, security headers add karna.                |
| **Google GenAI SDK**     | `/api/gemini/*` endpoints                   | Multimodal vision (image + text prompts) aur structured JSON output generation.                   |
| **Supabase PostgreSQL**  | Cloud Database (`supabase/schema.sql`)      | Relational database with Row Level Security (RLS) taaki ek user doosre ka inventory na dekh sake. |
| **Browser LocalStorage** | Client Persistence (`services/supabase.ts`) | Offline-first architecture. Bina login/internet ke bhi app 100% fast chalta hai.                  |
| **Zod Schema**           | Backend validation (`server.ts`)            | Incoming API requests aur AI output ko runtime par sanitize aur validate karta hai.               |

---

## 🔄 4. Complete Application Flow (User Journey)

```text
[ 1. User Uploads / Captures Photo ]
                │
                ▼
[ 2. Frontend converts to Base64 & sends to /api/gemini/recognize-ingredients ]
                │
                ▼
[ 3. Server validates via Zod & calls Google Gemini Vision with JSON Schema ]
                │
                ▼
[ 4. AI returns normalized ingredients, category, and confidence (high/med/low) ]
                │
                ▼
[ 5. User Reviews Screen (Scan Results): Can edit, remove false items, add manual ]
                │
                ▼
[ 6. Saved to Inventory (Category ke hisab se default expiry dates set hoti hain) ]
                │
                ▼
[ 7. Matching Algorithm runs against 38 tested recipes: Coverage % + Rescue Bonus ]
                │
                ▼
[ 8. Recipe Details Screen: Shows Available vs Missing items + AI Substitutions ]
                │
                ▼
[ 9. Cooking Mode: Full-screen, step-by-step guidance, Web Audio chime timers ]
```

---

## 🧠 5. Core Algorithms & Math (Examiner's Favorite!)

### A. Recipe Matching Formula:

$$
\text{Match Percentage} = \left( \frac{\text{Matched Required Ingredients}}{\text{Total Required Ingredients}} \right) \times 100
$$

*(Note: Optional ingredients jaise garnishing salt ya fenugreek count me penalty nahi dete).*

### B. Food Waste Rescue Formula:

$$
\text{Final Score} = \text{Match Percentage} + (\text{Expiring Ingredients Rescued} \times 25)
$$

* **Example:** Agar Palak Paneer ka match 75% hai aur aapka Palak kal expire hone wala hai (1 expiring item):
  $$
  \text{Score} = 75 + (1 \times 25) = 100
  $$

  Toh yeh recipe dusri non-expiring 90% match wali recipe ke upar rank karegi!

### C. Expiry Classification Logic (`services/matching.ts`):

* **Expired:** Days remaining $< 0$
* **Expiring Soon (Alert):** Days remaining $0$ to $3$ days (configurable in Settings)
* **Fresh:** Days remaining $> 3$ days
* **Unknown:** Agar user ne expiry date nahi daali

### D. Synonym Normalization (`services/matching.ts`):

System me 100+ synonyms ka dictionary mapped hai:

* `cilantro` ➔ `coriander`
* `capsicum` ➔ `bell pepper`
* `dahi` / `curd` ➔ `yogurt`
* `paneer` / `cottage cheese` ➔ `paneer`
* `spaghetti` / `penne` ➔ `pasta`
* Plural handling: `tomatoes` ➔ `tomato`, `potatoes` ➔ `potato`

---

## 🛡️ 6. Security & Architecture Highlights

1. **API Key Security:** `GEMINI_API_KEY` kabhi bhi browser/client par expose nahi hota. Frontend sirf apne local Express backend (`/api/gemini/...`) se baat karta hai.
2. **In-Memory Rate Limiting:** Server per-IP tracking karta hai (`60 requests / minute`). Abuse ya quota exhaustion rokne ke liye status 429 bhejta hai.
3. **Resilient Model Cascade:** Agar Google ka ek model busy ya 503 error deta hai, server automatically agle model par fallback karta hai:
   `gemini-2.5-flash` ➔ `gemini-flash-latest` ➔ `gemini-3.8-flash`.
4. **Row Level Security (RLS) in Supabase:** Har table me `auth.uid() = user_id` policy lagi hai. Koi dusra user aapka pantry ya scan history query nahi kar sakta.
5. **Dual-Layer Persistence:** LocalStorage (Offline fast mode) + Supabase PostgreSQL (Cloud sync mode).

---

## 🎯 7. Top 15 Viva Questions & Bullet Answers

#### Q1. Why did you use Gemini API instead of training your own YOLO or CNN model?

* **Answer:** Training a custom CNN from scratch requires thousands of labeled grocery photos, heavy GPU infrastructure, and struggles with novel packaging. Gemini is a Large Multimodal Model with massive zero-shot visual reasoning that identifies obscure spices, cut vegetables, and produce varieties out of the box with zero model maintenance costs.

#### Q2. Is Gemini deciding the recipe recommendation order?

* **Answer:** **No, absolutely not.** Recipe recommendation is 100% **deterministic TypeScript logic** in `matching.ts`. This prevents LLM hallucinations, wrong proportions, and makes the system fast, explainable, and cost-free during recipe browsing. Gemini is only used for image recognition, conversational advice, and ad-hoc substitutions.

#### Q3. What happens if Gemini misidentifies an ingredient?

* **Answer:** We implemented a **Human-in-the-Loop** verification pattern. The AI never forces items directly into the inventory. The user lands on `ScanResults.tsx` where they can uncheck false positives, edit names/categories, or add items manually before saving.

#### Q4. How do you protect your Gemini API Key?

* **Answer:** The key is stored in server-side environment variables (`.env`). The client frontend never knows the key. All AI calls pass through our Express backend proxy with Zod validation and IP rate limiting.

#### Q5. What is the difference between your offline mode and cloud mode?

* **Answer:** By default, the app is offline-first using `localStorage`, allowing instant usage without login. If the user connects Supabase in Settings and logs in, all inventory and favorites seamlessly synchronize with a cloud PostgreSQL database protected by RLS.

#### Q6. What is the role of Zod in this project?

* **Answer:** Zod performs runtime schema validation. TypeScript only checks types at compile-time. Zod validates the actual HTTP request bodies on the Express server and ensures the JSON returned by Gemini strictly adheres to our expected keys and types before sending to the client.

#### Q7. Why did you award +25 bonus points for expiring items?

* **Answer:** The primary objective of the platform is zero-waste cooking. If a recipe matches 80% and another matches 85%, but the 80% recipe uses milk that expires tomorrow, saving that milk is ecologically and economically superior. The +25 bonus mathematically ensures urgency outranks minor ingredient differences.

#### Q8. What happens if the internet disconnects during a cooking session?

* **Answer:** The user can still cook uninterrupted. The 38 master recipes, step-by-step instructions, and Web Audio timers are completely local on the browser. Only live AI chat questions require active internet.

#### Q9. How do timers work in Cooking Mode without external audio mp3 files?

* **Answer:** It uses the browser's native **Web Audio API** (`AudioContext`). It synthesizes a musical dual-tone chime (sine wave D5 at 587Hz transitioning to A5 at 880Hz) programmatically, requiring zero external audio assets.

#### Q10. What are the tables present in your database schema?

* **Answer:** There are 9 relational tables: `profiles`, `user_preferences`, `recipes`, `recipe_ingredients`, `recipe_steps`, `inventory_items`, `favorites`, `scan_history`, and `scan_ingredients`.

#### Q11. What is Row Level Security (RLS)?

* **Answer:** RLS is a PostgreSQL security feature where the database engine itself verifies user permissions on each individual row. In our schema, policies like `USING (auth.uid() = user_id)` ensure that even if someone writes a raw SQL query, they can only access their own records.

#### Q12. How does the application scale ingredient amounts when serving size changes?

* **Answer:** In `RecipeDetails.tsx`, we calculate a scaling multiplier: `const scale = servings / recipe.servings;`. Every ingredient quantity is dynamically multiplied by this scale factor in the UI.

#### Q13. Can a user export or backup their kitchen data?

* **Answer:** Yes, in `UserSettings.tsx`, users can click **Export Backup (JSON)** to download a complete JSON snapshot of their inventory, preferences, and favorites, which can be re-imported anytime.

#### Q14. What are the limitations of your project? (Be honest!)

* **Answer:**
  1. No automated Vitest/Jest unit test suite yet (relies on manual verification and static TypeScript checks).
  2. Confidence scores are categorical labels from the LLM prompt, not calibrated softmax mathematical probabilities.
  3. Expiry dates are user-entered or category heuristics (+4 days for produce), not real-time IoT biochemical freshness sensors.

#### Q15. How would you improve this project in the future?

* **Answer:**
  1. Integration with smart-fridge IoT cameras or barcode/RFID scanners.
  2. Automated push notifications on mobile via Progressive Web App (PWA) when items hit the 24-hour expiry threshold.
  3. Automated grocery delivery API integration (e.g., Blinkit/Instacart) to order missing recipe ingredients with 1 click.

---

## 🎬 8. Practical Live Demonstration Steps

Jab examiner ke samne demo dikhana ho, toh is sequence me dikhana:

1. **Step 1 — Dashboard (`http://localhost:3000`):**
   * Dikhao ki inventory me pehle se 10 demo items hain (Spinach, Paneer, Roma Tomatoes, etc.).
   * Highlight karo: *"Spinach is expiring in 1 day, Paneer in 2 days."*
2. **Step 2 — Expiry Tracker:**
   * Click on **Expiry Tracker** tab. Dikhao 4 clean metric boxes (*Expiring Soon: 3 items, Fresh: 7 items*).
   * Dikhaiye ki Palak Paneer automatically top par recommend ho rahi hai because it rescues expiring spinach & paneer.
3. **Step 3 — Ingredient Scanner:**
   * Click on **Scanner** tab. Click on the preset sample **"Fresh Produce Basket"** (or upload your own photo).
   * Click **"Recognize Ingredients with Gemini"**.
   * Show `Scan Results` screen: Point out normalized names, categories, and confidence badges. Show that you can delete an item or add a manual ingredient.
4. **Step 4 — Recipe Details & Substitutions:**
   * Open any recipe (e.g. *Butter Chicken* or *Palak Paneer*).
   * Change Servings from 4 to 6 ➔ Show that ingredient quantities scale up automatically!
   * Click **"Ask Chef for Substitution"** on any ingredient ➔ Show real-time substitution ratio and flavor advice.
5. **Step 5 — Cooking Mode:**
   * Click **"Start Cooking Mode"**.
   * Show full-screen hands-free view. Start a timer (hear the Web Audio chime). Open the slide-out Sous-Chef drawer and ask a question.
6. **Step 6 — Settings & Backup:**
   * Open **Settings**. Toggle dietary preferences (e.g., Vegetarian / Peanut Allergy).
   * Click **Export Backup (JSON)** to demonstrate data portability.

---

*Created for Samir Pandey | Smart Kitchen AI (RasoiAI) Academic Defense*
