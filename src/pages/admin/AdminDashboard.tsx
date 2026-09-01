import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Product, Order, OrderStatus } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { 
  TrendingUp, ShoppingBag, DollarSign, Clock, AlertTriangle, 
  CheckCircle2, Truck, ArrowRight, RefreshCw, Plus 
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { formatBDT, showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [p, o] = await Promise.all([db.getProducts(), db.getOrders()]);
    setProducts(p);
    setOrders(o);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total_amount : sum), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;

  // Find low stock variants (< 4 units)
  const lowStockItems: { product: Product; size: string; stock: number; variantId: string }[] = [];
  products.forEach(p => {
    p.variants.forEach(v => {
      if (v.stock_quantity <= 4) {
        lowStockItems.push({
          product: p,
          size: v.size,
          stock: v.stock_quantity,
          variantId: v.id
        });
      }
    });
  });

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await db.updateOrderStatus(orderId, status);
    if (updated) {
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      showToast(`Order status updated to "${status}"`, 'success');
    }
  };

  const handleQuickRestock = async (productId: string, size: string, currentStock: number) => {
    const newStock = currentStock + 10;
    await db.updateVariantStock(productId, size as any, newStock);
    showToast(`Restocked ${size} to ${newStock} units`, 'success');
    loadData();
  };

  return (
    <div className="space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STORE OVERVIEW & ANALYTICS
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold uppercase border border-[#E5E5E3] shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 4 Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Sales</span>
            <div className="p-2 bg-[#F3EEFC] text-[#6D35C8] rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="font-display text-3xl font-black text-[#1F2024] font-mono">
            {formatBDT(totalRevenue)}
          </p>
          <p className="text-[11px] text-zinc-500 font-medium">Across all confirmed orders</p>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-[#F7F7F5] text-zinc-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="font-display text-3xl font-black text-[#1F2024] font-mono">
            {totalOrdersCount}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">
            {deliveredOrdersCount} delivered successfully
          </p>
        </div>

        {/* Pending Orders */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pending Action</span>
            <div className="p-2 bg-[#F3EEFC] text-[#6D35C8] rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="font-display text-3xl font-black text-[#6D35C8] font-mono">
            {pendingOrdersCount}
          </p>
          <p className="text-[11px] text-zinc-500">Awaiting confirmation or dispatch</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Low Stock Kits</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="font-display text-3xl font-black text-red-600 font-mono">
            {lowStockItems.length}
          </p>
          <p className="text-[11px] text-zinc-500">Variants below 4 units in stock</p>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E3]">
            <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider">
              Recent Customer Orders
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#6D35C8] hover:text-[#4B218A] flex items-center gap-1 cursor-pointer"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-zinc-500 bg-[#F7F7F5] border-b border-[#E5E5E3] uppercase font-mono">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E3] text-zinc-700">
                {orders.slice(0, 6).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F7F7F5] transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#6D35C8]">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#1F2024]">{ord.customer_name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{ord.customer_phone}</p>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1F2024]">
                      {formatBDT(ord.total_amount)}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase border focus:outline-none cursor-pointer ${
                          ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          ord.status === 'shipped' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                          ord.status === 'pending' ? 'bg-[#F3EEFC] text-[#6D35C8] border-[#8B5AD9]/30' :
                          'bg-[#F7F7F5] text-zinc-700 border-[#E5E5E3]'
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
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('orders')}
                        className="text-zinc-400 hover:text-[#6D35C8] p-1 cursor-pointer"
                        title="View Full Order Details"
                      >
                        <ArrowRight className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Quick Restock Panel */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E3]">
            <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Low Stock Alert
            </h3>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-[#6D35C8] hover:text-[#4B218A] cursor-pointer"
            >
              Inventory
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                All football kit variants are adequately stocked!
              </p>
            ) : (
              lowStockItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#1F2024] truncate">{item.product.name}</p>
                    <p className="text-[11px] text-zinc-500">
                      Size: <strong className="text-zinc-800 font-mono">{item.size}</strong> • Stock: <span className="text-red-600 font-bold font-mono">{item.stock} left</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleQuickRestock(item.product.id, item.size, item.stock)}
                    className="px-2.5 py-1.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition shadow-xs cursor-pointer"
                    title="Add 10 units"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+10</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
