"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Animates a number from 0 to `target` when scrolled into view. */
export function CountUp({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: 0 };
    const tween = gsap.to(obj, {
      value: target,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
      onUpdate: () => {
        setDisplay(
          `${prefix}${obj.value.toFixed(decimals)}${suffix}`
        );
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [target, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Floating gradient orb for decorative backgrounds. */
export function GlowOrb({
  className,
  color = "rgba(12, 41, 171, 0.12)",
  size = 400,
  duration = 8,
}: {
  className?: string;
  color?: string;
  size?: number;
  duration?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animation: `orb-float ${duration}s ease-in-out infinite`,
      }}
    />
  );
}
