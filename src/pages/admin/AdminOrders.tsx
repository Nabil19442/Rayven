import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Order, OrderStatus } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { 
  Search, Filter, Eye, Truck, CheckCircle2, Clock, 
  AlertCircle, DollarSign, X, ExternalLink, Printer 
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { formatBDT, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAssigningCourier, setIsAssigningCourier] = useState(false);
  const [courierPartner, setCourierPartner] = useState('SteadFast Courier Bangladesh');
  const [trackingNumber, setTrackingNumber] = useState('');

  const loadOrders = async () => {
    const data = await db.getOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await db.updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders(orders.map(o => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      showToast(`Order status set to "${newStatus}"`, 'success');
    }
  };

  const handleAssignCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !trackingNumber.trim()) return;

    const updated = await db.updateOrderTracking(selectedOrder.id, trackingNumber.trim(), courierPartner);
    if (updated) {
      setOrders(orders.map(o => (o.id === selectedOrder.id ? updated : o)));
      setSelectedOrder(updated);
      setIsAssigningCourier(false);
      setTrackingNumber('');
      showToast('Tracking number assigned & order marked as Shipped!', 'success');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesQuery =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.payment_method === paymentFilter;

    return matchesQuery && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            LOGISTICS & FULFILLMENT
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Orders & Shipments ({orders.length})
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5E3] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (RAY-...), Customer Name, or Phone..."
            className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1F2024] placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#6D35C8]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 focus:bg-white focus:outline-none focus:border-[#6D35C8] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 focus:bg-white focus:outline-none focus:border-[#6D35C8] cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-white border border-[#E5E5E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-[#E5E5E3] uppercase font-mono bg-[#F7F7F5]">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3] text-zinc-700">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#F7F7F5] transition">
                  {/* Order ID */}
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-[#6D35C8]">{ord.order_number}</p>
                    <p className="text-[10px] text-zinc-400">
                      {new Date(ord.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1F2024]">{ord.customer_name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{ord.customer_phone}</p>
                  </td>

                  {/* District / Zone */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#1F2024] block">{ord.shipping_address.district}</span>
                    <span className="text-[10px] text-zinc-400">
                      {ord.delivery_zone === 'inside_dhaka' ? 'Inside Dhaka (৳60)' : 'Outside Dhaka (৳120)'}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F7F7F5] border border-[#E5E5E3] text-zinc-700">
                      {ord.payment_method} ({ord.payment_status})
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 font-mono font-bold text-[#1F2024]">
                    {formatBDT(ord.total_amount)}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase border focus:outline-none cursor-pointer ${
                        ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        ord.status === 'shipped' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        ord.status === 'processing' ? 'bg-[#F3EEFC] text-[#6D35C8] border-[#8B5AD9]/30' :
                        ord.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setIsAssigningCourier(false);
                      }}
                      className="px-3 py-1.5 bg-[#F7F7F5] hover:bg-[#6D35C8] hover:text-white text-zinc-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#E5E5E3] rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3]">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Order Inspector</span>
                <h3 className="font-display text-xl font-black text-[#1F2024] font-mono">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier Dispatch Action */}
            <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#1F2024] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6D35C8]" />
                  Courier Tracking Details
                </span>
                {selectedOrder.tracking_number && (
                  <span className="font-mono text-xs text-[#6D35C8] font-bold">
                    {selectedOrder.courier_partner}: {selectedOrder.tracking_number}
                  </span>
                )}
              </div>

              {isAssigningCourier ? (
                <form onSubmit={handleAssignCourier} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      placeholder="Courier Partner"
                      className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:border-[#6D35C8] focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter Tracking Consignment ID"
                      className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:border-[#6D35C8] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase transition shadow-xs cursor-pointer"
                    >
                      Save & Mark Shipped
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAssigningCourier(false)}
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl text-xs font-bold uppercase transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAssigningCourier(true)}
                  className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold rounded-xl uppercase transition border border-[#E5E5E3] shadow-xs cursor-pointer"
                >
                  {selectedOrder.tracking_number ? 'Update Tracking Code' : '+ Assign Courier Consignment Code'}
                </button>
              )}
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-1">
                <p className="text-zinc-500 font-bold uppercase text-[10px]">Customer</p>
                <p className="font-bold text-[#1F2024]">{selectedOrder.customer_name}</p>
                <p className="font-mono text-zinc-600">{selectedOrder.customer_phone}</p>
                <p className="text-zinc-500">{selectedOrder.customer_email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-1">
                <p className="text-zinc-500 font-bold uppercase text-[10px]">Delivery Address</p>
                <p className="text-zinc-700">{selectedOrder.shipping_address.address_line1}</p>
                <p className="text-[#1F2024] font-semibold">{selectedOrder.shipping_address.district}, Bangladesh</p>
                {selectedOrder.notes && (
                  <p className="text-[#6D35C8] pt-1 font-mono text-[11px]">Note: {selectedOrder.notes}</p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 text-xs">
              <p className="font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Ordered Jerseys</p>
              <div className="divide-y divide-[#E5E5E3] border-t border-b border-[#E5E5E3]">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-xl object-cover border border-[#E5E5E3] bg-zinc-100" />
                      <div>
                        <h5 className="font-bold text-[#1F2024]">{item.product_name}</h5>
                        <p className="text-zinc-500 text-[11px]">Size: <strong className="text-zinc-800">{item.size}</strong> • Qty: {item.quantity}</p>
                        {item.custom_name && (
                          <p className="text-[#6D35C8] font-mono text-[10px] font-bold">
                            Custom Print: {item.custom_name} #{item.custom_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#1F2024]">{formatBDT(item.total_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-xs text-right max-w-xs ml-auto">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-800">{formatBDT(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatBDT(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Delivery:</span>
                <span className="font-mono text-zinc-800">{formatBDT(selectedOrder.delivery_charge)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#E5E5E3] text-[#1F2024]">
                <span>Total Amount:</span>
                <span className="font-display text-lg font-black text-[#1F2024] font-mono">
                  {formatBDT(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
