'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase-client';
import { adminApi } from '@/lib/admin-api';
import { DEFAULT_ZONES, DEFAULT_DELIVERY_INFO } from '@/lib/constants';
import type { DeliveryZone, DeliveryInfoCard } from '@/lib/types';

interface DeliveryContextType {
  zones: Record<string, DeliveryZone>;
  addZone: (key: string, zone: DeliveryZone) => Promise<void>;
  updateZone: (key: string, updates: Partial<DeliveryZone>) => Promise<void>;
  deleteZone: (key: string) => Promise<void>;
  infoCards: DeliveryInfoCard[];
  addInfoCard: (card: Omit<DeliveryInfoCard, 'id'>) => Promise<void>;
  updateInfoCard: (id: string, updates: Partial<DeliveryInfoCard>) => Promise<void>;
  deleteInfoCard: (id: string) => Promise<void>;
}

const DeliveryContext = createContext<DeliveryContextType>({} as DeliveryContextType);

export function DeliveryProvider({ children, initialZones, initialInfoCards }: {
  children: ReactNode;
  initialZones?: Record<string, DeliveryZone>;
  initialInfoCards?: DeliveryInfoCard[];
}) {
  const [zones, setZones] = useState<Record<string, DeliveryZone>>(initialZones || DEFAULT_ZONES);
  const [infoCards, setInfoCards] = useState<DeliveryInfoCard[]>(initialInfoCards || DEFAULT_DELIVERY_INFO);

  useEffect(() => {
    if (initialZones || initialInfoCards) return;
    async function fetchDeliveryData() {
      try {
        const { data: zonesData } = await supabase
          .from('farm_delivery_zones')
          .select('*')
          .order('created_at', { ascending: true });
        if (zonesData && zonesData.length > 0) {
          const zonesObj: Record<string, DeliveryZone> = {};
          zonesData.forEach((z: { key: string; name: string; day: string; fee: number }) => {
            zonesObj[z.key] = { name: z.name, day: z.day, fee: z.fee };
          });
          setZones(zonesObj);
        }
      } catch (err) {
        console.error('Failed to fetch delivery zones:', err);
      }
      try {
        const { data: cardsData } = await supabase
          .from('farm_delivery_info')
          .select('*')
          .order('sort_order', { ascending: true });
        if (cardsData && cardsData.length > 0) {
          setInfoCards(cardsData.map((c: { id: string; icon: string; title: string; description: string }) => ({
            id: c.id, icon: c.icon, title: c.title, description: c.description,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch delivery info cards:', err);
      }
    }
    fetchDeliveryData();
  }, [initialZones, initialInfoCards]);

  const addZone = async (key: string, zone: DeliveryZone) => {
    setZones(prev => ({ ...prev, [key]: zone }));
    try {
      await adminApi('addZone', { key, name: zone.name, day: zone.day, fee: zone.fee });
    } catch (err) {
      console.error('Failed to add zone:', err);
    }
  };

  const updateZone = async (key: string, updates: Partial<DeliveryZone>) => {
    setZones(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
    try {
      await adminApi('updateZone', { key, ...updates });
    } catch (err) {
      console.error('Failed to update zone:', err);
    }
  };

  const deleteZone = async (key: string) => {
    setZones(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    try {
      await adminApi('deleteZone', { key });
    } catch (err) {
      console.error('Failed to delete zone:', err);
    }
  };

  const addInfoCard = async (card: Omit<DeliveryInfoCard, 'id'>) => {
    const tempId = Date.now().toString();
    setInfoCards(prev => [...prev, { ...card, id: tempId }]);
    try {
      const result = await adminApi('addInfoCard', { ...card, sort_order: infoCards.length });
      const newCard = Array.isArray(result.data) ? result.data[0] : result.data;
      setInfoCards(prev => prev.map(c => c.id === tempId ? { ...c, id: newCard.id } : c));
    } catch (err) {
      console.error('Failed to add info card:', err);
    }
  };

  const updateInfoCard = async (id: string, updates: Partial<DeliveryInfoCard>) => {
    setInfoCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await adminApi('updateInfoCard', { id, ...updates });
    } catch (err) {
      console.error('Failed to update info card:', err);
    }
  };

  const deleteInfoCard = async (id: string) => {
    setInfoCards(prev => prev.filter(c => c.id !== id));
    try {
      await adminApi('deleteInfoCard', { id });
    } catch (err) {
      console.error('Failed to delete info card:', err);
    }
  };

  return (
    <DeliveryContext.Provider value={{
      zones, addZone, updateZone, deleteZone,
      infoCards, addInfoCard, updateInfoCard, deleteInfoCard,
    }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export const useDelivery = () => useContext(DeliveryContext);
