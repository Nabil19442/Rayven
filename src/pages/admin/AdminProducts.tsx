import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Product } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { 
  Search, Plus, Edit2, Trash2, Star, Flame, Sparkles, 
  ExternalLink, Eye, Filter, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface AdminProductsProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewProduct: (slug: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ 
  onAddProduct, 
  onEditProduct,
  onViewProduct 
}) => {
  const { formatBDT, showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await db.getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        const ok = await db.deleteProduct(product.id);
        if (ok) {
          showToast('Product deleted from inventory', 'info');
          setProducts(products.filter(p => p.id !== product.id));
        }
      } catch (err: any) {
        console.error('Delete product error:', err);
        showToast(err?.message || 'Failed to delete product', 'error');
      }
    }
  };

  const handleToggleFlag = async (product: Product, field: 'is_featured' | 'is_bestseller' | 'is_new_arrival') => {
    try {
      const updated = await db.updateProduct(product.id, {
        [field]: !product[field]
      });
      if (updated) {
        setProducts(products.map(p => p.id === product.id ? updated : p));
        showToast(`Updated ${field.replace('is_', '')} badge`, 'success');
      }
    } catch (err: any) {
      console.error('Update flag error:', err);
      showToast(err?.message || 'Failed to update badge', 'error');
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.league.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesVer = selectedVersion === 'all' || p.jersey_version === selectedVersion;

    return matchesSearch && matchesCat && matchesVer;
  });

  return (
    <div className="space-y-6 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            CATALOG MANAGEMENT
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Football Kit Catalog ({products.length})
          </h1>
        </div>

        <button
          onClick={onAddProduct}
          className="px-5 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition shadow-md shadow-purple-900/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Match Kit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5E3] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jerseys by club, national team, player, or league..."
            className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1F2024] placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#6D35C8]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="bg-[#F7F7F5] border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 focus:bg-white focus:outline-none focus:border-[#6D35C8] cursor-pointer"
          >
            <option value="all">All Editions</option>
            <option value="player">Player Edition</option>
            <option value="fan">Fan Edition</option>
            <option value="retro">Retro Classic</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-white border border-[#E5E5E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-[#E5E5E3] uppercase font-mono bg-[#F7F7F5]">
                <th className="py-3 px-4">Jersey</th>
                <th className="py-3 px-4">Team / League</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3] text-zinc-700">
              {filtered.map((prod) => {
                const totalStock = prod.variants.reduce((sum, v) => sum + v.stock_quantity, 0);

                return (
                  <tr key={prod.id} className="hover:bg-[#F7F7F5] transition">
                    {/* Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-[#E5E5E3] shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-[#1F2024] truncate">{prod.name}</p>
                          <span className="text-[10px] text-[#6D35C8] font-mono uppercase font-bold">
                            {prod.jersey_version} • {prod.season}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1F2024]">{prod.team}</p>
                      <p className="text-[10px] text-zinc-500">{prod.league}</p>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono">
                      <p className="font-bold text-[#1F2024]">{formatBDT(prod.price)}</p>
                      {prod.original_price && (
                        <p className="text-[10px] text-zinc-400 line-through">
                          {formatBDT(prod.original_price)}
                        </p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        totalStock > 10
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : totalStock > 0
                          ? 'bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {totalStock} units
                      </span>
                    </td>

                    {/* Badges Toggles */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(prod, 'is_featured')}
                          title="Toggle Featured"
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            prod.is_featured
                              ? 'bg-[#6D35C8] text-white border-[#6D35C8]'
                              : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleFlag(prod, 'is_bestseller')}
                          title="Toggle Bestseller"
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            prod.is_bestseller
                              ? 'bg-[#4B218A] text-white border-[#4B218A]'
                              : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProduct(prod.slug)}
                          className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-600 rounded-lg border border-[#E5E5E3] transition shadow-xs cursor-pointer"
                          title="View Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditProduct(prod)}
                          className="p-1.5 bg-white hover:bg-[#F3EEFC] hover:text-[#6D35C8] text-zinc-600 rounded-lg border border-[#E5E5E3] transition shadow-xs cursor-pointer"
                          title="Edit Kit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(prod)}
                          className="p-1.5 bg-white hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-lg border border-[#E5E5E3] transition shadow-xs cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
