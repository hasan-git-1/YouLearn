'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Sparkles, Compass, Mic, Star } from 'lucide-react';

interface FloatingCardData {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  meta: string;
  extra?: string;
  icon: React.ReactNode;
  positionClass: string;
  delay: number;
  slug: string;
}

const CARDS: FloatingCardData[] = [
  {
    id: 'card-1',
    badge: 'COURSE',
    badgeColor: 'border-violet-500/30 text-violet-300 bg-violet-500/10',
    title: 'React 19 & Full Stack Patterns',
    meta: '14h 20m · Hands-on Projects',
    extra: '99% Match',
    icon: <BookOpen size={13} className="text-violet-400" />,
    positionClass: 'hidden lg:block top-16 -left-8 xl:left-4',
    delay: 0,
    slug: 'full-stack-web-development',
  },
  {
    id: 'card-2',
    badge: 'ROADMAP',
    badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
    title: 'AI Engineering & Vector RAG',
    meta: '28 videos · 8 top creators',
    extra: 'Beginner → Prod',
    icon: <Sparkles size={13} className="text-cyan-400" />,
    positionClass: 'hidden lg:block top-20 -right-8 xl:right-4',
    delay: 0.2,
    slug: 'ai-engineering',
  },
  {
    id: 'card-3',
    badge: 'SYSTEM DESIGN',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    title: 'Distributed Architecture Deep Dive',
    meta: 'High Scale · Fault Tolerance',
    extra: 'Senior Level',
    icon: <Compass size={13} className="text-amber-400" />,
    positionClass: 'hidden xl:block bottom-16 -left-12 xl:left-8',
    delay: 0.4,
    slug: 'system-design',
  },
  {
    id: 'card-4',
    badge: 'PODCAST',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    title: 'Foundations of Modern AI',
    meta: 'Deep Tech Dialogue · 1h 45m',
    extra: '4.9 ★ Rating',
    icon: <Mic size={13} className="text-emerald-400" />,
    positionClass: 'hidden xl:block bottom-14 -right-12 xl:right-8',
    delay: 0.6,
    slug: 'ai-engineering',
  },
];

function InteractiveTiltCard({ card }: { card: FloatingCardData }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tilt values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 + card.delay, ease: [0.16, 1, 0.3, 1] as const }}
      className={`absolute ${card.positionClass} z-20 pointer-events-auto`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 5 + card.delay * 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-64 p-3.5 rounded-2xl cursor-pointer group transition-shadow duration-300"
        >
          {/* Glass Card Background */}
          <div
            className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-indigo-500/40 transition-colors duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 20, 38, 0.88), rgba(9, 12, 24, 0.94))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Light sweep indicator */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.22), transparent 70%)',
            }}
          />

          <Link href={`/topics/${card.slug}`} className="relative z-10 block" style={{ textDecoration: 'none' }}>
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
              {card.extra && (
                <span className="text-[10px] font-mono text-indigo-300/80 flex items-center gap-1">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  {card.extra}
                </span>
              )}
            </div>

            {/* Title */}
            <h4
              className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {card.title}
            </h4>

            {/* Meta */}
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 line-clamp-1">
              {card.icon}
              <span>{card.meta}</span>
            </p>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function FloatingEcosystemCards() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {CARDS.map((card) => (
        <InteractiveTiltCard key={card.id} card={card} />
      ))}
    </div>
  );
}
