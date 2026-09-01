import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlistProducts, clearWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1F2024]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-zinc-500 hover:text-[#6D35C8] inline-flex items-center gap-1.5 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Browsing</span>
          </button>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight flex items-center gap-3">
            <span>Saved Match Kits</span>
            <span className="text-[#6D35C8] font-mono text-xl">({wishlistProducts.length})</span>
          </h1>
        </div>

        {wishlistProducts.length > 0 && (
          <button
            onClick={clearWishlist}
            className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-200 flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {wishlistProducts.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto text-zinc-400 border border-[#E5E5E3] shadow-xs">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-[#1F2024] uppercase">Your Wishlist Is Empty</h2>
            <p className="text-xs text-zinc-500">
              Save player editions, club kits, and retro jerseys here while browsing.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-6 py-3 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            Explore Jerseys
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={(slug) => onNavigate(`/product/${slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
