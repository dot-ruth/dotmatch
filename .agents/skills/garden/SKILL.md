---
name: web-design-engineer
description: Build or redesign polished browser-rendered visual artifacts with HTML/CSS/JavaScript/React. Design-engineer workflow: verify facts, understand requirements, declare a design system, show v0 early, build, verify with a pre-delivery checklist. Anti-cliche, brand-fidelity first. Condensed from https://github.com/ConardLi/garden-skills (skills/web-design-engineer, MIT).
---

# Web Design Engineer

Bar is "stunning", not "functional". Every pixel intentional. Respect brand consistency while daring to innovate.

## Workflow

0. **Verify facts first.** Named product/SDK/version you are unsure of → web-search before designing. Never assert from memory.
1. **Requirements.** Enough context → build. Vague ("make something nice") → Design Direction Advisor (3 differentiated directions from different schools, never 3 from the same row).
2. **Context.** User-provided codebase/screenshots first (code over screenshots), then existing product pages, then industry anchors. One anchor → load only that recipe.
3. **Modes for existing UI.** Classify Extension / Redesign-Preserve / Redesign-Overhaul before editing. Extension: new elements indistinguishable from originals.
4. **Design Read + dials.** `artifact / audience / visual-language / mode / variance / motion / density / asset-dependence / brand-fidelity`. Dials must drive decisions.
5. ** Declare the system before code.** Palette, type, spacing base, radius strategy, shadow hierarchy, motion style. Confirm, show v0 early, then full build. Pause at non-trivial decision points.
6. **Verify.** Pre-delivery checklist below. Browser acceptance only when explicitly requested.

## Brand assets (non-negotiable order)

Logo (real file, never a colored rectangle) > product imagery/screenshots (the "main character") > color tokens > typography. No CSS silhouettes or hand-drawn SVG as product imagery. Missing logo → stop and ask.

## Anti-cliche (why: AI defaults erase brand recognition)

No purple-pink-blue gradients, no rounded-card + colored-left-border, no emoji-as-icons, no SVG-drawn scenes, no CSS silhouettes for product shots, no Inter/Roboto/Arial/Fraunces-as-display, no neon-on-#0D1117 cosplay, no fabricated stats/logo walls/testimonials. Exception is only ever "the brand spec uses it". Placeholders beat fakes (`[icon]`, initial circle, aspect-ratio box, "real data needed").

## Craft rules

- Type scale contrast (h1:body ≈ 4-6x), `text-wrap: pretty`, tabular numbers, ≤2 families, ≤4 colors.
- Whitespace is design; every element earns its place; no unilateral sections; less is more.
- Motion: CSS transitions for 80% of micro-interactions; no scroll listeners; transform/opacity only; reduced-motion honored; play/pause where relevant.
- States: hover/focus/active/disabled/loading + empty/error where warranted. Skeletons match layout shape.
- A11y + responsive declared per component; touch targets ≥44px; body text 16-18px.
- No `scrollIntoView`, no `const styles = {...}`, lazy-load below-fold weight.

## Pre-delivery checklist

Facts verified · design read drove decisions · mode contracts kept · real logo/assets · no missing imports/paths · responsive + scale strategy · all interactive states · no overflow · colors all from declared system · no cliches · no filler/fabrication · semantic naming · showcase-level finish.
