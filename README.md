<div align="center">

# 🌍 Vorld
### Professional Config-Driven 3D SaaS Platform & Interactive WebGL Engine

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-blue?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

[**Explore Live Demo**](#) • [**View Documentation**](#) • [**Report Bug**](https://github.com/YumiNoona/Vorld/issues)

---

**Vorld** is a state-of-the-art, multi-tenant 3D SaaS platform that bridges the gap between high-end WebGL engineering and user-friendly content management. 

</div>

## 📖 Overview

**Vorld** empowers creators and agencies to build, manage, and deploy interactive 3D environments using a **Configuration-Driven Runtime**. Instead of hardcoding interactions for every model, Vorld uses a unified JSON configuration system that controls everything from mesh-level highlights to complex spatial animations.

### Why Vorld?
- **Zero-Code Interactivity**: Define hover effects, click actions, and camera transitions via the dashboard.
- **Stable Mesh Mapping**: Our engine ensures that even if you re-upload your model, your established interactions remain linked to the correct geometries.
- **Enterprise-Ready Auth**: Built on Supabase SSR with robust middleware-level route protection.
- **Infinite Scalability**: Optimized R3F render loops and intelligent shadowing ensure performance even on mobile devices.

---

## ✨ Key Features

### 🎮 The 3D Engine
- **Liquid Glass Interface**: High-performance "Apple-style" dock with spring-tuned physics and Gaussian blur backdrops.
- **15+ Interaction Types**: 
  - **Visual**: Highlight, Glow, Material Swap, Particle Burst.
  - **Spatial**: Camera Focus, Explode View, Reveal Hidden, Scale.
  - **Logic**: Toggle States, URL Redirects, Info Panels, Animation Clips, Audio.
- **Professional Asset Pipeline**: Automated 512x512 thumbnail generation for all uploaded `.glb` files with transparent background and studio framing.
- **High-Performance selection**: Emerald-green halos and wireframe bounding boxes for precise editing.
- **Atmospheric Controls**: Real-time environment preset switching (City, Sunset, Studio, etc.) with high-fidelity contact shadows.

### 🛠 The Creator Dashboard
- **Visual Mesh Explorer**: Navigate your 3D hierarchy in real-time to target specific nodes for interactivity.
- **Real-time Synchronization**: Changes in the editor auto-save to the cloud and reflect instantly in the viewport.
- **Project Suites**: Manage multiple project thumbnails, descriptions, and settings in a modern studio-grid UI.

---

## 🏗 Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Server-side rendering (SSR) for SEO and high-speed client navigation. |
| **3D Rendering** | React Three Fiber / Three.js | The industry standard for declarative 3D in React. |
| **Animation** | Framer Motion | Smooth, liquid UI transitions and spring physics. |
| **Database** | Supabase (@supabase/ssr) | Real-time database and secure server-side auth management. |
| **State** | Zustand | Lightweight and performant store for complex 3D editor states. |

---

## 📂 Architecture

```text
Vorld/
├── src/
│   ├── app/                      # Next.js App Router (Auth, Dashboard, Editor)
│   ├── components/
│   │   ├── editor/               # Viewport, MeshExplorer, Logic Panels
│   │   ├── shared/               # Liquid Dock, Project Modals, Navigation
│   │   └── ui/                   # Design system primitives (Tailwind v4)
│   ├── hooks/                    # useInteractionRuntime, useThumbnailGenerator
│   ├── lib/                      # Supabase clients and shared logic
│   └── stores/                   # Zustand state (Editor, Viewer, UI)
├── supabase/                     # SQL Schemas, Storage Buckets & RLS
└── public/                       # Static environments and fallback assets
```

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/YumiNoona/Vorld.git
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```

---

## 📝 License

Distributed under the **MIT License**.

<div align="center">
 Built with ❤️ by the Vorld Team.
</div>
