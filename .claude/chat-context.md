# Chat Context — The Riff Bureau Website Planning Session

Saved 2026-08-29. Use this to pick the thread back up when ready to implement. Full implementation plan is in `plan.md` in this same folder.

## Brochure content (source: "The Riff Bureau .pdf", 4 pages)

**Page 1 — Cover/Hero:** Duotone orange/purple photo of a Hendrix-style guitarist on black, next to a guitar-shaped line-art logo mark, "THE RIFF BUREAU" wordmark, "By Yadhu VK" in orange script, and quote: *"At The Riff Bureau, we don't just teach guitar. We help you build a lifelong connection with music."* Black footer bar: +91 8296054888 · Page X of 4 · theriffbureau@gmail.com.

**Page 2 — "Beginner Level 1: What You Will Be Able To Do"** (note: brochure has typo "Biginner"): 7-item checklist with icons (play chords smoothly, strum with rhythm/confidence, play full songs w/ chord progressions, understand basic music theory, read chord charts/tabs, start lead playing, build a consistent practice habit). Sidebar card describing what Level 1 completion gives you. "What You Receive" row of 5 icons: Structured Curriculum, Practice Guides, Song Resources, Personalised Feedback, Ongoing Support.

**Page 3 — "The 3 Month Course"** (brochure typo: "Crourse"), a step-by-step foundation for every beginner, 3 timeline stops:
- M1 — Foundation: guitar familiarization, hand position/posture, finger strength/dexterity/control, spider walk & finger independence, string names & fretboard orientation.
- M2 — Technique & Theory: major/minor chords, major/minor scales, chord-hand strength, finger exercises, basic strumming patterns, rhythm & timing.
- M3 — Songs & Independence: more chords, smooth chord transitions, time signatures, intro to intervals, stronger rhythm understanding, continuing scale/finger exercises.
Below: "Monthly Assessments" (short evaluations each month) and "Practice Expectations" (15–30 min/day).

**Page 4 — "What Is The Riff Bureau?"**: Intro — structured guitar learning programme to build a strong foundation, understand music deeply, express yourself confidently. Three rows:
- Who Is It For? — open to all ages, students/professionals/hobbyists, designed for complete beginners.
- Our Approach — clarity, consistency, creativity; blend of theory, practical exercises, guided practice.
- How The Programme Works — 3 progressive monthly modules, each with guided lessons/exercises/practice.

## Decisions made this session

1. **Stack:** React + Vite + React Three Fiber (`@react-three/fiber`) + drei + GSAP (with `@gsap/react`'s `useGSAP` and ScrollTrigger). Plain JS, not TypeScript.
2. **Hero paint-reveal effect:** shader-based (GLSL `ShaderMaterial` + baked simplex-noise texture), not SVG/canvas masking — chosen for the organic, GPU-cheap, per-pixel noise-driven wipe.
3. **Image assets:** user will supply separate image files later (hero photo, logo, guitar photos) — not extracting from the PDF. Placeholder paths defined in the plan under `src/assets/`.
4. Explicit user instruction: "not overkill animations" — one signature 3D/shader hero moment, cursor-reactive small elements, scroll parallax, scroll-triggered section reveals. Everything past the hero should be DOM/CSS + GSAP, not more Three.js scenes.
5. Project directory (`E:\Projects\the-riff-bureau`) was completely empty at planning time except the source PDF — this is a from-scratch build, no existing scaffold to preserve.

## Status

Planning only — **no code has been written yet**. Full architecture, file breakdown, shader sketch, and verification checklist are in `plan.md`. When ready to implement, resume from that plan.
