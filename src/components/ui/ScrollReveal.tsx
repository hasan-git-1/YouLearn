'use client';

/**
 * ScrollReveal — fires a one-time fade-in when the wrapped element enters the viewport.
 *
 * Design rules (from spec Issue 2):
 * - Fires ONCE — does not re-animate on scroll-up-then-down
 * - Respects prefers-reduced-motion — animation is skipped entirely for users
 *   who've set that OS-level preference (the element is just visible immediately)
 * - Uses IntersectionObserver for performance (no scroll event listeners)
 * - threshold: 0.15 — triggers when 15% of the element is visible
 */

import { useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check for reduced motion preference — skip animation entirely
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Make visible immediately, no animation
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    // Initial hidden state
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate in
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            // Disconnect after firing ONCE — never re-triggers on scroll-up-then-down
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
