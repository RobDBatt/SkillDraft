# Handoff: SkillDraft Marketing Homepage

## Overview
SkillDraft is a tool that generates quality-scored `SKILL.md` files for AI coding agents. This package documents the **marketing homepage** — a single long-scroll landing page with an animated hero "pipeline" (Pick → Answer → Generate), social-proof strips, feature sections, and a closing CTA. It also includes the **brand identity** (animated "MD-eye" agent logo + wordmark).

## About the Design Files
The files in this bundle are **design references created in HTML/CSS** — a working prototype showing the intended look, motion, and behavior. They are **not** meant to be shipped as-is. The task is to **recreate this design in your target codebase's environment** (React/Next, Vue, Astro, plain HTML, etc.) using its established components, conventions, and build tooling. If there is no existing environment, pick the most appropriate framework for a marketing site (a static-first framework like Next.js or Astro is a good fit) and implement there.

The prototype includes a floating "Tweaks" panel (React + Babel, mounted to `#tweaks-root`) that was a **design-time tool only** for trying themes/accents live. **Do not port the Tweaks panel.** Instead, pick the final values (documented below) and bake them in, or expose them as real theme tokens if you want theming.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, motion, and copy. Recreate the UI pixel-perfectly. All visual values are tokenized as CSS custom properties in `skilldraft.css` — lift them directly.

**Final chosen settings** (the prototype ships in this state — see `TWEAK_DEFAULTS` in the HTML):
- Theme: **light**
- Accent: **#4D9CFF** (blue) — `--on-accent` for this accent is `#ffffff`
- Corners: **sharp** (2px radius on cards/pills/buttons)
- Background treatment: **glow** (subtle ambient hero glow)

Everything else (dark/paper/carbon themes, other accents) is optional theming you can ignore unless you want it.

---

## Tech & Dependencies

- **Fonts** (Google Fonts): `Space Grotesk` (400/500/600/700) and `JetBrains Mono` (400/500/600/700). Self-host in production for performance.
- **Icons:** none required — the design uses Unicode glyphs (◆ ◻ ▤ ›) and inline SVG (the logo). No icon library needed.
- **No runtime JS framework required.** The page is static HTML + CSS. The only JavaScript is small vanilla helpers (see "Interactions & Behavior"). Port those as ordinary component effects.
- **CSS approach:** the prototype uses one global stylesheet driven by CSS custom properties on `:root`, with `[data-theme]` / `[data-corners]` / `[data-bg]` attribute selectors for variants. Map these to your styling system (CSS Modules, Tailwind theme tokens, styled-components theme, etc.).

---

## Design Tokens

All tokens are defined in `skilldraft.css` at the top. **Final = light theme.**

### Colors — light theme (final)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAFAF8` | Page background |
| `--bg-grad` | `#F3F3EF` | Hero gradient stop |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-2` | `#F6F6F3` | Card headers, insets |
| `--border` | `rgba(15,18,20,0.11)` | Hairline borders |
| `--border-2` | `rgba(15,18,20,0.20)` | Stronger borders, dashed lines |
| `--text` | `#0E1114` | Primary text |
| `--text-dim` | `#535C64` | Secondary text |
| `--text-faint` | `#8B949C` | Tertiary / labels |
| `--accent` | `#4D9CFF` | Brand accent (links, highlights, pulse) |
| `--on-accent` | `#FFFFFF` | Text/icon on accent fills |
| `--accent-soft` | `color-mix(in srgb, var(--accent) 11%, transparent)` | Tinted backgrounds |
| `--accent-line` | `color-mix(in srgb, var(--accent) 30%, transparent)` | Tinted borders |
| `--accent-deep` | `color-mix(in srgb, var(--accent) 70%, #000)` | Pressed/deep accent |
| `--cta` | `#0E1114` | Primary button bg (near-black) |
| `--cta-text` | `#FAFAF8` | Primary button text |

> Note: `--accent-soft/line/deep` are **derived** from `--accent` via `color-mix`. If your toolchain lacks `color-mix`, precompute them for `#4D9CFF`.

### Other themes (optional)
The same token names are redefined under `:root[data-theme="dark"|"paper"|"carbon"]`. Defaults/dark accent is green `#5BE08C`. Accent options offered: green `#5BE08C`, violet `#8B7CF6`, blue `#4D9CFF` (chosen), amber `#F5A623`. Only port these if you want runtime theming.

### Typography
| Role | Family | Size | Weight | Tracking / notes |
|---|---|---|---|---|
| Hero H1 | Space Grotesk | clamp ~44–72px | 600–700 | tight line-height (~1.0), letter-spacing ~ -0.02em |
| Section H2/H3 | Space Grotesk | 22–32px | 600–700 | |
| Body | Space Grotesk | 15–17px | 400 | line-height ~1.5 |
| Eyebrow / label | Space Grotesk (or sans) | 10.5–11px | 600 | UPPERCASE, letter-spacing ~0.12–0.2em |
| Code / SKILL.md / stamps | JetBrains Mono | 12–13px | 400–700 | mono only here |

