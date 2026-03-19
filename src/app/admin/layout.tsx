import type { Metadata } from 'next';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
