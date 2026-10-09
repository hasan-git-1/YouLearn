import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { TOPICS, type TopicDefinition } from '@/config/topics';

interface TopicUniverseProps {
  topics?: readonly TopicDefinition[];
  title?: string;
  description?: string;
}

export function TopicUniverse({
  topics = TOPICS,
  title = 'YOUR LEARNING UNIVERSE',
  description = 'Explore one of our ten focused learning paths.',
}: TopicUniverseProps) {
  return (
    <section className="mt-10" aria-labelledby="topic-universe-title">
      <div className="mb-6">
        <h2 id="topic-universe-title" className="font-bold text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Link key={topic.slug} href={`/topics/${topic.slug}`} className="glass-card group block p-5 transition-transform hover:-translate-y-1">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{topic.name}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{topic.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--brand-primary)' }}>What you&apos;ll learn</p>
            <ul className="mt-2 space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              {topic.learn.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={13} className="mt-0.5 shrink-0" />{item}</li>)}
            </ul>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>Explore topic <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
