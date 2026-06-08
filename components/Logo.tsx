"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * SkillDraft brand mark — a small agent "bot" whose eyes are the letters that
 * blink and swap between MD (markdown) and AI on a timer and on hover, plus the
 * Sk◆llDraft wordmark (dotless-i with a CSS diamond dot). Honors
 * prefers-reduced-motion (static "MD"). Drives both nav and footer instances.
 *
 * Renders an <a> when `href` is set (default "/"), otherwise a plain <span>
 * wrapper — so it can sit inside another link without nesting anchors.
 */
export function Logo({
  size = 28,
  href = "/",
  className = "",
}: {
  size?: number;
  href?: string | null;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const eL = el.querySelector<SVGTextElement>(".eL");
    const eR = el.querySelector<SVGTextElement>(".eR");
    if (!eL || !eR) return;

    const states: [string, string][] = [
      ["M", "D"],
      ["A", "I"],
    ];
    let i = 0;
    let swapTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;

    const blink = () => {
      el.classList.add("blink");
      swapTimer = setTimeout(() => {
        i ^= 1;
        eL.textContent = states[i][0];
        eR.textContent = states[i][1];
      }, 140);
      openTimer = setTimeout(() => el.classList.remove("blink"), 290);
    };

    const interval = setInterval(blink, 3200);
    el.addEventListener("mouseenter", blink);

    return () => {
      clearInterval(interval);
      clearTimeout(swapTimer);
      clearTimeout(openTimer);
      el.removeEventListener("mouseenter", blink);
    };
  }, []);

  const inner = (
    <>
      <svg
        ref={svgRef}
        className="bot"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M32 14 V8" />
          <circle cx={32} cy={6} r={2.4} fill="currentColor" />
          <path d="M12 30 H8 V38 H12" />
          <path d="M52 30 H56 V38 H52" />
          <rect x={12} y={16} width={40} height={38} rx={10} />
          <rect x={18} y={28} width={11} height={11} rx={2.5} />
          <rect x={35} y={28} width={11} height={11} rx={2.5} />
          <text
            className="eye-letter eL"
            x={23.5}
            y={36.7}
            textAnchor="middle"
            fontFamily="var(--font-space-grotesk), sans-serif"
            fontWeight={700}
            fontSize={9}
            fill="currentColor"
            stroke="none"
          >
            M
          </text>
          <text
            className="eye-letter eR"
            x={40.5}
            y={36.7}
            textAnchor="middle"
            fontFamily="var(--font-space-grotesk), sans-serif"
            fontWeight={700}
            fontSize={9}
            fill="currentColor"
            stroke="none"
          >
            D
          </text>
          <line className="eye-lid" x1={20} y1={33.5} x2={27} y2={33.5} />
          <line className="eye-lid" x1={37} y1={33.5} x2={44} y2={33.5} />
          <path d="M26 47 H38" strokeWidth={2} />
        </g>
      </svg>
      <span className="wm">
        Sk<span className="dot-i">{"ı"}</span>ll<i>Draft</i>
      </span>
    </>
  );

  if (href) {
    return (
      <Link className={`logo ${className}`} href={href} aria-label="SkillDraft home">
        {inner}
      </Link>
    );
  }
  return <span className={`logo ${className}`}>{inner}</span>;
}
