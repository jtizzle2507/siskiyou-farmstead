'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function NewsletterPageClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Welcome aboard! Check your inbox for a welcome email.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Hero area */}
      <div className="relative text-white" style={{ minHeight: '350px' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/newsletter-bg.jpg" alt="Siskiyou Farmstead" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(30,25,18,0.25) 0%, rgba(30,25,18,0.45) 100%)' }} />
        </div>
        <div className="relative container mx-auto px-4 text-center flex flex-col items-center justify-center" style={{ minHeight: '350px' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg font-serif">
            Stay Connected with the Farm
          </h1>
          <p className="text-white text-lg opacity-90 max-w-xl mx-auto drop-shadow font-sans">
            Join our community and never miss a harvest update, seasonal special, or delivery schedule change.
          </p>
        </div>
      </div>

      {/* Signup Form */}
      <div className="container mx-auto px-4 mt-10">
        <div className="max-w-lg mx-auto bg-[#fdfcfa] rounded-2xl shadow-lg p-8 md:p-10" style={{ border: '1px solid #e8e4dc' }}>
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4 text-[#5a7c65]">&#10003;</div>
              <h2 className="text-2xl font-bold mb-2 text-[#2d2d2d] font-serif">{message}</h2>
              <p className="text-[#777] text-sm">You&apos;re all set. We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-center text-[#2d2d2d] font-serif">
                Sign Up for Updates
              </h2>
              <p className="text-[#777] text-center text-sm mb-6">
                Enter your email below and we&apos;ll keep you in the loop.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#e8e4dc] bg-[#faf8f4] text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#5a7c65] focus:border-transparent placeholder-[#bbb]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-primary text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {status === 'loading' ? 'Signing up...' : 'Subscribe'}
                </button>
              </form>
              {status === 'error' && (
                <p className="text-red-600 mt-3 text-sm text-center">{message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* What to Expect */}
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h3 className="text-2xl font-bold text-center mb-8 text-[#2d2d2d] font-serif">
          What You&apos;ll Receive
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-5 bg-[#fdfcfa] rounded-xl" style={{ border: '1px solid #d4e0d8' }}>
            <div className="text-3xl mb-3">&#127793;</div>
            <h4 className="font-bold text-sm mb-1 text-[#2d2d2d] font-serif">Harvest Updates</h4>
            <p className="text-[#777] text-xs">Know exactly what&apos;s fresh and in season each week.</p>
          </div>
          <div className="text-center p-5 bg-[#fdfcfa] rounded-xl" style={{ border: '1px solid #d4e0d8' }}>
            <div className="text-3xl mb-3">&#11088;</div>
            <h4 className="font-bold text-sm mb-1 text-[#2d2d2d] font-serif">Seasonal Specials</h4>
            <p className="text-[#777] text-xs">Exclusive offers and limited-time products just for subscribers.</p>
          </div>
          <div className="text-center p-5 bg-[#fdfcfa] rounded-xl" style={{ border: '1px solid #d4e0d8' }}>
            <div className="text-3xl mb-3">&#128666;</div>
            <h4 className="font-bold text-sm mb-1 text-[#2d2d2d] font-serif">Delivery Changes</h4>
            <p className="text-[#777] text-xs">Stay informed about schedule updates and new delivery zones.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
