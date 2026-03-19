import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterPageClient from './NewsletterPageClient';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Sign up for the Siskiyou Farmstead newsletter. Get harvest updates, seasonal specials, and delivery schedule changes.',
};

export default function NewsletterPage() {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        <NewsletterPageClient />
      </main>
      <Footer />
    </Providers>
  );
}
