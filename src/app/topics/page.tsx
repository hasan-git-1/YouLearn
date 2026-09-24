import type { Metadata } from 'next';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { TopicsClient } from './TopicsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore All Topics — Tubiq',
  description:
    'Browse all indexed learning topics on Tubiq. Courses, videos, podcasts, and creators — curated from YouTube.',
};

export default async function TopicsPage() {
  let allTopics: { id: string; name: string; slug: string; description: string | null }[] = [];
  try {
    allTopics = await db
      .select({ id: topics.id, name: topics.name, slug: topics.slug, description: topics.description })
      .from(topics)
      .orderBy(asc(topics.name));
  } catch {
    allTopics = [];
  }

  return <TopicsClient topics={allTopics} />;
}
