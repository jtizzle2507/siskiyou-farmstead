'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase-client';
import { adminApi } from '@/lib/admin-api';
import { INITIAL_PRODUCTS } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  decrementInventory: (id: string, quantity: number) => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType>({} as ProductContextType);

export function ProductProvider({ children, initialProducts }: {
  children: ReactNode;
  initialProducts?: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts || INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts) return;
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('farm_products')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [initialProducts]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const result = await adminApi('addProduct', product as Record<string, unknown>);
      const newProduct = Array.isArray(result.data) ? result.data[0] : result.data;
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error('Failed to add product:', err);
      const newProduct = { ...product, id: Date.now().toString() } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await adminApi('updateProduct', { id, ...updates });
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await adminApi('deleteProduct', { id });
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const decrementInventory = async (id: string, quantity: number) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, inventory: Math.max(0, p.inventory - quantity) } : p
    ));
    try {
      await adminApi('decrementInventory', { id, quantity });
    } catch (err) {
      console.error('Failed to decrement inventory:', err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, decrementInventory, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
