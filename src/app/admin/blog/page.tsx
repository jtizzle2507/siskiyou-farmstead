'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminGuard from '../AdminGuard';
import { adminApi } from '@/lib/admin-api';
import type { BlogPost } from '@/lib/types';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', image_url: '', published: false,
  });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const result = await adminApi('getBlogPosts', {});
      if (result.success && Array.isArray(result.data)) setPosts(result.data);
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title, slug: !editingPost ? generateSlug(title) : prev.slug }));
  };

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
        body: JSON.stringify({ image: base64, fileName: `blog-${Date.now()}.${ext}`, contentType }),
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
    const postData = { title: formData.title, slug: formData.slug, excerpt: formData.excerpt, content: formData.content, image_url: imageUrl, published: formData.published };

    try {
      if (editingPost) {
        await adminApi('updateBlogPost', { id: editingPost.id, ...postData });
      } else {
        await adminApi('addBlogPost', postData);
      }
      await fetchPosts();
    } catch (err) {
      console.error('Failed to save blog post:', err);
      alert('Failed to save post: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', excerpt: '', content: '', image_url: '', published: false });
    setImagePreview(null);
    setShowForm(false);
    setEditingPost(null);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({ title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content || '', image_url: post.image_url || '', published: post.published });
    setImagePreview(post.image_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;
    try {
      await adminApi('deleteBlogPost', { id });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete post: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) return <AdminGuard activeTab="blog"><div className="text-center py-12 text-gray-500">Loading blog posts...</div></AdminGuard>;

  return (
    <AdminGuard activeTab="blog">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className="btn-primary text-white px-4 py-2 rounded-lg">{showForm ? 'Cancel' : '+ Add Post'}</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{editingPost ? 'Edit Post' : 'Add New Post'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <input type="text" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full border rounded px-3 py-2" placeholder="Short description for the blog listing" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12} className="w-full border rounded px-3 py-2 resize-vertical"
                placeholder="Write your blog post content here. Separate paragraphs with blank lines." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Featured Image</label>
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
                <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="mr-2" />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
            <div>
              <button type="submit" disabled={uploading} className="btn-primary text-white px-6 py-2 rounded-lg">
                {uploading ? 'Uploading image...' : editingPost ? 'Update Post' : 'Add Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No blog posts yet.</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className="border-t">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : post.created_at ? new Date(post.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(post)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
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
