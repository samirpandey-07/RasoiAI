-- ==============================================================================
-- SMART KITCHEN AI - SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION
-- Compatible with Supabase Postgres, Supabase Auth, and Row-Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. USER PREFERENCES (Dietary, Allergens, Kitchen Setup)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dietary_preferences TEXT[] DEFAULT '{}', -- e.g. 'Vegetarian', 'Vegan', 'Keto', 'Gluten-Free'
  allergies TEXT[] DEFAULT '{}',           -- e.g. 'Peanuts', 'Dairy', 'Shellfish'
  measurement_unit TEXT DEFAULT 'metric' CHECK (measurement_unit IN ('metric', 'imperial')),
  default_servings INT DEFAULT 2 CHECK (default_servings > 0),
  expiry_warning_days INT DEFAULT 3 CHECK (expiry_warning_days >= 1),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. RECIPES (Master & Community Catalog)
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL = System / Master recipe
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cuisine TEXT NOT NULL, -- 'Indian', 'Italian', 'Mexican', 'French', 'American', 'Thai', etc.
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  prep_time_minutes INT NOT NULL CHECK (prep_time_minutes >= 0),
  cook_time_minutes INT NOT NULL CHECK (cook_time_minutes >= 0),
  servings INT NOT NULL DEFAULT 4 CHECK (servings > 0),
  dietary_tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  image_url TEXT,
  calories_per_serving INT,
  protein_grams NUMERIC(5,1),
  carbs_grams NUMERIC(5,1),
  fat_grams NUMERIC(5,1),
  fiber_grams NUMERIC(5,1),
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. RECIPE INGREDIENTS
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL, -- lowercase standardized for fast deterministic matching
  amount NUMERIC(8,2) NOT NULL,
  unit TEXT NOT NULL,           -- 'g', 'ml', 'tbsp', 'tsp', 'cup', 'piece', 'clove', 'can', etc.
  is_optional BOOLEAN DEFAULT FALSE,
  substitute_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. RECIPE STEPS (Ordered Cooking Instructions)
CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  instruction TEXT NOT NULL,
  timer_seconds INT DEFAULT 0,
  chef_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(recipe_id, step_number)
);

-- 6. KITCHEN INVENTORY
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Grains',
    'Herbs & Spices', 'Condiments & Oils', 'Bakery', 'Frozen', 'Beverages', 'Other'
  )),
  quantity NUMERIC(8,2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit TEXT NOT NULL DEFAULT 'unit',
  storage_location TEXT NOT NULL DEFAULT 'Fridge' CHECK (storage_location IN ('Fridge', 'Pantry', 'Freezer', 'Spice Rack', 'Countertop')),
  purchase_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. FAVORITE RECIPES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, recipe_id)
);

-- 8. SCAN HISTORY
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_summary TEXT,
  scanned_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'edited', 'saved_to_inventory'))
);

-- 9. SCAN INGREDIENTS (Recognized per scan session)
CREATE TABLE IF NOT EXISTS public.scan_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL REFERENCES public.scan_history(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  user_confirmed BOOLEAN DEFAULT FALSE,
  added_to_inventory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FAST QUERY PERFORMANCE & DETERMINISTIC RECIPE MATCHING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_inventory_user_normalized ON public.inventory_items (user_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON public.inventory_items (user_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_norm ON public.recipe_ingredients (normalized_name);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients (recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps (recipe_id, step_number);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON public.scan_history (user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce that users can strictly read and write only their own records!
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_ingredients ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Recipes (Public can read verified system recipes; users manage their own created recipes)
CREATE POLICY "Everyone can view published recipes"
  ON public.recipes FOR SELECT
  USING (creator_id IS NULL OR is_verified = TRUE OR auth.uid() = creator_id);

CREATE POLICY "Users can insert custom recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can edit their custom recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = creator_id);

-- 4. Recipe Ingredients & Steps
CREATE POLICY "Everyone can view ingredients of readable recipes"
  ON public.recipe_ingredients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_ingredients.recipe_id
    AND (r.creator_id IS NULL OR r.is_verified = TRUE OR auth.uid() = r.creator_id)
  ));

CREATE POLICY "Everyone can view steps of readable recipes"
  ON public.recipe_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_steps.recipe_id
    AND (r.creator_id IS NULL OR r.is_verified = TRUE OR auth.uid() = r.creator_id)
  ));

-- 5. Inventory Items (Strictly private per user)
CREATE POLICY "Users manage their own inventory items"
  ON public.inventory_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Favorites (Strictly private per user)
CREATE POLICY "Users manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Scan History & Scan Ingredients
CREATE POLICY "Users manage their own scan history"
  ON public.scan_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their scan ingredients"
  ON public.scan_ingredients FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.scan_history s
    WHERE s.id = scan_ingredients.scan_id
    AND s.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scan_history s
    WHERE s.id = scan_ingredients.scan_id
    AND s.user_id = auth.uid()
  ));

-- Trigger: create profile and preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');

  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
