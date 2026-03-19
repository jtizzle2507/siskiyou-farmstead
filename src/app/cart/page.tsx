import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        <CartPageClient />
      </main>
      <Footer />
    </Providers>
  );
}
