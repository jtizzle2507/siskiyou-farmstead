'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '../AdminGuard';
import { adminApi } from '@/lib/admin-api';
import type { Subscriber } from '@/lib/types';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [adding, setAdding] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<{ added: number; skipped: number; invalid: number } | null>(null);

  useEffect(() => { fetchSubscribers(); }, []);

  const fetchSubscribers = async () => {
    try {
      const result = await adminApi('getSubscribers', {});
      if (result.success && Array.isArray(result.data)) setSubscribers(result.data);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    if (subscribers.some(s => s.email.toLowerCase() === email)) {
      alert('This email is already subscribed.');
      return;
    }

    setAdding(true);
    try {
      const result = await adminApi('addSubscriber', { email });
      const newSub = Array.isArray(result.data) ? result.data[0] : result.data;
      setSubscribers(prev => [newSub, ...prev]);
      setNewEmail('');
      setShowForm(false);
    } catch (err) {
      alert('Failed to add subscriber: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAdding(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const lines = bulkEmails.split(/[\n,;]+/).map(l => l.trim().toLowerCase()).filter(Boolean);
    const unique = [...new Set(lines)];
    const existing = new Set(subscribers.map(s => s.email.toLowerCase()));

    const valid: string[] = [];
    let skipped = 0;
    let invalid = 0;

    for (const email of unique) {
      if (!emailRegex.test(email)) { invalid++; continue; }
      if (existing.has(email)) { skipped++; continue; }
      valid.push(email);
    }

    if (valid.length === 0) {
      setBulkStatus({ added: 0, skipped, invalid });
      return;
    }

    setAdding(true);
    let added = 0;
    for (const email of valid) {
      try {
        const result = await adminApi('addSubscriber', { email });
        const newSub = Array.isArray(result.data) ? result.data[0] : result.data;
        setSubscribers(prev => [newSub, ...prev]);
        added++;
      } catch {
        skipped++;
      }
    }
    setAdding(false);
    setBulkStatus({ added, skipped, invalid });
    setBulkEmails('');
  };

  const handleToggle = async (id: string) => {
    try {
      const sub = subscribers.find(s => s.id === id);
      await adminApi('toggleSubscriber', { id, active: !sub?.active });
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    } catch (err) {
      alert('Failed to update subscriber: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber? This cannot be undone.')) return;
    try {
      await adminApi('deleteSubscriber', { id });
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete subscriber: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) return <AdminGuard activeTab="subscribers"><div className="text-center py-12 text-gray-500">Loading subscribers...</div></AdminGuard>;

  const activeCount = subscribers.filter(s => s.active).length;

  return (
    <AdminGuard activeTab="subscribers">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
          <p className="text-sm text-gray-600 mt-1">{subscribers.length} total &middot; {activeCount} active</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowBulk(!showBulk); setShowForm(false); setBulkStatus(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showBulk ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            {showBulk ? 'Cancel' : 'Bulk Import'}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setShowBulk(false); setBulkStatus(null); }}
            className="btn-primary text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancel' : '+ Add Email'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Add Subscriber</h3>
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 border rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="btn-primary text-white px-6 py-2 rounded-lg whitespace-nowrap"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>
      )}

      {showBulk && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold mb-2">Bulk Import</h3>
          <p className="text-sm text-gray-500 mb-4">Paste emails below — one per line, or separated by commas.</p>
          <form onSubmit={handleBulkAdd} className="space-y-3">
            <textarea
              value={bulkEmails}
              onChange={(e) => { setBulkEmails(e.target.value); setBulkStatus(null); }}
              rows={8}
              placeholder={"john@example.com\njane@example.com\nfarm-lover@email.com"}
              className="w-full border rounded px-3 py-2 resize-vertical font-mono text-sm"
              required
            />
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={adding}
                className="btn-primary text-white px-6 py-2 rounded-lg"
              >
                {adding ? 'Importing...' : 'Import All'}
              </button>
              {bulkStatus && (
                <p className="text-sm text-gray-600">
                  <span className="text-green-700 font-medium">{bulkStatus.added} added</span>
                  {bulkStatus.skipped > 0 && <span> &middot; {bulkStatus.skipped} skipped (duplicate)</span>}
                  {bulkStatus.invalid > 0 && <span> &middot; <span className="text-red-600">{bulkStatus.invalid} invalid</span></span>}
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date Subscribed</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No subscribers yet.</td></tr>
            ) : subscribers.map(sub => (
              <tr key={sub.id} className="border-t">
                <td className="px-4 py-3">{sub.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${sub.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {sub.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleToggle(sub.id)} className="text-gray-600 hover:text-gray-800 text-sm">
                      {sub.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
