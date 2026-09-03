# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for The Riff Bureau, a guitar-lessons business run by Yadhu VK. Built from a 4-page PDF brochure (`references/The Riff Bureau .pdf`). One signature WebGL moment in the hero; everything else is DOM/CSS choreographed with GSAP. The guiding constraint throughout was "not overkill animations."

## Commands

Package manager is **pnpm**.

- `pnpm dev` — Vite dev server. Hard-refresh to re-trigger the hero load animation.
- `pnpm build` — production build to `dist/`.
- `pnpm preview` — serve the built `dist/`.
- `pnpm lint` — ESLint.

There is **no test suite and no test runner**. Verification is manual — see the checklist at the end of `.claude/plan.md` (paint reveal, cursor/scroll parallax, scroll reveals, responsive breakpoints, `prefers-reduced-motion`, WebGL-failure fallback).

### Known tooling gaps

- `pnpm lint` runs `eslint .`, but `eslint.config.js` only matches `**/*.{ts,tsx}`. All application code is `.jsx`/`.js`, so lint currently only covers `vite.config.ts` and config files — it does **not** check `src/`.
- TypeScript is scaffolded (`tsconfig.*.json`) but application code is deliberately plain JS (see decision 1 in `.claude/chat-context.md`). The tsconfigs effectively only describe `vite.config.ts`. Don't convert `src/` to TS without asking.

## Architecture

### Page composition

`src/main.jsx` registers the GSAP `ScrollTrigger` and `useGSAP` plugins once, then mounts `App`. `App.jsx` renders every content section as a direct `<section>` child of `<main className="page-sections">`, plus persistent `Footer`, `Menu`, `SectionDots`, and a `LoadingScreen` gated on `ready`.

There is **no router**. Sections in order: `Hero`, `Outcomes`, `Timeline`, `About`, `Instructor`, `Register` (`src/sections/`). The original plan in `.claude/plan.md` predates `Instructor`, `Register`, `Menu`, `LoadingScreen`, `SectionDots`, per-section backdrops, and the second shader — treat that file as design rationale, not a current map.

### Navigation is DOM-derived

`SectionDots` builds one dot per direct `<section>` of `.page-sections` via a `MutationObserver`. **Adding a section to `App.jsx` is the whole job** — there is no parallel list to update. Dot labels fall back through `data-nav-label` → `aria-label` → `[class$="-eyebrow"]` → `h1/h2` → `"Section N"`. Use `data-nav-label` only when a section's own heading reads badly as a nav label (the Hero does this — its `<h1>` is the site name).

### Loading gate

`Hero` loads the hero photo as a WebGL texture and calls `onAssetsReady` (whether it succeeds, fails, or WebGL is absent). That flips `App`'s `ready`, which hides `LoadingScreen` and triggers a `ScrollTrigger.refresh()` on the next frame so triggers measure the settled page height.

### Motion contract (follow this for any new animation)

Every animated feature checks `usePrefersReducedMotion()` and, when reduced motion is set, **renders the final state immediately** with no tween (see `useScrollReveal`, `Hero`, `useBackgroundParallax`, `SectionDots`). Pointer-driven effects are also skipped on `(pointer: coarse)`.

Shared motion primitives in `src/hooks/`:
- `useScrollReveal(scopeRef, selector, opts)` — `ScrollTrigger.batch` fade-up; items animate individually as they cross the viewport. Sections call it once per group of elements.
- `useBackgroundParallax(layerRef, triggerRef, opts)` — scrubbed `yPercent` drift of a backdrop layer across its section's passage. Travel is in `yPercent` and must stay under the layer's overscan (`--backdrop-overscan` in `sectionBackdrop.css`).
- `usePointerParallax`, `useReactivePhoto`, `useScrollScramble` — pointer/scroll accents.

`SectionBackdrop` is the standard textured-background wrapper: a compositing-friendly transformed image element plus a static veil (two elements specifically so the drift is a `transform`, not a per-frame `background-position` repaint). `tint` prop controls the wash opacity per section because the source photos vary in busyness.

No `scroll-behavior: smooth` anywhere — it fights `ScrollTrigger` scrub (noted in `src/styles/index.css`).

### WebGL hero (`src/three/`)

Three.js is scoped to exactly one component tree: `HeroCanvas.jsx`, an orthographic `@react-three/fiber` `<Canvas>` with two textured planes and no lights/postprocessing.

- `PaintRevealMaterial.js` — the guitarist photo, revealed by a noise-perturbed horizontal sweep.
- `PaintDividerMaterial.js` — a brush stroke straddling the column seam. Exports layout constants (`BRUSH_PLANE_FRAC`, `STROKE_CENTRE_U`, `NOISE_CELL_W`, …) that `HeroCanvas` reads to position and scale the plane.
- `noiseTexture.js` — a fractal simplex-noise `DataTexture` baked once at module load, shared by both materials. No runtime cost, no external PNG.
- GSAP **never touches the render loop**: tweens write to a plain `progressRef.current` object (`{ photo, brush }`); `HeroScene`'s `useFrame` copies those into the shader uniforms each frame.
- Fallback: `HeroCanvas` probes `getContext('webgl2') || getContext('webgl')` and also handles texture-load failure. Either path renders the photo as a plain `<img className="hero-fallback-img">` and still fires `onReady`.

### Shaders must be pure ASCII

`vite.config.ts` installs an `assertAsciiShaders` plugin that **throws at import time** if any `.glsl`/`.vert`/`.frag` file (in `src/three/shaders/`) contains a non-ASCII byte, comments included. A single typographic dash or curly quote otherwise produces an opaque runtime "Fragment shader is not compiled". Keep shader source ASCII-only. Shaders are imported with `?raw`.

### Styling

Plain CSS, one file per section/component in `src/styles/`, all `@import`ed by `index.css`. Design tokens (brand orange, near-black background scale, fonts, `--footer-height`) live in `tokens.css`. Icons are hand-authored inline-SVG React components in `src/components/icons/`.

### Assets

Static assets are served from `public/` and referenced by absolute path (e.g. `/webp-images/Hendrix - full.webp`). Images are WebP (converted from PNG — recent history). The hero photo is `<link rel="preload">`ed in `index.html` as the likely LCP asset. `Menu` copies the guitar-pick SVG from `references/` into `public/` so Vite will serve it.
