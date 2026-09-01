import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Product, JerseySize, JerseyVersion } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';
import { 
  Filter, SlidersHorizontal, Search, X, Check 
} from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  initialVersion?: string;
  initialSearch?: string;
  onNavigate: (path: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ 
  initialCategory, 
  initialVersion, 
  initialSearch, 
  onNavigate 
}) => {
  const { categories, formatBDT } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedVersion, setSelectedVersion] = useState<string>(initialVersion || '');
  const [selectedSize, setSelectedSize] = useState<JerseySize | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialCategory !== undefined) setSelectedCategory(initialCategory);
    if (initialVersion !== undefined) setSelectedVersion(initialVersion);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialCategory, initialVersion, initialSearch]);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await db.getProducts({
      categorySlug: selectedCategory || undefined,
      version: selectedVersion ? (selectedVersion as JerseyVersion) : undefined,
      search: searchQuery || undefined,
      inStock: inStockOnly ? true : undefined,
      sortBy
    });
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedVersion, inStockOnly, sortBy]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allSizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];

  // Filter products by selected size and max price client-side
  const filteredProducts = products.filter(p => {
    const price = p.discount_price ?? p.price;
    if (price > maxPrice) return false;
    if (selectedSize) {
      const hasSize = p.variants.some(v => v.size === selectedSize && v.stock_quantity > 0);
      if (!hasSize) return false;
    }
    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedVersion('');
    setSelectedSize('');
    setInStockOnly(false);
    setMaxPrice(3000);
    setSortBy('featured');
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || selectedVersion || selectedSize || inStockOnly || maxPrice < 3000
  );

  return (
    <div className="w-full bg-white min-h-screen py-8 text-[#1F2024]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-xl">
            <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
              AUTHENTIC FOOTBALL SPORTSWEAR
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-black text-[#1F2024] uppercase tracking-tight">
              All Football Kits & Jerseys
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600">
              Browse our complete catalogue of 2026/27 club match kits, master player editions, national teams, and retro vault classics.
            </p>
          </div>

          {/* Search Bar inside Header */}
          <div className="relative z-10 w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, kit, player..."
                className="w-full bg-white border border-zinc-300 rounded-xl pl-10 pr-4 py-3 text-xs text-[#1F2024] placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8] shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Control Bar (Total Count, Mobile Filter Button, Sort Dropdown) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E5E5E3] shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2 bg-[#6D35C8] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
            </button>

            <span className="text-xs font-bold text-zinc-700">
              Showing <strong className="text-[#1F2024] font-mono font-black">{filteredProducts.length}</strong> football kits
            </span>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F7F7F5] border border-[#E5E5E3] rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#6D35C8] cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Releases</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Active Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F3EEFC] border border-[#8B5AD9]/30 text-[#6D35C8] rounded-full text-xs font-bold">
                Club: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}
            {selectedVersion && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F3EEFC] border border-[#8B5AD9]/30 text-[#6D35C8] rounded-full text-xs font-bold">
                Edition: {selectedVersion.toUpperCase()}
                <button onClick={() => setSelectedVersion('')} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F3EEFC] border border-[#8B5AD9]/30 text-[#6D35C8] rounded-full text-xs font-bold">
                Size: {selectedSize}
                <button onClick={() => setSelectedSize('')} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full text-xs font-bold">
                In-Stock Only
                <button onClick={() => setInStockOnly(false)} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}
            {maxPrice < 3000 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F3EEFC] border border-[#8B5AD9]/30 text-[#6D35C8] rounded-full text-xs font-bold">
                Under {formatBDT(maxPrice)}
                <button onClick={() => setMaxPrice(3000)} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Grid & Desktop Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1 space-y-6`}>
            <div className="p-6 rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] shadow-xs space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E3]">
                <h3 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#6D35C8]" />
                  Refine Kits
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] text-zinc-500 hover:text-[#6D35C8] font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Club / Category</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      selectedCategory === '' 
                        ? 'bg-[#6D35C8] text-white font-bold shadow-xs' 
                        : 'text-zinc-700 hover:bg-white hover:text-zinc-900'
                    }`}
                  >
                    <span>All Clubs & Vault</span>
                    {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        selectedCategory === cat.slug 
                          ? 'bg-[#6D35C8] text-white font-bold shadow-xs' 
                          : 'text-zinc-700 hover:bg-white hover:text-zinc-900'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jersey Version Filter */}
              <div className="space-y-2 pt-4 border-t border-[#E5E5E3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Jersey Edition</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'All', val: '' },
                    { label: 'Player', val: 'player' },
                    { label: 'Fan', val: 'fan' },
                    { label: 'Retro', val: 'retro' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSelectedVersion(item.val)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${
                        selectedVersion === item.val
                          ? 'bg-[#6D35C8] border-[#6D35C8] text-white'
                          : 'bg-white border-[#E5E5E3] text-zinc-700 hover:border-[#8B5AD9]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-2 pt-4 border-t border-[#E5E5E3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Filter By Size</h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`py-2 text-xs font-bold rounded-xl border transition text-center cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#6D35C8] text-white border-[#6D35C8]'
                          : 'bg-white border-[#E5E5E3] text-zinc-700 hover:border-[#8B5AD9]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter Slider */}
              <div className="space-y-2 pt-4 border-t border-[#E5E5E3]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-zinc-800">Max Budget</span>
                  <span className="font-mono font-bold text-[#6D35C8]">{formatBDT(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#6D35C8] cursor-pointer"
                />
              </div>

              {/* In-stock toggle */}
              <div className="pt-4 border-t border-[#E5E5E3]">
                <label className="flex items-center justify-between text-xs font-bold text-zinc-800 cursor-pointer">
                  <span>In-Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-zinc-300 text-[#6D35C8] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="py-24 text-center text-zinc-500 text-xs">
                Loading authentic match kits...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-200 flex items-center justify-center mx-auto text-zinc-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#1F2024]">No match kits found</h3>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                  No jerseys match your selected criteria. Try adjusting your club filter, edition, or price range.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
