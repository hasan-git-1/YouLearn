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
    <div className="min-h-screen overflow-hidden bg-[#04060d] text-white">
      <section className="relative isolate min-h-[min(860px,100svh)] overflow-hidden border-b border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-20"
          aria-hidden="true"
        >
          <KnowledgeUniverseCanvas />
        </motion.div>

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_80%_24%,rgba(69,85,210,0.20),transparent_70%),radial-gradient(ellipse_48%_55%_at_26%_78%,rgba(117,63,198,0.14),transparent_74%),linear-gradient(118deg,rgba(4,6,13,0.6)_0%,rgba(4,6,13,0.24)_56%,rgba(4,6,13,0.65)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(160,174,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(160,174,255,.16)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

        <FloatingTopicSignals />
        <div className="pointer-events-none absolute inset-0 z-10 mx-auto hidden max-w-[1600px] xl:block">
          <FloatingEcosystemCards />
        </div>

        <div className="relative z-20 mx-auto flex min-h-[min(860px,100svh)] max-w-7xl items-center px-6 pb-24 pt-28 sm:px-10 lg:px-12">
          <div className="w-full max-w-[42rem]">
            <HeroHeadline />
            <CommandSearch />
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400 sm:flex">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-300/70" />
          Explore Tubiq
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-300/70" />
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
