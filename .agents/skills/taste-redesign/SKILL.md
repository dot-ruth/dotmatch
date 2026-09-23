---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS. Sourced from https://github.com/leonxlnx/taste-skill (skills/redesign-skill, MIT).
---

# Redesign Skill

## How this works

1. **Scan** — read the codebase: framework, styling method, current patterns.
2. **Diagnose** — run the audit below; list every generic pattern, weak point, missing state.
3. **Fix** — targeted upgrades in the existing stack. Never rewrite from scratch.

## Audit

### Typography
Browser-default/Inter-everywhere → a font with character (Geist, Outfit, Cabinet Grotesk, Satoshi; serif header + sans body for editorial). Headlines need size, tight tracking, low leading. Body ≤ 65ch with generous leading. Use 500/600 weights, not just 400/700. Mono or `tabular-nums` for numbers. Negative tracking on large headers, positive on labels. Prefer sentence case. Fix orphans with `text-wrap: balance`.

### Color and surfaces
No pure `#000000` backgrounds (off-black/charcoal instead). Saturation < 80%. One accent color. One gray family, consistently tinted. No AI-purple-gradient fingerprint. Tint shadows to the background hue. Add grain/micro-texture over sterile flats; break even gradients with radial/mesh. One light source for all shadows. No random inverted sections; contrast via darker shades of the same palette. Flat text-only sections need imagery, pattern, or ambient gradient (picsum seeds when real assets are missing).

### Layout
Break center-symmetry (offsets, mixed ratios, left headers). No three-equal-card feature rows (zig-zag, asymmetric grid, scroll, masonry instead). `min-height: 100dvh`, never `100vh`. CSS Grid over flexbox math. Max-width container (~1200-1440px). Vary border-radius with a documented rule. Layer with overlap/negative margins. Optical (not just mathematical) padding. Bottom padding often slightly larger than top. Whitespace: double it on marketing pages. Pin card CTAs to a shared baseline. Keep shared baselines aligned across side-by-side elements.

### Interactivity and states
Hover states on everything interactive; `scale(0.98)` press feedback; 200-300ms transitions; visible focus rings; skeleton loaders shaped like the layout (no generic spinners); composed empty states; inline errors (never `alert()`); no `#` dead links; visible active-nav state; `scroll-behavior: smooth`; animate `transform`/`opacity` only.

### Content
Real diverse names; organic numbers (`47.2%`, not `99.99%`); believable brands; no AI cliches (Elevate, Seamless, Unleash, Next-Gen, Game-changer, Delve, Tapestry, "In the world of..."); no `!` in success messages; no "Oops!"; active voice; varied dates; unique avatars; never Lorem Ipsum; sentence case headers.

### Components
Cards only when elevation means hierarchy (else `border-t`/`divide-y`/space). Tertiary text-link actions, not always filled+ghost pairs. No pill "New/Beta" badges, accordion FAQs, 3-dot testimonial carousels, 3-tower pricing, modals-for-everything, avatar-circles-only, sun/moon toggles, 4-column footer farms. Standardize icon stroke width; prefer Phosphor/Heroicons over default Lucide; no cliche metaphors; always ship a branded favicon; no uncanny stock team photos.

### Code quality
Semantic HTML; no inline-style/class mixing; relative units; real alt text; clean z-index scale; no dead commented code; no hallucinated imports; full meta tags.

### Strategic omissions
Legal links, back navigation, custom 404, client validation, skip-to-content link, cookie consent where required.

## Upgrade techniques (pull as needed)

Type: variable-font animation, outlined-to-fill, text-mask reveals. Layout: broken grid, whitespace maximization, parallax stacks, split-screen scroll. Motion: inertial smooth scroll, staggered entry, spring physics, scroll-driven reveals. Surface: true glass (inner border + inner shadow), spotlight borders, fixed grain overlay, tinted shadows.

## Fix priority

1. Font swap 2. Palette cleanup 3. Hover/active states 4. Layout + spacing 5. Replace generic components 6. Loading/empty/error states 7. Type scale + spacing polish.

## Rules

Existing stack only — no framework migrations, no broken functionality, test after every change, check the dependency file before new imports, Tailwind v3 vs v4 awareness, vanilla CSS if frameless, small reviewable changes.
