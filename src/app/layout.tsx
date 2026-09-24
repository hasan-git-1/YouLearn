import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { AuthModal } from '@/components/auth/AuthModal';

// Loaded via next/font — avoids the Tailwind v4 @import ordering issue
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'YouLearn — AI-Guided Knowledge Discovery',
    template: '%s | YouLearn',
  },
  description:
    'Discover the best YouTube courses, podcasts, videos, and creators for any topic. AI-organized, expertly curated learning paths.',
  keywords: ['learn', 'youtube courses', 'online learning', 'AI learning', 'educational videos'],
  authors: [{ name: 'YouLearn' }],
  creator: 'YouLearn',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://youlearn.app',
    siteName: 'YouLearn',
    title: 'YouLearn — AI-Guided Knowledge Discovery',
    description: 'Discover the best YouTube content for any learning goal.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouLearn — AI-Guided Knowledge Discovery',
    description: 'Discover the best YouTube content for any learning goal.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body>
        <AuthProvider>
          <ProgressProvider>
            <Navbar />
            <main>{children}</main>
            <AuthModal />
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
