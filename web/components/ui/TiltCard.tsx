"use client";

import { useRef, type ReactNode, type CSSProperties, type MouseEvent } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** max tilt in degrees */
  max?: number;
  /** scale on hover */
  scale?: number;
};

/**
 * 3D tilt-on-hover card. Tracks the mouse and rotates the card in 3D.
 * Add `transform-style: preserve-3d` children with `translateZ` for depth.
 */
export function TiltCard({ children, className, style, max = 8, scale = 1.03 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg) scale(${scale})`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: "transform 0.25s ease-out", willChange: "transform" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
