import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { Category } from '../../types';
import { db } from '../../lib/db';
import { Plus, Trash2, Edit2, FolderTree } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, setCategories, showToast } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Partial<Category> = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
      is_active: true
    };

    const created = await db.createCategory(payload);
    if (created) {
      setCategories([...categories, created]);
      setIsCreating(false);
      setName('');
      setSlug('');
      setDescription('');
      showToast('Category created!', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      await db.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      showToast('Category deleted', 'info');
    }
  };

  return (
    <div className="space-y-6 text-[#1F2024]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            ORGANIZATION
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Clubs & Leagues Categories ({categories.length})
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition shadow-md shadow-purple-900/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {isCreating && (
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-xs space-y-4">
          <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase">Create Category</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                placeholder="e.g. Serie A Clubs"
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase text-zinc-700 mb-1 block">Cover Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2">
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
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="p-4 rounded-2xl bg-white border border-[#E5E5E3] shadow-xs flex items-center justify-between gap-4 hover:border-[#8B5AD9]/40 transition">
            <div className="flex items-center gap-3">
              <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-[#E5E5E3]" />
              <div>
                <h4 className="font-bold text-[#1F2024] text-sm">{c.name}</h4>
                <p className="text-[10px] text-zinc-500 font-mono">/{c.slug}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(c.id)}
              className="p-2 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
