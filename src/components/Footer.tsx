import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#f5f1eb]" style={{ borderTop: '1px solid #e8e4dc' }}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-3 text-[#2d2d2d] font-serif">Siskiyou Farmstead</h3>
            <p className="text-[#777] text-sm leading-relaxed">
              Your local source for fresh, sustainably grown greens and gourmet mushrooms in beautiful Siskiyou County. Farm-fresh, delivered to your door.
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
