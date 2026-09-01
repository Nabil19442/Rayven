import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Coupon } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { Plus, Tag, Trash2, CheckCircle2, XCircle, Percent, DollarSign, X } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { formatBDT, showToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // New coupon form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('1500');
  const [maxDiscount, setMaxDiscount] = useState('500');

  const loadCoupons = async () => {
    const data = await db.getCoupons();
    setCoupons(data);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleToggleActive = async (c: Coupon) => {
    const updated = await db.updateCoupon(c.id, { is_active: !c.is_active });
    if (updated) {
      setCoupons(coupons.map(item => (item.id === c.id ? updated : item)));
      showToast(`Coupon ${c.code} status updated`, 'success');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      await db.deleteCoupon(id);
      setCoupons(coupons.filter(c => c.id !== id));
      showToast('Coupon removed', 'info');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const payload: Partial<Coupon> = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_value: Number(minOrderValue) || 0,
      max_discount_amount: maxDiscount ? Number(maxDiscount) : undefined,
      is_active: true,
      used_count: 0
    };

    const created = await db.createCoupon(payload);
    if (created) {
      setCoupons([created, ...coupons]);
      setIsCreating(false);
      setCode('');
      showToast(`Coupon ${created.code} created!`, 'success');
    }
  };

  return (
    <div className="space-y-6 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            MARKETING & PROMOTIONS
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Discount Coupons & Vouchers
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition shadow-md shadow-purple-900/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      {/* New Coupon Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E5E3] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-black text-[#1F2024] uppercase">
                Create Promo Coupon
              </h3>
              <button onClick={() => setIsCreating(false)} className="p-1.5 text-zinc-400 hover:text-zinc-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Promo Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RAYVEN10, DERBY50"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] uppercase font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8] cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed BDT (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Min. Order (BDT)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Max Cap (BDT)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold uppercase hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6D35C8] text-white font-bold rounded-xl text-xs uppercase hover:bg-[#4B218A] shadow-xs cursor-pointer"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="rounded-3xl bg-white border border-[#E5E5E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-[#E5E5E3] uppercase font-mono bg-[#F7F7F5]">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Cart Value</th>
                <th className="py-3 px-4">Times Redeemed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3] text-zinc-700">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#6D35C8] text-sm">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#1F2024]">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `${formatBDT(c.discount_value)} OFF`}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    {formatBDT(c.min_order_value)}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-700">
                    {c.used_count || 0} times
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                        c.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
