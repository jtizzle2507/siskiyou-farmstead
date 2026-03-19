'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase-client';
import { adminApi } from '@/lib/admin-api';
import type { Order, CartItem, DeliveryZone } from '@/lib/types';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: {
    items: CartItem[];
    customer: { name: string; email: string; phone: string; address: string };
    deliveryZone: string;
    deliveryInfo: DeliveryZone;
    paymentMethod: string;
    total: number;
    deliveryFee: number;
  }) => Promise<Order>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('farm_orders')
          .select('*, farm_order_items(*)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          const mapped: Order[] = data.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            orderNumber: o.order_number as string,
            date: o.created_at as string,
            status: o.status as string,
            customer: {
              name: o.customer_name as string,
              email: o.customer_email as string,
              phone: o.customer_phone as string,
              address: o.customer_address as string,
            },
            deliveryZone: o.delivery_zone as string,
            deliveryInfo: { name: o.delivery_zone as string, day: o.delivery_day as string },
            paymentMethod: o.payment_method as string,
            subtotal: o.subtotal as number,
            deliveryFee: o.delivery_fee as number,
            total: o.total as number,
            items: ((o.farm_order_items as Record<string, unknown>[]) || []).map((item: Record<string, unknown>) => ({
              id: item.product_id as string,
              name: item.product_name as string,
              size: item.product_size as string,
              price: item.price as number,
              quantity: item.quantity as number,
            })),
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch orders from Supabase:', err);
      }
    }
    fetchOrders();
  }, []);

  const addOrder: OrderContextType['addOrder'] = async (order) => {
    const orderNumber = `SF${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber,
      date: new Date().toISOString(),
      status: 'pending',
      customer: order.customer,
      deliveryZone: order.deliveryZone,
      deliveryInfo: { name: order.deliveryInfo.name, day: order.deliveryInfo.day },
      paymentMethod: order.paymentMethod,
      subtotal: order.total - order.deliveryFee,
      deliveryFee: order.deliveryFee,
      total: order.total,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
      })),
    };
    setOrders(prev => [newOrder, ...prev]);

    try {
      const result = await adminApi('addOrder', {
        order_number: orderNumber,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        customer_address: order.customer.address,
        delivery_zone: order.deliveryZone,
        delivery_day: order.deliveryInfo.day || '',
        payment_method: order.paymentMethod,
        subtotal: order.total - order.deliveryFee,
        delivery_fee: order.deliveryFee,
        total: order.total,
        items: order.items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_size: item.size,
          price: item.price,
          quantity: item.quantity,
        })),
      });
      if (result.data) {
        const realOrder = Array.isArray(result.data) ? result.data[0] : result.data;
        setOrders(prev => prev.map(o =>
          o.orderNumber === orderNumber ? { ...o, id: realOrder.id } : o
        ));
      }
    } catch (err) {
      console.error('Failed to save order to Supabase:', err);
    }

    return newOrder;
  };

  const updateOrderStatus = async (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    try {
      await adminApi('updateOrderStatus', { id, status });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
