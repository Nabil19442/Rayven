import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { db } from '../../lib/db';
import { FAQItem } from '../../types';
import { 
  HelpCircle, Plus, Edit2, Trash2, CheckCircle2, XCircle, 
  Search, Save, RefreshCw, X, ArrowUpDown 
} from 'lucide-react';

export const AdminFAQ: React.FC = () => {
  const { faqs, refreshFAQs, showToast } = useStore();
  const [items, setItems] = useState<FAQItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Quality & Authenticity');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setItems(faqs);
  }, [faqs]);

  const categoriesList = ['Quality & Authenticity', 'Sizing & Fit', 'Delivery & Dispatch', 'Customization', 'Returns & Support', 'General'];

  const openAddModal = () => {
    setEditingItem(null);
    setQuestion('');
    setAnswer('');
    setCategory('Quality & Authenticity');
    setDisplayOrder(String(items.length + 1));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: FAQItem) => {
    setEditingItem(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category || 'Quality & Authenticity');
    setDisplayOrder(String(item.display_order || 1));
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      showToast('Please fill out both question and answer', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await db.saveFAQ({
        id: editingItem?.id,
        question: question.trim(),
        answer: answer.trim(),
        category,
        display_order: Number(displayOrder) || 1,
        is_active: isActive,
      });
      await refreshFAQs();
      showToast(editingItem ? 'FAQ updated successfully!' : 'New FAQ created!', 'success');
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to save FAQ.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ entry?')) return;
    try {
      await db.deleteFAQ(id);
      await refreshFAQs();
      showToast('FAQ deleted.', 'info');
    } catch (err) {
      showToast('Failed to delete FAQ.', 'error');
    }
  };

  const handleToggleActive = async (item: FAQItem) => {
    try {
      await db.saveFAQ({
        ...item,
        is_active: !item.is_active,
      });
      await refreshFAQs();
      showToast(`FAQ marked as ${!item.is_active ? 'Active' : 'Hidden'}`, 'success');
    } catch (err) {
      showToast('Failed to update FAQ status.', 'error');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STORE MANAGEMENT & CMS
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage questions and answers displayed on the customer FAQ page and support centers.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5E3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#1F2024] text-white'
                : 'bg-[#F7F7F5] text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All Categories ({items.length})
          </button>
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#6D35C8] text-white'
                  : 'bg-[#F7F7F5] text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E5E3]">
            <HelpCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-700">No FAQ entries found</p>
            <p className="text-xs text-zinc-400 mt-1">Try resetting search filters or click "Add New FAQ".</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-white border transition ${
                item.is_active ? 'border-[#E5E5E3]' : 'border-zinc-200 opacity-60 bg-zinc-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#F3EEFC] text-[#6D35C8] text-[10px] font-mono font-bold uppercase">
                      {item.category || 'General'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Order: #{item.display_order}</span>
                    {!item.is_active && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase">
                        Hidden
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-[#1F2024]">{item.question}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{item.answer}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      item.is_active
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200'
                    }`}
                    title={item.is_active ? 'Active on store' : 'Hidden from store'}
                  >
                    {item.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-700 rounded-xl border border-zinc-200 transition cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E5E5E3] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-4">
              <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase tracking-wider">
                {editingItem ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do I choose between Fan Version and Player Issue?"
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide a clear, reassuring answer for the fan..."
                  className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl p-3 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-700 mb-1.5 block">Sort Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-[#1F2024] font-mono focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="faq-active-check"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#6D35C8] rounded border-zinc-300 focus:ring-[#6D35C8]"
                />
                <label htmlFor="faq-active-check" className="text-xs font-bold text-zinc-800 uppercase cursor-pointer">
                  Visible on storefront FAQ hub
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold uppercase transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{editingItem ? 'Save Changes' : 'Create FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
