# 🌍 Vorld
### Config-Driven 3D SaaS Platform & Interactive WebGL Engine

A professional-grade 3D engine to visualize, customize, and deploy interactive WebGL environments with dynamic configuration.

[Live Demo](#) • [GitHub](https://github.com/YumiNoona/Vorld)

**React Three Fiber** • **Three.js** • **Next.js 14+** • **Supabase** • **Stripe** • **Tailwind CSS v4**

---

## 📖 Summary

**Vorld (Venus)** is a multi-tenant, config-driven 3D SaaS platform designed for creators, designers, and agencies to easily manage and publish interactive 3D portfolios. Available through a unified Next.js 14 Dashboard with integrated auth, project editing, and a high-performance Public Viewer.

Unlike traditional hardcoded 3D experiences, Vorld implements a **Configuration-Driven Runtime**, ensuring the rendering core accepts a versioned JSON configuration. This empowers users to upload custom `.glb` models, define interactive behaviors (like hover highlights, click info panels, and URL triggers), and tweak lighting and themes — all without writing code.

Built with a modern stack focusing on **Speed of Delight**, Vorld bridges the gap between raw WebGL development and user-friendly CMS management.

---

## ✨ Features

### 🎮 Core Engine Capabilities
| Feature | Description |
| :--- | :--- |
| **Config-Driven Runtime** | Engine renders scenes based on dynamic JSON properties for full logic-content separation. |
| **Stable Mesh Normalization** | Intelligently maps 3D nodes to stable IDs for consistent interactivity across model versions. |
| **Interactive Behaviors** | Click & hover triggers, wobbly selection effects, and dynamic data panels. |
| **Atmospheric Systems** | Pre-configured environment presets (Studio, City, Park) and high-quality contact shadows. |

### 🛠 Editor & Management
| Feature | Description |
| :--- | :--- |
| **Unified Dashboard** | Central hub for project management, activity tracking, and quick-start actions. |
| **Visual Mesh Explorer** | Real-time hierarchical navigation of uploaded 3D assets to target specific geometries. |
| **Live Inline Preview** | Instant WebGL feedback within the dashboard during the configuration process. |
| **Multi-step Publish** | Automated serialization and generation of public viewer URLs and embed codes. |

### 🔐 Platform Capabilities
| Feature | Description |
| :--- | :--- |
| **Supabase SSR Auth** | Secure authentication with server/browser client split and middleware-level route protection. |
| **Tiered Pricing Model** | Plan-gated features (Free, Starter, Pro) with integrated billing UI and usage stats. |
| **High Performance** | Optimized R3F render loops, conditional shadowing, and selective post-processing outlines. |

---

## 🏗 Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14/15/16 (App Router) | Unified auth, editor, and billing with advanced proxy logic. |
| **Render Engine** | R3F / Three.js / Drei | Main 3D abstractions and helpers for WebGL rendering. |
| **Post-processing** | @react-three/postprocessing | Custom selective outlines and visual fidelity tools. |
| **Dashboard** | Next.js 16.2 (Turbopack) | High-speed protected dashboard and project editing suite. |
| **Public Viewer** | Next.js Dynamic Routes | Optimized, edge-ready rendering at `/p/[username]/[slug]`. |
| **UI Components** | Tailwind CSS v4 / Radix UI | Premium dark-mode first design system with Geist typography. |
| **Auth & DB** | Supabase (@supabase/ssr) | Full SSR auth support with custom proxy-middleware. |
| **Payments** | Stripe (API Ready) | Tiered subscription structure and billing management. |

---

## 📂 Project Structure

```text
Vorld/
├── src/
│   ├── app/                      # ─── Next.js App Router ───
│   │   ├── (marketing)/          # Landing page, Features, Pricing
│   │   ├── (auth)/               # Login & Signup with 3D Backgrounds
│   │   ├── (app)/dashboard/      # Protected Project Management Hub
│   │   │   ├── projects/         # Project Gallery & 3D Editor
│   │   │   ├── billing/          # Subscription & Stats UI
│   │   │   └── settings/         # Profile & Security settings
│   │   ├── auth/callback/        # Supabase Redirect Handler
│   │   └── p/[user]/[slug]/      # Public 3D Viewer Route
│   ├── components/
│   │   ├── editor/               # Viewport, MeshExplorer, InteractionPanel
│   │   ├── landing/              # Hero, HowItWorks, LiveDemo
│   │   ├── shared/               # Sidebar, ProjectCard, PublishSheet
│   │   └── ui/                   # Shared Radix Primitives
│   ├── lib/                      # Supabase & Helper Utils
│   ├── proxy.ts                  # Server-side Route Protection (Proxy/Middleware)
│   └── stores/                   # Zustand Global State
├── public/                       # Static Assets (Models, Textures)
├── README.md                     # Platform Documentation
└── package.json                  # Dependencies & Scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js 18+**
- **Supabase Account** (for Auth & Database)
- **Stripe Account** (optional, for payments)

### 2. Setup
```bash
# Clone repository
git clone https://github.com/YumiNoona/Vorld.git
cd Vorld

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 📝 License
License: MIT
This project is licensed under the MIT License — see the LICENSE file for details.
