import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Category, Product, FAQItem, CMSPage } from '../types';
import { db } from '../lib/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initialStoreSettings, initialCategories, initialFAQs, initialCMSPages } from '../lib/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface StoreContextType {
  settings: StoreSettings;
  categories: Category[];
  faqs: FAQItem[];
  pages: CMSPage[];
  isLoadingSettings: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<StoreSettings>;
  refreshCategories: () => Promise<void>;
  refreshFAQs: () => Promise<void>;
  refreshPages: () => Promise<void>;
  refreshAll: () => Promise<void>;
  formatBDT: (amount: number) => string;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  bangladeshDistricts: string[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Comilla', 'Gazipur', 'Narayanganj', 'Bogra', 'Cox\'s Bazar', 'Jessore', 'Dinajpur',
  'Feni', 'Brahmanbaria', 'Tangail', 'Narsingdi', 'Faridpur', 'Kushtia', 'Pabna', 'Noakhali'
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [pages, setPages] = useState<CMSPage[]>(initialCMSPages);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const refreshSettings = async () => {
    try {
      const s = await db.getStoreSettings();
      if (s) setSettings(s);
    } catch (e) {
      console.warn('Failed refreshing store settings:', e);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await db.updateStoreSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  const refreshCategories = async () => {
    try {
      const cats = await db.getCategories();
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    } catch (e) {
      console.warn('Failed refreshing categories:', e);
    }
  };

  const refreshFAQs = async () => {
    try {
      const items = await db.getFAQs();
      if (items && items.length > 0) setFaqs(items);
    } catch (e) {
      console.warn('Failed refreshing FAQs:', e);
    }
  };

  const refreshPages = async () => {
    try {
      const p = await db.getCMSPages();
      if (p && p.length > 0) setPages(p);
    } catch (e) {
      console.warn('Failed refreshing CMS pages:', e);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      refreshSettings(),
      refreshCategories(),
      refreshFAQs(),
      refreshPages()
    ]);
  };

  useEffect(() => {
    refreshAll();

    // Supabase Real-Time Listener: Automatically sync any changes across tabs and devices
    if (isSupabaseConfigured && supabase) {
      try {
        const channel = supabase
          .channel('rayven-global-sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
            refreshSettings();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
            refreshCategories();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'faq' }, () => {
            refreshFAQs();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pages' }, () => {
            refreshPages();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Supabase real-time subscription error:', err);
      }
    }
  }, []);

  const formatBDT = (amount: number): string => {
    return `${settings.currency_symbol || '৳'}${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        faqs,
        pages,
        isLoadingSettings,
        refreshSettings,
        updateSettings,
        refreshCategories,
        refreshFAQs,
        refreshPages,
        refreshAll,
        formatBDT,
        toasts,
        showToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        bangladeshDistricts: BANGLADESH_DISTRICTS,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
