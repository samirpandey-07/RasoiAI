# 🍳 Smart Kitchen AI — Production-Ready Culinary Intelligence

An enterprise-grade, AI-powered smart kitchen companion featuring multi-modal computer vision for pantry recognition, real-time recipe matching, intelligent expiry tracking, waste-reduction recipe generation, and an interactive conversational chef mentor.

---

## 🚀 Key Features

- **Multi-Modal Vision Recognition:** Identify vegetables, pantry goods, and ingredients directly from camera captures or uploaded images using Google Gemini 2.5/Flash AI.
- **Dynamic AI Recipe Generation:** Create zero-food-waste recipes tailored to whatever ingredients you have on-hand, prioritizing expiring items.
- **Interactive Step-by-Step Cooking Mode:** Hands-free cooking assistant with voice guidance, step timers, and real-time culinary problem solving.
- **Smart Expiry Management:** Color-coded urgency alerts, shelf-life indicators, and proactive suggestions before food goes bad.
- **Dual Persistence Architecture:** Runs seamlessly **offline-first** with instant local caching, with optional 1-click **Supabase PostgreSQL** cloud sync across all your devices.
- **Resilient AI Cascade:** Automatic failover between Gemini models to eliminate 503/high-demand disruptions.
- **Hardened Production Server:** Built with security headers, IP rate limiting, graceful SIGTERM shutdowns, and high-performance vendor chunking.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / API:** Node.js (v20+ / v22+), Express, Google GenAI SDK (`@google/genai`), Zod v3+
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) / LocalStorage Offline Fallback
- **Bundler:** Vite 8 (Client) & esbuild (Server)

---

## 📋 Environment Configuration

Create a `.env` or `.env.local` file in the project root (see [.env.example](.env.example)):

```env
PORT=3000
NODE_ENV=production
APP_URL=http://localhost:3000

# Required for AI Features:
# Get free key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional / Cloud Sync (Supabase):
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** If Supabase keys are not set, the application operates in 100% offline-first mode using secure browser storage.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Type Checking
```bash
npm run lint
```

---

## 📦 Production Build & Run

To build both the frontend and compiled server bundle:

```bash
# Compile client & bundle backend
npm run build

# Start production server
npm start
```
The production server runs directly on native Node (`dist/server.js`), serving static assets with caching headers and handling API routes.

---

## 🐳 Docker Deployment

A multi-stage, hardened Docker image is included.

### Build and Run with Docker Compose:
```bash
docker compose up --build -d
```

### Or using Docker CLI:
```bash
# Build image
docker build -t smart-kitchen-ai .

# Run container
docker run -d -p 3000:3000 --env-file .env --name smart-kitchen smart-kitchen-ai
```

---

## 🗄️ Database Setup (Supabase)

If you wish to enable cloud sync, user authentication, and multi-device persistence:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
4. Copy your project **URL** and **Anon Key** into your `.env` file or enter them directly inside the app's **Settings** panel.

---

## 📡 API Health & Diagnostics

- **Health check:** `GET /api/health`
  Returns server uptime, environment, and AI configuration status.
- **Ingredient Recognition:** `POST /api/gemini/recognize-ingredients`
- **Chef Cooking Assistant:** `POST /api/gemini/cooking-assistant`
- **Recipe Generator:** `POST /api/gemini/generate-recipe`
- **Ingredient Substitutions:** `POST /api/gemini/substitutions`
