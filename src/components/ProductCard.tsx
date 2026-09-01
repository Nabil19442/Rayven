import React from 'react';
import { Product, JerseySize } from '../types';
import { useStore } from '../contexts/StoreContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Heart, Eye, ShoppingBag, Sparkles, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate?: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { formatBDT, setQuickViewProduct, showToast } = useStore();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(product.id);

  const price = product.discount_price ?? product.price;
  const originalPrice = product.discount_price ? product.price : null;
  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock <= 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (onNavigate) onNavigate(product.slug);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const availableVariant = product.variants?.find(v => v.stock_quantity > 0) || product.variants?.[0];
    const sizeToUse: JerseySize = availableVariant?.size || 'M';
    const res = addToCart(product, sizeToUse, 1);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-2xl border border-[#E5E5E3] hover:border-[#8B5AD9] hover:shadow-xl hover:shadow-[#6D35C8]/8 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
        {product.is_new_arrival && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#6D35C8] text-white shadow-sm">
            <Sparkles className="w-3 h-3" /> NEW
          </span>
        )}
        {product.is_bestseller && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#1F2024] text-white shadow-sm">
            <Flame className="w-3 h-3 text-[#8B5AD9]" /> HOT
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30 shadow-sm">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Jersey Version Pill */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${
          product.jersey_version === 'player' 
            ? 'bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30' 
            : product.jersey_version === 'retro'
            ? 'bg-purple-900 text-purple-100 border border-purple-800'
            : 'bg-zinc-100/90 text-zinc-700 border border-zinc-200'
        }`}>
          {product.jersey_version} Edition
        </span>
      </div>

      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-[#F7F7F5] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Secondary image preview on hover if available */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Action Overlay buttons */}
        <div className="absolute inset-x-0 bottom-3 px-3 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            id={`quick-view-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white/95 hover:bg-[#F3EEFC] text-[#1F2024] hover:text-[#6D35C8] rounded-xl text-xs font-bold shadow-lg border border-[#E5E5E3] transition cursor-pointer"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 text-[#6D35C8]" /> Quick View
          </button>

          <button
            id={`wishlist-btn-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
              showToast(
                inWishlist ? 'Removed from wishlist' : 'Saved to wishlist',
                'info'
              );
            }}
            className={`p-2 rounded-xl border shadow-lg transition cursor-pointer ${
              inWishlist 
                ? 'bg-red-50 border-red-200 text-red-600' 
                : 'bg-white/95 hover:bg-white border-[#E5E5E3] text-zinc-700 hover:text-[#6D35C8]'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-[#1F2024] text-white text-xs font-bold uppercase tracking-wider rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-bold text-[#6D35C8] uppercase tracking-wider text-[11px]">{product.team}</span>
            <span className="text-zinc-400 font-mono text-[11px]">{product.season}</span>
          </div>

          <h3 className="font-display text-base sm:text-lg font-bold text-[#1F2024] line-clamp-2 leading-tight group-hover:text-[#6D35C8] transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Sizes Availability Chips */}
        <div className="flex flex-wrap gap-1 items-center">
          {product.variants?.map(v => (
            <span
              key={v.size}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                v.stock_quantity > 0
                  ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                  : 'bg-zinc-50 text-zinc-400 line-through'
              }`}
            >
              {v.size}
            </span>
          ))}
        </div>

        {/* Price & Add to Cart Row */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl font-black text-[#1F2024]">
                {formatBDT(price)}
              </span>
              {originalPrice && (
                <span className="text-xs text-zinc-400 line-through font-mono">
                  {formatBDT(originalPrice)}
                </span>
              )}
            </div>
            {totalStock > 0 && totalStock <= 5 && (
              <span className="text-[10px] text-[#6D35C8] font-bold">
                Only {totalStock} kits left!
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-[#6D35C8] hover:bg-[#4B218A] text-white active:scale-95 shadow-sm shadow-purple-900/20 cursor-pointer'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
