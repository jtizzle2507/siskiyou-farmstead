'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { CartProvider } from '@/contexts/CartContext';
import type { Product, DeliveryZone, DeliveryInfoCard } from '@/lib/types';

interface ProvidersProps {
  children: ReactNode;
  initialProducts?: Product[];
  initialZones?: Record<string, DeliveryZone>;
  initialInfoCards?: DeliveryInfoCard[];
}

export default function Providers({ children, initialProducts, initialZones, initialInfoCards }: ProvidersProps) {
  return (
    <AuthProvider>
      <ProductProvider initialProducts={initialProducts}>
        <OrderProvider>
          <DeliveryProvider initialZones={initialZones} initialInfoCards={initialInfoCards}>
            <CartProvider>
              {children}
            </CartProvider>
          </DeliveryProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
