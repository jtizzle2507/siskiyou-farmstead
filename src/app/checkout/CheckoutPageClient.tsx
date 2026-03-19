'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { useProducts } from '@/contexts/ProductContext';
import { useDelivery } from '@/contexts/DeliveryContext';

export default function CheckoutPageClient() {
  const router = useRouter();
  const { cart, total, deliveryZone, setDeliveryZone, clearCart, deliveryFee } = useCart();
  const { addOrder } = useOrders();
  const { decrementInventory } = useProducts();
  const { zones } = useDelivery();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '', address: '',
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const order = {
      items: cart,
      customer: customerInfo,
      deliveryZone,
      deliveryInfo: zones[deliveryZone],
      paymentMethod,
      total,
      deliveryFee,
    };

    await addOrder(order);

    cart.forEach(item => {
      decrementInventory(item.id, item.quantity);
    });

    clearCart();
    router.push('/order-confirmation');
    setProcessing(false);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="section-heading text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-[#fdfcfa] rounded-xl p-6" style={{ border: '1px solid #e8e4dc' }}>
              <h2 className="text-xl font-bold mb-4 text-[#2d2d2d] font-serif">Customer Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" required value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="border border-[#e8e4dc] rounded-lg px-3 py-2.5 bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#5a7c65] focus:border-transparent text-[#2d2d2d] placeholder-[#bbb]" />
                <input type="email" placeholder="Email" required value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="border border-[#e8e4dc] rounded-lg px-3 py-2.5 bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#5a7c65] focus:border-transparent text-[#2d2d2d] placeholder-[#bbb]" />
                <input type="tel" placeholder="Phone" required value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="border border-[#e8e4dc] rounded-lg px-3 py-2.5 bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#5a7c65] focus:border-transparent text-[#2d2d2d] placeholder-[#bbb]" />
                <input type="text" placeholder="Delivery Address" required value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="border border-[#e8e4dc] rounded-lg px-3 py-2.5 bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#5a7c65] focus:border-transparent text-[#2d2d2d] placeholder-[#bbb]" />
              </div>
            </div>

            {/* Delivery Zone */}
            <div className="bg-[#fdfcfa] rounded-xl p-6" style={{ border: '1px solid #e8e4dc' }}>
              <h2 className="text-xl font-bold mb-4 text-[#2d2d2d] font-serif">Select Delivery Zone</h2>
              <div className="space-y-3">
                {Object.entries(zones).map(([key, zone]) => (
                  <label key={key} className="flex items-center p-3 border border-[#e8e4dc] rounded-lg cursor-pointer hover:bg-[#faf8f4] transition-colors">
                    <input type="radio" name="deliveryZone" value={key} checked={deliveryZone === key}
                      onChange={(e) => setDeliveryZone(e.target.value)} required className="mr-3" />
                    <div className="flex-1">
                      <div className="font-medium text-[#2d2d2d]">{zone.name}</div>
                      <div className="text-sm text-[#888]">{zone.day}</div>
                    </div>
                    <div className="font-bold text-[#5a7c65]">
                      {zone.fee === 0 ? 'Free' : `$${zone.fee}`}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#fdfcfa] rounded-xl p-6" style={{ border: '1px solid #e8e4dc' }}>
              <h2 className="text-xl font-bold mb-4 text-[#2d2d2d] font-serif">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-[#e8e4dc] rounded-lg cursor-pointer hover:bg-[#faf8f4] transition-colors">
                  <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)} required className="mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-[#2d2d2d]">Credit/Debit Card</div>
                    <div className="text-sm text-[#888]">Pay securely with Stripe</div>
                  </div>
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </label>
                {deliveryZone === 'pickup' && (
                  <label className="flex items-center p-3 border border-[#e8e4dc] rounded-lg cursor-pointer hover:bg-[#faf8f4] transition-colors">
                    <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                    <div className="flex-1">
                      <div className="font-medium text-[#2d2d2d]">Cash on Pickup</div>
                      <div className="text-sm text-[#888]">Pay when you pick up</div>
                    </div>
                    <span className="text-2xl">&#128181;</span>
                  </label>
                )}
              </div>

              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    &#128274; Note: This is a demo. In production, Stripe card input would appear here.
                  </p>
                </div>
              )}
            </div>

            <button type="submit" disabled={processing}
              className="w-full btn-primary text-white py-3 rounded-lg font-semibold text-lg">
              {processing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-[#fdfcfa] rounded-xl p-6 sticky top-28" style={{ border: '1px solid #e8e4dc' }}>
            <h2 className="text-xl font-bold mb-4 text-[#2d2d2d] font-serif">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#555]">{item.name} ({item.size}) x{item.quantity}</span>
                  <span className="font-medium text-[#2d2d2d]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e8e4dc] pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#777]">Subtotal:</span>
                <span className="font-medium text-[#2d2d2d]">${(total - deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#777]">Delivery:</span>
                <span className="font-medium text-[#2d2d2d]">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#e8e4dc] pt-2 flex justify-between text-lg font-bold">
                <span className="text-[#2d2d2d]">Total:</span>
                <span className="text-[#5a7c65]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
