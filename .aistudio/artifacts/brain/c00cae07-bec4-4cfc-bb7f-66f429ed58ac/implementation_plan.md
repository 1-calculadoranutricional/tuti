# Scrappy Yard: Mobile-Optimized 3D Cyber-Scrapyard Runner

An exact clone of the 3D action runner **Scrappy Yard** (chongdashu/scrappy-yard) engineered for Google AI Studio Build, resolving the mobile WebGL 2 GLSL precision bug, and featuring responsive on-screen touch controls, all animal skins, audio, and persistent high scores.

### User Review & Critical Decisions

> [!IMPORTANT]
> The original game crashed on mobile browsers (such as Lemur Browser, Chrome Mobile, and Android WebViews) with:
> `GLSL mesh: 0:92: S0032: no default precision defined for variable 'float[6]'`.
> This happens because mobile OpenGL ES 3.0 / WebGL 2 compilers strictly require explicit precision qualifiers on array types and constructors in concatenated shaders. We will patch the shader pipeline, auto-fallback safely to optimized WebGL 2 on mobile devices, and calibrate touch ergonomics.

- **Confirmed Decision 1 (Controls)**: Virtual joystick, touch swipes (up to jump, left/right to nudge lanes), and prominent on-screen Jump action button.
- **Confirmed Decision 2 (Graphics & Shaders)**: WebGL 2 mobile shader pipeline fix with auto performance scaling (dynamic device pixel ratio scaling capped at 1.5x on mobile to maintain 60 FPS without thermal throttling).
- **Confirmed Decision 3 (Feature Scope)**: Complete game feature set: Endless runner chase against the junk mech, all 6 animal characters (Raccoon, Fox, Cat, Badger, Possum, Otter), sound effects, background synth music, and local high score tracking.

---

### 1. Overview & Core Concept

- **What It Does**: You play as a goggled animal hero sprinting down a neon cyber-scrapyard track while being pursued by a towering junk mech. Dodge oil drums, crushed scrap cars, and floor gaps while collecting golden hex nuts.
- **Target Audience / Persona**: Mobile and desktop gamers wanting an intense, responsive 3D endless runner playable directly in any browser without app store installation.
- **Key Value**: Flawless mobile execution on devices that previously crashed on the original WebGL/WebGPU shaders, paired with ergonomic touch controls that feel native on smartphones.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Boot & Splash**: Industrial hazard-tape loading screen with asset caching, loading bar, and a tap-to-start overlay (fulfilling browser audio unlock requirements).
  2. **Main Menu & Customization**: Neon cyber-scrapyard title screen with Play button, high score counter, character skin selector carousel (Raccoon, Fox, Cat, Badger, Possum, Otter with live 3D preview), and audio toggle.
  3. **In-Game Chase**: Oncoming camera view; the player sprints forward along 3 lanes while the junk mech stomps behind. Dynamic warnings show oncoming obstacles with color-coded distance lamps.
  4. **Mobile Touch HUD**: Floating thumb stick on the lower-left for analog strafing, swipe gestures for quick lane dodges and jumping, and a large thumb Jump button on the lower-right.
  5. **Game Over & Retry**: Crashing into an obstacle or falling into a scrap pit triggers a smash animation, Mech overtake sequence, score recap, and quick instant-restart.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Industrial neon cyberpunk scrapyard — rusted corrugated iron, caution stripes, glowing cyan and magenta billboards, oil-slicked asphalt.
  - *Color Palette*:
    - Canvas / Scenery: Obsidian `#120804` and deep rust `#2a140b`
    - Hazard Accents: Neon hazard yellow `#facc15`, vivid lamp orange `#ff6a1a`, alarm crimson `#ff3b5c`
    - Pickups & Cyber Highlights: Golden hex nut `#ffc93d`, electric cyan `#48f0ff`, neon pink `#ff4fa3`
  - *Typography*: Bold industrial display typography (`Impact`, `"Arial Black"`, with monospace tabular figures for scores and distances).
  - *Mobile Touch Ergonomics*: Natural thumb zone placement (bottom 35% of the screen), with interactive hitboxes exceeding $48 \times 48\text{px}$ and safe insets from phone system navigation bars.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct WebGL 2 Mobile Shader Patch**
  - *Chosen Approach*: Rewrite `common.glsl` and `shaders.ts` to replace bare `float[6](...)` array declarations with explicit scalar indexing and `precision highp float; precision highp int;` qualifiers.
  - *Why*: Directly solves the `S0032: no default precision defined for variable 'float[6]'` syntax error on mobile GPUs (Mali, Adreno, PowerVR) without needing heavy external 3D libraries or changing game mechanics.
  - *Alternatives Considered*: Rewriting the entire game in Three.js was rejected because the original custom engine has hand-tuned glTF mesh skinning, custom camera framing, and exact physics simulation mirroring that would lose accuracy.

- **Decision 2: Dual Simulation Architecture (WASM + JS Mirror Fallback)**
  - *Chosen Approach*: Load the official precompiled `sim.wasm` (verified ABI v3) from the game assets, with a built-in TypeScript physics mirror fallback if WebAssembly instantiation is blocked by specific browser sandboxes.
  - *Why*: Guarantees 100% launch reliability regardless of restrictive browser iframe policies.

- **Decision 3: Local Storage High Score & Character Selection Persistence**
  - *Chosen Approach*: Save best score, total collected nuts, and chosen character skin to `localStorage` with offline support.
  - *Why*: Instant loading, zero server friction, and privacy-respecting local persistence.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Mobile Browser Viewport                       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      3D WebGL 2 Canvas                         │   │
│   │  - Fixed mobile shaders (no float[N] precision errors)         │   │
│   │  - Dynamic DPR scaling (0.8x - 1.5x)                           │   │
│   │  - glTF characters, lane tiles, scrap obstacles & mech         │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                     HUD & Touch Control Layer                  │   │
│   │  - Heads-up warning lamps & score/distance tracker             │   │
│   │  - Virtual joystick / analog strafe (Left thumb)               │   │
│   │  - Big tactile JUMP button & swipe detector (Right thumb)      │   │
│   │  - Audio mute & pause quick toggles                            │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Engine & Simulation Core                        │
│                                                                        │
│   ┌───────────────────────┐                 ┌──────────────────────┐   │
│   │  Fixed-step Sim (WASM)│ <─────────────> │  WebAudio Sound Bus  │   │
│   │  - Lanes, gaps, nuts  │  State events   │  - Synth BGM & SFX   │   │
│   │  - Mech chase physics │  (jump, stomp,  │  - User-tap unlock   │   │
│   │  - Collision queries  │   pickup, lose) │                      │   │
│   └───────────────────────┘                 └──────────────────────┘   │
│               │                                                        │
│               ▼                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │              Skin Store & Local Score Persistence              │   │
│   │              (Raccoon, Fox, Cat, Badger, Possum, Otter)        │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `PlayerState`: `{ lane: number, x: number, y: number, z: number, vy: number, skin: string, alive: boolean }`
  - `RunStats`: `{ distance: number, nuts: number, speed: number, mechDistance: number, state: 'ready' | 'playing' | 'gameover' }`
  - `SavedProfile`: `{ highScore: number, totalNuts: number, selectedSkin: string, soundEnabled: boolean }`
- **Key Sequences**:
  1. User tap unlocks WebAudio context and triggers character run animation.
  2. Engine polls touch stick and swipes, feeding `sim_strafe()` and `sim_jump()`.
  3. Fixed-step loop advances track generation, hazard placement, and mech pursuit.
  4. Renderer draws glTF animated characters and instanced scrap scenery using mobile-safe GLSL shaders.
