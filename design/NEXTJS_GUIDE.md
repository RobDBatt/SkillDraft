# SkillDraft → Next.js (App Router) Implementation Guide

This is a concrete starting point for rebuilding the homepage in **React / Next.js (App Router)**. It pairs with `README.md` (the full design spec). Values here are the **final** settings: light theme, accent `#4D9CFF`, sharp corners.

The prototype's CSS (`skilldraft.css`) is already token-driven and framework-agnostic — the fastest path is: **keep the tokens + component classes as plain CSS, and port only the JS behaviors into React.** You don't need Tailwind unless you want it; CSS Modules or a single global stylesheet works great.

---

## 1. Project structure

```
app/
  layout.tsx            // fonts, <html data-theme="light" data-corners="sharp">, metadata + favicon
  page.tsx              // composes the sections
  globals.css           // tokens + base (lift from skilldraft.css)
components/
  Logo.tsx              // MD-eye bot + Sk◆llDraft wordmark, blink MD⇄AI
  Nav.tsx
  Hero.tsx
  Pipeline.tsx          // the signature animated row
  SocialProof.tsx
  Sections.tsx
  CtaFinal.tsx
  Footer.tsx
hooks/
  useReveal.ts          // IntersectionObserver scroll reveal + visibility floor
  useCountUp.ts         // 0 → target score
  usePrefersReducedMotion.ts
styles/
  pipeline.module.css   // (optional) scope the pipeline CSS
```

> **Do not port** the prototype's Tweaks panel (`tweaks-panel.jsx`, the React/Babel `<script>` block, `#tweaks-root`). It was a design-time tool. Bake the final tokens in instead.

---

## 2. Fonts (`app/layout.tsx`)

Use `next/font/google` so the fonts self-host and there's no layout shift:

```tsx
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"], weight: ["400", "500", "600", "700"],
  variable: "--font-sans", display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"], weight: ["400", "500", "700"],
  variable: "--font-mono", display: "swap",
});

export const metadata = {
  title: "SkillDraft — Quality-scored SKILL.md files for every AI agent",
  icons: { icon: "/skilldraft-favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-corners="sharp" data-bg="glow"
          className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

In `globals.css`, point the token aliases at the Next font variables:

```css
:root {
  --sans: var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif;
  --mono: var(--font-mono), ui-monospace, "SF Mono", Menlo, monospace;
}
```

Put `skilldraft-favicon.svg` in `/public`.

---

## 3. Tokens (`app/globals.css`)

Lift the `:root` + `:root[data-theme="light"]` blocks from `skilldraft.css` verbatim. If your build can't do `color-mix()`, precompute the derived accents for `#4D9CFF`:

```css
:root[data-theme="light"] {
  --accent:      #4D9CFF;
  --on-accent:   #ffffff;
  --accent-soft: rgba(77,156,255,0.11);
  --accent-line: rgba(77,156,255,0.30);
  --accent-deep: #366db3;  /* ~accent mixed 70% with black */
}
```

(Modern browsers support `color-mix`, so you can usually keep the originals.) You can drop the dark/paper/carbon blocks unless you want theming.

---

## 4. Hooks

### `usePrefersReducedMotion.ts`
```ts
import { useEffect, useState } from "react";
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
```

### `useReveal.ts` — scroll reveal with a hard visibility floor
```ts
"use client";
import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("in"); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    io.observe(el);
    // floor: never let content stay hidden
    const t = setTimeout(() => el.classList.add("in"), 2400);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return ref;
}
```
CSS (from the prototype):
```css
[data-reveal] { opacity: 0; transform: translateY(14px);
  transition: opacity .7s var(--ease), transform .7s var(--ease); transition-delay: var(--d, 0s); }
[data-reveal].in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; transform: none; transition: none; } }
```
Usage: `const ref = useReveal<HTMLDivElement>(); <div ref={ref} data-reveal style={{"--d":".12s"} as any} />`

### `useCountUp.ts` — score 0 → target on view
```ts
"use client";
import { useEffect, useRef, useState } from "react";
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCountUp(target: number, duration = 1050) {
  const ref = useRef<HTMLElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let raf = 0, t0 = 0;
      const step = (ts: number) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / duration, 1);
        setVal(Math.round(easeOut(p) * target));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      const guard = setTimeout(() => setVal(target), duration + 250); // rAF-throttle guard
      return () => { cancelAnimationFrame(raf); clearTimeout(guard); };
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return [ref, val] as const;
}
```
Usage: `const [ref, score] = useCountUp(92); <span ref={ref}>{score} / 100</span>`

---

## 5. `<Logo>` — MD-eye bot + diamond-i wordmark

