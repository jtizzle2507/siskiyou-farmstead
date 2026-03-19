'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.inventory <= 0;

  return (
    <div className="product-card rounded-xl overflow-hidden">
      {product.image_url && (
        <div className="w-full h-48 overflow-hidden relative">
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      <div className="p-5">
        <div className="mb-1">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#8b7355] bg-[#f5f1eb] px-2.5 py-1 rounded-full mb-3 font-sans">{product.category}</span>
        </div>
        <div className="mb-3">
          <h3 className="font-bold text-lg text-[#2d2d2d] font-serif">{product.name}</h3>
          <p className="text-[#888] text-sm">{product.size}</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-[#5a7c65]">${product.price}</span>
          <span className="text-sm text-[#999]">
            {isOutOfStock ? (
              <span className="text-red-500 font-medium">Out of Stock</span>
            ) : (
              `${product.inventory} available`
            )}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || !product.active}
          className={`w-full py-2.5 rounded-lg font-semibold transition-all text-sm ${
            isOutOfStock || !product.active
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : added
              ? 'bg-[#5a7c65] text-white'
              : 'btn-primary text-white'
          }`}
        >
          {added ? '\u2713 Added to Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
