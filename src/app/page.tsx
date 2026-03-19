import { createServerSupabase } from '@/lib/supabase-server';
import { DEFAULT_ZONES, DEFAULT_DELIVERY_INFO } from '@/lib/constants';
import type { Product, DeliveryZone, DeliveryInfoCard } from '@/lib/types';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  const supabase = createServerSupabase();

  let products: Product[] = [];
  let zones: Record<string, DeliveryZone> = DEFAULT_ZONES;
  let infoCards: DeliveryInfoCard[] = DEFAULT_DELIVERY_INFO;

  try {
    const { data } = await supabase.from('farm_products').select('*').order('inventory', { ascending: false }).order('created_at', { ascending: true });
    if (data && data.length > 0) products = data;
  } catch { /* fallback to empty */ }

  try {
    const { data } = await supabase.from('farm_delivery_zones').select('*').order('created_at', { ascending: true });
    if (data && data.length > 0) {
      zones = {};
      data.forEach((z: { key: string; name: string; day: string; fee: number }) => {
        zones[z.key] = { name: z.name, day: z.day, fee: z.fee };
      });
    }
  } catch { /* fallback */ }

  try {
    const { data } = await supabase.from('farm_delivery_info').select('*').order('sort_order', { ascending: true });
    if (data && data.length > 0) {
      infoCards = data.map((c: { id: string; icon: string; title: string; description: string }) => ({
        id: c.id, icon: c.icon, title: c.title, description: c.description,
      }));
    }
  } catch { /* fallback */ }

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Siskiyou Farmstead',
    description: 'Fresh greens and gourmet mushrooms grown locally in Siskiyou County, California.',
    url: 'https://siskiyoufarmstead.com',
    image: 'https://siskiyoufarmstead.com/hero.jpg',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'CA',
      addressLocality: 'Siskiyou County',
    },
    areaServed: 'Siskiyou County, California',
    priceRange: '$',
  };

  return (
    <Providers initialProducts={products} initialZones={zones} initialInfoCards={infoCards}>
      <JsonLd data={localBusinessJsonLd} />
      <Header />
      <main className="flex-1">
        <HomePageClient products={products} zones={zones} infoCards={infoCards} />
      </main>
      <Footer />
    </Providers>
  );
}