```tsx
"use client";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function Logo({ size = 28 }: { size?: number }) {
  const svg = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = svg.current; if (!el) return;
    const eL = el.querySelector(".eL")!, eR = el.querySelector(".eR")!;
    const states = [["M", "D"], ["A", "I"]]; let i = 0;
    const blink = () => {
      el.classList.add("blink");
      setTimeout(() => { i ^= 1; eL.textContent = states[i][0]; eR.textContent = states[i][1]; }, 140);
      setTimeout(() => el.classList.remove("blink"), 290);
    };
    const id = setInterval(blink, 3200);
    el.addEventListener("mouseenter", blink);
    return () => { clearInterval(id); el.removeEventListener("mouseenter", blink); };
  }, [reduced]);

  return (
    <a className="logo" href="#top">
      <svg ref={svg} className="bot" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
          <path d="M32 14 V8" /><circle cx={32} cy={6} r={2.4} fill="currentColor" />
          <path d="M12 30 H8 V38 H12" /><path d="M52 30 H56 V38 H52" />
          <rect x={12} y={16} width={40} height={38} rx={10} />
          <rect x={18} y={28} width={11} height={11} rx={2.5} />
          <rect x={35} y={28} width={11} height={11} rx={2.5} />
          <text className="eye-letter eL" x={23.5} y={36.7} textAnchor="middle"
                fontFamily="var(--font-sans), sans-serif" fontWeight={700} fontSize={9}
                fill="currentColor" stroke="none">M</text>
          <text className="eye-letter eR" x={40.5} y={36.7} textAnchor="middle"
                fontFamily="var(--font-sans), sans-serif" fontWeight={700} fontSize={9}
                fill="currentColor" stroke="none">D</text>
          <line className="eye-lid" x1={20} y1={33.5} x2={27} y2={33.5} />
          <line className="eye-lid" x1={37} y1={33.5} x2={44} y2={33.5} />
          <path d="M26 47 H38" strokeWidth={2} />
        </g>
      </svg>
      <span className="wm">Sk<span className="dot-i">{"\u0131"}</span>ll<i>Draft</i></span>
    </a>
  );
}
```

Logo CSS (lift from `skilldraft.css`):
```css
.logo { display:inline-flex; align-items:center; gap:9px; color:var(--accent); text-decoration:none; }
.logo .bot { overflow:visible; }
.logo .bot .eye-letter { transform-box:fill-box; transform-origin:center; transition:transform .13s ease, opacity .12s ease; }
.logo .bot .eye-lid { opacity:0; transition:opacity .1s ease; }
.logo .bot.blink .eye-letter { transform:scaleY(.06); opacity:.25; }
.logo .bot.blink .eye-lid { opacity:1; }
.logo .wm { font:700 18px/1 var(--sans); letter-spacing:-.02em; color:var(--text); }
.logo .wm i { font-style:normal; font-weight:600; color:var(--accent); }
.logo .wm .dot-i { position:relative; }
.logo .wm .dot-i::after { content:""; position:absolute; left:50%; top:.18em; width:.16em; height:.16em;
  background:var(--accent); transform:translateX(-50%) rotate(45deg); }
@media (prefers-reduced-motion: reduce) { .logo .bot .eye-letter, .logo .bot .eye-lid { transition:none; } }
```

---

## 6. `<Pipeline>` — the signature animated row

Keep the markup + CSS almost exactly as the prototype (it's pure CSS animation — no React state needed). Copy these rules from `skilldraft.css` into `pipeline.module.css` (or globals): `.pipe-stages`, `.pipe-stages::before`, `.stage-col`, `.sp`, `.float-card`, `.code-card`, `.pc-cat/.pc-q/.pc-skill`, the equal-height block, `.pipe-flow` + `@keyframes flowx`, the `::before` flash + `@keyframes glowA/B/C`, `.type-caret`, `.scan`. **Critical correctness notes (these were real bugs we fixed):**

- All three `.sp` pills are identical — **no** `.on`/highlighted pill.
- All three cards share `background: var(--surface)` (white) — card 3 is **not** blue/translucent.
- The pulse dot `.pipe-flow` is **`z-index: 0`** so it passes **behind** the pills/cards.
- The per-card "active" effect is an **inset outline** (`box-shadow: inset 0 0 0 2px var(--accent)`), **not** an outer drop-shadow glow (an outer glow halos the card and makes it look tinted).
- Wrap all keyframed animations in `@media (prefers-reduced-motion: no-preference)`; under reduce, `.pipe-flow`/`.scan` get `display:none` and the cards just render static.

```tsx
export function Pipeline() {
  return (
    <div className="hero-pipe" data-reveal>
      <div className="pipe-stages">
        <span className="pipe-flow" aria-hidden="true" />
        <div className="stage-col s1">
          <span className="sp"><i>◆</i> 1 · pick</span>
          <div className="float-card pc-cat">{/* category header + chip list */}</div>
        </div>
        <div className="stage-col s2">
          <span className="sp"><i>◆</i> 2 · answer</span>
          <div className="float-card pc-q">{/* answers header + 5 rows */}</div>
        </div>
        <div className="stage-col s3">
          <span className="sp"><i>◆</i> 3 · generate</span>
          <div className="code-card pc-skill">
            <span className="scan" aria-hidden="true" />
            {/* SKILL.md header (with 92/100 via useCountUp) + code body + .type-caret */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

For the `92 / 100` chip, swap the static text for `useCountUp(92)`.

---

## 7. Sections & page (`app/page.tsx`)

```tsx
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
// ...
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />          {/* contains <Pipeline /> */}
        <SocialProof />
        <Sections />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
```

Anything with motion or browser APIs (Logo, Pipeline if you add the count-up, reveal wrappers) needs `"use client"`. Static sections can stay Server Components. Wire the "Generate" / "Build a Skill" CTAs to your real routes instead of the prototype's `#anchor`s.

---

## 8. Gotchas / parity checklist
- [ ] Self-hosted fonts via `next/font` (no FOUT).
- [ ] `color-mix` accents render (or precomputed fallback).
- [ ] All three pipeline cards identical white; pills identical; dot behind; inset-outline flashes.
- [ ] `prefers-reduced-motion`: logo static "MD", no pulse/scan, reveals show immediately.
- [ ] <1000px: pipeline single column, connector line + pulse hidden, nav wraps (add a mobile menu — the prototype doesn't have one).
- [ ] Score count-up reaches 92 and never sticks at 0.
- [ ] Reveal floor: no element can stay invisible if IO misfires.
```
```
