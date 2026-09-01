import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { db } from '../lib/db';
import { Product } from '../types';
import { Search, X, ArrowRight, Sparkles, Trophy } from 'lucide-react';

interface SearchModalProps {
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onNavigate }) => {
  const { isSearchOpen, setIsSearchOpen, formatBDT } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const popularSearches = [
    'Real Madrid', 'Barcelona', 'Player Edition', 'Argentina 3-Star', 
    'Zidane 1998', 'Arsenal Away', 'Manchester United', 'Retro Vault'
  ];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await db.getProducts({ search: searchTerm });
      setResults(res);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isSearchOpen) return null;

  const handleSelect = (slug: string) => {
    setIsSearchOpen(false);
    onNavigate(`/product/${slug}`);
  };

  const handleQuickTag = (tag: string) => {
    setSearchTerm(tag);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-[#1F2024]/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      <div className="relative w-full max-w-2xl bg-white border border-[#E5E5E3] rounded-3xl shadow-2xl overflow-hidden z-10 text-[#1F2024]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5E5E3] flex items-center gap-3 bg-[#F7F7F5]">
          <Search className="w-5 h-5 text-[#6D35C8] shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search club kits, player names, retro legends, SKU..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#1F2024] placeholder-zinc-400 focus:outline-none font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 px-2.5 py-1 bg-white rounded-lg border border-zinc-200 shadow-xs cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Quick Tag Recommendations */}
        {!searchTerm && (
          <div className="p-6 space-y-5 bg-white">
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6D35C8]" />
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTag(tag)}
                    className="px-3 py-1.5 rounded-xl bg-[#F7F7F5] hover:bg-[#F3EEFC] border border-[#E5E5E3] hover:border-[#8B5AD9]/40 text-xs font-semibold text-zinc-700 hover:text-[#6D35C8] transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#6D35C8]" />
                Browse Categories
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    onNavigate('/shop?version=player');
                  }}
                  className="p-3 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] hover:border-[#8B5AD9]/50 hover:bg-[#F3EEFC]/50 text-left transition group cursor-pointer"
                >
                  <p className="text-xs font-bold text-[#1F2024] group-hover:text-[#6D35C8]">Player Edition</p>
                  <p className="text-[10px] text-zinc-500">Pro HEAT.RDY</p>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    onNavigate('/shop?version=fan');
                  }}
                  className="p-3 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] hover:border-[#8B5AD9]/50 hover:bg-[#F3EEFC]/50 text-left transition group cursor-pointer"
                >
                  <p className="text-xs font-bold text-[#1F2024] group-hover:text-[#6D35C8]">Fan Edition</p>
                  <p className="text-[10px] text-zinc-500">Comfort Regular</p>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    onNavigate('/shop?category=retro-classics');
                  }}
                  className="p-3 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] hover:border-[#8B5AD9]/50 hover:bg-[#F3EEFC]/50 text-left transition group cursor-pointer"
                >
                  <p className="text-xs font-bold text-[#1F2024] group-hover:text-[#6D35C8]">Retro Classics</p>
                  <p className="text-[10px] text-zinc-500">Vault Editions</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchTerm && (
          <div className="p-4 max-h-96 overflow-y-auto divide-y divide-zinc-100 bg-white">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                Searching authentic kits...
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-bold text-zinc-700">No football kits matched "{searchTerm}"</p>
                <p className="text-xs text-zinc-400">Try searching for club names, player editions, or retro years.</p>
              </div>
            ) : (
              results.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelect(prod.slug)}
                  className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-[#F7F7F5] rounded-xl transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#6D35C8] uppercase font-mono">{prod.team}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{prod.season}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1F2024] group-hover:text-[#6D35C8] transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-display font-black text-[#1F2024]">
                      {formatBDT(prod.discount_price ?? prod.price)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#6D35C8] group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
