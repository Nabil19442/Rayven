import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { db } from '../../lib/db';
import { CMSPage, StoreSettings } from '../../types';
import { uploadAppFile } from '../../lib/storage';
import { 
  FileText, Shield, Truck, HelpCircle, Save, RefreshCw, 
  Upload, X, CheckCircle2, Eye, Award, Sparkles, Globe 
} from 'lucide-react';

type PageKey = 'about' | 'returns' | 'shipping' | 'terms' | 'privacy';

export const AdminPagesCMS: React.FC = () => {
  const { settings, updateSettings, pages, refreshPages, showToast } = useStore();
  const [activePage, setActivePage] = useState<PageKey>('about');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);

  // About Page State
  const [aboutState, setAboutState] = useState({
    title: settings.about_us?.title || 'THE ART OF AUTHENTIC MATCHDAY KITS',
    subtitle: settings.about_us?.subtitle || 'Born from obsessive football passion in Dhaka',
    story: settings.about_us?.story || 'RAYVEN was founded by football fanatics who were frustrated with low-quality, scratchy replicas. We spent years sourcing authentic master-grade materials, working directly with premier textile manufacturers to bring player-issue HEAT.RDY and Dri-FIT ADV kits to Bangladesh.',
    mission: settings.about_us?.mission || 'To deliver professional player-grade football jerseys with official name printing and authentic badges to every enthusiast across Bangladesh.',
    vision: settings.about_us?.vision || 'To become the gold standard sportswear and matchday kit house in South Asia.',
    image_url: settings.about_us?.image_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85',
    stats: settings.about_us?.stats || [
      { label: 'Verified Fans Served', value: '15,000+' },
      { label: 'Clubs & National Kits', value: '120+' },
      { label: 'Customer Satisfaction', value: '99.4%' },
      { label: 'Average Dhaka Dispatch', value: '24 Hours' }
    ]
  });

  // Policy Pages (Returns, Shipping, Terms, Privacy)
  const [policyPages, setPolicyPages] = useState<Record<string, CMSPage>>({});

  useEffect(() => {
    const map: Record<string, CMSPage> = {};
    pages.forEach(p => {
      map[p.slug] = p;
    });
    setPolicyPages(map);
  }, [pages]);

  const handleAboutImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const res = await uploadAppFile({
        file,
        featureName: 'about-story',
        itemId: 'story-hero',
      });
      setAboutState(prev => ({ ...prev, image_url: res.url }));
      showToast('About page image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        about_us: aboutState,
      });
      showToast('About Us page updated and live!', 'success');
    } catch (err) {
      showToast('Failed to update About Us page', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePolicy = async (slug: string) => {
    const currentPage = policyPages[slug];
    if (!currentPage) return;
    setIsSaving(true);
    try {
      await db.saveCMSPage(currentPage);
      await refreshPages();
      showToast(`"${currentPage.title}" updated successfully!`, 'success');
    } catch (err) {
      showToast('Failed to save policy page', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const pageNav = [
    { id: 'about', label: 'About RAYVEN & Story', icon: Award },
    { id: 'returns', label: 'Return & Exchange Policy', icon: Shield },
    { id: 'shipping', label: 'Shipping & Delivery Policy', icon: Truck },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STORE MANAGEMENT & CMS
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Information Pages & Policy CMS
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Edit the brand origin story, stats, and customer policies without changing application code.
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E5E3] no-scrollbar">
        {pageNav.map(tab => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePage(tab.id as PageKey)}
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

      {/* 1. ABOUT US EDITOR */}
      {activePage === 'about' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-4">
            <h2 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-[#6D35C8]" />
              <span>About RAYVEN Brand Hub & Origin Story</span>
            </h2>

            <button
              type="button"
              onClick={handleSaveAbout}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save About Page</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Hero Headline</label>
              <input
                type="text"
                value={aboutState.title}
                onChange={(e) => setAboutState({ ...aboutState, title: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Hero Subtitle</label>
              <input
                type="text"
                value={aboutState.subtitle}
                onChange={(e) => setAboutState({ ...aboutState, subtitle: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Full Brand Story</label>
              <textarea
                rows={5}
                value={aboutState.story}
                onChange={(e) => setAboutState({ ...aboutState, story: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8] leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Our Mission</label>
              <textarea
                rows={3}
                value={aboutState.mission}
                onChange={(e) => setAboutState({ ...aboutState, mission: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Our Vision</label>
              <textarea
                rows={3}
                value={aboutState.vision}
                onChange={(e) => setAboutState({ ...aboutState, vision: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="pt-6 border-t border-[#E5E5E3] space-y-4">
            <h3 className="font-bold text-xs uppercase text-zinc-800">Key Brand Metrics & Credibility Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutState.stats.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F7F7F5] border border-zinc-200 space-y-2">
                  <span className="text-[10px] font-mono text-[#6D35C8] font-bold uppercase">Stat #{idx + 1}</span>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Display Value</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const copy = [...aboutState.stats];
                        copy[idx] = { ...copy[idx], value: e.target.value };
                        setAboutState({ ...aboutState, stats: copy });
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#1F2024] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Label</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const copy = [...aboutState.stats];
                        copy[idx] = { ...copy[idx], label: e.target.value };
                        setAboutState({ ...aboutState, stats: copy });
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-[11px] text-zinc-700 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About Image Upload */}
          <div className="pt-6 border-t border-[#E5E5E3] space-y-3">
            <label className="text-xs font-bold uppercase text-zinc-700 block">Brand Story Visual / Team Photo</label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-48 h-32 rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                <img src={aboutState.image_url} alt="About Story" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2">
                <input
                  ref={aboutImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleAboutImageUpload(e.target.files[0]);
                  }}
                />

                <button
                  type="button"
                  onClick={() => aboutImageInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6D35C8]" />
                  <span>{isUploading ? 'Uploading Image...' : 'Upload Brand Image from Device'}</span>
                </button>

                <p className="text-[11px] text-zinc-500">
                  Visual displayed alongside your brand history on the customer /about page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. POLICY PAGES (Returns, Shipping, Terms, Privacy) */}
      {activePage !== 'about' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-6">
          {(() => {
            const page = policyPages[activePage] || {
              id: activePage,
              slug: activePage,
              title: activePage.toUpperCase(),
              subtitle: '',
              content: '',
              is_published: true,
            };

            return (
              <>
                <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-4">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider">
                      {page.title || activePage.toUpperCase()}
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono">Route: /{page.slug}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSavePolicy(activePage)}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Policy Page</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Page Title</label>
                    <input
                      type="text"
                      value={page.title}
                      onChange={(e) => {
                        setPolicyPages({
                          ...policyPages,
                          [activePage]: { ...page, title: e.target.value }
                        });
                      }}
                      className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Page Subtitle / Summary</label>
                    <input
                      type="text"
                      value={page.subtitle || ''}
                      onChange={(e) => {
                        setPolicyPages({
                          ...policyPages,
                          [activePage]: { ...page, subtitle: e.target.value }
                        });
                      }}
                      className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">
                      Full Policy Content (Markdown & Plain Text Supported)
                    </label>
                    <textarea
                      rows={12}
                      value={page.content}
                      onChange={(e) => {
                        setPolicyPages({
                          ...policyPages,
                          [activePage]: { ...page, content: e.target.value }
                        });
                      }}
                      className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-2xl p-4 text-xs font-mono text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8] leading-relaxed"
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
