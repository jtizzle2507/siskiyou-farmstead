import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#f5f1eb]" style={{ borderTop: '1px solid #e8e4dc' }}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-3 text-[#2d2d2d] font-serif">Siskiyou Farmstead</h3>
            <p className="text-[#777] text-sm leading-relaxed">
              Your local source for fresh, sustainably grown greens and gourmet mushrooms in beautiful Siskiyou County.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#5a7c65] mb-4 font-sans">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/newsletter', label: 'Newsletter' },
                { href: '/about', label: 'About' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#777] hover:text-[#5a7c65] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#5a7c65] mb-4 font-sans">Contact</h4>
            <div className="space-y-2 text-sm text-[#777]">
              <p>Siskiyou County, California</p>
              <p>Sunday pickup in Yreka</p>
            </div>
            <a
              href="https://www.facebook.com/siskiyoufarmstead/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-[#777] hover:text-[#5a7c65] transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#e8e4dc]">
        <div className="container mx-auto px-6 py-5">
          <p className="text-center text-xs text-[#999] tracking-wide">&copy; 2026 Siskiyou Farmstead. Locally grown in Siskiyou County.</p>
        </div>
      </div>
    </footer>
  );
}
