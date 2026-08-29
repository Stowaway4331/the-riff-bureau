# The Riff Bureau — Animated Three.js Website

## Context

The Riff Bureau is a guitar-lessons business run by Yadhu VK. The only existing asset is a 4-page PDF brochure (`The Riff Bureau .pdf`), and the project directory is otherwise completely empty (no git repo, no scaffold). The goal is to turn that brochure into a modern, single-page marketing website with a restrained but distinctive set of Three.js/GSAP animations — one signature 3D moment in the hero (an organic "paint reveal" wipe between the guitarist photo and the logo/text), small cursor-reactive accents, background parallax on scroll, and scroll-triggered reveals for content sections. The explicit instruction is "not overkill" — most of the site is DOM/CSS with GSAP choreography; Three.js is scoped to the hero canvas only.

Image assets (hero photo, logo, guitar photos) will be supplied by the user separately and are referenced as placeholder paths for now.

## Stack & Scaffold

- `npm create vite@latest . -- --template react` (JS, not TS — this is a small marketing site, TS adds friction around GLSL uniform typing for little payoff)
- `npm install three @react-three/fiber @react-three/drei gsap @gsap/react simplex-noise`
- No smooth-scroll library (e.g. Lenis) — native scroll + ScrollTrigger `scrub` is enough and keeps things simple per "not overkill."

### Folder structure
```
src/
  assets/            hero-guitarist.png, logo.svg, guitar-headstock.jpg,
                      guitar-chord.jpg, guitar-player.jpg, bg-texture.png
  components/
    Footer.jsx        persistent phone/email/logo bar
    CursorAccents.jsx  small SVG glyphs, cursor parallax
    icons/             inline SVG line-art icons (checklist, "what you receive", about rows)
  hooks/
    usePointerParallax.js
    usePrefersReducedMotion.js
    useScrollReveal.js
  three/
    HeroCanvas.jsx
    PaintRevealMaterial.js
    noiseTexture.js
    shaders/paintReveal.vert.glsl
    shaders/paintReveal.frag.glsl
  sections/
    Hero.jsx      Outcomes.jsx      Timeline.jsx      About.jsx
  styles/tokens.css, index.css
  App.jsx, main.jsx
```

**Assumption to confirm with user:** the ~15 small brochure icons (checklist, "what you receive", about rows) will be hand-authored as inline SVG React components in `src/components/icons/`, since no icon asset files were supplied. If the user has real icon files coming, section components accept an `Icon` prop so swapping to `<img>`/`<svg>` imports is trivial later.

## Page Architecture

Single scrolling page, no router. Brochure's 4 pages → 4 sections + one persistent footer (pulled out of page 1's black bar so it's site-wide):

| Brochure page | Component | Content |
|---|---|---|
| 1 | `Hero.jsx` | Photo + logo/wordmark/script tag/quote, paint-reveal shader |
| 2 | `Outcomes.jsx` | "Beginner Level 1" 7-item checklist, sidebar completion card, "What You Receive" 5-icon row |
| 3 | `Timeline.jsx` | 3-month course (M1 Foundation / M2 Technique & Theory / M3 Songs & Independence), Monthly Assessments + Practice Expectations cards |
| 4 | `About.jsx` | Intro paragraph + 3 rows (Who Is It For / Our Approach / How The Programme Works) |
| — | `Footer.jsx` | Phone, email, logo mark |

Content note: correct the source brochure's typos ("Biginner" → "Beginner", "Crourse" → "Course") in final copy.

## Hero: Paint Reveal Effect

**Approach:** hybrid DOM + WebGL, not an all-WebGL scene.
- Right half (wordmark, script tag, quote) stays real DOM text — accessible, crisp, reflows naturally. Own small GSAP fade-in timeline.
- Left half (guitarist photo) is a textured plane inside a full-bleed `@react-three/fiber` `<Canvas>` positioned absolutely behind the hero section, using a custom `ShaderMaterial` to drive the reveal.

This keeps Three.js scoped to exactly one signature moment: a single plane, no lights/postprocessing/controls.

**Noise texture:** baked once at module load via the `simplex-noise` package into a `THREE.DataTexture` (4-octave fractal noise, 256×256, single-channel) — no runtime cost, no external PNG dependency (`src/three/noiseTexture.js`).

**Shader:** vertex shader is a passthrough forwarding UVs. Fragment shader (`paintReveal.frag.glsl`) computes a horizontal sweep threshold (`vUv.x`) perturbed by the noise texture for a jagged/organic edge, applies `smoothstep(uProgress - softness, uProgress + softness, threshold)` to get per-pixel alpha (revealed vs. not), and adds a thin warm-orange rim glow at the active edge to sell a "wet paint" leading edge. `uProgress` (0→1) is the only value animated externally.

