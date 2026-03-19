import type { MetadataRoute } from 'next';
import { createServerSupabase } from '@/lib/supabase-server';
import { SITE_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabase();

  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${SITE_URL}/newsletter`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await supabase
      .from('farm_blog_posts')
      .select('slug, published_at, updated_at')
      .eq('published', true);

    if (posts) {
      blogPages = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Continue without blog pages
  }

  return [...staticPages, ...blogPages];
}
