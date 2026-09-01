import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { Banner } from '../../types';
import { db } from '../../lib/db';
import { Plus, Trash2, Eye, ExternalLink } from 'lucide-react';

export const AdminBanners: React.FC = () => {
  const { showToast } = useStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('NEW DROP 2025/26');
  const [buttonText, setButtonText] = useState('Shop Collection');
  const [linkUrl, setLinkUrl] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('');

  const loadBanners = async () => {
    const data = await db.getBanners();
    setBanners(data);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleToggle = async (b: Banner) => {
    const updated = await db.updateBanner(b.id, { is_active: !b.is_active });
    if (updated) {
      setBanners(banners.map(item => (item.id === b.id ? updated : item)));
      showToast('Banner visibility updated', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this promotional banner?')) {
      await db.deleteBanner(id);
      setBanners(banners.filter(b => b.id !== id));
      showToast('Banner removed', 'info');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const payload: Partial<Banner> = {
      title,
      subtitle,
      tag,
      button_text: buttonText,
      link_url: linkUrl,
      image_url: imageUrl,
      position: 'hero',
      is_active: true,
      sort_order: banners.length + 1
    };

    const created = await db.createBanner(payload);
    if (created) {
      setBanners([...banners, created]);
      setIsCreating(false);
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      showToast('Hero banner created!', 'success');
    }
  };

  return (
    <div className="space-y-6 text-[#1F2024]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STOREFRONT MARKETING
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Hero & Promotional Banners
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition shadow-md shadow-purple-900/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* New Banner Drawer */}
      {isCreating && (
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase">New Hero Banner</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Badge / Tag</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. UCL MATCHDAY DROP"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Headline Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2025/26 Authentic Player Issue"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Ultra-breathable player cut with official heat-press crests."
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Background Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Button Label</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Link URL</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
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
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="relative rounded-3xl overflow-hidden border border-[#E5E5E3] bg-white shadow-xs group">
            <div className="h-44 relative">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                {b.tag && <span className="text-[10px] font-mono font-bold text-[#8B5AD9] uppercase">{b.tag}</span>}
                <h4 className="font-display text-base font-black text-white leading-tight">{b.title}</h4>
              </div>
            </div>

            <div className="p-3 bg-white flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggle(b)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                  b.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {b.is_active ? 'Live on Store' : 'Inactive'}
              </button>

              <button
                onClick={() => handleDelete(b.id)}
                className="p-1.5 text-zinc-400 hover:text-red-600 transition cursor-pointer"
                title="Delete banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
