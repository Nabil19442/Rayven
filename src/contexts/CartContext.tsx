import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, JerseySize, Coupon } from '../types';
import { db } from '../lib/db';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  setDeliveryZone: (zone: 'inside_dhaka' | 'outside_dhaka') => void;
  coupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: JerseySize, quantity?: number, customName?: string, customNumber?: string) => { success: boolean; message: string };
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateSize: (cartItemId: string, size: JerseySize) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rayven_cart_items_v1';
const CART_COUPON_KEY = 'rayven_cart_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [insideDhakaFee, setInsideDhakaFee] = useState(60);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(120);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  
  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const stored = localStorage.getItem(CART_COUPON_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with store settings for real-time delivery fee updates
  useEffect(() => {
    db.getStoreSettings().then(settings => {
      if (settings) {
        setInsideDhakaFee(settings.inside_dhaka_delivery_fee ?? 60);
        setOutsideDhakaFee(settings.outside_dhaka_delivery_fee ?? 120);
        setFreeShippingThreshold(settings.free_shipping_threshold ?? 3000);
      }
    });
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed saving cart', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem(CART_COUPON_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(CART_COUPON_KEY);
      }
    } catch (e) {
      console.warn('Failed saving coupon', e);
    }
  }, [coupon]);

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  // Re-evaluate coupon when subtotal changes
  useEffect(() => {
    if (coupon) {
      if (subtotal < coupon.min_order_amount) {
        setCouponDiscount(0);
        setCouponError(`Min order ৳${coupon.min_order_amount} required`);
      } else {
        setCouponError(null);
        let disc = 0;
        if (coupon.discount_type === 'percentage') {
          disc = Math.round((subtotal * coupon.discount_value) / 100);
          if (coupon.max_discount_amount && disc > coupon.max_discount_amount) {
            disc = coupon.max_discount_amount;
          }
        } else {
          disc = coupon.discount_value;
        }
        setCouponDiscount(Math.min(disc, subtotal));
      }
    } else {
      setCouponDiscount(0);
    }
  }, [subtotal, coupon]);

  // Delivery charge calculation
  const deliveryCharge = (subtotal >= freeShippingThreshold && items.length > 0) 
    ? 0 
    : (deliveryZone === 'inside_dhaka' ? insideDhakaFee : outsideDhakaFee);

  const grandTotal = Math.max(0, subtotal - couponDiscount + (items.length > 0 ? deliveryCharge : 0));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (
    product: Product, 
    size: JerseySize, 
    quantity = 1, 
    customName?: string, 
    customNumber?: string
  ): { success: boolean; message: string } => {
    const variant = product.variants.find(v => v.size === size);
    const stockAvailable = variant ? variant.stock_quantity : 10;

    if (stockAvailable <= 0) {
      return { success: false, message: `Size ${size} is currently out of stock.` };
    }

    const unitPrice = product.discount_price ?? product.price;
    const cartItemId = `${product.id}-${size}-${customName || ''}-${customNumber || ''}`;

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.id === cartItemId);
      if (existingIndex >= 0) {
        const existing = prevItems[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, stockAvailable);
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          total_price: newQty * unitPrice
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          product_id: product.id,
          variant_id: variant?.id || `v-${product.id}-${size}`,
          product,
          size,
          quantity: Math.min(quantity, stockAvailable),
          custom_name: customName?.trim() ? customName.toUpperCase() : undefined,
          custom_number: customNumber?.trim() || undefined,
          unit_price: unitPrice,
          total_price: Math.min(quantity, stockAvailable) * unitPrice
        };
        return [...prevItems, newItem];
      }
    });

    setIsCartOpen(true);
    return { success: true, message: `${product.name} (${size}) added to cart!` };
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const variant = item.product.variants.find(v => v.size === item.size);
        const maxStock = variant ? variant.stock_quantity : 99;
        const validQty = Math.min(quantity, maxStock);
        return {
          ...item,
          quantity: validQty,
          total_price: validQty * item.unit_price
        };
      }
      return item;
    }));
  };

  const updateSize = (cartItemId: string, newSize: JerseySize) => {
    setItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newVariant = item.product.variants.find(v => v.size === newSize);
        return {
          ...item,
          id: `${item.product_id}-${newSize}-${item.custom_name || ''}-${item.custom_number || ''}`,
          size: newSize,
          variant_id: newVariant?.id || `v-${item.product_id}-${newSize}`
        };
      }
      return item;
    }));
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const result = await db.validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setCoupon(result.coupon);
      setCouponDiscount(result.discount);
      setCouponError(null);
      return true;
    } else {
      setCouponError(result.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryCharge,
        deliveryZone,
        setDeliveryZone,
        coupon,
        couponDiscount,
        couponError,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        applyCoupon,
        removeCoupon,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
