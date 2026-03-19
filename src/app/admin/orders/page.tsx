'use client';

import { useState } from 'react';
import AdminGuard from '../AdminGuard';
import { useOrders } from '@/contexts/OrderContext';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <AdminGuard activeTab="orders">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="flex space-x-2">
          {['all', 'pending', 'confirmed', 'completed'].map(status => (
            <button key={status} onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${filter === status ? 'bg-green-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                </p>
              </div>
              <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className={`px-3 py-1 rounded border ${
                  order.status === 'pending' ? 'bg-yellow-50 border-yellow-300' :
                  order.status === 'confirmed' ? 'bg-blue-50 border-blue-300' :
                  'bg-green-50 border-green-300'
                }`}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Customer</h4>
                <p className="text-sm">{order.customer.name}</p>
                <p className="text-sm text-gray-600">{order.customer.email}</p>
                <p className="text-sm text-gray-600">{order.customer.phone}</p>
                <p className="text-sm text-gray-600 mt-1">{order.customer.address}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Delivery</h4>
                <p className="text-sm">{order.deliveryInfo.name}</p>
                <p className="text-sm text-gray-600">{order.deliveryInfo.day}</p>
                <p className="text-sm font-medium mt-2 capitalize">Payment: {order.paymentMethod}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-1">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} ({item.size}) x{item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                <span>Total:</span>
                <span className="text-green-700">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </AdminGuard>
  );
}
