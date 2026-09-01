import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useStore } from '../contexts/StoreContext';
import { RayvenLogo } from './RayvenLogo';
import { 
  Search, ShoppingBag, Heart, User, Menu, X, Shield, 
  ChevronDown, ArrowRight, Truck 
} from 'lucide-react';

interface NavbarProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath = '/', onNavigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { settings, setIsSearchOpen } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [clubsDropdownOpen, setClubsDropdownOpen] = useState(false);

  const handleLink = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setClubsDropdownOpen(false);
  };

  const clubsList = [
    { name: 'Real Madrid', slug: 'real-madrid' },
    { name: 'FC Barcelona', slug: 'barcelona' },
    { name: 'Manchester United', slug: 'manchester-united' },
    { name: 'Manchester City', slug: 'manchester-city' },
    { name: 'Liverpool FC', slug: 'liverpool' },
    { name: 'Arsenal FC', slug: 'arsenal' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E5E3] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-700 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <div 
              onClick={() => handleLink('/')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <RayvenLogo variant="light" size="md" subtitleText="FOOTBALL LAB" />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => handleLink('/')}
              className={`transition-colors py-2 relative ${
                currentPath === '/' ? 'text-[#1F2024] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6D35C8]' : 'text-zinc-600 hover:text-[#1F2024]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleLink('/shop')}
              className={`transition-colors py-2 relative ${
                currentPath === '/shop' ? 'text-[#1F2024] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6D35C8]' : 'text-zinc-600 hover:text-[#1F2024]'
              }`}
            >
              All Jerseys
            </button>

            {/* Clubs Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setClubsDropdownOpen(true)}
              onMouseLeave={() => setClubsDropdownOpen(false)}
            >
              <button
                onClick={() => handleLink('/shop')}
                className="flex items-center gap-1 text-zinc-600 hover:text-[#1F2024] transition-colors py-2 cursor-pointer"
              >
                <span>Clubs</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${clubsDropdownOpen ? 'rotate-180 text-[#6D35C8]' : ''}`} />
              </button>

              {clubsDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-[#E5E5E3] rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {clubsList.map(club => (
                    <button
                      key={club.slug}
                      onClick={() => handleLink(`/shop?category=${club.slug}`)}
                      className="text-left px-3.5 py-2.5 text-xs font-bold text-zinc-700 hover:text-[#1F2024] hover:bg-[#F3EEFC] hover:text-[#6D35C8] rounded-xl transition flex items-center justify-between cursor-pointer"
                    >
                      <span>{club.name}</span>
                    </button>
                  ))}
                  <div className="border-t border-zinc-100 my-1"></div>
                  <button
                    onClick={() => handleLink('/shop')}
                    className="text-left px-3.5 py-2 text-xs font-extrabold text-[#6D35C8] hover:bg-[#F3EEFC] rounded-xl transition flex items-center justify-between cursor-pointer"
                  >
                    <span>View All Clubs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleLink('/shop?version=player')}
              className="text-zinc-700 hover:text-[#1F2024] transition-colors flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <span>Player Edition</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30">
                PRO
              </span>
            </button>

            <button
              onClick={() => handleLink('/shop?category=retro-classics')}
              className="text-zinc-600 hover:text-[#1F2024] transition-colors py-2 cursor-pointer"
            >
              Retro Vault
            </button>

            <button
              onClick={() => handleLink('/shop?category=national-teams')}
              className="text-zinc-600 hover:text-[#1F2024] transition-colors py-2 cursor-pointer"
            >
              National Teams
            </button>

            <button
              onClick={() => handleLink('/track-order')}
              className="text-zinc-600 hover:text-[#1F2024] transition-colors flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-[#6D35C8]" />
              <span>Track Order</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              id="global-search-btn"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
              title="Search Football Kits"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              id="nav-wishlist-btn"
              type="button"
              onClick={() => handleLink('/wishlist')}
              className="relative p-2.5 text-zinc-700 hover:text-[#6D35C8] hover:bg-[#F3EEFC] rounded-xl transition cursor-pointer"
              title="Saved Jerseys"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#6D35C8] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-sm">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              id="nav-cart-btn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl transition active:scale-95 shadow-md shadow-purple-900/15 cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Cart</span>
              <span className="w-5 h-5 bg-white text-[#6D35C8] rounded-full text-xs font-black flex items-center justify-center">
                {itemCount}
              </span>
            </button>

            {/* User Account Menu */}
            <div className="relative">
              <button
                id="user-menu-btn"
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition border border-[#E5E5E3] cursor-pointer"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-[#6D35C8]" />
                ) : (
                  <User className="w-5 h-5 text-zinc-700" />
                )}
                <span className="hidden sm:inline text-xs font-bold max-w-[90px] truncate text-zinc-900">
                  {user ? user.full_name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E5E5E3] rounded-2xl shadow-2xl p-3 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {user ? (
                    <>
                      <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                        <p className="text-xs font-bold text-zinc-950 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-zinc-500 font-mono truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            isAdmin ? 'bg-[#F3EEFC] text-[#6D35C8] border border-[#8B5AD9]/30' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLink('/account')}
                        className="text-left px-3 py-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                      >
                        My Profile & Orders
                      </button>

                      <button
                        onClick={() => handleLink('/wishlist')}
                        className="text-left px-3 py-2 text-xs font-bold text-zinc-700 hover:text-[#6D35C8] hover:bg-[#F3EEFC] rounded-xl transition cursor-pointer"
                      >
                        My Wishlist ({wishlistIds.length})
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleLink('/admin')}
                          className="text-left px-3 py-2 text-xs font-bold text-[#6D35C8] hover:bg-[#F3EEFC] rounded-xl transition flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-[#6D35C8]" />
                            Admin Dashboard
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <div className="border-t border-zinc-100 my-1"></div>

                      <button
                        onClick={async () => {
                          await logout();
                          setUserDropdownOpen(false);
                        }}
                        className="text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="p-2 text-center space-y-2">
                      <p className="text-xs font-bold text-zinc-800">RAYVEN Account</p>
                      <button
                        onClick={() => handleLink('/login')}
                        className="w-full py-2.5 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => handleLink('/register')}
                        className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E5E3] px-4 pt-3 pb-6 flex flex-col gap-3 shadow-lg">
          <div className="flex flex-col gap-1 text-xs font-bold uppercase">
            <button
              onClick={() => handleLink('/')}
              className="text-left py-2.5 px-3.5 rounded-xl text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
            >
              Home
            </button>
            <button
              onClick={() => handleLink('/shop')}
              className="text-left py-2.5 px-3.5 rounded-xl text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
            >
              All Football Jerseys
            </button>
            <button
              onClick={() => handleLink('/shop?version=player')}
              className="text-left py-2.5 px-3.5 rounded-xl text-[#6D35C8] bg-[#F3EEFC] hover:bg-[#F3EEFC]/80"
            >
              Player Edition Kits (Pro)
            </button>
            <button
              onClick={() => handleLink('/shop?category=retro-classics')}
              className="text-left py-2.5 px-3.5 rounded-xl text-zinc-800 hover:bg-zinc-100"
            >
              Retro Vault
            </button>
            <button
              onClick={() => handleLink('/shop?category=national-teams')}
              className="text-left py-2.5 px-3.5 rounded-xl text-zinc-800 hover:bg-zinc-100"
            >
              National Teams
            </button>
            <button
              onClick={() => handleLink('/track-order')}
              className="text-left py-2.5 px-3.5 rounded-xl text-zinc-800 hover:bg-zinc-100 flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-[#6D35C8]" />
              <span>Track Order</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

