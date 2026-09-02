import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { db, seedCatalogToSupabase } from '../../lib/db';
import { supabase, isSupabaseConfigured, SUPABASE_URL } from '../../lib/supabase';
import { StoreSettings } from '../../types';
import { uploadAppFile } from '../../lib/storage';
import { 
  Save, Settings, DollarSign, Truck, Phone, Mail, MapPin, 
  Globe, Share2, Palette, Megaphone, Shield, AlertTriangle, 
  Upload, X, CheckCircle2, RefreshCw, Eye, ExternalLink,
  CreditCard, Smartphone, Lock, HelpCircle, Database, Server
} from 'lucide-react';

type SettingsTab = 'general' | 'branding' | 'contact' | 'social' | 'shipping' | 'payment' | 'announcement' | 'seo' | 'database';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast, formatBDT, refreshAll } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [dbProductCount, setDbProductCount] = useState<number | null>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Form State initialized from settings
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const checkDbHealth = async () => {
    try {
      setDbStatus('checking');
      const prods = await db.getProducts();
      setDbProductCount(prods.length);
      setDbStatus('connected');
    } catch (e) {
      setDbStatus('error');
    }
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  const handleSeedDatabase = async () => {
    if (!confirm('This will insert default 2025/26 and 2026/27 official kits, club categories, banners, and default store settings directly into Supabase. Continue?')) {
      return;
    }
    setIsSeeding(true);
    try {
      const ok = await seedCatalogToSupabase();
      if (ok) {
        showToast('Supabase Database successfully seeded!', 'success');
        await refreshAll();
        await checkDbHealth();
      } else {
        showToast('Seeding completed. Verify Supabase tables.', 'info');
      }
    } catch (err: any) {
      showToast(`Error seeding database: ${err?.message || err}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle image upload from device
  const handleFileUpload = async (field: keyof StoreSettings | 'og_image_url', file: File) => {
    try {
      setUploadingField(field);
      const result = await uploadAppFile({
        file,
        featureName: 'site-assets',
        itemId: field,
      });

      if (field === 'og_image_url') {
        setFormData(prev => ({
          ...prev,
          seo: {
            ...prev.seo,
            og_image_url: result.url,
            meta_title: prev.seo?.meta_title || '',
            meta_description: prev.seo?.meta_description || '',
            meta_keywords: prev.seo?.meta_keywords || '',
            og_title: prev.seo?.og_title || '',
            og_description: prev.seo?.og_description || '',
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: result.url }));
      }
      showToast('Asset uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload asset', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateSettings(formData);
      setFormData({ ...updated });
      showToast('All Store & CMS settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STORE MANAGEMENT & CMS
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Store Settings & Configuration
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage branding, delivery rates, contact details, social channels, SEO, and store availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-6 py-3 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E5E3] no-scrollbar">
        {[
          { id: 'general', label: 'General Info', icon: Settings },
          { id: 'branding', label: 'Branding & Assets', icon: Palette },
          { id: 'contact', label: 'Contact & Address', icon: Phone },
          { id: 'social', label: 'Social Channels', icon: Share2 },
          { id: 'shipping', label: 'Delivery & Shipping', icon: Truck },
          { id: 'payment', label: 'Payment Options', icon: CreditCard },
          { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
          { id: 'seo', label: 'SEO & Metadata', icon: Globe },
          { id: 'database', label: 'Database & Sync', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#1F2024] text-white shadow-xs'
                  : 'bg-white text-zinc-600 hover:bg-[#F7F7F5] border border-[#E5E5E3]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8B5AD9]' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
              <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#6D35C8]" />
                <span>Store Identity & Operation Status</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Store Name</label>
                  <input
                    type="text"
                    required
                    value={formData.store_name}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Store Tagline / Slogan</label>
                  <input
                    type="text"
                    value={formData.store_tagline || ''}
                    onChange={(e) => setFormData({ ...formData, store_tagline: e.target.value, tagline: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Store Description</label>
                  <textarea
                    rows={2}
                    value={formData.store_description || ''}
                    onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.currency_symbol || '৳'}
                    onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Order Number Prefix</label>
                  <input
                    type="text"
                    value={formData.order_prefix || 'RAY'}
                    onChange={(e) => setFormData({ ...formData, order_prefix: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
              </div>

              {/* Store Status Toggle */}
              <div className="pt-4 border-t border-[#E5E5E3] space-y-4">
                <label className="text-xs font-bold uppercase text-zinc-700 block">Store Availability Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { status: 'OPEN', label: 'Store Open', desc: 'Customers can browse and place orders normally' },
                    { status: 'CLOSED', label: 'Store Closed', desc: 'Display store closed notice to visitors' },
                    { status: 'MAINTENANCE', label: 'Maintenance Mode', desc: 'Display maintenance notice while updating' },
                  ].map(mode => (
                    <button
                      key={mode.status}
                      type="button"
                      onClick={() => setFormData({ ...formData, store_status: mode.status as any })}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        formData.store_status === mode.status
                          ? 'bg-[#F3EEFC] border-[#6D35C8] text-[#6D35C8]'
                          : 'bg-[#F7F7F5] border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase">{mode.label}</span>
                        {formData.store_status === mode.status && <CheckCircle2 className="w-4 h-4 text-[#6D35C8]" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">{mode.desc}</p>
                    </button>
                  ))}
                </div>

                {formData.store_status !== 'OPEN' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <label className="text-xs font-bold uppercase text-amber-900 block">Notice Message Displayed to Visitors</label>
                    <input
                      type="text"
                      value={formData.status_message || ''}
                      onChange={(e) => setFormData({ ...formData, status_message: e.target.value })}
                      placeholder="e.g. We are currently restocking 2026/27 UCL Player Kits. Ordering resumes at 6:00 PM."
                      className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2 text-xs text-zinc-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. BRANDING TAB */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
              <div>
                <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#6D35C8]" />
                  <span>Logos & Visual Assets</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Upload your brand logo assets directly from your device. Supported formats: PNG, JPG, WEBP, SVG (Max 10MB).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Main Light Logo */}
                <div className="p-5 rounded-2xl bg-[#F7F7F5] border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-zinc-700">Navbar / Light Logo</span>
                    {formData.light_logo_url || formData.logo_url ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Default SVG</span>
                    )}
                  </div>

                  <div className="h-24 rounded-xl bg-white border border-dashed border-zinc-300 flex items-center justify-center p-2 relative overflow-hidden">
                    {formData.light_logo_url || formData.logo_url ? (
                      <img
                        src={formData.light_logo_url || formData.logo_url}
                        alt="Light Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400 font-mono">No Custom Image</span>
                    )}
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload('light_logo_url', e.target.files[0]);
                    }}
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingField === 'light_logo_url'}
                      className="flex-1 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'light_logo_url' ? 'Uploading...' : 'Choose File'}</span>
                    </button>
                    {(formData.light_logo_url || formData.logo_url) && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, light_logo_url: '', logo_url: '' })}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
                        title="Remove Logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer / Dark Logo */}
                <div className="p-5 rounded-2xl bg-[#1F2024] text-white border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-zinc-300">Footer / Dark Logo</span>
                    {formData.dark_logo_url ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Default SVG</span>
                    )}
                  </div>

                  <div className="h-24 rounded-xl bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-center p-2 relative overflow-hidden">
                    {formData.dark_logo_url ? (
                      <img
                        src={formData.dark_logo_url}
                        alt="Dark Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-zinc-500 font-mono">No Custom Image</span>
                    )}
                  </div>

                  <input
                    ref={darkLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload('dark_logo_url', e.target.files[0]);
                    }}
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => darkLogoInputRef.current?.click()}
                      disabled={uploadingField === 'dark_logo_url'}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'dark_logo_url' ? 'Uploading...' : 'Choose File'}</span>
                    </button>
                    {formData.dark_logo_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, dark_logo_url: '' })}
                        className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl border border-rose-800 transition"
                        title="Remove Logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Favicon */}
                <div className="p-5 rounded-2xl bg-[#F7F7F5] border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-zinc-700">Browser Favicon</span>
                    {formData.favicon_url ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Default</span>
                    )}
                  </div>

                  <div className="h-24 rounded-xl bg-white border border-dashed border-zinc-300 flex items-center justify-center p-2 relative overflow-hidden">
                    {formData.favicon_url ? (
                      <img
                        src={formData.favicon_url}
                        alt="Favicon"
                        className="w-10 h-10 object-contain rounded-lg shadow-xs"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400 font-mono">32x32 / 64x64 PNG</span>
                    )}
                  </div>

                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload('favicon_url', e.target.files[0]);
                    }}
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingField === 'favicon_url'}
                      className="flex-1 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'favicon_url' ? 'Uploading...' : 'Choose File'}</span>
                    </button>
                    {formData.favicon_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, favicon_url: '' })}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
                        title="Remove Favicon"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="pt-6 border-t border-[#E5E5E3] space-y-4">
                <h4 className="font-bold text-xs uppercase text-zinc-800">Brand Color Accent Palette</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F7F5] border border-zinc-200">
                    <input
                      type="color"
                      value={formData.primary_color || '#6D35C8'}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-800 uppercase">Primary Accent</p>
                      <p className="text-[11px] font-mono text-zinc-500">{formData.primary_color || '#6D35C8'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F7F5] border border-zinc-200">
                    <input
                      type="color"
                      value={formData.secondary_color || '#8B5AD9'}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-800 uppercase">Secondary Glow</p>
                      <p className="text-[11px] font-mono text-zinc-500">{formData.secondary_color || '#8B5AD9'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
            <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#6D35C8]" />
              <span>Customer Helpline & Business Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">WhatsApp Helpline</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value, support_phone: e.target.value, whatsapp_number: e.target.value })}
                  placeholder="+880 1711-234567"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Official Support Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value, support_email: e.target.value })}
                  placeholder="orders@rayven.store"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Dispatch Hub / Showroom Address</label>
                <input
                  type="text"
                  value={formData.business_address || formData.showroom_address || ''}
                  onChange={(e) => setFormData({ ...formData, business_address: e.target.value, showroom_address: e.target.value })}
                  placeholder="House 42, Road 11, Block D, Banani, Dhaka 1213, Bangladesh"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Business Operating Hours</label>
                <input
                  type="text"
                  value={formData.business_hours || 'Everyday: 10:00 AM - 11:00 PM'}
                  onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Google Maps Link</label>
                <input
                  type="url"
                  value={formData.google_maps_url || ''}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. SOCIAL CHANNELS TAB */}
        {activeTab === 'social' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
            <div>
              <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#6D35C8]" />
                <span>Social Media & Community Links</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Enable or disable social links displayed on the website navbar, footer, and contact hubs.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'facebook', label: 'Facebook Page / Group', placeholder: 'https://facebook.com/rayvenfootball' },
                { key: 'instagram', label: 'Instagram Profile', placeholder: 'https://instagram.com/rayven.bd' },
                { key: 'tiktok', label: 'TikTok Channel', placeholder: 'https://tiktok.com/@rayvenfootball' },
                { key: 'youtube', label: 'YouTube Channel', placeholder: 'https://youtube.com/@rayvensportswear' },
                { key: 'whatsapp', label: 'WhatsApp Direct Chat', placeholder: 'https://wa.me/8801711234567' },
                { key: 'messenger', label: 'Facebook Messenger', placeholder: 'https://m.me/rayvenfootball' },
              ].map(item => {
                const currentSocial = formData.social_links?.[item.key as keyof typeof formData.social_links] || {
                  url: (item.key === 'facebook' ? formData.facebook_url : item.key === 'instagram' ? formData.instagram_url : '') || '',
                  enabled: true
                };

                return (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-[#F7F7F5] border border-zinc-200">
                    <div className="w-48 shrink-0 flex items-center justify-between sm:justify-start gap-3">
                      <span className="text-xs font-bold uppercase text-zinc-800">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSocial.enabled}
                          onChange={(e) => {
                            const updated = {
                              ...formData.social_links,
                              [item.key]: { ...currentSocial, enabled: e.target.checked }
                            };
                            setFormData({ ...formData, social_links: updated as any });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D35C8]"></div>
                      </label>
                    </div>

                    <input
                      type="url"
                      value={currentSocial.url}
                      disabled={!currentSocial.enabled}
                      onChange={(e) => {
                        const updated = {
                          ...formData.social_links,
                          [item.key]: { ...currentSocial, url: e.target.value }
                        };
                        setFormData({
                          ...formData,
                          social_links: updated as any,
                          facebook_url: item.key === 'facebook' ? e.target.value : formData.facebook_url,
                          instagram_url: item.key === 'instagram' ? e.target.value : formData.instagram_url,
                        });
                      }}
                      placeholder={item.placeholder}
                      className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:outline-none focus:border-[#6D35C8] disabled:opacity-40"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. SHIPPING & DELIVERY TAB */}
        {activeTab === 'shipping' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
            <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6D35C8]" />
              <span>Bangladesh Delivery Rates & Free Shipping</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">
                  Inside Dhaka Delivery Fee (৳)
                </label>
                <input
                  type="number"
                  required
                  value={formData.inside_dhaka_delivery_fee}
                  onChange={(e) => setFormData({ ...formData, inside_dhaka_delivery_fee: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Default ৳60 across Dhaka Metropolitan</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">
                  Outside Dhaka Delivery Fee (৳)
                </label>
                <input
                  type="number"
                  required
                  value={formData.outside_dhaka_delivery_fee}
                  onChange={(e) => setFormData({ ...formData, outside_dhaka_delivery_fee: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Default ৳120 across all other 63 districts</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">
                  Free Shipping Minimum (৳)
                </label>
                <input
                  type="number"
                  required
                  value={formData.free_shipping_threshold}
                  onChange={(e) => setFormData({ ...formData, free_shipping_threshold: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Orders above this receive ৳0 delivery fee</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">
                  Inside Dhaka Delivery Time
                </label>
                <input
                  type="text"
                  value={formData.inside_dhaka_delivery_time || '24-48 Hours'}
                  onChange={(e) => setFormData({ ...formData, inside_dhaka_delivery_time: e.target.value })}
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">
                  Outside Dhaka Delivery Time
                </label>
                <input
                  type="text"
                  value={formData.outside_dhaka_delivery_time || '48-72 Hours'}
                  onChange={(e) => setFormData({ ...formData, outside_dhaka_delivery_time: e.target.value })}
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="free-shipping-toggle"
                  checked={formData.free_shipping_enabled !== false}
                  onChange={(e) => setFormData({ ...formData, free_shipping_enabled: e.target.checked })}
                  className="w-4 h-4 text-[#6D35C8] rounded border-zinc-300 focus:ring-[#6D35C8]"
                />
                <label htmlFor="free-shipping-toggle" className="text-xs font-bold text-zinc-800 cursor-pointer uppercase">
                  Enable Free Delivery Promotion
                </label>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Shipping & Courier Notice</label>
                <input
                  type="text"
                  value={formData.shipping_note || ''}
                  onChange={(e) => setFormData({ ...formData, shipping_note: e.target.value })}
                  placeholder="Parcels are dispatched daily via SteadFast and Pathao Express with live SMS tracking."
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. PAYMENT TAB */}
        {activeTab === 'payment' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
            <div>
              <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#6D35C8]" />
                <span>Payment Gateways & Mobile Banking</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configure payment channels displayed during checkout.
              </p>
            </div>

            {/* COD */}
            <div className="p-5 rounded-2xl bg-[#F7F7F5] border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6D35C8]" />
                  <span className="font-bold text-xs uppercase text-zinc-800">Cash on Delivery (COD)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.payment_methods?.cod?.enabled !== false}
                    onChange={(e) => {
                      const pm = formData.payment_methods || ({} as any);
                      setFormData({
                        ...formData,
                        payment_methods: {
                          ...pm,
                          cod: {
                            enabled: e.target.checked,
                            title: pm.cod?.title || 'Cash on Delivery (COD)',
                            description: pm.cod?.description || 'Inspect and verify your parcel right at your doorstep before paying.',
                          }
                        } as any
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D35C8]"></div>
                </label>
              </div>
              <p className="text-xs text-zinc-500">Allows customer to pay in cash after parcel inspection at delivery.</p>
            </div>

            {/* bKash */}
            <div className="p-5 rounded-2xl bg-[#F7F7F5] border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-pink-600" />
                  <span className="font-bold text-xs uppercase text-zinc-800">bKash Mobile Payment</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.payment_methods?.bkash?.enabled !== false}
                    onChange={(e) => {
                      const pm = formData.payment_methods || ({} as any);
                      setFormData({
                        ...formData,
                        payment_methods: {
                          ...pm,
                          bkash: {
                            enabled: e.target.checked,
                            number: pm.bkash?.number || '01711234567',
                            account_type: pm.bkash?.account_type || 'Merchant',
                            instructions: pm.bkash?.instructions || 'Pay to our bKash Merchant account with Order ID as reference.',
                          }
                        } as any
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D35C8]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-600 block mb-1">bKash Account Number</label>
                  <input
                    type="text"
                    value={formData.payment_methods?.bkash?.number || '01711234567'}
                    onChange={(e) => {
                      const pm = formData.payment_methods || ({} as any);
                      setFormData({
                        ...formData,
                        payment_methods: {
                          ...pm,
                          bkash: { ...(pm.bkash || {}), number: e.target.value }
                        } as any
                      });
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-600 block mb-1">Account Type</label>
                  <select
                    value={formData.payment_methods?.bkash?.account_type || 'Merchant'}
                    onChange={(e) => {
                      const pm = formData.payment_methods || ({} as any);
                      setFormData({
                        ...formData,
                        payment_methods: {
                          ...pm,
                          bkash: { ...(pm.bkash || {}), account_type: e.target.value as any }
                        } as any
                      });
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none"
                  >
                    <option value="Merchant">Merchant (Make Payment)</option>
                    <option value="Personal">Personal (Send Money)</option>
                    <option value="Agent">Agent (Cash In)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nagad */}
            <div className="p-5 rounded-2xl bg-[#F7F7F5] border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-600" />
                  <span className="font-bold text-xs uppercase text-zinc-800">Nagad Mobile Payment</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.payment_methods?.nagad?.enabled !== false}
                    onChange={(e) => {
                      const pm = formData.payment_methods || ({} as any);
                      setFormData({
                        ...formData,
                        payment_methods: {
                          ...pm,
                          nagad: {
                            enabled: e.target.checked,
                            number: pm.nagad?.number || '01711234567',
                            account_type: pm.nagad?.account_type || 'Merchant',
                            instructions: pm.nagad?.instructions || 'Pay to our Nagad account with Order ID.',
                          }
                        } as any
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D35C8]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-600 block mb-1">Nagad Account Number</label>
                  <input
                    type="text"
                    value={formData.payment_methods?.nagad?.number || '01711234567'}
                    onChange={(e) => {
                      const pm = formData.payment_methods || ({} as any);
                      setFormData({
                        ...formData,
                        payment_methods: {
                          ...pm,
                          nagad: { ...(pm.nagad || {}), number: e.target.value }
                        } as any
                      });
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-600 block mb-1">Account Type</label>
                  <select
                    value={formData.payment_methods?.nagad?.account_type || 'Merchant'}
                    onChange={(e) => {
                      const pm = formData.payment_methods || ({} as any);
                      setFormData({
                        ...formData,
                        payment_methods: {
                          ...pm,
                          nagad: { ...(pm.nagad || {}), account_type: e.target.value as any }
                        } as any
                      });
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none"
                  >
                    <option value="Merchant">Merchant</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. ANNOUNCEMENT TAB */}
        {activeTab === 'announcement' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#6D35C8]" />
                  <span>Top Announcement Banner</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Display an active announcement bar across header and storefront pages.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcement?.enabled !== false}
                  onChange={(e) => {
                    const ann = formData.announcement || ({} as any);
                    setFormData({
                      ...formData,
                      announcement: {
                        ...ann,
                        enabled: e.target.checked,
                        text: ann.text || formData.announcement_text || '🔥 100% MASTER GRADE KITS | ⚡ INSIDE DHAKA ৳60 / OUTSIDE DHAKA ৳120',
                        badge: ann.badge || 'EXCLUSIVE MATCHDAY DROP',
                        placement: ann.placement || 'all'
                      }
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D35C8]"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Announcement Message</label>
                <input
                  type="text"
                  value={formData.announcement?.text || formData.announcement_bar || formData.announcement_text || ''}
                  onChange={(e) => {
                    const text = e.target.value;
                    const ann = formData.announcement || ({} as any);
                    setFormData({
                      ...formData,
                      announcement_bar: text,
                      announcement_text: text,
                      announcement: { ...ann, text }
                    });
                  }}
                  placeholder="🔥 100% MASTER GRADE KITS | ⚡ INSIDE DHAKA ৳60 / OUTSIDE DHAKA ৳120 | 📦 FREE SHIPPING ON ৳3,000+"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Badge Label</label>
                  <input
                    type="text"
                    value={formData.announcement?.badge || 'EXCLUSIVE DROP'}
                    onChange={(e) => {
                      const ann = formData.announcement || ({} as any);
                      setFormData({ ...formData, announcement: { ...ann, badge: e.target.value } });
                    }}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Display Placement</label>
                  <select
                    value={formData.announcement?.placement || 'all'}
                    onChange={(e) => {
                      const ann = formData.announcement || ({} as any);
                      setFormData({ ...formData, announcement: { ...ann, placement: e.target.value as any } });
                    }}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  >
                    <option value="all">All Pages (Top Navbar)</option>
                    <option value="homepage">Homepage Only</option>
                    <option value="shop">Shop Page Only</option>
                    <option value="checkout">Checkout Page Only</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-2xl bg-[#17181C] text-white border border-zinc-800 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Live Header Preview</span>
                <div className="py-2 px-4 rounded-xl bg-[#1F2024] border border-zinc-700 flex items-center justify-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-[#6D35C8] text-white text-[10px] font-black uppercase tracking-wider">
                    {formData.announcement?.badge || 'EXCLUSIVE DROP'}
                  </span>
                  <span className="text-zinc-200 font-medium truncate">
                    {formData.announcement?.text || formData.announcement_text || '🔥 100% MASTER GRADE KITS | INSIDE DHAKA ৳60 / OUTSIDE DHAKA ৳120'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. SEO TAB */}
        {activeTab === 'seo' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
            <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#6D35C8]" />
              <span>Search Engine Optimization & Social Sharing</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Site Meta Title</label>
                <input
                  type="text"
                  value={formData.seo?.meta_title || ''}
                  onChange={(e) => {
                    const seo = formData.seo || ({} as any);
                    setFormData({ ...formData, seo: { ...seo, meta_title: e.target.value } });
                  }}
                  placeholder="RAYVEN | Premium Football Jerseys in Bangladesh"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Meta Description</label>
                <textarea
                  rows={3}
                  value={formData.seo?.meta_description || ''}
                  onChange={(e) => {
                    const seo = formData.seo || ({} as any);
                    setFormData({ ...formData, seo: { ...seo, meta_description: e.target.value } });
                  }}
                  placeholder="Buy authentic master-grade player edition jerseys, retro classic kits, and custom name prints in Bangladesh..."
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Meta Keywords</label>
                <input
                  type="text"
                  value={formData.seo?.meta_keywords || ''}
                  onChange={(e) => {
                    const seo = formData.seo || ({} as any);
                    setFormData({ ...formData, seo: { ...seo, meta_keywords: e.target.value } });
                  }}
                  placeholder="football jerseys bangladesh, authentic player edition, real madrid jersey dhaka"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              {/* Social Share OG Image */}
              <div className="pt-4 border-t border-[#E5E5E3] space-y-3">
                <label className="text-xs font-bold uppercase text-zinc-700 block">Social Sharing (Open Graph) Banner Image</label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-48 aspect-[1.91/1] rounded-xl bg-[#F7F7F5] border border-dashed border-zinc-300 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.seo?.og_image_url ? (
                      <img src={formData.seo.og_image_url} alt="OG Banner" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-mono">1200 x 630 px</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      ref={ogImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload('og_image_url', e.target.files[0]);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => ogImageInputRef.current?.click()}
                      disabled={uploadingField === 'og_image_url'}
                      className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'og_image_url' ? 'Uploading...' : 'Upload Social Share Image'}</span>
                    </button>
                    <p className="text-[11px] text-zinc-500">
                      This image is displayed when your store link is shared on Facebook, WhatsApp, or Twitter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. DATABASE & SYNC TAB */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3]">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[#1F2024] uppercase tracking-wide">
                    Supabase Single Source of Truth
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Verify cloud database health, real-time synchronization, and remote data tables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={checkDbHealth}
                  className="px-3 py-1.5 bg-[#F7F7F5] hover:bg-[#E5E5E3] text-zinc-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbStatus === 'checking' ? 'animate-spin' : ''}`} />
                  <span>Check Status</span>
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-1">
                  <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase">Backend Connection</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <p className="text-sm font-bold text-[#1F2024]">
                      {isSupabaseConfigured ? 'Supabase Connected' : 'Missing Supabase Config'}
                    </p>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">{SUPABASE_URL}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-1">
                  <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase">Products in Database</span>
                  <p className="font-display text-2xl font-black text-[#1F2024] font-mono">
                    {dbProductCount !== null ? `${dbProductCount} Products` : 'Loading...'}
                  </p>
                  <p className="text-[10px] text-emerald-700">Remote tables: products & product_variants</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-1">
                  <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase">Cross-Device Realtime</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#6D35C8]">
                    <span className="w-2 h-2 rounded-full bg-[#6D35C8] animate-ping" />
                    <span>Real-Time Broadcast Active</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Live sync across all customer phones & laptops</p>
                </div>
              </div>

              {/* Seeding & Catalog Push */}
              <div className="p-5 rounded-2xl bg-[#F3EEFC] border border-[#8B5AD9]/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-[#6D35C8] uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      <span>Seed / Sync Initial Catalog to Supabase</span>
                    </h4>
                    <p className="text-xs text-zinc-600 max-w-xl">
                      If your remote Supabase database is clean or empty, click here to insert all categories, match kits, size variants, banners, and default store settings directly into your Supabase tables.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isSeeding ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Seeding Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Seed Supabase Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="sticky bottom-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E5E5E3] shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Changes will apply immediately across your customer storefront.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
