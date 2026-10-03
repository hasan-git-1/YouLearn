import type { Metadata } from 'next';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { HomeClient } from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tubiq — AI-Guided Knowledge Discovery',
  description:
    'Discover the best YouTube courses, podcasts, and creators for any learning goal. AI-organized, quota-safe, always grounded in real content.',
};

export default async function HomePage() {
  // Fetch seeded topics from DB — fast Postgres read, no external API calls
  let allTopics: { id: string; name: string; slug: string }[] = [];
  try {
    allTopics = await db.select({ id: topics.id, name: topics.name, slug: topics.slug }).from(topics);
  } catch {
    allTopics = [];
  }

  return <HomeClient allTopics={allTopics} />;
}
