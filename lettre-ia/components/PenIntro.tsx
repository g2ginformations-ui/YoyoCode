"use client";

// Stylo plume qui écrit un trait à l'arrivée sur la page, puis s'estompe.
// Rien ne s'affiche pour les personnes qui ont demandé à réduire les animations.

import { useEffect, useRef, useState } from "react";

const STROKE =
  "M8 58 C 16 30, 26 22, 32 44 S 44 70, 54 44 S 70 18, 78 44 S 94 66, 104 46 S 120 32, 128 52 L 156 52";
const WRITE_MS = 2200;

export default function PenIntro() {
  const ink = useRef<SVGPathElement>(null);
  const pen = useRef<SVGGElement>(null);
  const [state, setState] = useState<"writing" | "fading" | "done">("writing");

  useEffect(() => {
    const path = ink.current;
    if (!path || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("done");
      return;
    }
    const length = path.getTotalLength();
    let frame = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / WRITE_MS, 1);
      // Démarrage et arrivée en douceur, comme une vraie main.
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
      const point = path.getPointAtLength(eased * length);
      path.style.strokeDashoffset = String(1 - eased);
      pen.current?.setAttribute("transform", `translate(${point.x} ${point.y})`);
      if (progress < 1) frame = requestAnimationFrame(step);
      else setState("fading");
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (state === "done") return null;

  return (
    <svg
      className={`pen-intro${state === "fading" ? " fading" : ""}`}
      viewBox="0 -64 170 132"
      aria-hidden="true"
      focusable="false"
      onAnimationEnd={() => setState("done")}
    >
      <path ref={ink} className="pen-ink" d={STROKE} pathLength={1} />
      <g ref={pen} className="pen-body" transform="translate(8 58)">
        {/* Le point (0, 0) est la pointe de la plume : c'est lui qui suit le trait. */}
        <g transform="rotate(-32) scale(0.82)">
          <path d="M0 0 L-7 -18 Q0 -22 7 -18 Z" />
          <path d="M0 -1 L0 -12" className="pen-cut" />
          <circle cx="0" cy="-13" r="1.8" className="pen-cut-fill" />
          <rect x="-7.5" y="-30" width="15" height="12" rx="2" />
          <rect x="-8" y="-33.5" width="16" height="2.5" className="pen-cut-fill" />
          <rect x="-9.5" y="-74" width="19" height="41" rx="8" />
        </g>
      </g>
    </svg>
  );
}
