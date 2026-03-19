'use client';

import { useState } from 'react';

export default function ContactPageClient() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setStatusMessage('Message sent! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="py-16" style={{ backgroundColor: '#faf8f4' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-3 text-[#2d2d2d] text-center font-serif">Contact Us</h1>
          <p className="text-center text-[#555] mb-10 text-lg">Have a question or special request? We&apos;d love to hear from you.</p>

          {status === 'success' ? (
            <div className="bg-[#fdfcfa] rounded-xl p-10 text-center" style={{ border: '1px solid #d4e0d8' }}>
              <div className="text-4xl mb-4" style={{ color: '#5a7c65' }}>&#10003;</div>
              <h2 className="text-2xl font-bold mb-3 text-[#2d2d2d] font-serif">Message Sent!</h2>
              <p className="text-[#555]">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#fdfcfa] rounded-xl p-8" style={{ border: '1px solid #e8e4dc' }}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#2d2d2d]">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#5a7c65]"
                    style={{ borderColor: '#e8e4dc', backgroundColor: '#faf8f4' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#2d2d2d]">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#5a7c65]"
                    style={{ borderColor: '#e8e4dc', backgroundColor: '#faf8f4' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#2d2d2d]">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full border rounded-lg px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#5a7c65] resize-vertical"
                    style={{ borderColor: '#e8e4dc', backgroundColor: '#faf8f4' }}
                    required
                  />
                </div>
                {status === 'error' && (
                  <p className="text-red-600 text-sm">{statusMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-primary text-white py-3 rounded-lg font-semibold text-base tracking-wide"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-[#555] mb-2">You can also reach us directly at</p>
            <a href="mailto:hello@siskiyoufarmstead.com" className="text-[#5a7c65] font-medium text-lg hover:underline">hello@siskiyoufarmstead.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
