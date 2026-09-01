import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Category, Product } from '../types';
import { db } from '../lib/db';
import { initialStoreSettings, initialCategories } from '../lib/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface StoreContextType {
  settings: StoreSettings;
  categories: Category[];
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const refreshSettings = async () => {
    const s = await db.getStoreSettings();
    if (s) setSettings(s);
  };

  const refreshCategories = async () => {
    const cats = await db.getCategories();
    if (cats) setCategories(cats);
  };

  useEffect(() => {
    refreshSettings();
    refreshCategories();
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
        refreshSettings,
        refreshCategories,
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
