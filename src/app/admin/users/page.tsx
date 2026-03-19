'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '../AdminGuard';
import { adminApi } from '@/lib/admin-api';
import type { AdminUser } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'staff' });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await adminApi('getUsers', {});
        if (result.success && Array.isArray(result.data)) {
          setUsers(result.data.map((u: { id: string; username: string; role: string }) => ({
            id: u.id, username: u.username, role: u.role,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch admin users:', err);
      }
    }
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await adminApi('addUser', formData);
      const newUser = Array.isArray(result.data) ? result.data[0] : result.data;
      setUsers(prev => [...prev, { id: newUser.id, username: newUser.username, role: newUser.role }]);
    } catch (err) {
      console.error('Failed to add user:', err);
      setUsers(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setFormData({ username: '', password: '', role: 'staff' });
    setShowForm(false);
  };

  const deleteUser = async (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    try {
      await adminApi('deleteUser', { id });
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <AdminGuard activeTab="users">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Users</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-white px-4 py-2 rounded-lg">
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <button type="submit" className="btn-primary text-white px-6 py-2 rounded-lg">Add User</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t bg-gray-50">
              <td className="px-4 py-3">admin</td>
              <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Owner</span></td>
              <td className="px-4 py-3 text-gray-500 text-sm">Default user</td>
            </tr>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => { if (confirm('Delete this user?')) deleteUser(user.id); }}
                    className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
