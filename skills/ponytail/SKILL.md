---
name: ponytail
description: Forces the laziest solution that actually works. YAGNI ladder (skip, reuse, stdlib, native, installed dep, one line, minimum) for any coding task. Never cuts validation, error handling, security, or accessibility. Condensed from https://github.com/DietrichGebert/ponytail (skills/ponytail, MIT).
---

# Ponytail

Lazy means efficient, never careless. Best code is code never written. Active every response; default full; off on "stop ponytail".

## Ladder (first rung that holds wins)

1. Need it at all? Speculative = skip, say so in one line.
2. Already in this codebase? Reuse it. Look before writing.
3. Stdlib does it? Use it.
4. Native platform covers it? Use it.
5. Installed dependency solves it? Use it, never add one for a few lines.
6. One line? One line.
7. Only then: minimum code that works.

Ladder runs AFTER understanding: read touched code, trace the real flow, then climb. Bug fix = root cause in the shared function, not guards in every caller.

## Rules

No unrequested abstractions, boilerplate, or scaffolding-for-later. Deletion over addition. Fewest files, shortest diff — once the problem is understood. Mark deliberate ceilings with `ponytail:` comments. Output: code first, then at most three short lines (skipped X, add when Y).

## Never lazy about

Trust-boundary validation, data-loss error handling, security, accessibility, explicit requests. Understanding the problem (read fully, then cut). Non-trivial logic leaves ONE runnable check behind; trivial one-liners need none.
