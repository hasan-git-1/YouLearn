'use client';

import { Children, type ReactNode, type RefObject, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import type { PointerEvent as ReactPointerEvent } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const revealDuration = 0.34;
const finePointerQuery = '(hover: hover) and (pointer: fine)';
const finePointerSubscribers = new Set<() => void>();
let finePointerMedia: MediaQueryList | null = null;

function getFinePointerMedia() {
  if (typeof window === 'undefined') return null;
  finePointerMedia ??= window.matchMedia(finePointerQuery);
  return finePointerMedia;
}

function notifyFinePointerSubscribers() {
  finePointerSubscribers.forEach((subscriber) => subscriber());
}

function subscribeFinePointer(subscriber: () => void) {
  const media = getFinePointerMedia();
  if (!media) return () => {};

  finePointerSubscribers.add(subscriber);
  if (finePointerSubscribers.size === 1) {
    media.addEventListener('change', notifyFinePointerSubscribers);
  }

  return () => {
    finePointerSubscribers.delete(subscriber);
    if (finePointerSubscribers.size === 0) {
      media.removeEventListener('change', notifyFinePointerSubscribers);
    }
  };
}

function getFinePointerSnapshot() {
  return getFinePointerMedia()?.matches ?? false;
}

export function useMotionPreferences() {
  const reducedMotion = useReducedMotionPreference();
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    () => false,
  );

  return { reducedMotion, finePointer, interactiveMotion: finePointer && !reducedMotion };
}

export function useReducedMotionPreference() {
  return Boolean(useReducedMotion());
}

export function MotionCursor() {
  const { interactiveMotion } = useMotionPreferences();
  const x = useSpring(-100, { stiffness: 520, damping: 42, mass: 0.18 });
  const y = useSpring(-100, { stiffness: 520, damping: 42, mass: 0.18 });
  const scale = useSpring(1, { stiffness: 460, damping: 30, mass: 0.22 });

  useEffect(() => {
    if (!interactiveMotion) {
      document.body.classList.remove('tubiq-custom-cursor');
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    const handlePointerOver = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      scale.set(event.target.closest('a, button, [role="button"], input, select, textarea') ? 1.45 : 1);
    };

    document.body.classList.add('tubiq-custom-cursor');
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });

    return () => {
      document.body.classList.remove('tubiq-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
    };
  }, [interactiveMotion, scale, x, y]);

  return (
    <motion.div
      className="motion-cursor"
      style={{ x, y, scale, translateX: '-50%', translateY: '-50%' }}
      aria-hidden="true"
    >
      <span className="motion-cursor__dot" />
    </motion.div>
  );
}

export function CursorSpotlight({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const { interactiveMotion } = useMotionPreferences();
  const x = useSpring(-500, { stiffness: 160, damping: 32, mass: 0.7 });
  const y = useSpring(-500, { stiffness: 160, damping: 32, mass: 0.7 });
  const opacity = useSpring(0, { stiffness: 180, damping: 30, mass: 0.5 });

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !interactiveMotion) return;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = target.getBoundingClientRect();
      if (
        event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom
      ) return;
      x.set(event.clientX - bounds.left);
      y.set(event.clientY - bounds.top);
      opacity.set(1);
    };
    const handlePointerLeave = () => opacity.set(0);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    target.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      target.removeEventListener('pointerleave', handlePointerLeave);
      opacity.set(0);
    };
  }, [interactiveMotion, targetRef, opacity, x, y]);

  if (!interactiveMotion) return null;

  return (
    <motion.div
      className="cursor-spotlight"
      style={{ x, y, opacity, translateX: '-50%', translateY: '-50%' }}
      aria-hidden="true"
    />
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const reducedMotion = useReducedMotionPreference();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reducedMotion ? 0.01 : revealDuration, delay: reducedMotion ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className,
  delayStep = 0.05,
}: {
  children: ReactNode;
  className?: string;
  delayStep?: number;
}) {
  const items = Children.toArray(children);
  const { interactiveMotion } = useMotionPreferences();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useSpring(-500, { stiffness: 160, damping: 32, mass: 0.7 });
  const y = useSpring(-500, { stiffness: 160, damping: 32, mass: 0.7 });
  const opacity = useSpring(0, { stiffness: 180, damping: 30, mass: 0.5 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactiveMotion || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
    opacity.set(1);
  };

  const hideSpotlight = () => {
    opacity.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerMove={interactiveMotion ? handlePointerMove : undefined}
      onPointerLeave={interactiveMotion ? hideSpotlight : undefined}
    >
      {interactiveMotion && (
        <motion.div className="cursor-spotlight" style={{ x, y, opacity, translateX: '-50%', translateY: '-50%' }} aria-hidden="true" />
      )}
      <div className={`${className ?? ''} relative z-[1]`}>
        <AnimatePresence initial={false}>
          {items.map((child, index) => (
            <Reveal key={index} delay={Math.min(index * delayStep, 0.56)} amount={0.08}>
              {child}
            </Reveal>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function TiltSurface({ children, className }: { children: ReactNode; className?: string }) {
  const { interactiveMotion } = useMotionPreferences();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 280, damping: 28, mass: 0.35 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 280, damping: 28, mass: 0.35 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactiveMotion || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateX.set(-y * 12);
    rotateY.set(x * 12);
    ref.current.style.setProperty('--tilt-media-x', `${-x * 4}px`);
    ref.current.style.setProperty('--tilt-media-y', `${-y * 4}px`);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    ref.current?.style.setProperty('--tilt-media-x', '0px');
    ref.current?.style.setProperty('--tilt-media-y', '0px');
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt-surface ${className ?? ''}`}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      onPointerMove={interactiveMotion ? handlePointerMove : undefined}
      onPointerLeave={interactiveMotion ? resetTilt : undefined}
    >
      {children}
    </motion.div>
  );
}

export function useMagneticMotion<T extends HTMLElement>() {
  const { interactiveMotion } = useMotionPreferences();
  const ref = useRef<T>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 360, damping: 28, mass: 0.26 });
  const y = useSpring(useMotionValue(0), { stiffness: 360, damping: 28, mass: 0.26 });

  const onPointerMove = (event: ReactPointerEvent<T>) => {
    if (!interactiveMotion || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const proximity = Math.hypot(bounds.width, bounds.height) / 2 + 40;
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    if (Math.hypot(dx, dy) > proximity) return;
    x.set(Math.max(-9, Math.min(9, dx * 0.18)));
    y.set(Math.max(-9, Math.min(9, dy * 0.18)));
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    style: { x, y },
    onPointerMove: interactiveMotion ? onPointerMove : undefined,
    onPointerLeave: interactiveMotion ? onPointerLeave : undefined,
  };
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const magnetic = useMagneticMotion<HTMLDivElement>();

  return (
    <motion.div
      {...magnetic}
      className={className}
      style={magnetic.style}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  );
}
