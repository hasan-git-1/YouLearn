import type { Metadata } from 'next';
import { HomeClient } from '@/components/home/HomeClient';

export const metadata: Metadata = {
  title: 'Tubiq — AI-Guided Knowledge Discovery',
  description:
    'Discover the best YouTube courses, podcasts, and creators for any learning goal. AI-organized, quota-safe, always grounded in real content.',
};

export default function HomePage() {
  return <HomeClient />;
}
