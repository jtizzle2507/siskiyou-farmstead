'use client';

import { useState } from 'react';
import Image from 'next/image';
import AdminGuard from '../AdminGuard';
import { useProducts } from '@/contexts/ProductContext';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', category: 'mushrooms', size: '', price: '', inventory: '', active: true, image_url: '',
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imagePreview) return formData.image_url || '';
    setUploading(true);
    try {
      const base64 = imagePreview.split(',')[1];
      const match = imagePreview.match(/data:([^;]+);/);
      const contentType = match ? match[1] : 'image/jpeg';
      const ext = contentType.split('/')[1] || 'jpg';
      const res = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, fileName: `product.${ext}`, contentType }),
      });
      const data = await res.json();
      if (data.success) return data.url;
      throw new Error(data.error);
    } catch (err) {
      alert('Image upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return formData.image_url || '';
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrl = await uploadImage();
    const productData = {
      name: formData.name, category: formData.category, size: formData.size,
      price: parseFloat(formData.price), inventory: parseInt(formData.inventory),
      active: formData.active, image_url: imageUrl,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setFormData({ name: '', category: 'mushrooms', size: '', price: '', inventory: '', active: true, image_url: '' });
    setImagePreview(null);
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: typeof products[0]) => {
    setEditingProduct(product);
    setFormData({ ...product, price: String(product.price), inventory: String(product.inventory), image_url: product.image_url || '' });
    setImagePreview(product.image_url || null);
    setShowForm(true);
  };

  return (
    <AdminGuard activeTab="products">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-white px-4 py-2 rounded-lg">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded px-3 py-2" required>
                <option value="mushrooms">Mushrooms</option>
                <option value="greens">Greens</option>
                <option value="herbs">Herbs</option>
                <option value="vegetables">Vegetables</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size/Weight</label>
              <input type="text" placeholder="e.g., 4 oz, 1 lb" value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input type="number" step="0.01" value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Inventory</label>
              <input type="number" value={formData.inventory}
                onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300 text-sm transition-colors">
                  Choose Photo
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
                {(imagePreview || formData.image_url) && (
                  <div className="flex items-center gap-3">
                    <Image src={imagePreview || formData.image_url} alt="Preview" width={64} height={64} className="w-16 h-16 object-cover rounded border" />
                    <button type="button" onClick={() => { setImagePreview(null); setFormData({ ...formData, image_url: '' }); }}
                      className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="mr-2" />
                <span className="text-sm font-medium">Active (visible to customers)</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={uploading} className="btn-primary text-white px-6 py-2 rounded-lg">
                {uploading ? 'Uploading image...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Size</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Inventory</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-3">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} width={48} height={48} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                </td>
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3 capitalize">{product.category}</td>
                <td className="px-4 py-3">{product.size}</td>
                <td className="px-4 py-3">${product.price}</td>
                <td className="px-4 py-3">
                  <span className={product.inventory <= 5 ? 'text-red-600 font-medium' : ''}>{product.inventory}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button onClick={() => updateProduct(product.id, { active: !product.active })}
                      className="text-gray-600 hover:text-gray-800 text-sm">{product.active ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => { if (confirm('Delete this product?')) deleteProduct(product.id); }}
                      className="text-red-600 hover:text-red-800 text-sm">Delete</button>
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
