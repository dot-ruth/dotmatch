---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. Reads the brief, infers the design direction via dials, and ships interfaces that do not look templated. Condensed from https://github.com/leonxlnx/taste-skill (skills/taste-skill, MIT).
---

# Taste — Anti-Slop Frontend

Landing pages, portfolios, redesigns. Every rule is contextual: read the brief first, then pull only what fits.

## 0. Design read (output one line before generating)

"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <system/aesthetic>."

Signals: page kind, vibe words, references, audience, existing brand assets (starting material, not optional), quiet constraints (a11y/regulated override aesthetics). If genuinely ambiguous, ask exactly one question; otherwise declare and proceed.

Anti-defaults: no AI-purple glow, no centered-hero-over-dark-mesh, no three-equal-cards, no blanket glassmorphism, no Inter-by-default.

## 1. Dials (set after the read; all decisions gate on these)

- `DESIGN_VARIANCE` 1-10 (symmetry → chaos). Baseline 8.
- `MOTION_INTENSITY` 1-10 (static → cinematic). Baseline 6.
- `VISUAL_DENSITY` 1-10 (airy → cockpit). Baseline 4.
- Redesign-preserve: match existing variance/density, motion +1. Redesign-overhaul: variance +2, motion +2.

## 2. System honesty

If the brief reads as a real system (Fluent, Material, Carbon, Polaris, Atlassian, Primer, GOV.UK, USWDS, Radix, shadcn), use the official package. One system per project. Aesthetics (bento, brutalism, editorial, glass) are built with native CSS + Tailwind, labeled as inspiration, never as official.

Stack notes: check `package.json` before importing anything; Tailwind v3 vs v4 matters; never `window.addEventListener('scroll')` (use IntersectionObserver / CSS `animation-timeline`); animate only `transform` + `opacity`.

## 3. Typography

Sans display by default (Space Grotesk, Geist, Satoshi, Outfit). Serif only if the brand brief names one or the family is genuinely editorial/luxury/heritage. Emphasis inside a headline = italic or bold of the SAME family, never a mixed-family word. Italic display words with descenders (y g j p q) need `leading-[1.1]` minimum. Balance headlines (`text-wrap: balance`).

## 4. Color

Max one accent; saturation < 80%; lock it page-wide (no surprise blue CTA on a forest page). No AI-purple default; warm/cool grays never mixed. Tint shadows to the background hue. `text-balance` for orphans; `tabular-nums`/mono for data.

## 5. Layout (hard rules)

- Hero fits the viewport: headline ≤ 2 lines, subtext ≤ 20 words, CTAs visible without scroll, top padding ≤ `pt-24`, `min-h-[100dvh]` never `h-screen`.
- Hero stack max 4 text elements: eyebrow OR brand strip (not both), headline, subtext, CTAs (1 primary + ≤1 secondary). No taglines, trust strips, or logo walls inside the hero.
- Eyebrows: max 1 per 3 sections. Split-header (headline left + explainer right) banned by default; stack vertically instead.
- One layout family per section; max 2 consecutive image+text splits; bento cells exactly match content count with ≥2 visually varied cells.
- Nav: single line on desktop, ≤ 80px tall. One marquee per page max.

## 6. Motion (motivated or dropped)

Every animation answers "what does it communicate?" (hierarchy, story, feedback, transition). `MOTION > 3` must honor `prefers-reduced-motion`. Entry cascade on hero, scroll reveals on sections, tactile `:active` (`scale-[0.98]`), spring easing over linear.

## 7. Images

Hero needs a real visual: image-gen first, real photography (Unsplash direct URLs, picsum seeds) second. Div-based fake screenshots and hand-rolled illustrations are banned; if assets are impossible, leave labeled placeholders and say so. Logo walls use real SVG marks, logos only, no category labels.

## 8. Copy + CTAs

Self-audit every string: no broken grammar, no AI cliches (Elevate, Seamless, Unleash, Next-Gen, Delve), no fake-precise numbers unless real or labeled mock, one register per page. CTAs: WCAG AA contrast, one line at desktop, one label per intent per page.

## 9. Pre-flight (mechanical, all must pass)

Theme locked (no mid-page light/dark flips) · eyebrows ≤ ceil(sections/3) · one accent · one radius rule · no em-dash flourishes · quotes ≤ 3 lines with real quote marks · forms labeled above / errors below · skeletons match layout shape · empty + error states composed · focus visible · tested in light + dark · LCP/CLS sane.
