'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/newsletter', label: 'Newsletter' },
  ];

  return (
    <header className="bg-[#fdfcfa] sticky top-0 z-50" style={{ borderBottom: '1px solid #e8e4dc' }}>
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="Siskiyou Farmstead" width={56} height={56} className="w-14 h-14" />
          </Link>
          <nav className="hidden md:flex space-x-10">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>
            ))}
          </nav>
          <div className="flex items-center space-x-5">
            <Link href="/cart" className="relative p-2 hover:bg-[#faf8f4] rounded-lg transition-colors">
              <svg className="w-6 h-6 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5a7c65] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/admin" className="nav-link text-[#999] hover:text-[#555]">Admin</Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#faf8f4] rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[#fdfcfa]" style={{ borderTop: '1px solid #e8e4dc' }}>
          <div className="flex flex-col">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-left w-full px-6 py-3 hover:bg-[#faf8f4]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
