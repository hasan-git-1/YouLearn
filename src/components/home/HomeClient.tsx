'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { KnowledgeUniverseCanvas } from './KnowledgeUniverseCanvas';
import { HeroHeadline } from './HeroHeadline';
import { CommandSearch } from './CommandSearch';
import { FloatingEcosystemCards } from './FloatingEcosystemCards';
import { FloatingTopicSignals } from './FloatingTopicSignals';
import { ExploreUniverseSection } from './ExploreUniverseSection';
import { InteractiveProductSimulation } from './InteractiveProductSimulation';
import { DiscoveryBento } from './DiscoveryBento';
import { KnowledgeArchitecture } from './KnowledgeArchitecture';
import { UniverseCTA } from './UniverseCTA';

interface HomeClientProps {
  allTopics: { id: string; name: string; slug: string }[];
}

export function HomeClient({ allTopics }: HomeClientProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen overflow-hidden bg-[#120c0a] text-white">
      <section className="relative isolate min-h-[min(860px,100svh)] overflow-hidden border-b border-[#f8c784]/10">
        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-20"
          aria-hidden="true"
        >
          <KnowledgeUniverseCanvas />
        </motion.div>

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_80%_at_82%_22%,rgba(245,158,11,0.22),transparent_60%),radial-gradient(ellipse_48%_52%_at_30%_78%,rgba(251,146,60,0.14),transparent_72%),linear-gradient(120deg,rgba(18,12,10,0.82)_0%,rgba(18,12,10,0.55)_48%,rgba(18,12,10,0.92)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgba(255,205,120,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,205,120,.10)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

        <FloatingTopicSignals />
        <div className="pointer-events-none absolute inset-0 z-10 mx-auto hidden max-w-[1600px] xl:block">
          <FloatingEcosystemCards />
        </div>

        <div className="relative z-20 mx-auto flex min-h-[min(860px,100svh)] max-w-[1500px] items-center px-6 pb-24 pt-28 sm:px-10 lg:px-12">
          <div className="relative w-full max-w-[46rem]">
            <div className="absolute -bottom-8 left-8 h-28 w-28 rounded-full bg-[#f59e0b]/12 blur-3xl" aria-hidden="true" />
            <HeroHeadline />
            <div className="mt-3">
              <CommandSearch />
            </div>
          </div>

          <aside className="hidden w-full max-w-[360px] justify-self-end xl:block">
            <div className="rounded-[28px] border border-[#f8c784]/15 bg-[#2a1b12]/45 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#f1c27d]">
                <span>Live synthesis</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f8c784]/15 bg-[#f59e0b]/10 px-2 py-1 text-[9px] text-[#ffd79a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                  active
                </span>
              </div>

              <div className="mb-5 flex items-end gap-3">
                <div className="flex h-20 items-end gap-1.5">
                  {[28, 42, 38, 63, 52, 80].map((h, index) => (
                    <span
                      key={index}
                      className="w-2 rounded-t-md bg-gradient-to-t from-[#f59e0b] via-[#fb923c] to-[#fcd34d]"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="pb-2 text-left">
                  <div className="text-3xl font-black tracking-[-0.06em] text-[#fff7ed]">+42%</div>
                  <div className="text-[11px] leading-4 text-[#f1c27d]">Learning velocity</div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold tracking-[-0.05em] text-[#fff7ed]">Measure real progress</h3>
              <p className="mt-2 text-sm leading-6 text-[#f5d4a6]">
                Tubiq connects content, concept depth, and momentum into one guided learning flow.
              </p>
            </div>
          </aside>
        </div>

        <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#f1c27d] sm:flex">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#fbbf24]/70" />
          Explore Tubiq
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#fbbf24]/70" />
        </div>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,rgba(62,74,180,0.10),transparent_68%)]" />
        <ExploreUniverseSection />
        <InteractiveProductSimulation />
        <DiscoveryBento topicsList={allTopics} />
        <KnowledgeArchitecture />
        <div className="pb-16"><UniverseCTA /></div>
      </div>
    </div>
  );
}
