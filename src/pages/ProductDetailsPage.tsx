import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, ProductReview, JerseySize } from '../types';
import { useStore } from '../contexts/StoreContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { 
  Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Award, 
  Ruler, Check, Plus, Minus, Zap, Share2, Sparkles, AlertCircle, 
  CheckCircle2, ArrowRight, PackageCheck 
} from 'lucide-react';

interface ProductDetailsPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenSizeGuide: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ 
  slug, 
  onNavigate,
  onOpenSizeGuide 
}) => {
  const { formatBDT, showToast, settings } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Selections
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<JerseySize>('M');
  const [quantity, setQuantity] = useState(1);
  const [enableCustomPrint, setEnableCustomPrint] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'specs' | 'fabric' | 'delivery' | 'reviews'>('specs');

  // Review submission state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProduct = async () => {
    const prod = await db.getProductBySlug(slug);
    if (prod) {
      setProduct(prod);
      // Find default available size if not already selected
      const defaultVar = prod.variants?.find(v => v.stock_quantity > 0) || prod.variants?.[0];
      if (defaultVar && !selectedSize) setSelectedSize(defaultVar.size);

      // Fetch reviews
      const revs = await db.getProductReviews(prod.id);
      setReviews(revs);

      // Fetch related kits
      const related = await db.getProducts({ categorySlug: prod.category?.slug, limit: 4 });
      setRelatedProducts(related.filter(r => r.id !== prod.id));
    } else {
      setProduct(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    loadProduct();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`rayven-prod-${slug}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadProduct();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () => {
          loadProduct();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-zinc-500 text-sm font-medium">
        Loading authentic kit specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display text-2xl font-black text-[#1F2024] uppercase">Kit Not Found</h2>
        <p className="text-sm text-zinc-500">The jersey you are looking for is currently unavailable.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-2.5 bg-[#6D35C8] text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
        >
          Explore All Jerseys
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const price = product.discount_price ?? product.price;
  const originalPrice = product.discount_price ? product.price : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const currentVariant = product.variants?.find(v => v.size === selectedSize);
  const stockForSelected = currentVariant ? currentVariant.stock_quantity : 0;
  const isOutOfStock = stockForSelected <= 0;

  const handleAddToCart = (redirectCheckout = false) => {
    const res = addToCart(
      product,
      selectedSize,
      quantity,
      enableCustomPrint ? customName : undefined,
      enableCustomPrint ? customNumber : undefined
    );

    if (res.success) {
      showToast(res.message, 'success');
      if (redirectCheckout) {
        onNavigate('/checkout');
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please provide your name and review feedback.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    const newRev = await db.createProductReview({
      product_id: product.id,
      user_name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      is_verified_purchase: true,
    });

    setIsSubmittingReview(false);
    if (newRev) {
      setReviews([newRev, ...reviews]);
      setReviewComment('');
      setReviewName('');
      showToast('Thank you! Your verified review has been published.', 'success');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Kit link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 text-[#1F2024]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-semibold">
        <button onClick={() => onNavigate('/')} className="hover:text-[#6D35C8] cursor-pointer">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('/shop')} className="hover:text-[#6D35C8] cursor-pointer">Jerseys</button>
        <span>/</span>
        <button onClick={() => onNavigate(`/shop?category=${product.category?.slug}`)} className="hover:text-[#6D35C8] cursor-pointer">
          {product.team}
        </button>
        <span>/</span>
        <span className="text-[#1F2024] font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Interactive Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] overflow-hidden shadow-lg">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30 shadow-sm">
                {product.jersey_version} Edition
              </span>
              {discountPercent > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#1F2024] text-white shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Custom print overlay preview if active */}
            {enableCustomPrint && (customName || customNumber) && (
              <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none px-4">
                <div className="inline-block bg-[#1F2024]/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
                  <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider block">Official Print Preview</span>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span className="font-display text-xl font-black text-white tracking-widest">
                      {customName || 'NAME'}
                    </span>
                    <span className="font-display text-2xl font-black text-[#8B5AD9] font-mono">
                      {customNumber || '00'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#6D35C8] scale-105 shadow-md shadow-purple-900/10'
                      : 'border-[#E5E5E3] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Buying Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Meta Row */}
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-bold text-[#6D35C8] uppercase tracking-wider font-mono">
                {product.team} • {product.season}
              </span>
              <span className="font-mono text-zinc-400">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price & Rating */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3]">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl sm:text-4xl font-black text-[#6D35C8]">
                  {formatBDT(price)}
                </span>
                {originalPrice && (
                  <span className="text-base text-zinc-400 line-through font-mono">
                    {formatBDT(originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <div className="flex text-[#6D35C8]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating_avg) ? 'fill-[#6D35C8]' : 'text-zinc-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#1F2024]">{product.rating_avg.toFixed(1)}</span>
                <span className="text-zinc-400">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector with Live Stock Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#1F2024]">
                  Select Size (Athletic Cut):
                </span>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="text-[#6D35C8] hover:text-[#4B218A] flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fit Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {product.variants?.map((v) => {
                  const outOfStock = v.stock_quantity <= 0;
                  const isSelected = selectedSize === v.size;
                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(v.size)}
                      className={`py-3 px-2 rounded-xl text-xs font-black border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        outOfStock
                          ? 'border-zinc-200 text-zinc-400 bg-zinc-100 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-[#6D35C8] bg-[#6D35C8] text-white shadow-md shadow-purple-900/20'
                          : 'border-[#E5E5E3] bg-[#F7F7F5] text-zinc-800 hover:border-[#8B5AD9]'
                      }`}
                    >
                      <span className="text-sm font-bold">{v.size}</span>
                      <span className={`text-[9px] font-normal ${
                        outOfStock ? 'text-zinc-400' : isSelected ? 'text-purple-100 font-bold' : 'text-zinc-500'
                      }`}>
                        {outOfStock ? 'Out' : v.stock_quantity <= 4 ? `${v.stock_quantity} left` : 'In Stock'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {stockForSelected > 0 && stockForSelected <= 4 && (
                <p className="text-xs text-[#6D35C8] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Hurry! Only {stockForSelected} kits remaining in Size {selectedSize}.
                </p>
              )}
            </div>

            {/* Custom Name & Number Printing Option */}
            <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-3">
              <label className="flex items-center gap-2.5 text-xs font-bold text-[#1F2024] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCustomPrint}
                  onChange={(e) => setEnableCustomPrint(e.target.checked)}
                  className="rounded border-zinc-300 text-[#6D35C8] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#6D35C8]" />
                  Add Official Player / Custom Name & Number Printing (FREE)
                </span>
              </label>

              {enableCustomPrint && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">
                      Name on Back
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BELLINGHAM"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                      maxLength={14}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-[#1F2024] uppercase font-mono focus:outline-none focus:border-[#6D35C8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">
                      Jersey Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={2}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:outline-none focus:border-[#6D35C8]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Controller & Wishlist */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-[#E5E5E3] rounded-xl bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-[#1F2024] text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stockForSelected || 10, quantity + 1))}
                  className="p-2 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product);
                  showToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'info');
                }}
                className={`p-3.5 rounded-xl border transition flex items-center gap-2 text-xs font-bold cursor-pointer ${
                  inWishlist
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-[#E5E5E3] text-zinc-700 hover:text-[#6D35C8]'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{inWishlist ? 'Saved' : 'Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-3.5 rounded-xl border border-[#E5E5E3] bg-white text-zinc-600 hover:text-[#6D35C8] transition cursor-pointer"
                title="Share Kit"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(false)}
                className={`py-4 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer ${
                  isOutOfStock
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                    : 'bg-[#1F2024] hover:bg-[#2B2D31] text-white shadow-zinc-900/10'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add To Bag'}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(true)}
                className={`py-4 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md cursor-pointer ${
                  isOutOfStock
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                    : 'bg-[#6D35C8] hover:bg-[#4B218A] text-white shadow-purple-900/20'
                }`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Instant Checkout</span>
              </button>
            </div>
          </div>

          {/* Quick Value Badges */}
          <div className="pt-6 border-t border-[#E5E5E3] grid grid-cols-2 gap-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6D35C8] shrink-0" />
              <span>Dhaka (24-48h) • Outside (48-72h)</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#6D35C8] shrink-0" />
              <span>7 Days Size Exchange Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Specifications, Fabric Tech, Delivery, Reviews */}
      <div className="pt-8 border-t border-[#E5E5E3]">
        <div className="flex border-b border-[#E5E5E3] overflow-x-auto gap-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'specs'
                ? 'border-[#6D35C8] text-[#6D35C8]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('fabric')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'fabric'
                ? 'border-[#6D35C8] text-[#6D35C8]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Fabric & Technology
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'delivery'
                ? 'border-[#6D35C8] text-[#6D35C8]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Bangladesh Delivery & COD
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#6D35C8] text-[#6D35C8]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Verified Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-6">
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3 bg-[#F7F7F5] p-6 rounded-2xl border border-[#E5E5E3]">
                <h4 className="font-bold text-[#1F2024] uppercase tracking-wider text-[#6D35C8]">
                  Match Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-zinc-700">
                  <span className="text-zinc-500">Club / Team:</span>
                  <span className="font-semibold">{product.team}</span>
                  <span className="text-zinc-500">Season:</span>
                  <span className="font-semibold font-mono">{product.season}</span>
                  <span className="text-zinc-500">Kit Type:</span>
                  <span className="font-semibold uppercase">{product.kit_type}</span>
                  <span className="text-zinc-500">Edition:</span>
                  <span className="font-semibold uppercase">{product.jersey_version} Issue</span>
                </div>
              </div>

              <div className="space-y-3 bg-[#F7F7F5] p-6 rounded-2xl border border-[#E5E5E3]">
                <h4 className="font-bold text-[#1F2024] uppercase tracking-wider text-[#6D35C8]">
                  Care & Washing Instructions
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-700">
                  <li>Cold machine wash inside out at 30°C.</li>
                  <li>Do not iron directly over rubber heat-press sponsors or player names.</li>
                  <li>Hang dry naturally; avoid industrial heat tumble drying.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'fabric' && (
            <div className="p-6 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-4 text-xs leading-relaxed text-zinc-700">
              <h4 className="font-display text-lg font-bold text-[#1F2024] uppercase">
                Pro Grade Heat-Press Technology
              </h4>
              <p>
                Engineered with lightweight micro-mesh breathability panels across high-heat zones. The authentic silicone crest and heat-transferred sponsor logos minimize friction during 90-minute competitive matches.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-xl border border-[#E5E5E3]">
                  <p className="font-bold text-[#6D35C8]">AEROREADY / HEAT.RDY</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Accelerated sweat-wicking properties for humid weather.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-[#E5E5E3]">
                  <p className="font-bold text-[#6D35C8]">100% Recycled Polyester</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Eco-friendly performance textiles with double-knit yarn.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-[#E5E5E3]">
                  <p className="font-bold text-[#6D35C8]">Slim Athletic Profile</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Tapered ergonomic cut as worn on European matchdays.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="p-6 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-4 text-xs leading-relaxed text-zinc-700">
              <h4 className="font-display text-lg font-bold text-[#1F2024] uppercase">
                Bangladesh Nationwide Shipping Policy
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#E5E5E3]">
                  <p className="font-bold text-[#6D35C8] text-sm">Inside Dhaka Metro</p>
                  <p className="text-zinc-800 mt-1 font-semibold">Fee: <strong>{formatBDT(settings.inside_dhaka_delivery_fee)}</strong></p>
                  <p className="text-[11px] text-zinc-500 mt-1">Delivery Time: 24 - 48 Hours via courier partner with doorstep inspection.</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#E5E5E3]">
                  <p className="font-bold text-[#6D35C8] text-sm">Outside Dhaka (All 64 Districts)</p>
                  <p className="text-zinc-800 mt-1 font-semibold">Fee: <strong>{formatBDT(settings.outside_dhaka_delivery_fee)}</strong></p>
                  <p className="text-[11px] text-zinc-500 mt-1">Delivery Time: 48 - 72 Hours via SteadFast / Pathao / Paperfly.</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                * Orders over <strong>{formatBDT(settings.free_shipping_threshold ?? 3000)}</strong> qualify for <strong>100% FREE SHIPPING</strong> anywhere in Bangladesh.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Write Review Form */}
              <div className="p-6 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-4">
                <h4 className="font-display text-base font-bold text-[#1F2024] uppercase tracking-wider">
                  Write A Verified Review
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Shakib Al Hasan"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#6D35C8]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Rating</label>
                      <div className="flex items-center gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-[#6D35C8] transition cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-[#6D35C8] text-[#6D35C8]' : 'text-zinc-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Your Feedback</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about the jersey fabric, size fit, and delivery speed..."
                      className="w-full bg-white border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-[#6D35C8]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">
                    No reviews yet. Be the first to review this match kit!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white border border-[#E5E5E3] space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1F2024]">{rev.user_name}</span>
                          {rev.is_verified_purchase && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex text-[#6D35C8]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#6D35C8]' : 'text-zinc-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-700 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Football Kits Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#E5E5E3] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-black text-[#1F2024] uppercase tracking-tight">
              You May Also Like
            </h3>
            <button
              onClick={() => onNavigate('/shop')}
              className="text-xs font-bold text-[#6D35C8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={(s) => onNavigate(`/product/${s}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
