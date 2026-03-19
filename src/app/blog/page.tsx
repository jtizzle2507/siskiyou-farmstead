import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabase } from '@/lib/supabase-server';
import type { BlogPost } from '@/lib/types';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Stories, updates, and seasonal notes from Siskiyou Farmstead. Read about life on the farm in Siskiyou County.',
};

export default async function BlogPage() {
  const supabase = createServerSupabase();

  let posts: BlogPost[] = [];
  try {
    const { data } = await supabase
      .from('farm_blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (data) posts = data;
  } catch { /* fallback */ }

  return (
    <Providers>
      <Header />
      <main className="flex-1 min-h-screen bg-[#faf8f4]">
        <div className="container mx-auto px-4 py-12">
          <h1 className="section-heading text-4xl font-bold mb-3 text-center">From the Farm</h1>
          <p className="text-center text-[#777] mb-10 text-lg">Stories, updates, and seasonal notes from Siskiyou Farmstead.</p>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#999] text-lg mb-2">No posts yet.</p>
              <p className="text-[#bbb] text-sm">Check back soon for farm updates and stories.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="product-card rounded-xl overflow-hidden cursor-pointer block">
                  {post.image_url && (
                    <div className="w-full h-48 overflow-hidden relative">
                      <Image src={post.image_url} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-[#5a7c65] font-semibold uppercase tracking-wider mb-2 font-sans">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </p>
                    <h3 className="font-bold text-lg text-[#2d2d2d] mb-2 font-serif">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-[#777] text-sm leading-relaxed">{post.excerpt}</p>
                    )}
                    <span className="inline-block mt-3 text-[#5a7c65] text-sm font-medium hover:underline">Read more &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
