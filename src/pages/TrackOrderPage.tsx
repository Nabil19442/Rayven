import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Order, OrderStatus } from '../types';
import { useStore } from '../contexts/StoreContext';
import { 
  Search, Truck, CheckCircle2, Clock, Package, AlertCircle, 
  MapPin, Phone, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  onNavigate: (path: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber, onNavigate }) => {
  const { formatBDT } = useStore();
  const [query, setQuery] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      // Try search by order number first
      let result = await db.getOrderByNumber(searchTerm.trim());

      // If not found, try search by phone
      if (!result) {
        const orders = await db.getOrders();
        result = orders.find(o => o.customer_phone.includes(searchTerm.trim()) || o.id === searchTerm.trim()) || null;
      }

      if (result) {
        setOrder(result);
      } else {
        setOrder(null);
        setErrorMessage(`No football kit order found for "${searchTerm}". Please double-check your Order ID or phone number.`);
      }
    } catch (err: unknown) {
      setErrorMessage('Search error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      executeSearch(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  // Timeline Step calculation
  const getTimelineSteps = (currentStatus: OrderStatus) => {
    const steps: { key: OrderStatus; label: string; desc: string }[] = [
      { key: 'pending', label: 'Order Received', desc: 'Kit registered in system' },
      { key: 'confirmed', label: 'Order Confirmed', desc: 'Verified by RAYVEN team' },
      { key: 'processing', label: 'Custom Printing & Pack', desc: 'Jersey & custom flock prepared' },
      { key: 'shipped', label: 'Handed to Courier', desc: 'In transit to your district' },
      { key: 'delivered', label: 'Delivered', desc: 'Parcel received & verified' },
    ];

    const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, idx) => {
      let state: 'completed' | 'current' | 'upcoming' = 'upcoming';
      if (currentStatus === 'cancelled') {
        state = 'upcoming';
      } else if (idx < currentIndex) {
        state = 'completed';
      } else if (idx === currentIndex) {
        state = 'current';
      }
      return { ...step, state };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
          PARCEL TRACKING
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
          Track Your Football Kit
        </h1>
        <p className="text-xs text-zinc-600">
          Enter your Order Number (e.g. <strong className="font-mono text-[#6D35C8]">RAY-20260901-0001</strong>) or 11-digit mobile phone number.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] shadow-sm">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order Number (RAY-...) or Phone (01XXXXXXXXX)"
              className="w-full bg-white border border-zinc-300 rounded-xl pl-11 pr-4 py-3.5 text-xs text-[#1F2024] placeholder-zinc-400 font-mono focus:outline-none focus:border-[#6D35C8]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3.5 bg-[#6D35C8] hover:bg-[#4B218A] disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>{isLoading ? 'Searching...' : 'Track Order'}</span>
          </button>
        </form>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Order Results */}
      {order && (
        <div className="space-y-6">
          {/* Status Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E3]">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  ORDER REFERENCE
                </span>
                <h2 className="font-display text-2xl font-black text-[#6D35C8] font-mono">
                  {order.order_number}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  order.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : order.status === 'shipped'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : order.status === 'cancelled'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30'
                }`}>
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* Courier Dispatch Info if shipped */}
            {order.tracking_number && (
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="text-zinc-500 font-bold uppercase text-[10px]">Assigned Courier Partner</p>
                  <p className="font-bold text-[#1F2024]">{order.courier_partner || 'SteadFast Courier Bangladesh'}</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 font-bold uppercase text-[10px]">Tracking Code</p>
                  <p className="font-mono font-bold text-[#6D35C8]">{order.tracking_number}</p>
                </div>
              </div>
            )}

            {/* Visual Step Timeline */}
            <div className="pt-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6">
                Delivery Milestones
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                {getTimelineSteps(order.status).map((step, index) => (
                  <div key={step.key} className="flex sm:flex-col items-start gap-3 sm:gap-2 relative">
                    {/* Step Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition ${
                      step.state === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : step.state === 'current'
                        ? 'bg-[#6D35C8] border-[#6D35C8] text-white animate-pulse'
                        : 'bg-white border-zinc-300 text-zinc-400'
                    }`}>
                      {step.state === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold font-mono">{index + 1}</span>
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold uppercase ${
                        step.state === 'completed' || step.state === 'current'
                          ? 'text-[#1F2024]'
                          : 'text-zinc-400'
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kits Ordered Details */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 text-xs shadow-sm">
            <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
              Package Contents
            </h3>

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

            <div className="pt-2 flex items-center justify-between text-zinc-500">
              <span>Delivery Address:</span>
              <span className="font-semibold text-[#1F2024]">
                {order.shipping_address.address_line1}, {order.shipping_address.district}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-[#E5E5E3] text-[#1F2024]">
              <span>Total Payable</span>
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
