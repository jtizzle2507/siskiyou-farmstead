'use client';

import { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import ProductCard from '@/components/ProductCard';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

export default function ShopPageClient() {
  const { products } = useProducts();
  const [filter, setFilter] = useState('all');

  const filteredProducts = filter === 'all'
    ? products.filter(p => p.active)
    : products.filter(p => p.active && p.category === filter);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="section-heading text-4xl font-bold mb-8">Shop</h1>

      <div className="flex space-x-3 mb-10">
        {PRODUCT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-lg font-medium capitalize text-sm transition-all ${
              filter === cat
                ? 'bg-[#5a7c65] text-white shadow-sm'
                : 'bg-[#fdfcfa] text-[#555] hover:bg-[#f5f1eb] border border-[#e8e4dc]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-[#999]">
          No products available in this category.
        </div>
      )}
    </div>
  );
}