### Spacing & shape
- Content max-width: `--maxw: 1200px`, centered via `.wrap`.
- Card radius (sharp/final): **2px**. (Rounded variant uses 14px.)
- Buttons: square-ish (2px), padding ~`12px 18px`.
- Borders: **1px hairlines** or **1px dashed**. The aesthetic avoids blurred drop-shadows in solid themes; cards use a very soft long shadow only in light/paper.
- Easing token: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.

---

## Screens / Views

This is a single scrolling page. Sections top-to-bottom:

### 1. Nav (sticky)
- **Layout:** `.wrap` flex row, sticky top, translucent backdrop (`backdrop-filter: blur(14px)`), `z-index: 50`.
- **Left:** logo lockup — inline SVG "bot" mark + wordmark `Sk◆llDraft` (the dotless-i `ı` U+0131 with a CSS diamond dot; "Draft" in accent color). See "Brand / Logo".
- **Center:** nav links (Explore, Pricing, Improve, Collections, Install, FAQ), `--text-dim`, hover → `--text`.
- **Right:** "Sign in" (quiet button) + "Generate →" (primary button: `--cta` bg, `--cta-text`). Arrow `.arr` translates +3px on hover.

### 2. Hero
- **Eyebrow:** `◆ SKILL.MD GENERATOR` + a `◆ Security scanned` pill (small accent dot with a pulsing ring).
- **H1:** "Your agent. Your rules." (large Space Grotesk).
- **Sub + actions:** lead paragraph + two buttons (primary "Build a Skill →", ghost "Browse community →").
- **Signature element — the Pipeline** (see below). Sits above the hero copy in the live layout.
- **Background:** subtle ambient glow (`--bg` → `--bg-grad`), removed in solid themes.

### 3. THE PIPELINE (signature, animated) — most important to get right
A 3-column row (`grid-template-columns: 1fr 1fr 1fr; gap: 22px`) representing Pick → Answer → Generate, connected by a **dashed horizontal line** with a **blue dot that pulses along it**.

- A **dashed connector line** runs across the row (`.pipe-stages::before`, `top: 13px`, `border-top: 1px dashed --border-2`, `z-index: 0`).
- Above each column is a small **stage pill** (`.sp`): `◆ 1 · pick`, `◆ 2 · answer`, `◆ 3 · generate`. Mono, uppercase, white bg (`--surface-2`-ish `#FAFAF8`), 1px border. **All three pills are identical** — none is highlighted. (Earlier a `.sp.on` accent state existed; it was removed so the row reads consistently.)
- **Three equal-height cards** (`align-items: stretch`, each card `flex:1` column so all match height):
  1. **`.pc-cat` "category"** — header strip (`▤ category` + `Dev ✓` chip), then a vertical list of category chips: Development (selected, accent-tinted), Frontend, Content, Data & ML, Project, Custom.
  2. **`.pc-q` "answers"** — header (`▤ answers` + `5 / 5` chip), then 5 Q&A rows; answered ones show accent text + `✓`.
  3. **`.pc-skill` "SKILL.md"** (a `.code-card`) — header (`▤ SKILL.md` + `92 / 100` chip), then a syntax-highlighted markdown body (frontmatter `name`/`description`, `## Hard stops`, `## Verification`) ending with a blinking type caret.
- **All three cards share identical chrome:** `background: var(--surface)` (white), same 1px border, same soft shadow, same header strip `#F6F6F3`. Do not give card 3 a different (blue/translucent) background.

**Pipeline animation details:**
- **Pulse dot** (`.pipe-flow`): an 8px accent dot with a soft accent halo, absolutely positioned on the connector line (`top: 9px`). Animates `left: 2% → 98%` over **8s linear, infinite** (`@keyframes flowx`, fading in at 10% and out at 100%). **`z-index: 0` so it travels BEHIND the pills and cards** (tucks behind them — important, this was a deliberate choice).
- **Card "active" flash:** as the pulse passes each card, an inset accent outline flashes on (`::before`, `box-shadow: inset 0 0 0 2px var(--accent)`, opacity 0→1→0). Timed per card via `@keyframes glowA/glowB/glowC` (all 8s, peaks at ~15% / 50% / 85% to sync with the dot). **Use the inset outline, not an outer drop-shadow glow** — an outer glow casts a blue halo that makes a card look tinted/translucent.
- **Type caret** (`.type-caret`): blinking 7px accent bar at the end of the SKILL.md, `@keyframes caret` 1.06s steps.
- **Scan sweep** (`.scan` inside `.pc-skill`): a faint accent gradient band that sweeps top→bottom over the SKILL.md card every 6s (reinforces "security scanned").
- All motion is wrapped in `@media (prefers-reduced-motion: no-preference)`, and explicitly disabled under `prefers-reduced-motion: reduce` (dot/scan `display:none`). Honor this.
- Below 1000px the pipeline stacks to one column and the connector line + pulse are hidden.

### 4. Social-proof strip
Marquee/row of "skills people are shipping" + a meta strip (`◻ agentskills.io open standard`, community link). The marquee duplicates its track in JS for a seamless loop.

