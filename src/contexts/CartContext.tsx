'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDelivery } from './DeliveryContext';
import type { Product, CartItem } from '@/lib/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryZone: string;
  setDeliveryZone: (zone: string) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const { zones } = useDelivery();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryZone, setDeliveryZone] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const storedZone = localStorage.getItem('deliveryZone');
    if (storedZone) setDeliveryZone(storedZone);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('deliveryZone', deliveryZone);
  }, [deliveryZone]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryZone('');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryZone ? zones[deliveryZone]?.fee || 0 : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      subtotal, deliveryFee, total, deliveryZone, setDeliveryZone,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
