import React, { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { Order } from '../types';
import { useStore } from '../contexts/StoreContext';
import { 
  CheckCircle2, Package, Truck, ArrowRight, Printer, Phone, 
  MapPin, Clock, Calendar, Sparkles, ShieldCheck 
} from 'lucide-react';

interface OrderSuccessPageProps {
  orderNumber: string;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderNumber, onNavigate }) => {
  const { formatBDT, settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    db.getOrderByNumber(orderNumber).then((data) => {
      setOrder(data);
      setIsLoading(false);
    });
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-[#1F2024]">
      {/* Celebration Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E5E5E3] text-center space-y-5 shadow-xl shadow-purple-900/5 relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            ORDER CONFIRMED
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Your football matchday kit has been registered and scheduled for dispatch.
          </p>
        </div>

        {/* Order Reference Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] font-mono text-sm">
          <span className="text-zinc-500 uppercase font-semibold">Order ID:</span>
          <strong className="text-[#6D35C8] font-bold text-base">{orderNumber}</strong>
        </div>

        {/* Timeline Estimation */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left text-xs">
          <div className="p-3.5 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E3] flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#6D35C8] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1F2024]">Estimated Delivery:</p>
              <p className="text-zinc-500 mt-0.5">
                {order?.delivery_zone === 'inside_dhaka' ? '24 - 48 Hours (Dhaka)' : '48 - 72 Hours (Nationwide)'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E3] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1F2024]">Payment Mode:</p>
              <p className="text-zinc-500 mt-0.5 uppercase font-mono">
                {order?.payment_method === 'cod' ? 'Cash On Delivery' : order?.payment_method?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate(`/track-order?order=${orderNumber}`)}
            className="px-6 py-3 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-purple-900/20 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-3 bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 border border-[#E5E5E3] transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => onNavigate('/shop')}
            className="px-5 py-3 bg-white hover:bg-[#F3EEFC]/40 text-[#1F2024] font-bold rounded-xl text-xs uppercase tracking-wider border border-[#E5E5E3] transition cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Detailed Receipt Card */}
      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-6 text-xs text-zinc-700 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3]">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase">
                Order Receipt & Kit Breakdown
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Date: {new Date(order.created_at).toLocaleString('en-GB')}
              </p>
            </div>
            <span className="px-3 py-1 bg-[#F3EEFC] border border-[#8B5AD9]/30 text-[#6D35C8] rounded-xl font-bold uppercase">
              Status: {order.status}
            </span>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3]">
            <div>
              <p className="font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">Customer Info</p>
              <p className="font-bold text-[#1F2024] text-sm">{order.customer_name}</p>
              <p className="font-mono text-zinc-600">{order.customer_phone}</p>
              {order.customer_email && <p className="text-zinc-500">{order.customer_email}</p>}
            </div>

            <div>
              <p className="font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">Shipping Destination</p>
              <p className="text-[#1F2024]">{order.shipping_address.address_line1}</p>
              <p className="text-zinc-700 font-semibold">{order.shipping_address.district}, Bangladesh</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <p className="font-bold text-[#1F2024] uppercase tracking-wider text-[11px]">Ordered Jerseys</p>
            <div className="divide-y divide-[#E5E5E3] border-t border-b border-[#E5E5E3]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#F7F7F5] border border-[#E5E5E3]"
                    />
                    <div>
                      <h4 className="font-bold text-[#1F2024]">{item.product_name}</h4>
                      <p className="text-zinc-500 text-[11px]">
                        Size: <strong className="text-[#6D35C8] font-mono">{item.size}</strong> • Qty: {item.quantity}
                      </p>
                      {item.custom_name && (
                        <p className="text-[#6D35C8] font-mono text-[10px]">
                          Print: {item.custom_name} #{item.custom_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="font-mono font-bold text-[#1F2024] text-sm">
                    {formatBDT(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 pt-2 text-right max-w-xs ml-auto">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-mono text-[#1F2024] font-semibold">{formatBDT(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.coupon_code})</span>
                <span className="font-mono">-{formatBDT(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Charge</span>
              <span className="font-mono text-[#1F2024] font-semibold">{formatBDT(order.delivery_charge)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#E5E5E3] text-[#1F2024]">
              <span className="uppercase">Total Paid / Payable</span>
              <span className="font-display text-lg font-black text-[#6D35C8]">
                {formatBDT(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
