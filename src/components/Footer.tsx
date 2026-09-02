import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { db } from '../lib/db';
import { RayvenLogo } from './RayvenLogo';
import { ShieldCheck, Truck, RotateCcw, Award, Phone, Mail, MapPin, Send, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, formatBDT, showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await db.addNewsletterSubscriber(newsletterEmail);
      if (res.success) {
        setSubscribed(true);
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Subscription failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#1F2024] text-zinc-300 border-t border-zinc-800 mt-20">
      {/* Value Proposition Highlights Banner */}
      <div className="border-b border-zinc-800/80 bg-[#17181C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#1F2024] border border-zinc-800">
              <div className="p-3 rounded-xl bg-[#6D35C8]/15 text-[#8B5AD9] shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">100% Authentic Quality</h4>
                <p className="text-xs text-zinc-400 mt-1">High grade master-issue & fan edition football kits with high-density crests.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#1F2024] border border-zinc-800">
              <div className="p-3 rounded-xl bg-[#6D35C8]/15 text-[#8B5AD9] shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Express Delivery</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Dhaka: {formatBDT(settings.inside_dhaka_delivery_fee)} (24-48h) | Outside Dhaka: {formatBDT(settings.outside_dhaka_delivery_fee)} (48-72h).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#1F2024] border border-zinc-800">
              <div className="p-3 rounded-xl bg-[#6D35C8]/15 text-[#8B5AD9] shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">7 Days Easy Exchange</h4>
                <p className="text-xs text-zinc-400 mt-1">Hassle-free size replacement support across all 64 districts of Bangladesh.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#1F2024] border border-zinc-800">
              <div className="p-3 rounded-xl bg-[#6D35C8]/15 text-[#8B5AD9] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Cash on Delivery</h4>
                <p className="text-xs text-zinc-400 mt-1">Inspect and verify your football kit parcel right at your doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <RayvenLogo variant="dark" size="lg" subtitleText={settings.tagline || 'PREMIUM FOOTBALL LAB'} />

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {settings.store_description || settings.store_tagline || 'Bangladesh’s premier football sportswear hub for authentic player editions, club kits, retro classics, and custom name/number prints.'}
            </p>

            <div className="space-y-2 pt-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8B5AD9] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white font-mono transition">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8B5AD9] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white font-mono transition">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#8B5AD9] shrink-0" />
                <span>{settings.address || 'House 42, Road 11, Banani, Dhaka 1213, Bangladesh'}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-display text-base font-bold text-white uppercase tracking-wider mb-4 text-[#8B5AD9]">
              Shop Collections
            </h5>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  All Football Jerseys
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=real-madrid')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Real Madrid Kits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=barcelona')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  FC Barcelona Kits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=manchester-united')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Manchester United
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=retro-classics')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Retro Classics Vault
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?version=player')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Pro Player Editions
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="font-display text-base font-bold text-white uppercase tracking-wider mb-4 text-[#8B5AD9]">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <button onClick={() => onNavigate('/track-order')} className="hover:text-[#8B5AD9] transition flex items-center gap-1 cursor-pointer">
                  <span>Track Your Order</span>
                  <ArrowRight className="w-3 h-3 text-[#8B5AD9]" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  About {settings.store_name || 'RAYVEN'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Contact & WhatsApp Helpline
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/returns')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Return & Exchange Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-[#8B5AD9] transition cursor-pointer">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h5 className="font-display text-base font-bold text-white uppercase tracking-wider mb-2 text-[#8B5AD9]">
              Join The Squad
            </h5>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Subscribe for early access to new kit drops, restock alerts, and get an instant <strong className="text-[#8B5AD9]">10% discount code</strong>.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#6D35C8]/20 border border-[#6D35C8]/40 rounded-xl text-xs text-purple-200 font-bold">
                🎉 Welcome to the squad! Check your email or use code <span className="underline font-mono text-white">RAYVEN10</span> at checkout.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                    className="w-full bg-[#2B2D31] border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#8B5AD9]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Subscribing...' : 'Subscribe & Save'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright and payment methods */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {settings.store_name || 'RAYVEN'} Football Sportswear. All rights reserved.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-zinc-400">Accepted In Bangladesh:</span>
            <span className="px-2.5 py-1 bg-[#2B2D31] border border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-200">
              Cash on Delivery (COD)
            </span>
            <span className="px-2.5 py-1 bg-[#2B2D31] border border-zinc-700 rounded-lg text-[10px] font-bold text-pink-400">
              bKash
            </span>
            <span className="px-2.5 py-1 bg-[#2B2D31] border border-zinc-700 rounded-lg text-[10px] font-bold text-orange-400">
              Nagad
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
