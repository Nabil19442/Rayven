import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { JerseySize } from '../types';
import { X, Star, ShoppingBag, Heart, Check, Ruler, ArrowRight, Sparkles } from 'lucide-react';

interface QuickViewModalProps {
  onNavigate: (path: string) => void;
  onOpenSizeGuide: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ onNavigate, onOpenSizeGuide }) => {
  const { quickViewProduct, setQuickViewProduct, formatBDT, showToast } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<JerseySize>('M');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [enableCustomPrint, setEnableCustomPrint] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const inWishlist = isInWishlist(product.id);
  const price = product.discount_price ?? product.price;
  const originalPrice = product.discount_price ? product.price : null;

  const currentVariant = product.variants.find(v => v.size === selectedSize);
  const stockForSelected = currentVariant ? currentVariant.stock_quantity : 0;
  const isOutOfStock = stockForSelected <= 0;

  const handleAddToCart = () => {
    const res = addToCart(
      product, 
      selectedSize, 
      quantity, 
      enableCustomPrint ? customName : undefined, 
      enableCustomPrint ? customNumber : undefined
    );
    if (res.success) {
      showToast(res.message, 'success');
      setQuickViewProduct(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleViewFullDetails = () => {
    setQuickViewProduct(null);
    onNavigate(`/product/${product.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-[#1F2024]/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      <div className="relative w-full max-w-4xl bg-white border border-[#E5E5E3] rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 text-[#1F2024]">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-zinc-500 hover:text-zinc-900 border border-zinc-200 shadow-md transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Images */}
        <div className="p-6 bg-[#F7F7F5] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5E5E3]">
          <div className="relative aspect-square rounded-2xl bg-white overflow-hidden border border-[#E5E5E3]">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30 text-[10px] font-black uppercase tracking-wider">
              {product.jersey_version} Edition
            </span>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    selectedImageIndex === idx ? 'border-[#6D35C8]' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-bold text-[#6D35C8] uppercase tracking-wider">{product.team}</span>
              <span className="font-mono">{product.season}</span>
            </div>

            <h2 className="font-display text-2xl font-black text-[#1F2024] leading-tight">
              {product.name}
            </h2>

            {/* Price & Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-black text-[#6D35C8]">
                  {formatBDT(price)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-zinc-400 line-through font-mono">
                    {formatBDT(originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-zinc-600">
                <Star className="w-4 h-4 fill-[#6D35C8] text-[#6D35C8]" />
                <span className="font-bold">{product.rating_avg.toFixed(1)}</span>
                <span className="text-zinc-400">({product.review_count})</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 uppercase">Select Size:</span>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="text-[11px] font-bold text-[#6D35C8] hover:text-[#4B218A] flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isAvail = v.stock_quantity > 0;
                  const isSelected = selectedSize === v.size;
                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={!isAvail}
                      onClick={() => setSelectedSize(v.size)}
                      className={`min-w-[44px] h-10 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        !isAvail
                          ? 'bg-zinc-100 text-zinc-400 line-through cursor-not-allowed border border-zinc-200'
                          : isSelected
                          ? 'bg-[#6D35C8] text-white shadow-sm'
                          : 'bg-[#F7F7F5] text-zinc-700 border border-[#E5E5E3] hover:border-[#8B5AD9]'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                  isOutOfStock
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                    : 'bg-[#6D35C8] hover:bg-[#4B218A] text-white shadow-md shadow-purple-900/15 cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product);
                  showToast(
                    inWishlist ? 'Removed from wishlist' : 'Saved to wishlist',
                    'info'
                  );
                }}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  inWishlist
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-[#E5E5E3] text-zinc-600 hover:text-[#6D35C8]'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleViewFullDetails}
              className="w-full py-2.5 bg-[#F7F7F5] hover:bg-[#F3EEFC] border border-[#E5E5E3] text-zinc-700 hover:text-[#6D35C8] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>View Full Details & Custom Print Options</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
