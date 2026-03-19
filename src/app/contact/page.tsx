import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Siskiyou Farmstead. Questions about delivery, products, or special requests? We\'d love to hear from you.',
};

export default function ContactPage() {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        <ContactPageClient />
      </main>
      <Footer />
    </Providers>
  );
}
