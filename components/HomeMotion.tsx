"use client";

import { useEffect } from "react";

/**
 * Scroll-reveal controller for the homepage. Mirrors the prototype's vanilla
 * script: adds `.in` to `[data-reveal]` elements as they enter the viewport,
 * with a hard visibility floor so nothing can stay hidden if the observer
 * misfires. The `html.js` class (set pre-paint in the root layout) is what
 * arms the initial hidden state; without JS, content stays visible.
 */
export function HomeMotion() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (!("IntersectionObserver" in window)) {
      document.documentElement.classList.add("force-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));

    // floor: snap any already-near-viewport reveals so they can't get stuck
    const floor = setTimeout(() => {
      els.forEach((el) => {
        if (
          !el.classList.contains("in") &&
          el.getBoundingClientRect().top < window.innerHeight * 0.92
        ) {
          el.classList.add("shown");
        }
      });
    }, 2000);

    return () => {
      io.disconnect();
      clearTimeout(floor);
    };
  }, []);

  return null;
}
