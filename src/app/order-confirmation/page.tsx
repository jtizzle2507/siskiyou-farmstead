import type { Metadata } from 'next';
import Link from 'next/link';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto bg-[#fdfcfa] rounded-2xl p-10" style={{ border: '1px solid #e8e4dc', boxShadow: '0 8px 32px rgba(139,115,85,0.08)' }}>
            <div className="text-6xl mb-4 text-[#5a7c65]">&#10003;</div>
            <h1 className="text-3xl font-bold mb-4 text-[#5a7c65] font-serif">Order Confirmed!</h1>
            <p className="text-[#777] mb-8">
              Thank you for your order. You will receive a confirmation email shortly with your order details and delivery information.
            </p>
            <div className="space-x-4">
              <Link href="/" className="btn-primary text-white px-6 py-3 rounded-lg inline-block">
                Return to Home
              </Link>
              <Link href="/shop" className="bg-[#fdfcfa] border-2 border-[#5a7c65] text-[#5a7c65] px-6 py-3 rounded-lg hover:bg-[#f0f5f1] transition-colors inline-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
