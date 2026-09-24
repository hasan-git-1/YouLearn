'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CategorySectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
  className?: string;
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
}: CategorySectionProps) {
  if (count === 0) return null;

  return (
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

        {count > 6 && (
          <button
            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1"
            type="button"
          >
            See all <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Cards grid */}
      <div
        className={cn(
          'grid gap-4',
          twoColumn
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {children}
      </div>
    </section>
  );
}
