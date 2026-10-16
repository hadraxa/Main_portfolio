# 🚀 Ahad Raza Portfolio — 3D Architecture & Performance Guide

This guide explains how the 3D features on your portfolio work, where the code lives, and how you can easily customize them.

---

## 📂 Where the 3D Code Lives

```
src/
├── components/
│   ├── TiltCard.tsx              # 🎴 3D tilt cards on hover with light glare
│   └── three/
│       ├── HeroScene.tsx         # 🌌 Hero 3D scene (Glowing core, gyroscope rings, satellites)
│       ├── SkillsGlobe.tsx       # 🌐 Interactive 3D Skills Sphere (drag to rotate, hover)
│       └── Lazy3D.tsx            # ⚡ Dynamic lazy-loader (keeps initial load fast)
```

---

## 1. 🌌 Hero 3D Scene (`src/components/three/HeroScene.tsx`)

### How it works:
- **Central Core**: A geometric icosahedron with purple metallic glow + an outer cyan wireframe cage that spins in opposite directions.
- **Gyroscope Rings**: Dual planetary rings (pink and cyan) that spin on independent axes.
- **Satellites**: Glowing orbital nodes that cycle around the core in 3D ellipses.
- **Mouse Tilt**: Follows cursor movement across the screen with smooth damping (`THREE.MathUtils.damp`).

### ⚡ Why it is Butter-Smooth (No Lag):
1. **IntersectionObserver**: When you scroll past the hero down into Experience or Skills, the 3D rendering **automatically pauses completely** (`frameloop="never"`). It uses **0% GPU** while reading the rest of your site!
2. **Capped Pixel Ratio**: Capped to `1.5` so 4K monitors and Retina phones render at 60 FPS without overheating or dropping frames.
3. **No Heavy Shaders**: Uses optimized standard materials rather than heavy CPU noise shaders.

### 🎨 How to Customize (Edit `HERO_CONFIG` at top of `HeroScene.tsx`):
```ts
export const HERO_CONFIG = {
  coreColor: "#8b5cf6",          // Core orb color
  innerWireframeColor: "#22d3ee",// Cyan wireframe cage
  outerWireframeColor: "#f472b6",// Pink ring
  outerRingColor: "#38bdf8",     // Blue ring
  idleSpinSpeed: 0.35,           // Rotation speed (higher = faster)
  mouseParallaxStrength: 0.45,   // Mouse tilt sensitivity
};
```

---

## 2. 🌐 Interactive 3D Skills Globe (`src/components/three/SkillsGlobe.tsx`)

### How it works:
- Takes all your skills from `src/lib/site.ts` and distributes them evenly on a 3D sphere using the **Fibonacci Golden Spiral** formula.
- Projects 3D `(x, y, z)` coordinates into 2D canvas coordinates:
  - Tags in front (`z > 0`) are drawn larger, brighter, and sharper.
  - Tags in back (`z < 0`) are smaller and slightly transparent for genuine depth.
- **Interactive Dragging**: Click/touch and drag in any direction to spin the globe!
- **Smooth Inertia**: When you let go, it smoothly decelerates back to idle spin.
- **Hover to Pause**: Hovering over any skill highlights it with a glowing pill and pauses rotation so it is easy to read.

### ⚡ Why it is Butter-Smooth (No Lag):
- Renders to a single lightweight `<canvas>` element (zero DOM reflows).
- Also uses an `IntersectionObserver` to pause when scrolled out of view.

### 🎨 How to Customize (Edit `GLOBE_CONFIG` at top of `SkillsGlobe.tsx`):
```ts
const GLOBE_CONFIG = {
  sphereRadiusDesktop: 165,   // Size of globe on desktop
  sphereRadiusMobile: 120,    // Size of globe on mobile
  autoRotateSpeedX: 0.0015,   // Idle spin speed
  dragSensitivity: 0.004,     // Drag responsiveness
  tagColors: ["#c084fc", "#22d3ee", "#f472b6", "#38bdf8", "#fbbf24", "#34d399"],
};
```

---

## 3. 🎴 3D Tilt Cards (`src/components/TiltCard.tsx`)

### How it works:
- Wraps any card (projects, about boxes) to tilt towards your cursor with real CSS 3D perspective (`perspective(1000px) rotateX(...) rotateY(...)`).
- Adds a dynamic specular glare reflection layer that follows the mouse.

### ⚡ Why it is Butter-Smooth:
- Uses `requestAnimationFrame` to synchronize with your screen's refresh rate (no frame drops).
- Uses `(hover: hover)` media query check: automatically disabled on touch devices (phones/tablets) so vertical scrolling is 100% fluid without accidental tilt or touch delay.

---

## 4. 📝 How to Update Your Content

- **Your CV / Bio / Skills**: Edit `src/lib/site.ts`.
- **Upload / Edit Projects**: Go to `/admin` and log in with your password (`ADMIN_PASSWORD` in `.env`).
  - You can write project taglines, descriptions, and upload source code files directly to show in the GitHub-style repo viewer!