### 5. Feature / How sections
Standard editorial sections (`#why`, `#how`, `#install`) with headings, body copy, and supporting cards/code samples in the same visual language. (Reuse `.float-card` / `.code-card`.)

### 6. Closing CTA (`.cta-final`)
Eyebrow + heading + lead + the two buttons again ("Build a Skill →", "Browse skills →").

### 7. Footer
Logo lockup (same bot + wordmark), link nav, and a meta line.

---

## Brand / Logo

The mark is a small **robot/agent face** whose two eyes are the letters **M** and **D**. Built as inline SVG (`viewBox 0 0 64 64`, `stroke: currentColor`, `stroke-width: 3`, round joins/caps): antenna with a dot, side "ears", rounded-rect head, two rounded-square eye sockets each containing a letter, a mouth line, and two `.eye-lid` lines (hidden until blink).

- **Signature animation:** the eyes **blink and swap between `MD` and `AI`** on a timer (~3.2s) and on logo hover. On blink, `.eye-letter` scales to `scaleY(.06)` + the `.eye-lid` shows; mid-blink the letter text content swaps `M/D` ↔ `A/I`. Disabled under reduced-motion (static "MD").
- **Wordmark:** `Sk◆llDraft` — the first "i" is a **dotless ı (U+0131)** wrapped in `<span class="dot-i">`, whose `::after` draws a small **diamond** (rotated 4px square) in `--accent` as the i-dot. "Draft" is set in `--accent`, weight 600. On dark backgrounds the diamond uses the light/cyan tint.
- **Favicon:** `skilldraft-favicon.svg` (static blue MD-eye bot).
- A standalone logo spec sheet with all states/lockups/scale tests is included as `SkillDraft Logo.html` for reference.

Implement the mark as a reusable `<Logo>` component: an SVG sub-component (props for size & color via `currentColor`) + the wordmark. Drive the blink with a single timer/effect that toggles a `blink` class and swaps the eye text; respect `prefers-reduced-motion`.

---

## Interactions & Behavior

All currently vanilla JS — port each as an effect/handler in your framework:

1. **Scroll reveals:** elements with `data-reveal` (and an optional `--d` stagger delay) start hidden (`opacity:0; translateY(14px)`) and animate in when scrolled into view via `IntersectionObserver` (add `.in`). There is a **hard visibility floor**: a `force-visible` class is added after a timeout and on no-IO fallback so content can never stay hidden. Replicate the floor — never let content get stuck invisible.
2. **Score count-up:** any `.score` element counts from 0 up to its target (e.g. `92 / 100`) with an ease-out when it enters view; a `setTimeout` guarantees the final value even if rAF is throttled.
3. **Logo blink loop:** described above — timer + hover, swaps `MD ⇄ AI`.
4. **Marquee:** duplicate each `.marquee-track`'s children once for a seamless CSS loop.
5. **Hover states:** buttons lift 1px and slide their arrow; nav/footer links shift color; cards/category chips have subtle hover treatments.
6. **Reduced motion:** every animation must no-op under `prefers-reduced-motion: reduce` and show final/visible states.

No data fetching, routing, or real state beyond the above. The "Generate" CTAs are anchor links in the prototype — wire them to the real app/route in production.

## State Management
Effectively none for the marketing page. If you keep runtime theming, the only state is `{ theme, accent, corners, bg }` applied as `data-*` attributes on the document root + a `--accent` CSS var. Otherwise hardcode the final settings.

## Responsive behavior
- Content centered at max 1200px with side padding via `.wrap`.
- Pipeline: 3 columns ≥1000px; single column <1000px (connector line + pulse hidden).
- Nav collapses/wraps on narrow screens (provide a mobile menu in production — the prototype keeps links inline).
- Type scales via `clamp()` on the hero.

## Assets
- `skilldraft-favicon.svg` — favicon (MD-eye bot).
- Logo + all UI are inline SVG / Unicode glyphs / CSS — **no raster assets** to export.
- Fonts: Space Grotesk + JetBrains Mono (Google Fonts; self-host recommended).

## Files in this bundle
- `SkillDraft Homepage.html` — the full homepage prototype (structure + inline scripts + Tweaks block to ignore).
- `skilldraft.css` — the complete design system / stylesheet (all tokens, components, animations). **Primary source of truth for values.**
- `skilldraft-favicon.svg` — favicon.
- `SkillDraft Logo.html` — standalone logo spec (states, lockups, favicon-scale tests) for the brand component.
- `README.md` — this document.

## Implementation order (suggested)
1. Set up fonts + token layer (map the light-theme tokens; precompute the `color-mix` accents for `#4D9CFF` if needed).
2. Build primitives: `.btn` (primary/ghost/quiet), `.wrap`, eyebrow/label, card shells (`.float-card`, `.code-card`).
3. Build the `<Logo>` component (SVG mark + diamond-i wordmark + blink).
4. Build the **Pipeline** component — get the three equal-height matching cards, the dashed line, the behind-everything pulse dot, and the synced inset-outline flashes right. This is the centerpiece.
5. Lay out the page sections; wire reveals, count-up, marquee.
6. QA against `prefers-reduced-motion` and at <1000px.