**Trigger:** GSAP tween on `uProgress` from 0→1 over ~2s on page load (not scroll-linked — a one-time "arrival" beat), `power2.inOut` easing, via `useGSAP`. Under `prefers-reduced-motion`, skip straight to `uProgress = 1`.

**Mount:** `HeroCanvas.jsx` — orthographic `<Canvas>`, `dpr={[1, 1.5]}`, `alpha: true`, `antialias: false`; single mesh sized to the R3F viewport so it always covers its container on resize. CSS grid (`1fr 1fr`) lays the photo/canvas side by side with the text column; solid brand-black sits behind the canvas to avoid a white flash before first paint.

**WebGL fallback:** cheap `getContext('webgl2') || getContext('webgl')` probe before mounting the canvas; if unsupported, render the hero photo as a plain `<img>` with a CSS opacity fade-in instead — same "arrival" beat, zero WebGL dependency.

## Cursor-Reactive Elements

4–6 small SVG glyphs (pick shape, short "string" line accents, a musical note), rendered as plain absolutely-positioned DOM elements — **not** inside the R3F canvas, keeping the WebGL scene scoped to the hero shader only. `usePointerParallax` hook normalizes `pointermove` position and drives each glyph via `gsap.quickTo` with a distinct max-offset per element (e.g. 8/14/22px) for a subtle layered-depth feel. Listener is never attached on `(pointer: coarse)` devices or under reduced motion.

## Parallax & Scroll Reveals

- **Background parallax:** one full-bleed background texture layer (faint guitar silhouette/texture, matching the brochure's background), moved via a single `ScrollTrigger`-`scrub` tween (`yPercent: 20`) spanning the whole document — simple, one layer, not per-section.
- **Section reveals:** shared `useScrollReveal` hook wraps `ScrollTrigger.batch(selector, { onEnter: fade/slide/stagger })`, applied to the Outcomes checklist items, the "What You Receive" icon row, the 3 Timeline cards, and the About icon rows. `batch` (not one trigger per section) so items animate in individually as each crosses the viewport threshold. Skipped entirely under reduced motion (render final state immediately).

## Responsive & Accessibility

- Hero grid collapses to a single stacked column below ~768px (photo on top, text below).
- Shader plane resizes automatically with the R3F viewport; sweep stays horizontal on mobile for v1 (documented as a possible later tweak, not required now).
- `usePrefersReducedMotion` (single `matchMedia` check) gates: hero tween (skip to revealed state), cursor parallax (never attached), and scroll reveals (render final state, no animation).
- WebGL capability check gates canvas mount vs. static `<img>` fallback (see above).

## Performance Notes

- Single 2-triangle plane, no lights/shadows/postprocessing — trivial GPU cost.
- `dpr` capped at 1.5, `antialias: false` (unnecessary for a flat plane).
- Hero canvas mounts immediately (above the fold, LCP-relevant) — no lazy-loading/code-splitting benefit.
- `<link rel="preload">` for the hero photo since it's the likely LCP asset.
- `useGSAP` handles automatic tween/ScrollTrigger cleanup on unmount (future-proofs against StrictMode double-invoke).

## Files To Be Created (key ones)

- `src/three/shaders/paintReveal.vert.glsl`, `paintReveal.frag.glsl` — the shader
- `src/three/PaintRevealMaterial.js` — drei `shaderMaterial()` + `extend()`
- `src/three/noiseTexture.js` — simplex-noise → `DataTexture`
- `src/three/HeroCanvas.jsx` — Canvas mount, GSAP trigger, fallback/reduced-motion branching
- `src/sections/Hero.jsx`, `Outcomes.jsx`, `Timeline.jsx`, `About.jsx`
- `src/components/CursorAccents.jsx`, `Footer.jsx`
- `src/hooks/usePointerParallax.js`, `usePrefersReducedMotion.js`, `useScrollReveal.js`
- `src/App.jsx`, `src/main.jsx` (registers `ScrollTrigger` plugin once)

## Verification Plan

Run `npm run dev`, hard-refresh each time to re-trigger the load animation, and manually check:
1. Paint reveal sweeps in organically (~2s) on load, no white flash before first paint.
2. Cursor parallax: accents shift subtly at different depths as the mouse moves; check DevTools Performance for steady frame rate.
3. Scroll parallax: background layer visibly moves slower than content, no shift/overlap at scroll bounds.
4. Scroll-in reveals: checklist/timeline/about items stagger in as each enters viewport (not all at once).
5. Responsive at 375/768/1024/1440px: hero stacks correctly on mobile, canvas resizes without distorting photo aspect ratio, cursor accents don't mount under touch emulation.
6. `prefers-reduced-motion: reduce` (DevTools Rendering tab): hero shows final state instantly, no cursor parallax, sections render without animating in.
7. Force a WebGL failure: static `<img>` fallback renders correctly, no console errors.
8. No shader compile errors, React warnings, or GSAP "target not found" warnings in console.
9. Content QA pass: corrected spelling ("Beginner", "Course") in final copy.