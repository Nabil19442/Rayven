import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';
import { Product } from './types';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { ToastContainer } from './components/ToastContainer';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPages } from './pages/AuthPages';
import { InfoPages } from './pages/InfoPages';

// Admin Portal Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminHomepageCMS } from './pages/admin/AdminHomepageCMS';
import { AdminPagesCMS } from './pages/admin/AdminPagesCMS';
import { AdminFAQ } from './pages/admin/AdminFAQ';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminSubscribers } from './pages/admin/AdminSubscribers';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

const AppContent: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [lastCreatedOrderNumber, setLastCreatedOrderNumber] = useState<string>('');
  
  // Admin sub-tab state & product edit state
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Sync with browser history and support direct popstate/navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname + window.location.search;
      setCurrentPath(path || '/');
    };

    window.addEventListener('popstate', handlePopState);
    if (window.location.pathname && window.location.pathname !== '/') {
      setCurrentPath(window.location.pathname + window.location.search);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse path & params
  const [pathname, searchString] = currentPath.split('?');
  const searchParams = new URLSearchParams(searchString || '');

  // Render Admin Portal if path starts with /admin
  if (pathname.startsWith('/admin')) {
    // If auth state is still loading, show a clean loader
    if (isLoading) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#6D35C8] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-zinc-500 font-mono">VERIFYING RAYVEN CREDENTIALS...</p>
          </div>
        </div>
      );
    }

    // Require admin authentication
    if (!isAdmin) {
      return (
        <AdminLogin
          onSuccess={() => navigate('/admin')}
          onNavigateStore={navigate}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          setAdminTab(tab);
          if (tab !== 'edit-product') setProductToEdit(null);
        }}
        onNavigateStore={(path) => navigate(path)}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
        {adminTab === 'products' && (
          <AdminProducts
            onAddProduct={() => setAdminTab('add-product')}
            onEditProduct={(p) => {
              setProductToEdit(p);
              setAdminTab('edit-product');
            }}
            onViewProduct={(slug) => navigate(`/product/${slug}`)}
          />
        )}
        {adminTab === 'add-product' && (
          <AdminProductForm
            onCancel={() => setAdminTab('products')}
            onSaved={() => setAdminTab('products')}
          />
        )}
        {adminTab === 'edit-product' && (
          <AdminProductForm
            productToEdit={productToEdit}
            onCancel={() => {
              setProductToEdit(null);
              setAdminTab('products');
            }}
            onSaved={() => {
              setProductToEdit(null);
              setAdminTab('products');
            }}
          />
        )}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'inventory' && <AdminInventory />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'coupons' && <AdminCoupons />}
        {adminTab === 'banners' && <AdminBanners />}
        {adminTab === 'homepage-cms' && <AdminHomepageCMS />}
        {adminTab === 'pages-cms' && <AdminPagesCMS />}
        {adminTab === 'faq-cms' && <AdminFAQ />}
        {adminTab === 'messages' && <AdminMessages />}
        {adminTab === 'subscribers' && <AdminSubscribers />}
        {adminTab === 'logs' && <AdminLogs />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Determine Customer Storefront View
  let content = <HomePage onNavigate={navigate} />;

  if (pathname === '/shop') {
    const cat = searchParams.get('category') || undefined;
    const team = searchParams.get('team') || undefined;
    const version = (searchParams.get('version') as any) || undefined;
    const search = searchParams.get('search') || undefined;

    content = (
      <ShopPage
        initialCategory={cat}
        initialTeam={team}
        initialVersion={version}
        initialSearch={search}
        onNavigate={navigate}
      />
    );
  } else if (pathname.startsWith('/product/')) {
    const slug = pathname.replace('/product/', '').split('/')[0];
    content = <ProductDetailsPage slug={slug} onNavigate={navigate} />;
  } else if (pathname === '/cart') {
    content = <CartPage onNavigate={navigate} />;
  } else if (pathname === '/checkout') {
    content = (
      <CheckoutPage
        onNavigate={navigate}
        onOrderCreated={(orderNum) => setLastCreatedOrderNumber(orderNum)}
      />
    );
  } else if (pathname.startsWith('/order-success')) {
    const orderNumFromPath = pathname.replace('/order-success/', '').split('/')[0];
    const orderNum = orderNumFromPath || lastCreatedOrderNumber || 'RAY-20260901-0001';
    content = <OrderSuccessPage orderNumber={orderNum} onNavigate={navigate} />;
  } else if (pathname === '/track-order') {
    const orderParam = searchParams.get('order') || undefined;
    content = <TrackOrderPage initialOrderNumber={orderParam} onNavigate={navigate} />;
  } else if (pathname === '/wishlist') {
    content = <WishlistPage onNavigate={navigate} />;
  } else if (pathname === '/account') {
    content = <AccountPage onNavigate={navigate} />;
  } else if (pathname === '/login') {
    content = <AuthPages mode="login" onNavigate={navigate} />;
  } else if (pathname === '/register') {
    content = <AuthPages mode="register" onNavigate={navigate} />;
  } else if (['/about', '/contact', '/faq', '/returns', '/terms', '/privacy'].includes(pathname)) {
    const pageKey = pathname.replace('/', '') as any;
    content = <InfoPages page={pageKey} onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-white text-[#1F2024] font-sans flex flex-col selection:bg-[#F3EEFC] selection:text-[#6D35C8]">
      {/* Sticky Header & Navigation */}
      <Navbar onNavigate={navigate} />

      {/* Main Page Body */}
      <main className="flex-1">
        {content}
      </main>

      {/* Store Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Interactive Drawers & Modals */}
      <CartDrawer onNavigate={navigate} />
      <SearchModal onNavigate={navigate} />
      <QuickViewModal onNavigate={navigate} />
      <SizeGuideModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WishlistProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
