import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Product, Category, Banner } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';
import { 
  Sparkles, Flame, ShieldCheck, Truck, RotateCcw, Award, ArrowRight, 
  ChevronRight, Star, Instagram, CheckCircle2, Zap, Trophy, Shield 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { categories, settings, formatBDT } = useStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [retroProducts, setRetroProducts] = useState<Product[]>([]);

  useEffect(() => {
    db.getBanners().then(setBanners);
    db.getProducts({ featured: true, limit: 8 }).then(setFeaturedProducts);
    db.getProducts({ newArrival: true, limit: 8 }).then(setNewArrivals);
    db.getProducts({ bestseller: true, limit: 8 }).then(setBestsellers);
    db.getProducts({ version: 'retro', limit: 4 }).then(setRetroProducts);
  }, []);

  const hero = settings.hero || {
    badge: 'RAYVEN FOOTBALL LAB',
    headline: 'WEAR THE PASSION.',
    headline_highlight: 'FEEL THE GLORY.',
    subheadline: "Premium Football Jerseys for fans who live the game. Bangladesh's premier destination for master-grade player issue kits, fan editions, retro legends, and bespoke heat-press customization.",
    cta_text: 'SHOP JERSEYS',
    cta_link: '/shop',
    secondary_cta_text: 'EXPLORE COLLECTION',
    secondary_cta_link: '/shop?version=player',
    image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85',
    trust_badge_1: '100% MASTER',
    trust_badge_2: '24-48H DHAKA',
  };

  const sections = settings.homepage_sections || {
    hero: true,
    categories: true,
    featured_kits: true,
    new_arrivals: true,
    best_sellers: true,
    retro_vault: true,
    promotional_banners: true,
    why_rayven: true,
    customer_reviews: true,
    newsletter: true,
  };

  const whyCards = settings.why_rayven_cards || [
    {
      id: 'c1',
      title: '100% Master-Grade Craftsmanship',
      description: 'Breathable Dri-FIT ADV & HEAT.RDY weave, embossed team badges, silicone heat-press sponsor prints, and genuine official sleeve badges.',
      icon: 'Award'
    },
    {
      id: 'c2',
      title: 'Custom Name & Number Heat-Press',
      description: 'Get your own name or your favorite superstar’s name (Vini Jr, Bellingham, Messi, Yamal, Saka) printed with official tournament fonts.',
      icon: 'Sparkles'
    },
    {
      id: 'c3',
      title: '24-48H Bangladesh Delivery',
      description: 'Fast courier dispatch to all 64 districts in Bangladesh with Cash on Delivery and complete parcel inspection support.',
      icon: 'Truck'
    }
  ];

  const reviews = [
    {
      id: 'rev-1',
      name: 'Tanvir Hossain',
      location: 'Dhanmondi, Dhaka',
      rating: 5,
      comment: 'The heat-pressed badges and breathable jacquard fabric on the Player Edition kit are 100% authentic master grade. Delivered to Dhanmondi in less than 24 hours!',
      verified: true,
      club: 'Real Madrid 26/27'
    },
    {
      id: 'rev-2',
      name: 'Rashedul Karim',
      location: 'Chittagong',
      rating: 5,
      comment: 'Custom name printing for "BELLINGHAM #5" is crisp and doesn’t fade after washes. Best jersey shop in Bangladesh right now without any doubt.',
      verified: true,
      club: 'England Home Kit'
    },
    {
      id: 'rev-3',
      name: 'Farhan Ahmed',
      location: 'Uttara, Dhaka',
      rating: 5,
      comment: 'The retro 1998 France Zidane jersey is pure nostalgia. Heavy collar, sublimated patterns, and perfect packaging. Highly recommended.',
      verified: true,
      club: 'France 1998 Retro'
    }
  ];

  return (
    <div className="w-full bg-white text-[#1F2024]">
      {/* 1. LIGHT HERO SECTION */}
      {sections.hero !== false && (
        <section className="relative w-full bg-[#F7F7F5] border-b border-[#E5E5E3] overflow-hidden py-12 lg:py-20">
          {/* Subtle geometric light accent */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#6D35C8]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#6D35C8]/5 blur-2xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Content Column */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEFC] border border-[#8B5AD9]/30 text-[#6D35C8] text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#6D35C8] animate-pulse" />
                  <span>{hero.badge || 'RAYVEN FOOTBALL LAB'}</span>
                </div>

                {/* Large Headline */}
                <div className="space-y-1">
                  <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-[#1F2024] tracking-tight leading-[0.92] uppercase">
                    {hero.headline || 'WEAR THE PASSION.'}
                  </h1>
                  {hero.headline_highlight && (
                    <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-[#6D35C8] tracking-tight leading-[0.92] uppercase">
                      {hero.headline_highlight}
                    </h1>
                  )}
                </div>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-zinc-600 max-w-xl leading-relaxed">
                  {hero.subheadline}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    id="hero-shop-jerseys-btn"
                    type="button"
                    onClick={() => onNavigate(hero.cta_link || '/shop')}
                    className="px-8 py-4 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 transition active:scale-95 shadow-lg shadow-purple-900/20 cursor-pointer"
                  >
                    <span>{hero.cta_text || 'SHOP JERSEYS'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {hero.secondary_cta_text && (
                    <button
                      id="hero-explore-collection-btn"
                      type="button"
                      onClick={() => onNavigate(hero.secondary_cta_link || '/shop?version=player')}
                      className="px-8 py-4 bg-white hover:bg-[#F3EEFC]/50 text-[#1F2024] font-bold rounded-2xl text-xs sm:text-sm uppercase tracking-wider border border-[#E5E5E3] hover:border-[#6D35C8] transition shadow-xs cursor-pointer"
                    >
                      {hero.secondary_cta_text}
                    </button>
                  )}
                </div>

                {/* Micro Trust Proofs */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E5E5E3] text-xs">
                  <div>
                    <p className="font-black text-[#1F2024] text-sm">{hero.trust_badge_1 || '100% MASTER'}</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Grade 1:1 Authentic Quality</p>
                  </div>
                  <div>
                    <p className="font-black text-[#1F2024] text-sm">{hero.trust_badge_2 || '24-48H DHAKA'}</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Express Courier Delivery</p>
                  </div>
                  <div>
                    <p className="font-black text-[#1F2024] text-sm">7-DAY FIT</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Hassle-Free Size Exchange</p>
                  </div>
                </div>
              </div>

              {/* Right Product Hero Card Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md bg-white rounded-3xl p-5 border border-[#E5E5E3] shadow-xl shadow-purple-900/5 group">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F7F7F5] border border-[#E5E5E3]">
                    <img
                      src={hero.image_url || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85'}
                      alt="Featured Match Kit"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#6D35C8] text-white font-black rounded-full text-xs uppercase tracking-wider shadow-sm">
                        MATCHDAY ISSUE
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E5E5E3] shadow-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#6D35C8] uppercase tracking-widest font-mono">
                          AUTHENTIC PLAYER CUT
                        </span>
                        <h4 className="font-display text-base font-black text-[#1F2024] uppercase">
                          2026/27 UCL Edition Kits
                        </h4>
                      </div>
                      <button
                        onClick={() => onNavigate('/shop')}
                        className="p-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white rounded-xl transition cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. FEATURED JERSEYS (WHITE) */}
      {sections.featured_kits !== false && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E3] pb-5">
              <div>
                <div className="flex items-center gap-2 text-[#6D35C8] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#6D35C8]" />
                  <span>CURATED SELECTION</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
                  Featured Football Kits
                </h2>
              </div>

              <button
                onClick={() => onNavigate('/shop')}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#1F2024] hover:text-[#6D35C8] transition group cursor-pointer"
              >
                <span>View All Collection</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. CATEGORIES & LEAGUES (#F7F7F5) */}
      {sections.categories !== false && (
        <section className="py-16 sm:py-20 bg-[#F7F7F5] border-y border-[#E5E5E3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
                OFFICIAL CLUBS & LEAGUES
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
                Explore by Team & Tournament
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.slice(0, 6).map((category) => (
                <div
                  key={category.id}
                  onClick={() => onNavigate(`/shop?category=${category.slug}`)}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-[#E5E5E3] hover:border-[#6D35C8] p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-lg shadow-xs"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F7F7F5] mb-3 border border-[#E5E5E3]">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-display text-sm font-bold text-[#1F2024] group-hover:text-[#6D35C8] transition-colors uppercase leading-snug">
                    {category.name}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Explore Kits →</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. NEW ARRIVALS 2026/27 (WHITE) */}
      {sections.new_arrivals !== false && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E3] pb-5">
              <div>
                <div className="flex items-center gap-2 text-[#6D35C8] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <Flame className="w-3.5 h-3.5 text-[#6D35C8]" />
                  <span>FRESH DROPS</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
                  New Season 2026/27 Arrivals
                </h2>
              </div>

              <button
                onClick={() => onNavigate('/shop')}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#1F2024] hover:text-[#6D35C8] transition group cursor-pointer"
              >
                <span>Explore All Drops</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. BEST SELLERS & PLAYER EDITIONS (#F7F7F5) */}
      {sections.best_sellers !== false && (
        <section className="py-16 sm:py-20 bg-[#F7F7F5] border-y border-[#E5E5E3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E3] pb-5">
              <div>
                <div className="flex items-center gap-2 text-[#6D35C8] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <Trophy className="w-3.5 h-3.5 text-[#6D35C8]" />
                  <span>TOP MATCHDAY CHOICES</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
                  Most Wanted Kits
                </h2>
              </div>

              <button
                onClick={() => onNavigate('/shop?version=player')}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#1F2024] hover:text-[#6D35C8] transition group cursor-pointer"
              >
                <span>Player Edition Pro Kits</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {bestsellers.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={(slug) => onNavigate(`/product/${slug}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. WHY RAYVEN (WHITE) */}
      {sections.why_rayven !== false && (
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
                AUTHENTIC STANDARD
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-[#1F2024] uppercase tracking-tight">
                Why Football Fans Trust {settings.store_name || 'RAYVEN'}
              </h2>
              <p className="text-sm text-zinc-600">
                We specialize in master-grade football kits engineered with official player fabrics, heat-sealed crests, and precision heat-press customization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyCards.map((card, idx) => (
                <div key={card.id || idx} className="p-8 rounded-3xl bg-[#F7F7F5] border border-[#E5E5E3] space-y-4 hover:border-[#6D35C8] transition-colors shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3EEFC] border border-[#8B5AD9]/30 flex items-center justify-center text-[#6D35C8]">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-black text-[#1F2024] uppercase">
                    {card.title}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. CUSTOMER REVIEWS (WHITE) */}
      {sections.customer_reviews !== false && (
        <section className="py-16 sm:py-20 bg-[#F7F7F5] border-t border-[#E5E5E3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
                COMMUNITY VOICES
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase tracking-tight">
                Verified Fan Reviews
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-3xl bg-white border border-[#E5E5E3] shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#6D35C8]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#6D35C8] text-[#6D35C8]" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      VERIFIED PURCHASE
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  <div className="pt-3 border-t border-[#E5E5E3] flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-[#1F2024]">{rev.name}</h4>
                      <p className="text-[11px] text-zinc-500">{rev.location}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#6D35C8] bg-[#F3EEFC] px-2 py-1 rounded border border-[#8B5AD9]/20 font-bold">
                      {rev.club}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CALL TO ACTION SECTION (CLEAN PURPLE BANNER) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#6D35C8] p-8 sm:p-14 text-white shadow-xl shadow-purple-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-left">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-mono font-bold uppercase backdrop-blur-sm">
                MATCHDAY READY
              </span>
              <h3 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                Gear Up for the Next Big Matchday
              </h3>
              <p className="text-sm text-purple-100 font-medium">
                Choose your club kit, pick Player or Fan Edition, and customize with your name & number. Free delivery on orders over {formatBDT(settings.free_shipping_threshold || 3000)}!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('/shop')}
                className="px-8 py-4 bg-white hover:bg-zinc-100 text-[#1F2024] font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition shadow-lg cursor-pointer"
              >
                Shop All Kits Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
