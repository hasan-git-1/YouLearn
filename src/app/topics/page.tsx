import type { Metadata } from 'next';
import { TopicUniverse } from '@/components/topics/TopicUniverse';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore All Topics — Tubiq',
  description:
    'Browse all indexed learning topics on Tubiq. Courses, videos, podcasts, and creators — curated from YouTube.',
};

export default async function TopicsPage() {
  return <main className="px-4 py-12" style={{ maxWidth: 1280, margin: '0 auto' }}><TopicUniverse title="Explore Learning Topics" description="Ten curated paths for focused, practical learning." /></main>;
}
