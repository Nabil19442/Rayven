import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { db } from '../lib/db';
import { Order } from '../types';
import { 
  User, Package, MapPin, LogOut, Shield, CheckCircle2, 
  Clock, Truck, Edit3, Save, ArrowRight, Heart 
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, logout, updateProfile } = useAuth();
  const { formatBDT, showToast } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (user) {
      setEditName(user.full_name);
      setEditPhone(user.phone || '');
      db.getOrders(user.id).then(setOrders);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 text-[#1F2024]">
        <div className="w-16 h-16 rounded-full bg-[#F7F7F5] border border-[#E5E5E3] flex items-center justify-center mx-auto text-zinc-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-black text-[#1F2024] uppercase">Account Login Required</h2>
        <p className="text-xs text-zinc-500">Please sign in to access your profile, order history, and saved preferences.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="w-full py-3 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-purple-900/20 cursor-pointer"
        >
          Sign In to RAYVEN
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: editName,
      phone: editPhone
    });
    setIsEditingProfile(false);
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1F2024]">
      {/* Profile Overview Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
            alt={user.full_name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#6D35C8] shadow-sm"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-black text-[#1F2024] uppercase">
                {user.full_name}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                isAdmin ? 'bg-[#6D35C8] text-white' : 'bg-zinc-100 text-zinc-700'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
            {user.phone && <p className="text-xs text-zinc-400 font-mono">{user.phone}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('/admin')}
              className="px-4 py-2 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          )}

          <button
            onClick={async () => {
              await logout();
              onNavigate('/');
            }}
            className="px-4 py-2 bg-[#F7F7F5] hover:bg-red-50 text-zinc-700 hover:text-red-600 border border-[#E5E5E3] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E3] gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders' ? 'border-[#6D35C8] text-[#6D35C8]' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile' ? 'border-[#6D35C8] text-[#6D35C8]' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-3">
                <Package className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase">No orders found</h3>
                <p className="text-xs text-zinc-500">You have not placed any football kit orders yet.</p>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="px-6 py-2 bg-[#6D35C8] text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E5E3]">
                    <div>
                      <p className="text-xs text-zinc-400 font-mono">ORDER ID</p>
                      <h4 className="font-display text-lg font-black text-[#6D35C8] font-mono">
                        {order.order_number}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30'
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => onNavigate(`/track-order?order=${order.order_number}`)}
                        className="px-3.5 py-1.5 bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 border border-[#E5E5E3] cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#6D35C8]" />
                        <span>Track</span>
                      </button>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-xs bg-[#F7F7F5] p-2.5 rounded-2xl border border-[#E5E5E3]">
                        <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-xl object-cover bg-white" />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-[#1F2024] truncate">{item.product_name}</h5>
                          <p className="text-[11px] text-zinc-500">Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                        <span className="font-mono font-bold text-[#6D35C8]">{formatBDT(item.total_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E5E3] text-zinc-600">
                    <span>Payment: <strong className="uppercase text-[#1F2024]">{order.payment_method}</strong> ({order.payment_status})</span>
                    <span className="font-bold text-[#1F2024] text-sm">
                      Total: <strong className="text-[#6D35C8] font-mono">{formatBDT(order.total_amount)}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] max-w-xl space-y-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider">
              Profile Information
            </h3>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 bg-[#F7F7F5] text-zinc-700 border border-[#E5E5E3] rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3]">
                  <div>
                    <span className="text-zinc-500">Full Name</span>
                    <p className="font-bold text-[#1F2024] text-sm mt-0.5">{user.full_name}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Email Address</span>
                    <p className="font-mono text-zinc-700 text-sm mt-0.5">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Phone</span>
                    <p className="font-mono text-zinc-700 text-sm mt-0.5">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Member Since</span>
                    <p className="text-zinc-700 text-sm mt-0.5">
                      {new Date(user.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-5 py-2.5 bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 border border-[#E5E5E3] transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
