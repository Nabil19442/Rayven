import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { JerseySize } from '../types';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Tag, Truck } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onNavigate }) => {
  const { 
    items, itemCount, subtotal, deliveryCharge, deliveryZone, setDeliveryZone,
    coupon, couponDiscount, couponError, grandTotal, isCartOpen, setIsCartOpen,
    removeFromCart, updateQuantity, updateSize, applyCoupon, removeCoupon 
  } = useCart();
  const { formatBDT, settings, showToast } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const availableSizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const freeThreshold = settings.free_shipping_threshold ?? 3000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const amountNeededForFree = Math.max(0, freeThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const ok = await applyCoupon(couponInput);
    setIsApplyingCoupon(false);
    if (ok) {
      showToast('Coupon applied successfully!', 'success');
      setCouponInput('');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#1F2024]/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E5E5E3] text-[#1F2024] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-[#E5E5E3] flex items-center justify-between bg-[#F7F7F5]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#F3EEFC] text-[#6D35C8] rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-black uppercase tracking-wider text-[#1F2024]">
                  Your Kit Bag
                </h2>
                <span className="text-[11px] font-mono text-zinc-500 font-bold">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-400 hover:text-[#1F2024] rounded-xl hover:bg-zinc-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-3.5 bg-[#F3EEFC]/60 border-b border-[#8B5AD9]/20 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-bold">
              <span className="flex items-center gap-1.5 text-[#1F2024]">
                <Truck className="w-4 h-4 text-[#6D35C8]" />
                {subtotal >= freeThreshold ? (
                  <span className="text-emerald-700 font-extrabold">🎉 You unlocked FREE Delivery across Bangladesh!</span>
                ) : (
                  <span>Add <strong className="text-[#6D35C8]">{formatBDT(amountNeededForFree)}</strong> more for <strong>FREE DELIVERY</strong></span>
                )}
              </span>
              <span className="text-[#6D35C8] font-bold">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8B5AD9] to-[#6D35C8] transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F7F7F5] flex items-center justify-center text-zinc-400 border border-[#E5E5E3]">
                  <ShoppingBag className="w-8 h-8 text-[#8B5AD9]" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1F2024]">Your bag is empty</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                    Explore our latest 2026/27 club kits, player editions, and retro classics.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-purple-900/15 cursor-pointer"
                >
                  Explore Kits
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] relative group hover:border-[#8B5AD9]/40 transition"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400&q=80'}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-white border border-[#E5E5E3] shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#1F2024] line-clamp-1 leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-red-600 p-1 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-zinc-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold">{item.product.team}</span>
                        {item.custom_name && (
                          <span className="text-[#6D35C8] font-mono font-bold bg-[#F3EEFC] px-1.5 py-0.2 rounded">
                            Print: {item.custom_name} #{item.custom_number}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Size and Quantity Row */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200/70">
                      {/* Size Selector */}
                      <select
                        value={item.size}
                        onChange={(e) => updateSize(item.id, e.target.value as JerseySize)}
                        className="bg-white border border-zinc-300 rounded-lg px-2 py-0.5 text-[11px] font-bold text-zinc-800 focus:outline-none focus:border-[#6D35C8]"
                      >
                        {availableSizes.map(sz => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-zinc-300 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-zinc-500 hover:text-[#1F2024] transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-mono font-bold text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-zinc-500 hover:text-[#1F2024] transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <span className="text-xs font-display font-black text-[#1F2024]">
                        {formatBDT(item.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary & Checkout Section */}
          {items.length > 0 && (
            <div className="p-4 border-t border-[#E5E5E3] bg-[#F7F7F5] space-y-3.5">
              {/* Delivery Zone Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                  Select Delivery Zone:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition cursor-pointer ${
                      deliveryZone === 'inside_dhaka'
                        ? 'bg-white border-[#6D35C8] text-[#6D35C8] shadow-xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <p className="font-bold">Inside Dhaka</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{formatBDT(settings.inside_dhaka_delivery_fee ?? 60)} (24-48h)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition cursor-pointer ${
                      deliveryZone === 'outside_dhaka'
                        ? 'bg-white border-[#6D35C8] text-[#6D35C8] shadow-xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <p className="font-bold">Outside Dhaka</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{formatBDT(settings.outside_dhaka_delivery_fee ?? 120)} (48-72h)</p>
                  </button>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Coupon <strong className="font-mono">{coupon.code}</strong> applied (-{formatBDT(couponDiscount)})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 text-[11px] font-bold underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon (e.g. RAYVEN10)"
                      className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 uppercase font-mono focus:outline-none focus:border-[#6D35C8]"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-[#1F2024] hover:bg-[#2B2D31] disabled:opacity-50 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold">{couponError}</p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-zinc-200">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-900 font-bold">{formatBDT(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-{formatBDT(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Delivery ({deliveryZone === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka'})</span>
                  <span className="font-mono text-zinc-900 font-bold">
                    {deliveryCharge === 0 ? <strong className="text-emerald-600 font-black">FREE</strong> : formatBDT(deliveryCharge)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200 text-[#1F2024]">
                  <span className="font-display font-black uppercase tracking-wider text-sm">Grand Total</span>
                  <span className="font-display text-2xl font-black text-[#6D35C8]">
                    {formatBDT(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="drawer-checkout-btn"
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-black rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-purple-900/20 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
