# 🌍 Vorld
### Config-Driven 3D SaaS Platform & Interactive WebGL Engine

A professional-grade 3D engine to visualize, customize, and deploy interactive WebGL environments with dynamic configuration. No code required.

[Live Demo](#) • [GitHub](#)

**Next.js 14** • **React Three Fiber** • **Three.js** • **Supabase** • **Stripe** • **Tailwind CSS v4**

---

## 📖 Summary

**Vorld (Venus)** is a multi-tenant, config-driven 3D SaaS platform designed for creators, designers, and agencies to easily manage and publish interactive 3D portfolios. Built with a unified Next.js 14 Dashboard, it features integrated authentication, a high-fidelity 3D editor, and a high-performance Public Viewer.

Unlike traditional hardcoded 3D experiences, Vorld implements a **Configuration-Driven Runtime**. The rendering core accepts a versioned JSON configuration, empowering users to:
1. **Upload** custom `.glb` models.
2. **Define** interactive behaviors (hover highlights, click info panels, camera triggers).
3. **Customize** lighting, environment, and themes.
4. **Publish** to a dedicated, high-speed viewer route instantly.

---

## ✨ Features

### 🎮 Core Engine Capabilities
| Feature | Description |
| :--- | :--- |
| **Config-Driven Runtime** | The engine renders scenes based on a dynamic JSON schema, ensuring decoupled logic and content. |
| **Mesh Interaction System** | Built-in support for hover-state outlines, click-to-open data panels, and custom URL triggers. |
| **Post-Processing** | Integrated outline effects and selective bloom for a premium, high-end visual feel. |
| **Performance First** | Optimized R3F render loops, conditional shadows, and memory-safe mesh disposal. |

### 🛠 Editor & Management
| Feature | Description |
| :--- | :--- |
| **Visual Mesh Explorer** | Intuitive tree-view of 3D hierarchies to select and target specific model parts. |
| **Live Inline Preview** | Real-time WebGL rendering inside the Dashboard while managing interactivity logic. |
| **Publishing Flow** | One-click serialization to JSON with generated embed codes and public URLs. |
| **Multi-step Upload** | Drag-and-drop GLB uploader with validation and progress tracking. |

### 🔐 Platform Capabilities
| Feature | Description |
| :--- | :--- |
| **Supabase SSR Auth** | Secure authentication with server/browser client split and middleware protection. |
| **Tiered Pricing Model** | UI-ready plans (Free, Starter, Pro) with integrated billing and usage tracking. |
| **Responsive Design** | A mobile-first, high-fidelity UI built with Tailwind CSS v4 and Framer Motion. |

---

## 🏗 Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Unified auth, editor, and billing with Server Actions. |
| **Render Engine** | R3F / Three.js / Drei | Main 3D abstractions and helpers. |
| **Post-processing** | @react-three/postprocessing | Custom selective outlines and visual effects. |
| **State Management** | Zustand | Centralized store for editor state and interactivity configs. |
| **Styling** | Tailwind CSS v4 | Cutting-edge utility-first CSS with modern design tokens. |
| **UI Components** | Radix UI / Framer Motion | Accessible primitives and premium animations. |
| **Auth & DB** | Supabase | Postgres-backed storage and secure authentication. |

---

## 📂 Project Structure

```text
Vorld/
├── src/
│   ├── app/                      # ─── Consuming Applications ───
│   │   ├── (marketing)/          # Landing page, Features, Pricing
│   │   ├── (auth)/               # Login & Signup with 3D Backgrounds
│   │   ├── (app)/dashboard/      # Protected Project Management Hub
│   │   │   ├── projects/         # Project Gallery & Creation
│   │   │   ├── billing/          # Subscription & Tier management
│   │   │   └── settings/         # Profile & Preferences
│   │   ├── auth/callback/        # Supabase OTP/Auth Handler
│   │   └── p/[user]/[slug]/      # Public 3D Viewer Route (Optimized)
│   ├── components/
│   │   ├── editor/               # Viewport, MeshExplorer, InteractionPanel
│   │   ├── landing/              # Hero, HowItWorks, LiveDemo
│   │   ├── shared/               # AppSidebar, ProjectCard, PublishSheet
│   │   └── ui/                   # Radix Primitives (Dialog, Dropdown, Sheet)
│   ├── lib/                      # Supabase Clients (Server/Browser), Utils
│   └── stores/                   # Zustand Editor State
├── tailwind.config.ts            # Custom Vorld Design Tokens
└── package.json                  # Next.js 14 Orchestration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Supabase Account (for Auth and Database)

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 📝 License
License: MIT
This project is licensed under the MIT License — see the LICENSE file for details.
