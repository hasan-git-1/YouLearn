import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { TOPICS } from '@/config/topics';
import { Magnetic, StaggerGrid, TiltSurface } from '@/lib/motion';

export function ExploreUniverseSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-20" id="explore">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono text-indigo-300"><Compass size={13} /> 02 · EXPLORE TUBIQ</div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>YOUR LEARNING UNIVERSE AWAITS</h2>
          <p className="mt-2 max-w-xl text-sm text-gray-400">Choose from ten focused technology learning paths.</p>
        </div>
        <Link href="/topics" className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white transition-all hover:border-indigo-500/40"><span>View all 10 topics</span><ArrowRight size={13} /></Link>
      </div>
      <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" delayStep={0.055}>
        {TOPICS.map((topic) => (
          <TiltSurface key={topic.slug} className="h-full">
            <Link href={`/topics/${topic.slug}`} className="block h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-indigo-500/50 hover:bg-white/[0.07]">
              <h3 className="font-bold text-white">{topic.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">{topic.description}</p>
              <Magnetic className="mt-4 inline-block">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300">Explore <ArrowRight size={12} /></span>
              </Magnetic>
            </Link>
          </TiltSurface>
        ))}
      </StaggerGrid>
    </section>
  );
}
