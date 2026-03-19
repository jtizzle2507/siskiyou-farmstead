'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HASH_MAP: Record<string, string> = {
  'home': '/',
  'shop': '/shop',
  'about': '/about',
  'blog': '/blog',
  'contact': '/contact',
  'newsletter': '/newsletter',
  'cart': '/cart',
  'checkout': '/checkout',
  'order-confirmation': '/order-confirmation',
  'admin': '/admin',
  'admin-dashboard': '/admin/products',
  'admin-products': '/admin/products',
  'admin-orders': '/admin/orders',
  'admin-delivery': '/admin/delivery',
  'admin-blog': '/admin/blog',
  'admin-subscribers': '/admin/subscribers',
  'admin-users': '/admin/users',
};

export default function HashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash) return;

    // Check static map first
    if (HASH_MAP[hash]) {
      router.replace(HASH_MAP[hash]);
      return;
    }

    // Check for blog post slugs (blog-<slug> -> /blog/<slug>)
    if (hash.startsWith('blog-')) {
      const slug = hash.replace('blog-', '');
      router.replace(`/blog/${slug}`);
    }
  }, [router]);

  return null;
}
