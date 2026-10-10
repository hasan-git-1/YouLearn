'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useMotionPreferences } from '@/lib/motion';

const ease = [0.16, 1, 0.3, 1] as const;

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reducedMotion } = useMotionPreferences();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={pathname}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reducedMotion ? { opacity: 0, pointerEvents: 'none' } : { opacity: 0, scale: 0.98, pointerEvents: 'none' }}
        transition={{ duration: reducedMotion ? 0.01 : 0.24, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
