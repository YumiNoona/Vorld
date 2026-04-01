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

**Vorld** (Venus) empowers creators and agencies to build, manage, and deploy interactive 3D environments using a **Configuration-Driven Runtime**. Instead of hardcoding interactions for every model, Vorld uses a unified JSON configuration system that controls everything from mesh-level highlights to complex data-triggered events.

### Why Vorld?
- **Zero-Code Interactivity**: Define hover effects, click actions, and camera transitions via the dashboard.
- **Stable Mesh Mapping**: Our engine ensures that even if you re-upload your model, your established interactions remain linked to the correct geometries.
- **Enterprise-Ready Auth**: Built on Supabase SSR with robust middleware-level route protection.
- **Infinite Scalability**: Optimized R3F render loops and intelligent shadowing ensure performance even on mobile devices.

---

## ✨ Key Features

### 🎮 The 3D Engine
- **Dynamic Runtime**: Scenes are rendered based on versioned JSON properties, allowing for instant updates without redeploys.
- **Atmospheric Controls**: Instant environment switching (Studio, City, Park) with high-fidelity contact shadows.
- **Interaction Logic**: Support for mesh highlights, info-panels, and URL redirects.
- **Selection System**: Selective post-processing outlines with customizable edge strength and blur.

### 🛠 The Creator Dashboard
- **Visual Mesh Explorer**: Navigate your 3D hierarchy in real-time to target specific nodes for interactivity.
- **Real-time Synchronization**: Changes in the editor auto-save to the cloud and reflect instantly in the viewport.
- **Asset Pipeline**: Secure `.glb` model uploads with versioning and folder-based ownership rules.
- **Publishing Suite**: One-click deployments with generated share links and embed-friendly viewer URLs.

---

## 🏗 Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Server-side rendering (SSR) for SEO and high-speed client navigation. |
| **3D Rendering** | React Three Fiber / Three.js | The industry standard for declarative 3D in React. |
| **Styling** | Tailwind CSS v4 | Cutting-edge performance with utility-first workflow. |
| **Database/Auth** | Supabase (@supabase/ssr) | Real-time database and secure server-side auth management. |
| **State** | Zustand | Lightweight and performant store for complex 3D editor states. |
| **Animations** | Framer Motion | Smooth, premium UI transitions throughout the platform. |

---

## 📂 Architecture

```text
Vorld/
├── src/
│   ├── app/                      # Next.js App Router (Auth, Dashboard, Editor)
│   ├── components/
│   │   ├── editor/               # Viewport, MeshExplorer, Logic Panels
│   │   ├── landing/              # Marketing Hero & Live Demo sections
│   │   ├── shared/               # Navigation, Modal, and Utility UI
│   │   └── ui/                   # Design system primitives (Tailwind v4)
│   ├── lib/                      # Supabase SSR clients and shared logic
│   ├── stores/                   # Zustand state managers (Editor, UI)
│   └── proxy.ts                  # Advanced route protection & redirection
├── supabase/                     # SQL Schemas, Triggers, and RLS policies
└── public/                       # Static environments and fallback assets
```

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/YumiNoona/Vorld.git

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env.local` file with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Deploy Database
Run the contents of `supabase/schema.sql` in your Supabase SQL Editor to initialize tables, storage buckets, and RLS policies.

### 4. Run Locally
```bash
npm run dev
```

---

## 📝 License & Contributing

Distributed under the **MIT License**. We welcome contributions that help push the boundaries of WebGL SaaS!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
 Built with ❤️ by the Vorld Team.
</div>
