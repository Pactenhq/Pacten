"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties, type ElementType } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** direction the element enters from */
  from?: "up" | "down" | "left" | "right" | "scale" | "fade";
  /** seconds */
  duration?: number;
  /** stagger delay when used inside a group */
  delay?: number;
  /** distance in px */
  distance?: number;
  as?: "div" | "section" | "span" | "li";
};

/**
 * Scroll-triggered entrance animation.
 * Uses IntersectionObserver + CSS transitions (no GSAP), so content is
 * visible by default and can never get stuck with a partial transform.
 */
export function Reveal({
  children,
  className,
  style,
  from = "up",
  duration = 0.9,
  delay = 0,
  distance = 40,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already in view, reveal immediately without waiting.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add("rv-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("rv-visible");
            io.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as ElementType;

  // Initial (hidden) state via inline style; .rv-visible transitions to shown.
  const hidden: CSSProperties = {
    opacity: 0,
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}s`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}s`,
  };
  if (from === "up") hidden.transform = `translateY(${distance}px)`;
  if (from === "down") hidden.transform = `translateY(${-distance}px)`;
  if (from === "left") hidden.transform = `translateX(${distance}px)`;
  if (from === "right") hidden.transform = `translateX(${-distance}px)`;
  if (from === "scale") hidden.transform = "scale(0.92)";

  return (
    <Tag ref={ref} className={`rv ${className ?? ""}`} style={{ ...hidden, ...style }}>
      {children}
    </Tag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** stagger between children in seconds */
  stagger?: number;
  from?: "up" | "scale" | "fade";
};

/**
 * Animates direct children with a stagger on scroll into view.
 * CSS-based: each child gets a transition-delay by index.
 */
export function Stagger({
  children,
  className,
  stagger = 0.12,
  from = "up",
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add("rv-visible");

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      reveal();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            io.disconnect();
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const kids = Array.isArray(children) ? children : [children];

  return (
    <div ref={ref} className={`rv-stagger ${className ?? ""}`}>
      {kids.map((child, i) => (
        <div
          key={i}
          className="rv-stagger-child"
          style={{
            transitionDelay: `${i * stagger}s`,
            ...(from === "scale"
              ? { transform: "translateY(24px) scale(0.9)" }
              : from === "fade"
                ? {}
                : { transform: "translateY(36px)" }),
            opacity: 0,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
