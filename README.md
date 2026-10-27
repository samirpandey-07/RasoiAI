# 🍲 RasoiAI — Autonomous Culinary Intelligence & Zero-Waste Kitchen Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**RasoiAI** is a full-stack, enterprise-grade smart kitchen platform built to eliminate domestic food waste and elevate home cooking. Combining multi-modal computer vision, deterministic recipe matching, automated shelf-life tracking, and an interactive culinary mentor (**Chef RasoiAI**), RasoiAI transforms raw groceries and surplus ingredients into gourmet meals.

---

## ✨ Core Pillars & Features

### 👁️ Multimodal Visual Ingredient Recognition
- Upload or capture real-time photos of crisper drawers, pantry shelves, or countertops.
- Automatically detects individual items, calculates quantity heuristics, and flags duplicate pantry stock.
- Instant 1-click addition to your kitchen inventory.

### ♻️ Zero-Waste Deterministic Engine
- Calculates mathematical urgency scores based on shelf-life thresholds (Expiring in 24h, 3 days, 7 days).
- Ranks recipe matches from an internal culinary catalog of 30+ tested dishes, prioritizing meals that rescue ingredients nearest to expiration.

### 🍳 Chef RasoiAI — Real-Time Kitchen Mentor
- Conversational culinary mentor providing cooking technique adjustments, ingredient substitutions, and safety tips.
- **Local-First Session Architecture:** Real conversation history saved locally on your device with multi-session management, custom titles, and instant retrieval.
- Context-aware guidance integrating your active dietary preferences, allergies, and available pantry items.

### ⏱️ Interactive Step-by-Step Cooking Mode
- Hands-free culinary mode with progress milestones, visual instructions, and audio cues.
- Integrated step timers, ingredient check-offs, and instant Sous-Chef assistance for mid-recipe troubleshooting.

### 🛡️ Privacy-First Dual-Persistence Architecture
- **Offline-First Storage:** Operates completely in your browser without requiring account creation or cloud dependencies.
- **Optional Cloud Sync:** Native **Supabase PostgreSQL** integration with Row Level Security (RLS) for multi-device synchronization.

### ⚡ Resilient Production Server
- Node.js & Express server with hardened security headers (`X-Content-Type-Options`, `X-Frame-Options`, `XSS Protection`).
- In-memory per-IP token bucket rate-limiting to prevent quota exhaustion.
- Resilient model fallback cascades to maintain 99.9% uptime during high-demand network events.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion |
| **Backend / API** | Node.js (v20+ / v22+), Express, Zod Schema Validation |
| **Vision & Language Engine** | RasoiAI Multimodal Vision & Neural Language Pipelines |
| **Database & Cache** | Supabase PostgreSQL, Browser LocalStorage Offline Engine |
| **Build & Tooling** | Vite 8 (Client Bundler), esbuild (Backend Transpiler), Docker |

---

## 📁 Repository Architecture

```text
rasoi-ai/
├── src/
│   ├── components/           # UI Components & Modules
│   │   ├── AICookingAssistant.tsx     # Real conversational Chef RasoiAI
│   │   ├── AIRecipeGeneratorModal.tsx # Zero-waste recipe builder
│   │   ├── BrandLogo.tsx              # RasoiAI visual identity emblem
│   │   ├── CookingMode.tsx            # Hands-free step-by-step cooking
│   │   ├── ExpiryTracker.tsx          # Shelf-life urgency management
│   │   ├── Footer.tsx                 # Luxury colorful platform footer
│   │   ├── IngredientScanner.tsx      # Multimodal grocery vision
│   │   ├── KitchenInventory.tsx       # Real-time pantry management
│   │   ├── LandingPage.tsx            # Visual hero & feature showcase
│   │   ├── Navbar.tsx                 # Responsive luxury navigation
│   │   ├── RecipeCatalog.tsx          # 30+ tested recipe library
│   │   ├── RecipeDetails.tsx          # Recipe view with nutrition & substitutions
│   │   ├── ScanResults.tsx            # Vision detection breakdown
│   │   └── UserSettings.tsx           # Dietary preferences & backup manager
│   ├── services/             # Core engines & integrations
│   │   ├── gemini.ts                  # Vision & LLM backend proxy client
│   │   ├── matching.ts                # Deterministic recipe matching algorithm
│   │   ├── storage.ts                 # LocalStorage persistence layer
│   │   └── supabase.ts                # PostgreSQL cloud sync client
│   ├── types.ts              # TypeScript domain types & interfaces
│   ├── App.tsx               # Primary application state router
│   ├── main.tsx              # React DOM entry point
│   └── index.css             # Tailwind v4 theme configuration
├── server.ts                 # Hardened Express production server & API routes
├── supabase/
│   └── schema.sql            # PostgreSQL schema with Row Level Security (RLS)
├── Dockerfile                # Multi-stage production container build
├── docker-compose.yml        # Orchestration configuration
├── vite.config.ts            # Vite client build pipeline
└── package.json              # Dependencies & build scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20.0.0 or higher recommended)
- **npm** (v10+ or yarn / pnpm)

### 2. Clone Repository
```bash
git clone https://github.com/samirpandey-07/RasoiAI.git
cd RasoiAI
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=3000
NODE_ENV=production
APP_URL=http://localhost:3000

# Required for AI Features:
GEMINI_API_KEY=your_api_key_here

# Optional: Supabase PostgreSQL Cloud Sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build & Deployment

To compile client bundles and create the optimized single-file backend server:

```bash
# Lint & check types
npm run lint

# Build client and server bundles
npm run build

# Start production server
npm start
```

### 🐳 Docker Deployment
A lightweight, multi-stage Docker container is provided:

```bash
# Build and run with Docker Compose
docker compose up --build -d

# Check container health
docker compose ps
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, uptime, and AI pipeline status |
| `POST` | `/api/gemini/recognize-ingredients` | Multimodal computer vision ingredient extraction |
| `POST` | `/api/gemini/cooking-assistant` | Conversational mentoring by Chef RasoiAI |
| `POST` | `/api/gemini/generate-recipe` | Zero-waste custom recipe generation |
| `POST` | `/api/gemini/substitutions` | Dietary and pantry substitution recommendations |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/samirpandey-07/RasoiAI/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Credits

Distributed under the **MIT License**. See `LICENSE` for more information.

Crafted with care by **[Samir Pandey](https://github.com/samirpandey-07)**.
