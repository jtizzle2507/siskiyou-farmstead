import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { SITE_URL } from '@/lib/constants';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data: post } = await supabase
    .from('farm_blog_posts')
    .select('title, excerpt, image_url')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt || `Read "${post.title}" on Siskiyou Farmstead blog.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read "${post.title}" on Siskiyou Farmstead blog.`,
      images: post.image_url ? [{ url: post.image_url }] : [{ url: '/hero.jpg' }],
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data: post } = await supabase
    .from('farm_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) notFound();

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.image_url || `${SITE_URL}/hero.jpg`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: 'Siskiyou Farmstead' },
    publisher: {
      '@type': 'Organization',
      name: 'Siskiyou Farmstead',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    url: `${SITE_URL}/blog/${post.slug}`,
  };

  const isHtml = post.content && post.content.includes('<');
  const imagePos = post.image_position as { x: number; y: number } | null;

  return (
    <Providers>
      <JsonLd data={blogPostingJsonLd} />
      <Header />
      <main className="flex-1 min-h-screen bg-[#faf8f4]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="text-[#5a7c65] text-sm font-medium mb-8 inline-block hover:underline">
              &larr; Back to Blog
            </Link>

            <article>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2d2d2d] font-serif">
                {post.title}
              </h1>
              <p className="text-[#5a7c65] text-sm font-semibold uppercase tracking-wider mb-8 font-sans">
                {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </p>

              {post.image_url && (
                <div className="w-full rounded-xl overflow-hidden mb-10 relative" style={{ maxHeight: '500px', aspectRatio: '16/9' }}>
                  <Image
                    src={post.image_url} alt={post.title} fill className="object-cover"
                    style={{ objectPosition: imagePos ? `${imagePos.x}% ${imagePos.y}%` : '50% 50%' }}
                    sizes="(max-width: 768px) 100vw, 768px" priority
                  />
                </div>
              )}

              {isHtml ? (
                <div
                  className="prose prose-lg prose-headings:font-serif prose-headings:text-[#2d2d2d] prose-p:text-[#555] prose-p:leading-relaxed prose-a:text-[#5a7c65] prose-a:underline prose-img:rounded-lg prose-img:mx-auto prose-blockquote:border-l-[#5a7c65] prose-blockquote:text-[#777] max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <div className="prose prose-lg">
                  {post.content.split('\n').filter((p: string) => p.trim()).map((paragraph: string, i: number) => (
                    <p key={i} className="text-[#555] leading-relaxed mb-5 text-lg">{paragraph}</p>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
