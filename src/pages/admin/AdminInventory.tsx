import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Product, JerseySize } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { Search, Plus, Minus, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await db.getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStock = async (productId: string, size: JerseySize, newStock: number) => {
    if (newStock < 0) return;
    await db.updateVariantStock(productId, size, newStock);
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          variants: p.variants.map(v => v.size === size ? { ...v, stock_quantity: newStock } : v)
        };
      }
      return p;
    }));
    showToast(`Stock updated for ${size}`, 'success');
  };

  // Flattened matrix
  const inventoryRows: {
    productId: string;
    productName: string;
    team: string;
    version: string;
    image: string;
    size: JerseySize;
    stock: number;
    sku: string;
  }[] = [];

  products.forEach(p => {
    p.variants.forEach(v => {
      inventoryRows.push({
        productId: p.id,
        productName: p.name,
        team: p.team,
        version: p.jersey_version,
        image: p.images[0],
        size: v.size,
        stock: v.stock_quantity,
        sku: v.sku
      });
    });
  });

  const filtered = inventoryRows.filter(r => {
    const matchesSearch = r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLowStock = !onlyLowStock || r.stock <= 4;
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-6 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
            STOCK CONTROL
          </span>
          <h1 className="font-display text-3xl font-black text-[#1F2024] uppercase tracking-tight">
            Inventory & Size Matrix
          </h1>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold uppercase border border-[#E5E5E3] shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5E3] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, jersey name, or club..."
            className="w-full bg-[#F7F7F5] border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#1F2024] placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#6D35C8]"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={onlyLowStock}
            onChange={(e) => setOnlyLowStock(e.target.checked)}
            className="rounded text-[#6D35C8] focus:ring-[#6D35C8] border-zinc-300"
          />
          <span>Show Low Stock Only (≤ 4 Units)</span>
        </label>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white border border-[#E5E5E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-[#E5E5E3] uppercase font-mono bg-[#F7F7F5]">
                <th className="py-3 px-4">Match Kit</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4 text-right">Rapid Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3] text-zinc-700">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F7F7F5] transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={row.image} alt={row.productName} className="w-10 h-10 rounded-xl object-cover bg-zinc-100 border border-[#E5E5E3]" />
                      <div>
                        <p className="font-bold text-[#1F2024]">{row.productName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{row.team} • {row.version} Edition</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-zinc-500">
                    {row.sku}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-black text-[#1F2024] font-mono text-sm px-2.5 py-1 rounded bg-[#F7F7F5] border border-[#E5E5E3]">
                      {row.size}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                      row.stock > 6 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      row.stock > 2 ? 'bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30' :
                      'bg-red-50 text-red-700 border border-red-200 font-black animate-pulse'
                    }`}>
                      {row.stock} units
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleUpdateStock(row.productId, row.size, row.stock - 1)}
                        className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded-lg border border-[#E5E5E3] shadow-xs cursor-pointer"
                        title="Reduce 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={row.stock}
                        onChange={(e) => handleUpdateStock(row.productId, row.size, Number(e.target.value))}
                        className="w-14 bg-[#F7F7F5] border border-zinc-300 rounded-lg py-1 px-1 text-center font-mono font-bold text-xs text-[#1F2024] focus:bg-white focus:outline-none focus:border-[#6D35C8]"
                      />

                      <button
                        onClick={() => handleUpdateStock(row.productId, row.size, row.stock + 1)}
                        className="p-1.5 bg-white hover:bg-[#F3EEFC] hover:text-[#6D35C8] text-zinc-700 rounded-lg border border-[#E5E5E3] shadow-xs cursor-pointer"
                        title="Add 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleUpdateStock(row.productId, row.size, row.stock + 10)}
                        className="px-2 py-1 bg-[#F3EEFC] hover:bg-[#6D35C8] text-[#6D35C8] hover:text-white font-bold rounded-lg border border-[#8B5AD9]/30 text-[10px] shadow-xs transition cursor-pointer"
                        title="Add 10"
                      >
                        +10
                      </button>
                    </div>
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
