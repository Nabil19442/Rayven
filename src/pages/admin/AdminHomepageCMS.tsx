import React, { useState, useRef } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { db } from '../../lib/db';
import { StoreSettings } from '../../types';
import { uploadAppFile } from '../../lib/storage';
import { 
  Home, Image, Sparkles, Eye, Save, RefreshCw, Upload, 
  X, CheckCircle2, ShieldCheck, Zap, Award, Layers, ArrowRight
} from 'lucide-react';

export const AdminHomepageCMS: React.FC = () => {
  const { settings, updateSettings, showToast } = useStore();
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const hero = formData.hero || {
    badge: 'NEW 2026/27 UCL MASTER KITS',
    headline: 'AUTHENTIC FOOTBALL',
    headline_highlight: 'PERFORMANCE',
    subheadline: 'Engineered for true players and collectors. Premium heat-sealed silicone crests, breathable player-issue micro-mesh.',
    cta_text: 'SHOP 2026/27 KITS',
    cta_link: '/shop',
    secondary_cta_text: 'EXPLORE RETRO VAULT',
    secondary_cta_link: '/shop?type=retro',
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85',
    trust_badge_1: '100% Authentic Grade',
    trust_badge_2: '24-48h Dhaka Dispatch',
  };

  const sections = formData.homepage_sections || {
    hero: true,
    categories: true,
    featured_kits: true,
    new_arrivals: true,
    best_sellers: true,
    retro_vault: true,
    promotional_banners: true,
    why_rayven: true,
    customer_reviews: true,
    newsletter: true,
  };

  const whyRayven = formData.why_rayven_cards || [
    {
      id: 'c1',
      title: 'Player-Issue Heat.RDY & Dri-FIT ADV',
      description: 'Ultra-lightweight micro-mesh fabric engineered with laser-cut ventilation for peak breathability.',
      icon: 'ShieldCheck'
    },
    {
      id: 'c2',
      title: '3D Silicone & Metallic Gold Badges',
      description: 'Zero flat embroidery. High-definition heat-pressed flexible silicone club crests and official sleeve patches.',
      icon: 'Award'
    },
    {
      id: 'c3',
      title: 'Official Player Font Name & Number Printing',
      description: 'Authentic vinyl font heat-pressing with player names (Bellingham 5, Messi 10, Vini Jr. 7) or custom lettering.',
      icon: 'Zap'
    },
    {
      id: 'c4',
      title: 'Swift Bangladesh Dispatch & Doorstep Check',
      description: '24-48h Dhaka delivery, 48-72h nationwide via SteadFast with parcel checking at delivery.',
      icon: 'Truck'
    }
  ];

  const handleHeroImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const res = await uploadAppFile({
        file,
        featureName: 'homepage-hero',
        itemId: 'hero-main',
      });

      setFormData(prev => ({
        ...prev,
        hero: {
          ...(prev.hero || hero),
          image_url: res.url,
        }
      }));
      showToast('Hero background uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload hero image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateSettings({
        ...formData,
        hero,
        homepage_sections: sections,
        why_rayven_cards: whyRayven,
      });
      setFormData({ ...updated });
      showToast('Homepage CMS settings saved and live!', 'success');
    } catch (err) {
      showToast('Failed to save homepage settings.', 'error');
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
            Homepage Content Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure the main hero banner, value proposition highlights, and toggle section visibility.
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
              <span>Publish Homepage</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. HERO SECTION CMS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-4">
            <h2 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6D35C8]" />
              <span>1. Main Hero Banner & Headlines</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Storefront Primary View</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Hero Tag / Badge Text</label>
              <input
                type="text"
                value={hero.badge}
                onChange={(e) => {
                  const updatedHero = { ...hero, badge: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Main Headline Word</label>
              <input
                type="text"
                value={hero.headline}
                onChange={(e) => {
                  const updatedHero = { ...hero, headline: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Headline Highlight / Gradient Word</label>
              <input
                type="text"
                value={hero.headline_highlight}
                onChange={(e) => {
                  const updatedHero = { ...hero, headline_highlight: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Trust Badge #1</label>
              <input
                type="text"
                value={hero.trust_badge_1 || ''}
                onChange={(e) => {
                  const updatedHero = { ...hero, trust_badge_1: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                placeholder="100% Authentic Grade"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Hero Description / Subtitle</label>
              <textarea
                rows={2}
                value={hero.subheadline}
                onChange={(e) => {
                  const updatedHero = { ...hero, subheadline: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Primary Button Text</label>
              <input
                type="text"
                value={hero.cta_text}
                onChange={(e) => {
                  const updatedHero = { ...hero, cta_text: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Primary Button Link</label>
              <input
                type="text"
                value={hero.cta_link}
                onChange={(e) => {
                  const updatedHero = { ...hero, cta_link: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Secondary Button Text</label>
              <input
                type="text"
                value={hero.secondary_cta_text || ''}
                onChange={(e) => {
                  const updatedHero = { ...hero, secondary_cta_text: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Secondary Button Link</label>
              <input
                type="text"
                value={hero.secondary_cta_link || ''}
                onChange={(e) => {
                  const updatedHero = { ...hero, secondary_cta_link: e.target.value };
                  setFormData({ ...formData, hero: updatedHero });
                }}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>
          </div>

          {/* Hero Background Image Upload with Device File Input */}
          <div className="pt-6 border-t border-[#E5E5E3] space-y-4">
            <label className="text-xs font-bold uppercase text-zinc-700 block">
              Hero Section Background Image (Device Upload)
            </label>
            
            <div className="flex flex-col md:flex-row items-start gap-5">
              <div className="w-full md:w-80 h-44 rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden relative group">
                <img
                  src={hero.image_url}
                  alt="Hero Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Current Hero Visual</span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <input
                  ref={heroImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleHeroImageUpload(e.target.files[0]);
                  }}
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => heroImageInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-300 flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-[#6D35C8]" />
                    <span>{isUploading ? 'Uploading Image...' : 'Upload Image from Device'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updatedHero = {
                        ...hero,
                        image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85'
                      };
                      setFormData({ ...formData, hero: updatedHero });
                      showToast('Reset to default matchday photography', 'info');
                    }}
                    className="px-4 py-2.5 text-zinc-500 hover:text-zinc-800 text-xs font-medium transition cursor-pointer"
                  >
                    Reset to Default Stadium Visual
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Recommended size: 1920 x 1080 px or 1600 x 900 px (Landscape). JPG or WEBP formats optimize fast loading on mobile 4G networks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. HOMEPAGE SECTION VISIBILITY TOGGLES */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-4">
            <h2 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#6D35C8]" />
              <span>2. Homepage Section Visibility Controls</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Enable / Disable Modules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'hero', label: 'Main Hero Banner' },
              { key: 'categories', label: 'Club League Category Tabs' },
              { key: 'featured_kits', label: 'Featured Match Kits Grid' },
              { key: 'new_arrivals', label: 'New Arrivals 2026/27 Drop' },
              { key: 'best_sellers', label: 'Trending & Best Sellers' },
              { key: 'retro_vault', label: 'Retro Classic Kits Vault' },
              { key: 'promotional_banners', label: 'Matchday Promo Banners' },
              { key: 'why_rayven', label: 'Why RAYVEN Value Proposition' },
              { key: 'customer_reviews', label: 'Verified Fan Reviews & Ratings' },
              { key: 'newsletter', label: 'Squad Newsletter Signup' },
            ].map(sec => {
              const isEnabled = sections[sec.key as keyof typeof sections] !== false;
              return (
                <div
                  key={sec.key}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F5] border border-zinc-200"
                >
                  <span className="text-xs font-bold text-zinc-800 uppercase">{sec.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        const updated = { ...sections, [sec.key]: e.target.checked };
                        setFormData({ ...formData, homepage_sections: updated });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D35C8]"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. WHY RAYVEN VALUE PROPOSITION CARDS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-4">
            <h2 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-[#6D35C8]" />
              <span>3. "Why RAYVEN" 4-Pillar Quality Cards</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Craftsmanship Proofs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {whyRayven.map((card, idx) => (
              <div key={card.id || idx} className="p-5 rounded-2xl bg-[#F7F7F5] border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#6D35C8] font-mono">Pillar #{idx + 1}</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-600 block mb-1">Title</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => {
                      const copy = [...whyRayven];
                      copy[idx] = { ...copy[idx], title: e.target.value };
                      setFormData({ ...formData, why_rayven_cards: copy });
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-[#1F2024] focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-600 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={card.description}
                    onChange={(e) => {
                      const copy = [...whyRayven];
                      copy[idx] = { ...copy[idx], description: e.target.value };
                      setFormData({ ...formData, why_rayven_cards: copy });
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-[#1F2024] focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E5E5E3] shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Updates will display live across the customer home experience.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Publish Homepage</span>
          </button>
        </div>
      </form>
    </div>
  );
};
