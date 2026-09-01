import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { db } from '../../lib/db';
import { StoreSettings } from '../../types';
import { Save, Settings, DollarSign, Truck, Phone, Mail, MapPin } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, setSettings, formatBDT, showToast } = useStore();

  const [storeName, setStoreName] = useState(settings.store_name || 'RAYVEN');
  const [tagline, setTagline] = useState(settings.tagline || 'Matchday & Authentic Football Kits');
  const [phone, setPhone] = useState(settings.phone || '+880 1712 345678');
  const [email, setEmail] = useState(settings.email || 'support@rayven.com');
  const [insideDhaka, setInsideDhaka] = useState(String(settings.inside_dhaka_delivery_fee || 60));
  const [outsideDhaka, setOutsideDhaka] = useState(String(settings.outside_dhaka_delivery_fee || 120));
  const [freeThreshold, setFreeThreshold] = useState(String(settings.free_shipping_threshold || 3000));
  const [announcement, setAnnouncement] = useState(settings.announcement_text || '⚡ FREE SHIPPING ON ORDERS OVER ৳3000 | 24-48H DHAKA DELIVERY');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: Partial<StoreSettings> = {
      store_name: storeName,
      tagline,
      phone,
      email,
      inside_dhaka_delivery_fee: Number(insideDhaka),
      outside_dhaka_delivery_fee: Number(outsideDhaka),
      free_shipping_threshold: Number(freeThreshold),
      announcement_text: announcement,
    };

    const updated = await db.updateSettings(payload);
    if (updated) {
      setSettings(updated);
      showToast('Store settings saved successfully!', 'success');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#1F2024]">
      <div>
        <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
          CONFIGURATION
        </span>
        <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
          Store & Delivery Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Store Profile */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
            1. Brand Identity & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Helpline / WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Support Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>
          </div>
        </div>

        {/* Delivery Rates & Free Shipping */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
            2. Bangladesh Delivery Fees & Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">
                Inside Dhaka Fee (BDT ৳)
              </label>
              <input
                type="number"
                required
                value={insideDhaka}
                onChange={(e) => setInsideDhaka(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Default ৳60 (24-48 hours)</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">
                Outside Dhaka Fee (BDT ৳)
              </label>
              <input
                type="number"
                required
                value={outsideDhaka}
                onChange={(e) => setOutsideDhaka(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Default ৳120 (48-72 hours)</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">
                Free Delivery Threshold (BDT ৳)
              </label>
              <input
                type="number"
                required
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Free delivery for orders above this</p>
            </div>
          </div>
        </div>

        {/* Top Header Announcement */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h2 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
            3. Storefront Announcement
          </h2>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#6D35C8] hover:bg-[#4B218A] disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md shadow-purple-900/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
