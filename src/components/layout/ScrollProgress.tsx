'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useMotionPreferences } from '@/lib/motion';

export function ScrollProgress() {
  const pathname = usePathname();
  const { reducedMotion } = useMotionPreferences();
  const progress = useSpring(useMotionValue(0), { stiffness: 180, damping: 34, mass: 0.35 });
  const applies = /^\/(search|topics|courses|videos)(\/|$)/.test(pathname);

  useEffect(() => {
    if (!applies || reducedMotion) {
      progress.set(0);
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        progress.set(maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [applies, progress, reducedMotion]);

  if (!applies || reducedMotion) return null;

  return <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />;
}
