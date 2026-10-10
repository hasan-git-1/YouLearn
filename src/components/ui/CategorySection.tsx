'use client';

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Children, type ReactNode, useState } from 'react';
import { Reveal, StaggerGrid } from '@/lib/motion';

interface CategorySectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
  className?: string;
  /** Number of pre-fetched cards visible before the client-side expansion. */
  defaultVisible?: number;
  /** If true, renders children in a 2-column layout (for creator cards) */
  twoColumn?: boolean;
}

export function CategorySection({
  id,
  title,
  icon,
  count,
  children,
  className,
  twoColumn = false,
  defaultVisible = 8,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const cards = Children.toArray(children);
  if (count === 0) return null;

  return (
    <Reveal>
      <section id={id} className={cn('animate-fade-up', className)}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
            }}
          >
            {icon}
          </div>
          <div>
            <h2
              className="font-bold text-lg"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {count} result{count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {count > defaultVisible && (
          <motion.button
            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1"
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.16 }}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show less' : 'View more'} <ChevronRight size={13} className={expanded ? 'rotate-90' : ''} />
          </motion.button>
        )}
      </div>

      {/* Cards grid */}
      <StaggerGrid
        className={cn(
          'grid gap-4',
          twoColumn
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {cards.map((child, index) => (
          expanded || index < defaultVisible ? (
            <div key={index} className="h-full">{child}</div>
          ) : null
        ))}
      </StaggerGrid>
      </section>
    </Reveal>
  );
}
