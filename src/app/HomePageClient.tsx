'use client';

import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import type { Product, DeliveryZone, DeliveryInfoCard } from '@/lib/types';

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export default function HomePageClient({
  products, zones, infoCards,
}: {
  products: Product[];
  zones: Record<string, DeliveryZone>;
  infoCards: DeliveryInfoCard[];
}) {
  const featuredProducts = products
    .filter(p => p.active)
    .sort((a, b) => (b.inventory > 0 ? 1 : 0) - (a.inventory > 0 ? 1 : 0))
    .slice(0, 3);
  const gridCols = GRID_COLS[Math.min(infoCards.length, 4)] || 'grid-cols-3';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative text-white" style={{ minHeight: '600px' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/hero.jpg" alt="Mount Shasta at sunset with farmland" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(30,25,18,0.15) 0%, rgba(30,25,18,0.30) 100%)' }} />
        </div>
        <div className="relative container mx-auto px-4 text-center flex flex-col items-center justify-center" style={{ minHeight: '600px' }}>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 drop-shadow-lg text-white font-serif" style={{ letterSpacing: '0.02em' }}>Siskiyou Farmstead</h1>
          <p className="text-xl md:text-2xl mb-2 drop-shadow font-light font-sans">Fresh Greens & Mushrooms</p>
          <p className="text-base opacity-80 mb-10 drop-shadow font-sans" style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Locally grown in Siskiyou County</p>
          <Link href="/shop" className="btn-primary text-white px-10 py-3.5 rounded-lg text-base font-semibold tracking-wide font-sans">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 bg-[#fdfcfa]">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-3xl font-bold text-center mb-10">Featured Products</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="btn-primary text-white px-8 py-3 rounded-lg font-semibold">
              View All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-[#faf8f4] py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-heading text-3xl font-bold text-center mb-10">Pickup Schedule</h2>
          <div className={`grid md:${gridCols} gap-6 max-w-4xl mx-auto`}>
            {infoCards.map(card => (
              <div key={card.id} className="text-center p-6 bg-[#fdfcfa] rounded-xl" style={{ border: '1px solid #d4e0d8' }}>
                <div className="text-4xl mb-3">{card.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-[#2d2d2d] font-serif">{card.title}</h3>
                <p className="text-[#777] text-sm">{card.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 max-w-2xl mx-auto bg-[#fdfcfa] p-6 rounded-xl" style={{ border: '1px solid #e8e4dc' }}>
            <h3 className="font-bold text-lg mb-4 text-center text-[#2d2d2d] font-serif">Weekly Delivery Days</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(zones).map(([key, zone]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="font-medium text-[#5a7c65]">{zone.day}:</span>
                  <span className="text-[#555]">{zone.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter CTA Banner */}
      <div className="py-16" style={{ background: 'linear-gradient(135deg, #5a7c65 0%, #4a6b55 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3 font-serif">Join Our Newsletter</h2>
          <p className="text-white text-lg mb-8 opacity-90 font-sans">
            Get harvest updates, seasonal specials, and delivery schedule changes delivered to your inbox.
          </p>
          <Link href="/newsletter" className="bg-white text-[#5a7c65] px-8 py-3 rounded-lg font-semibold hover:bg-[#faf8f4] transition-all font-sans">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
