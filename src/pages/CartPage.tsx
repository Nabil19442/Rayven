import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { JerseySize } from '../types';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Tag, 
  Truck, ShieldCheck, CheckCircle2, RotateCcw, AlertCircle 
} from 'lucide-react';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { 
    items, itemCount, subtotal, deliveryCharge, deliveryZone, setDeliveryZone,
    coupon, couponDiscount, couponError, grandTotal, 
    removeFromCart, updateQuantity, updateSize, applyCoupon, removeCoupon 
  } = useCart();
  const { formatBDT, settings, showToast } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const availableSizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const freeThreshold = settings.free_shipping_threshold ?? 3000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const amountNeededForFree = Math.max(0, freeThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplying(true);
    const ok = await applyCoupon(couponCodeInput);
    setIsApplying(false);
    if (ok) {
      showToast('Coupon code applied!', 'success');
      setCouponCodeInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6 text-[#1F2024]">
        <div className="w-20 h-20 rounded-full bg-[#F7F7F5] border border-[#E5E5E3] flex items-center justify-center mx-auto text-zinc-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-black text-[#1F2024] uppercase">Your Kit Bag Is Empty</h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Explore our matchday kits, player issue heat-press jerseys, and vintage classics.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-8 py-3.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-purple-900/20 cursor-pointer"
        >
          Explore Football Jerseys
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1F2024]">
      {/* Title */}
      <div>
        <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
          REVIEW YOUR ORDER
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight mt-1">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'Kit' : 'Kits'})
        </h1>
      </div>

      {/* Free Delivery Bar */}
      <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-2 text-zinc-700">
            <Truck className="w-4 h-4 text-[#6D35C8]" />
            {subtotal >= freeThreshold ? (
              <span className="text-emerald-700">🎉 Congratulations! You unlocked FREE DELIVERY across Bangladesh.</span>
            ) : (
              <span>Add <strong className="text-[#6D35C8]">{formatBDT(amountNeededForFree)}</strong> more to get <strong>FREE SHIPPING</strong></span>
            )}
          </span>
          <span className="text-zinc-500 font-mono">{progressToFreeShipping}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6D35C8] to-[#8B5AD9] transition-all duration-500"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Grid: Cart Items (Left) vs Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5E5E3] shadow-sm flex flex-col sm:flex-row gap-4 justify-between"
            >
              {/* Product Info & Thumb */}
              <div className="flex gap-4">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-[#F7F7F5] border border-[#E5E5E3] shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#6D35C8] uppercase tracking-wider font-mono">
                    {item.product.team} • {item.product.jersey_version} Edition
                  </span>
                  <h3
                    onClick={() => onNavigate(`/product/${item.product.slug}`)}
                    className="font-display text-base font-bold text-[#1F2024] hover:text-[#6D35C8] cursor-pointer transition"
                  >
                    {item.product.name}
                  </h3>

                  {item.custom_name && (
                    <p className="text-xs text-[#6D35C8] font-mono font-semibold">
                      Custom Print: {item.custom_name} #{item.custom_number}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    {/* Size Selector */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <span>Size:</span>
                      <select
                        value={item.size}
                        onChange={(e) => updateSize(item.id, e.target.value as JerseySize)}
                        className="bg-[#F7F7F5] border border-[#E5E5E3] rounded-lg px-2 py-1 text-xs font-bold text-[#1F2024] focus:outline-none focus:border-[#6D35C8] cursor-pointer"
                      >
                        {availableSizes.map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xs text-zinc-500 font-mono">
                      Unit: {formatBDT(item.unit_price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity, Total & Remove */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E3]">
                <span className="font-display text-xl font-black text-[#6D35C8]">
                  {formatBDT(item.total_price)}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#E5E5E3] rounded-xl bg-[#F7F7F5] p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-bold text-[#1F2024]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('/shop')}
              className="text-xs font-bold text-zinc-500 hover:text-[#6D35C8] inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Right: Order Calculation & Checkout */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] space-y-5 sticky top-28 shadow-lg shadow-zinc-900/5">
            <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider pb-3 border-b border-[#E5E5E3]">
              Order Summary
            </h3>

            {/* Delivery Destination Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Delivery Location in Bangladesh:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside_dhaka')}
                  className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                    deliveryZone === 'inside_dhaka'
                      ? 'bg-[#F3EEFC] border-[#6D35C8] text-[#6D35C8]'
                      : 'bg-[#F7F7F5] border-[#E5E5E3] text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <p className="font-bold text-xs">Inside Dhaka</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{formatBDT(settings.inside_dhaka_delivery_fee)} (24-48h)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                    deliveryZone === 'outside_dhaka'
                      ? 'bg-[#F3EEFC] border-[#6D35C8] text-[#6D35C8]'
                      : 'bg-[#F7F7F5] border-[#E5E5E3] text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <p className="font-bold text-xs">Outside Dhaka</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{formatBDT(settings.outside_dhaka_delivery_fee)} (48-72h)</p>
                </button>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2">
              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    Coupon <strong className="font-mono">{coupon.code}</strong> (-{formatBDT(couponDiscount)})
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-zinc-500 hover:text-red-500 text-xs underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    className="flex-1 bg-[#F7F7F5] border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-[#1F2024] placeholder-zinc-400 uppercase font-mono focus:outline-none focus:border-[#6D35C8]"
                  />
                  <button
                    type="submit"
                    disabled={isApplying || !couponCodeInput.trim()}
                    className="px-4 py-2.5 bg-[#1F2024] hover:bg-[#2B2D31] disabled:opacity-50 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-xs text-red-500 font-semibold">{couponError}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs pt-2 border-t border-[#E5E5E3]">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-mono text-[#1F2024] font-semibold">{formatBDT(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-{formatBDT(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Delivery Charge</span>
                <span className="font-mono text-[#1F2024] font-semibold">
                  {deliveryCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : formatBDT(deliveryCharge)}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-base font-bold pt-3 border-t border-[#E5E5E3] text-[#1F2024]">
                <span className="font-display uppercase tracking-wider text-sm">Total Payable</span>
                <span className="font-display text-2xl font-black text-[#6D35C8]">
                  {formatBDT(grandTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="cart-page-checkout-btn"
              type="button"
              onClick={() => onNavigate('/checkout')}
              className="w-full py-4 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-purple-900/20 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Notice */}
            <div className="pt-2 text-center text-[11px] text-zinc-500 space-y-1">
              <p>🔒 100% Safe Checkout with Cash on Delivery (COD)</p>
              <p>7-Day Easy Exchange Policy Across Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
