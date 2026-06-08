"use client";

import { useEffect, useRef, useState } from "react";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animated score chip — counts 0 → `target` with an ease-out when it scrolls
 * into view. A timeout guarantees the final value even if rAF is throttled.
 * Renders "{value} / {total}". Honors prefers-reduced-motion (snaps to target).
 */
export function CountUp({
  target,
  total = 100,
  duration = 1050,
  className,
}: {
  target: number;
  total?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let guard: ReturnType<typeof setTimeout>;

    if (
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      raf = requestAnimationFrame(() => setVal(target));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let t0 = 0;
        const step = (ts: number) => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / duration, 1);
          setVal(Math.round(easeOut(p) * target));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        guard = setTimeout(() => setVal(target), duration + 250);
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(guard);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {val} / {total}
    </span>
  );
}
