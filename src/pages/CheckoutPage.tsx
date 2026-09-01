import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore, BANGLADESH_DISTRICTS } from '../contexts/StoreContext';
import { db } from '../lib/db';
import { Order, PaymentMethod } from '../types';
import { 
  ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle, 
  CreditCard, Smartphone, DollarSign, Lock, Sparkles 
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderCreated: (orderNumber: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderCreated }) => {
  const { items, subtotal, deliveryCharge, deliveryZone, setDeliveryZone, coupon, couponDiscount, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { formatBDT, settings, showToast } = useStore();

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-switch delivery zone based on chosen district
  useEffect(() => {
    if (district.toLowerCase() === 'dhaka') {
      setDeliveryZone('inside_dhaka');
    } else {
      setDeliveryZone('outside_dhaka');
    }
  }, [district]);

  // Sync user profile when user logs in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.full_name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display text-2xl font-black text-[#1F2024] uppercase">Your Bag is Empty</h2>
        <p className="text-sm text-zinc-500">Please select football kits to add to your bag before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Explore Kits
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setFormError('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).');
      return;
    }

    if (!addressLine.trim()) {
      setFormError('Please enter your detailed delivery address (House, Road, Area).');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      setFormError(`Please provide the ${paymentMethod.toUpperCase()} Transaction ID (TrxID).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload: Partial<Order> = {
        user_id: user?.id,
        customer_name: fullName,
        customer_email: email || `${cleanPhone}@rayven.customer`,
        customer_phone: cleanPhone,
        shipping_address: {
          full_name: fullName,
          phone: cleanPhone,
          address_line1: addressLine,
          district,
          thana: thana || district,
          postal_code: postalCode,
        },
        delivery_zone: deliveryZone,
        delivery_charge: deliveryCharge,
        subtotal,
        discount_amount: couponDiscount,
        coupon_code: coupon?.code,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'pending',
        notes: notes ? `${notes} ${trxId ? `| TrxID: ${trxId}` : ''}` : trxId ? `TrxID: ${trxId}` : undefined,
        items: items.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          order_id: '',
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product.name,
          product_image: item.product.images[0],
          size: item.size,
          custom_name: item.custom_name,
          custom_number: item.custom_number,
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_price: item.total_price
        }))
      };

      const created = await db.createOrder(orderPayload);

      if (created) {
        clearCart();
        showToast('Order placed successfully! Your authentic kit is being prepared.', 'success');
        onOrderCreated(created.order_number);
        onNavigate(`/order-success/${created.order_number}`);
      } else {
        setFormError('Could not process order. Please try again.');
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Order processing failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1F2024]">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('/cart')}
          className="text-xs font-bold text-zinc-500 hover:text-[#6D35C8] inline-flex items-center gap-1.5 transition mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kit Bag</span>
        </button>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
          Secure Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Shipping & Payment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Error notice */}
          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-semibold">{formError}</span>
            </div>
          )}

          {/* 1. Customer Details */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 shadow-sm">
            <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#F3EEFC] text-[#6D35C8] text-xs flex items-center justify-center font-black">
                1
              </span>
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  Phone Number (Mobile) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  Email Address (Optional for Order Confirmation)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 shadow-sm">
            <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#F3EEFC] text-[#6D35C8] text-xs flex items-center justify-center font-black">
                2
              </span>
              Delivery Address in Bangladesh
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  District / Zilla <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 font-semibold focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d} {d.toLowerCase() === 'dhaka' ? '(Inside Dhaka - ৳60)' : '(Outside Dhaka - ৳120)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  Area / Thana / Sub-district
                </label>
                <input
                  type="text"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  placeholder="e.g. Banani / Uttara / Nasirabad"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  Detailed Street Address (House, Road, Apartment) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. House #14, Road #5, Block C, Banani"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 1213"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before arrival"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 shadow-sm">
            <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#F3EEFC] text-[#6D35C8] text-xs flex items-center justify-center font-black">
                3
              </span>
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* COD */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'bg-[#F3EEFC]/60 border-[#6D35C8] text-[#1F2024]'
                    : 'bg-[#F7F7F5] border-[#E5E5E3] text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-[#6D35C8] bg-[#6D35C8]' : 'border-zinc-400 bg-white'
                  }`}>
                    {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1F2024] uppercase tracking-wide">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Pay with cash directly to the courier agent upon inspecting your football kit at your door.
                    </p>
                  </div>
                </div>
                <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
              </label>

              {/* bKash */}
              <label
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-50 border-pink-500 text-zinc-900'
                    : 'bg-[#F7F7F5] border-[#E5E5E3] text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'bkash' ? 'border-pink-600 bg-pink-600' : 'border-zinc-400 bg-white'
                    }`}>
                      {paymentMethod === 'bkash' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-pink-700 uppercase tracking-wide">
                        bKash Mobile Payment
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        Send Money to Merchant account: <strong className="text-pink-700 font-mono">01712-345678</strong>.
                      </p>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-pink-600 shrink-0" />
                </div>

                {paymentMethod === 'bkash' && (
                  <div className="pt-2 border-t border-pink-200">
                    <label className="text-[10px] text-zinc-600 uppercase font-bold mb-1 block">
                      bKash Transaction ID (TrxID) <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="e.g. BK89X24L10"
                      className="w-full bg-white border border-pink-300 rounded-xl px-3 py-2 text-xs text-zinc-900 uppercase font-mono focus:outline-none focus:border-pink-600"
                    />
                  </div>
                )}
              </label>

              {/* Nagad */}
              <label
                onClick={() => setPaymentMethod('nagad')}
                className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition ${
                  paymentMethod === 'nagad'
                    ? 'bg-orange-50 border-orange-500 text-zinc-900'
                    : 'bg-[#F7F7F5] border-[#E5E5E3] text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'nagad' ? 'border-orange-600 bg-orange-600' : 'border-zinc-400 bg-white'
                    }`}>
                      {paymentMethod === 'nagad' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                        Nagad Payment
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        Send Money to Nagad Wallet: <strong className="text-orange-700 font-mono">01812-345678</strong>.
                      </p>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-orange-600 shrink-0" />
                </div>

                {paymentMethod === 'nagad' && (
                  <div className="pt-2 border-t border-orange-200">
                    <label className="text-[10px] text-zinc-600 uppercase font-bold mb-1 block">
                      Nagad Transaction ID (TrxID) <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="e.g. NG71Z94P33"
                      className="w-full bg-white border border-orange-300 rounded-xl px-3 py-2 text-xs text-zinc-900 uppercase font-mono focus:outline-none focus:border-orange-600"
                    />
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Order Summary & Place Order CTA */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] space-y-5 sticky top-28 shadow-lg shadow-zinc-900/5">
            <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider pb-3 border-b border-[#E5E5E3]">
              Your Kits in Order ({items.length})
            </h3>

            {/* Line items mini summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-[#F7F7F5] border border-[#E5E5E3] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1F2024] truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-zinc-500">
                      Size: <strong className="text-[#6D35C8] font-mono">{item.size}</strong> × {item.quantity}
                    </p>
                    {item.custom_name && (
                      <p className="text-[10px] text-[#6D35C8] font-mono truncate">
                        Print: {item.custom_name} #{item.custom_number}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#1F2024] text-xs">
                    {formatBDT(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-[#E5E5E3]">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono text-[#1F2024] font-semibold">{formatBDT(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon ({coupon?.code})</span>
                  <span className="font-mono">-{formatBDT(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>
                  Delivery ({district.toLowerCase() === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span className="font-mono text-[#1F2024] font-semibold">
                  {deliveryCharge === 0 ? <strong className="text-emerald-700 font-black">FREE</strong> : formatBDT(deliveryCharge)}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-base font-bold pt-3 border-t border-[#E5E5E3] text-[#1F2024]">
                <span className="font-display uppercase tracking-wider text-sm">Total Payable</span>
                <span className="font-display text-2xl font-black text-[#6D35C8]">
                  {formatBDT(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              id="submit-order-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#6D35C8] hover:bg-[#4B218A] disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-purple-900/20 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            </button>

            <div className="text-[11px] text-zinc-500 text-center space-y-1">
              <p>🔒 256-Bit SSL Encrypted & Protected</p>
              <p>Doorstep Inspection Permitted on COD</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
