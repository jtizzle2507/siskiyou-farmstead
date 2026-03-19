'use client';

import { useState } from 'react';
import AdminGuard from '../AdminGuard';
import { useDelivery } from '@/contexts/DeliveryContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminDeliveryPage() {
  const { zones, addZone, deleteZone, infoCards, addInfoCard, updateInfoCard, deleteInfoCard } = useDelivery();
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState({ key: '', name: '', day: 'Monday', fee: '2' });
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({ icon: '', title: '', description: '' });

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = editingZone || zoneForm.key.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    addZone(key, { name: zoneForm.name, day: zoneForm.day, fee: parseFloat(zoneForm.fee) });
    setZoneForm({ key: '', name: '', day: 'Monday', fee: '2' });
    setShowZoneForm(false);
    setEditingZone(null);
  };

  const handleEditZone = (key: string, zone: { name: string; day: string; fee: number }) => {
    setEditingZone(key);
    setZoneForm({ key, name: zone.name, day: zone.day, fee: String(zone.fee) });
    setShowZoneForm(true);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      updateInfoCard(editingCard, cardForm);
    } else {
      addInfoCard(cardForm);
    }
    setCardForm({ icon: '', title: '', description: '' });
    setShowCardForm(false);
    setEditingCard(null);
  };

  const handleEditCard = (card: { id: string; icon: string; title: string; description: string }) => {
    setEditingCard(card.id);
    setCardForm({ icon: card.icon, title: card.title, description: card.description });
    setShowCardForm(true);
  };

  return (
    <AdminGuard activeTab="delivery">
      <div className="space-y-8">
        {/* Delivery Zones */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Delivery Zones</h2>
            <button onClick={() => { setShowZoneForm(!showZoneForm); setEditingZone(null); setZoneForm({ key: '', name: '', day: 'Monday', fee: '2' }); }}
              className="btn-primary text-white px-4 py-2 rounded-lg">{showZoneForm ? 'Cancel' : '+ Add Zone'}</button>
          </div>

          {showZoneForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">{editingZone ? 'Edit Zone' : 'Add New Zone'}</h3>
              <form onSubmit={handleZoneSubmit} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Zone Name</label>
                  <input type="text" placeholder="e.g., Hilt / Hornbrook" value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Day</label>
                  <select value={zoneForm.day} onChange={(e) => setZoneForm({ ...zoneForm, day: e.target.value })} className="w-full border rounded px-3 py-2">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Fee ($)</label>
                  <input type="number" step="0.01" min="0" value={zoneForm.fee}
                    onChange={(e) => setZoneForm({ ...zoneForm, fee: e.target.value })} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primary text-white px-6 py-2 rounded-lg">{editingZone ? 'Update Zone' : 'Add Zone'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Zone Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Day</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(zones).map(([key, zone]) => (
                  <tr key={key} className="border-t">
                    <td className="px-4 py-3">{zone.name}</td>
                    <td className="px-4 py-3">{zone.day}</td>
                    <td className="px-4 py-3">${zone.fee.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditZone(key, zone)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        <button onClick={() => { if (confirm('Delete this zone?')) deleteZone(key); }} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Delivery Info Cards</h2>
            <button onClick={() => { setShowCardForm(!showCardForm); setEditingCard(null); setCardForm({ icon: '', title: '', description: '' }); }}
              className="btn-primary text-white px-4 py-2 rounded-lg">{showCardForm ? 'Cancel' : '+ Add Card'}</button>
          </div>

          {showCardForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">{editingCard ? 'Edit Card' : 'Add New Card'}</h3>
              <form onSubmit={handleCardSubmit} className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
                  <input type="text" value={cardForm.icon} onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                    className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input type="text" value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                    className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input type="text" value={cardForm.description} onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                    className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <button type="submit" className="btn-primary text-white px-6 py-2 rounded-lg">{editingCard ? 'Update Card' : 'Add Card'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Icon</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {infoCards.map(card => (
                  <tr key={card.id} className="border-t">
                    <td className="px-4 py-3 text-2xl">{card.icon}</td>
                    <td className="px-4 py-3">{card.title}</td>
                    <td className="px-4 py-3">{card.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditCard(card)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        <button onClick={() => { if (confirm('Delete this card?')) deleteInfoCard(card.id); }} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
