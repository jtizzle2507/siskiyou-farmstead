'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartPageClient() {
  const { cart, removeFromCart, updateQuantity, subtotal, total, deliveryFee } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="section-heading text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-[#777] mb-8">Add some fresh products to get started!</p>
        <Link href="/shop" className="btn-primary text-white px-6 py-3 rounded-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="section-heading text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map(item => (
            <div key={item.id} className="bg-[#fdfcfa] rounded-xl p-5 mb-4 flex items-center justify-between" style={{ border: '1px solid #e8e4dc' }}>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#2d2d2d] font-serif">{item.name}</h3>
                <p className="text-[#888] text-sm">{item.size}</p>
                <p className="text-[#5a7c65] font-bold mt-1">${item.price}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-[#f5f1eb] hover:bg-[#ebe5db] text-[#555] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium text-[#2d2d2d]">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-[#f5f1eb] hover:bg-[#ebe5db] text-[#555] transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-[#fdfcfa] rounded-xl p-6 sticky top-28" style={{ border: '1px solid #e8e4dc' }}>
            <h2 className="text-xl font-bold mb-4 text-[#2d2d2d] font-serif">Order Summary</h2>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#777]">Subtotal:</span>
                <span className="font-medium text-[#2d2d2d]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Delivery Fee:</span>
                <span className="font-medium text-[#2d2d2d]">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#e8e4dc] pt-2 flex justify-between text-lg font-bold">
                <span className="text-[#2d2d2d]">Total:</span>
                <span className="text-[#5a7c65]">${total.toFixed(2)}</span>
              </div>
            </div>

            {subtotal < 25 && (
              <div className="bg-[#fef9ee] border border-[#e8d5a8] rounded-lg p-3 mb-4 text-sm">
                <p className="text-[#8b7355]">
                  Add ${(25 - subtotal).toFixed(2)} more to reach the $25 minimum.
                </p>
              </div>
            )}

            <Link
              href={subtotal >= 25 ? '/checkout' : '#'}
              className={`w-full py-3 rounded-lg font-semibold block text-center ${
                subtotal < 25
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'btn-primary text-white'
              }`}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
