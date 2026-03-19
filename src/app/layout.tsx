import type { Metadata } from 'next';
import { Inter, Gentium_Book_Plus } from 'next/font/google';
import './globals.css';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import HashRedirect from '@/components/HashRedirect';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const gentium = Gentium_Book_Plus({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-gentium',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Greens & Mushrooms`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: `${SITE_NAME} - Greens & Mushrooms`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: '/hero.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Greens & Mushrooms`,
    description: SITE_DESCRIPTION,
    images: ['/hero.jpg'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${gentium.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#faf8f4]">
        <HashRedirect />
        {children}
      </body>
    </html>
  );
}
