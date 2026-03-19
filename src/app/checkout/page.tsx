import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutPageClient from './CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        <CheckoutPageClient />
      </main>
      <Footer />
    </Providers>
  );
}
