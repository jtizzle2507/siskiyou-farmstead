import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Siskiyou Farmstead — your local source for fresh, sustainably grown greens and gourmet mushrooms in Siskiyou County, California.',
};

export default function AboutPage() {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-[#2d2d2d] font-serif">About Siskiyou Farmstead</h1>
            <div className="prose prose-lg">
              <p className="text-[#555] mb-5 leading-relaxed text-lg">
                Welcome to Siskiyou Farmstead, your local source for fresh, sustainably grown greens and gourmet mushrooms in Siskiyou County.
              </p>
              <p className="text-[#555] mb-5 leading-relaxed">
                We&apos;re passionate about providing our community with the freshest, highest-quality produce grown right here in the beautiful Siskiyou region. Our mission is to make healthy, locally-sourced food accessible and convenient for everyone.
              </p>
              <h2 className="text-2xl font-bold mt-10 mb-4 text-[#2d2d2d] font-serif">What We Offer</h2>
              <ul className="list-none pl-0 text-[#555] space-y-3">
                <li className="flex items-start"><span className="text-[#5a7c65] mr-3 mt-0.5">&bull;</span>Fresh cultivated mushrooms</li>
                <li className="flex items-start"><span className="text-[#5a7c65] mr-3 mt-0.5">&bull;</span>Seasonal greens and leafy vegetables</li>
                <li className="flex items-start"><span className="text-[#5a7c65] mr-3 mt-0.5">&bull;</span>Fresh and dried herbs</li>
                <li className="flex items-start"><span className="text-[#5a7c65] mr-3 mt-0.5">&bull;</span>Coming soon: lavender products, root vegetables, and more!</li>
              </ul>
              <h2 className="text-2xl font-bold mt-10 mb-4 text-[#2d2d2d] font-serif">Delivery & Pickup</h2>
              <p className="text-[#555] mb-5 leading-relaxed">
                We deliver throughout Siskiyou County with a rotating schedule to serve different communities each day. Sunday pickups are available at our Yreka location, where cash payment is also accepted.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
