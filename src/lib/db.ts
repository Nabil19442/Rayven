import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Product, Category, Order, UserProfile, Banner, Coupon, StoreSettings, 
  ProductReview, CustomerAddress, ActivityLog, JerseySize, OrderStatus, PaymentStatus,
  FAQItem, CMSPage, ContactMessage, NewsletterSubscriber 
} from '../types';
import { 
  initialProducts, initialCategories, initialBanners, initialCoupons, 
  initialStoreSettings, demoAdminUser, demoCustomerUser, initialOrders,
  initialFAQs, initialCMSPages, initialContactMessages, initialSubscribers 
} from './initialData';

// Local storage keys for persistent offline/fallback operations
const STORAGE_KEYS = {
  PRODUCTS: 'rayven_products_v1',
  CATEGORIES: 'rayven_categories_v1',
  ORDERS: 'rayven_orders_v1',
  COUPONS: 'rayven_coupons_v1',
  BANNERS: 'rayven_banners_v1',
  SETTINGS: 'rayven_settings_v1',
  REVIEWS: 'rayven_reviews_v1',
  ADDRESSES: 'rayven_addresses_v1',
  WISHLIST: 'rayven_wishlist_v1',
  LOGS: 'rayven_logs_v1',
  CURRENT_USER: 'rayven_current_user_v1',
  FAQS: 'rayven_faqs_v1',
  PAGES: 'rayven_pages_v1',
  MESSAGES: 'rayven_messages_v1',
  SUBSCRIBERS: 'rayven_subscribers_v1',
};

// Helpers for localStorage sync
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Failed reading storage key ${key}:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed saving storage key ${key}:`, err);
  }
}

// Initial hydration
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) setStored(STORAGE_KEYS.PRODUCTS, initialProducts);
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) setStored(STORAGE_KEYS.CATEGORIES, initialCategories);
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) setStored(STORAGE_KEYS.ORDERS, initialOrders);
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) setStored(STORAGE_KEYS.COUPONS, initialCoupons);
  if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) setStored(STORAGE_KEYS.BANNERS, initialBanners);
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) setStored(STORAGE_KEYS.SETTINGS, initialStoreSettings);
  if (!localStorage.getItem(STORAGE_KEYS.FAQS)) setStored(STORAGE_KEYS.FAQS, initialFAQs);
  if (!localStorage.getItem(STORAGE_KEYS.PAGES)) setStored(STORAGE_KEYS.PAGES, initialCMSPages);
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) setStored(STORAGE_KEYS.MESSAGES, initialContactMessages);
  if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) setStored(STORAGE_KEYS.SUBSCRIBERS, initialSubscribers);
  // Do NOT automatically log in any demo user
}

export const db = {
  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------
  async getProducts(params?: {
    categorySlug?: string;
    team?: string;
    season?: string;
    size?: string;
    version?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    newArrival?: boolean;
    bestseller?: boolean;
    search?: string;
    sortBy?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
    inStockOnly?: boolean;
    inStock?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('products').select(`*, variants:product_variants(*)`);
        if (params?.featured !== undefined) query = query.eq('is_featured', params.featured);
        if (params?.newArrival !== undefined) query = query.eq('is_new_arrival', params.newArrival);
        if (params?.bestseller !== undefined) query = query.eq('is_bestseller', params.bestseller);
        if (params?.type) query = query.eq('product_type', params.type);
        if (params?.version) query = query.eq('jersey_version', params.version);
        if (params?.team) query = query.ilike('team', `%${params.team}%`);
        if (params?.search) {
          query = query.or(`name.ilike.%${params.search}%,team.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
        }
        query = query.eq('is_published', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (e) {
        console.warn('Supabase query fallback to local cache:', e);
      }
    }

    // Local Storage / In-memory query
    let list = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    
    if (params?.categorySlug) {
      const cats = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
      const cat = cats.find(c => c.slug === params.categorySlug);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id || p.category_name?.toLowerCase() === cat.name.toLowerCase());
      }
    }

    if (params?.team) {
      list = list.filter(p => p.team.toLowerCase().includes(params.team!.toLowerCase()));
    }

    if (params?.season) {
      list = list.filter(p => p.season === params.season);
    }

    if (params?.version) {
      list = list.filter(p => p.jersey_version === params.version);
    }

    if (params?.type) {
      list = list.filter(p => p.product_type === params.type);
    }

    if (params?.featured) {
      list = list.filter(p => p.is_featured);
    }

    if (params?.newArrival) {
      list = list.filter(p => p.is_new_arrival);
    }

    if (params?.bestseller) {
      list = list.filter(p => p.is_bestseller);
    }

    if (params?.minPrice !== undefined) {
      list = list.filter(p => (p.discount_price ?? p.price) >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      list = list.filter(p => (p.discount_price ?? p.price) <= params.maxPrice!);
    }

    if (params?.size) {
      list = list.filter(p => p.variants?.some(v => v.size === params.size && v.stock_quantity > 0));
    }

    if (params?.inStockOnly || params?.inStock) {
      list = list.filter(p => p.variants?.some(v => v.stock_quantity > 0));
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.team.toLowerCase().includes(q) || 
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.category_name?.toLowerCase().includes(q)
      );
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'newest':
          list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'price_asc':
          list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
          break;
        case 'price_desc':
          list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
          break;
        case 'rating':
          list.sort((a, b) => (b.rating ?? b.rating_avg ?? 5) - (a.rating ?? a.rating_avg ?? 5));
          break;
        case 'featured':
        default:
          list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
          break;
      }
    }

    if (params?.limit) {
      list = list.slice(0, params.limit);
    }

    return list;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`*, variants:product_variants(*)`)
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Product;
      } catch (e) {
        console.warn('Supabase getProductBySlug error:', e);
      }
    }

    const list = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return list.find(p => p.slug === slug || p.id === slug) || null;
  },

  async saveProduct(product: Partial<Product> & { name: string; price: number; team: string }): Promise<Product> {
    const list = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const existingIndex = list.findIndex(p => p.id === product.id);

    const defaultVariants = (sizes: JerseySize[]) => 
      sizes.map(size => ({
        id: `v-${Date.now()}-${size}`,
        product_id: product.id || `prod-${Date.now()}`,
        size,
        stock_quantity: 15,
        sku: `${product.sku || 'RAY'}-${size}`
      }));

    let savedProduct: Product;

    if (existingIndex >= 0) {
      savedProduct = {
        ...list[existingIndex],
        ...product,
        updated_at: new Date().toISOString(),
      };
      list[existingIndex] = savedProduct;
    } else {
      const newId = product.id || `prod-${Date.now()}`;
      savedProduct = {
        id: newId,
        name: product.name,
        slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        team: product.team,
        league: product.league || 'Club Football',
        season: product.season || '2025/26',
        category_id: product.category_id || 'cat-1',
        category_name: product.category_name || 'Football Jerseys',
        description: product.description || 'Premium official grade football jersey.',
        details: product.details || ['Official matchday spec', '100% Breathable fabric'],
        features: product.features || ['AEROREADY moisture-wicking', 'Silicone crest'],
        price: Number(product.price),
        discount_price: product.discount_price ? Number(product.discount_price) : undefined,
        original_price: product.original_price ? Number(product.original_price) : undefined,
        sku: product.sku || `RAY-${Date.now().toString().slice(-4)}`,
        product_type: product.product_type || 'jersey',
        jersey_version: product.jersey_version || 'fan',
        kit_type: product.kit_type || 'home',
        is_featured: Boolean(product.is_featured),
        is_new_arrival: product.is_new_arrival !== undefined ? Boolean(product.is_new_arrival) : true,
        is_bestseller: Boolean(product.is_bestseller),
        is_published: product.is_published !== undefined ? Boolean(product.is_published) : true,
        images: product.images && product.images.length > 0 ? product.images : [
          'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85'
        ],
        variants: product.variants && product.variants.length > 0 ? product.variants : defaultVariants(['S', 'M', 'L', 'XL', 'XXL', '3XL']),
        specifications: product.specifications || { 'Material': '100% Recycled Polyester', 'Fit': 'Standard' },
        size_guide: product.size_guide || {
          'S': { chest: '36-38 in', length: '27 in' },
          'M': { chest: '38-40 in', length: '28 in' },
          'L': { chest: '40-42 in', length: '29 in' },
          'XL': { chest: '42-44 in', length: '30 in' },
          'XXL': { chest: '44-46 in', length: '31 in' }
        },
        rating: 5.0,
        rating_avg: 5.0,
        review_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      list.unshift(savedProduct);
    }

    setStored(STORAGE_KEYS.PRODUCTS, list);
    await db.logActivity('Admin User', 'admin', existingIndex >= 0 ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', `Product ${savedProduct.name} saved.`, 'products', savedProduct.id);
    return savedProduct;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return db.saveProduct({
      name: product.name || 'New Football Jersey',
      price: product.price || 1650,
      team: product.team || 'Football Club',
      ...product
    });
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const list = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const index = list.findIndex(p => p.id === productId);
    if (index < 0) return null;

    const updated = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    list[index] = updated;
    setStored(STORAGE_KEYS.PRODUCTS, list);
    return updated;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    let list = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const target = list.find(p => p.id === productId);
    list = list.filter(p => p.id !== productId);
    setStored(STORAGE_KEYS.PRODUCTS, list);
    if (target) {
      await db.logActivity('Admin User', 'admin', 'DELETE_PRODUCT', `Product ${target.name} deleted.`, 'products', productId);
    }
    return true;
  },

  async updateStock(productId: string, size: JerseySize, newStock: number): Promise<boolean> {
    const list = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const product = list.find(p => p.id === productId);
    if (!product) return false;

    const variant = product.variants.find(v => v.size === size);
    if (variant) {
      variant.stock_quantity = Math.max(0, newStock);
    } else {
      product.variants.push({
        id: `v-${Date.now()}-${size}`,
        product_id: productId,
        size,
        stock_quantity: Math.max(0, newStock),
        sku: `${product.sku || 'RAY'}-${size}`
      });
    }

    setStored(STORAGE_KEYS.PRODUCTS, list);
    return true;
  },

  async updateVariantStock(productId: string, size: JerseySize, newStock: number): Promise<boolean> {
    return db.updateStock(productId, size, newStock);
  },

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Category[];
      } catch (e) {
        console.warn('Supabase categories error:', e);
      }
    }
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  async saveCategory(cat: Partial<Category> & { name: string }): Promise<Category> {
    const list = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const existingIndex = list.findIndex(c => c.id === cat.id);

    let saved: Category;
    if (existingIndex >= 0) {
      saved = { ...list[existingIndex], ...cat };
      list[existingIndex] = saved;
    } else {
      saved = {
        id: `cat-${Date.now()}`,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image_url: cat.image_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        description: cat.description || '',
        is_featured: Boolean(cat.is_featured),
        is_active: true,
        display_order: cat.display_order || list.length + 1,
        product_count: 0,
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }

    setStored(STORAGE_KEYS.CATEGORIES, list);
    return saved;
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    return db.saveCategory({
      name: cat.name || 'New Category',
      ...cat
    });
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const list = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const index = list.findIndex(c => c.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...updates };
    setStored(STORAGE_KEYS.CATEGORIES, list);
    return list[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    let list = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    list = list.filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, list);
    return true;
  },

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------
  async getOrders(userId?: string): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
        if (userId) query = query.eq('customer_id', userId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Order[];
      } catch (e) {
        console.warn('Supabase getOrders error:', e);
      }
    }
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    if (userId) {
      return orders.filter(o => o.user_id === userId || o.customer_id === userId);
    }
    return orders;
  },

  async getOrderById(idOrNumber: string): Promise<Order | null> {
    const list = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    return list.find(o => o.id === idOrNumber || o.order_number.toLowerCase() === idOrNumber.toLowerCase()) || null;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return db.getOrderById(orderNumber);
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const settings = await db.getStoreSettings();
    const prefix = settings.order_prefix || 'RAY';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `${prefix}-${dateStr}-${randNum}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      user_id: orderData.user_id || null,
      customer_id: orderData.customer_id || orderData.user_id || null,
      customer_name: orderData.customer_name || 'Customer',
      customer_email: orderData.customer_email || 'customer@rayven.com',
      customer_phone: orderData.customer_phone || '01700000000',
      shipping_address: orderData.shipping_address || {
        full_name: orderData.customer_name || 'Customer',
        phone: orderData.customer_phone || '01700000000',
        address_line1: orderData.delivery_address || 'Dhaka, Bangladesh',
        district: 'Dhaka'
      },
      delivery_address: orderData.delivery_address || orderData.shipping_address?.address_line1 || 'Dhaka',
      delivery_zone: orderData.delivery_zone || 'inside_dhaka',
      district: orderData.shipping_address?.district || 'Dhaka',
      delivery_charge: orderData.delivery_charge ?? 60,
      discount_amount: orderData.discount_amount ?? 0,
      coupon_code: orderData.coupon_code,
      subtotal: orderData.subtotal ?? 0,
      grand_total: orderData.total_amount ?? orderData.grand_total ?? 0,
      total_amount: orderData.total_amount ?? orderData.grand_total ?? 0,
      status: orderData.status || 'pending',
      order_status: orderData.status || 'pending',
      payment_status: orderData.payment_status || 'pending',
      payment_method: orderData.payment_method || 'cod',
      notes: orderData.notes,
      items: orderData.items || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Reduce inventory in products store
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    for (const item of newOrder.items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        const variant = product.variants.find(v => v.size === item.size);
        if (variant) {
          variant.stock_quantity = Math.max(0, variant.stock_quantity - item.quantity);
        }
      }
    }
    setStored(STORAGE_KEYS.PRODUCTS, products);

    // Save order
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);

    // Coupon increment if used
    if (newOrder.coupon_code) {
      const coupons = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
      const coupon = coupons.find(c => c.code.toUpperCase() === newOrder.coupon_code?.toUpperCase());
      if (coupon) {
        coupon.used_count += 1;
        setStored(STORAGE_KEYS.COUPONS, coupons);
      }
    }

    await db.logActivity(newOrder.customer_name, 'customer', 'CREATE_ORDER', `New Order ${newOrder.order_number} placed for ৳${newOrder.total_amount}`, 'orders', newOrder.id);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, adminNotes?: string): Promise<Order | null> {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = status;
    order.order_status = status;
    if (adminNotes !== undefined) order.admin_notes = adminNotes;
    order.updated_at = new Date().toISOString();
    setStored(STORAGE_KEYS.ORDERS, orders);

    await db.logActivity('Admin User', 'admin', 'UPDATE_ORDER_STATUS', `Order ${order.order_number} status updated to ${status.toUpperCase()}`, 'orders', order.id);
    return order;
  },

  async updateOrderTracking(orderId: string, trackingNumber: string, courierPartner?: string): Promise<Order | null> {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.tracking_number = trackingNumber;
    if (courierPartner) order.courier_partner = courierPartner;
    order.status = 'shipped';
    order.order_status = 'shipped';
    order.updated_at = new Date().toISOString();
    setStored(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<boolean> {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    order.payment_status = status;
    order.updated_at = new Date().toISOString();
    setStored(STORAGE_KEYS.ORDERS, orders);
    return true;
  },

  // ----------------------------------------------------
  // COUPONS
  // ----------------------------------------------------
  async getCoupons(): Promise<Coupon[]> {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
  },

  async validateCoupon(code: string, cartSubtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
    const coupons = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    const minAmount = coupon.min_order_value ?? coupon.min_order_amount ?? 0;
    if (cartSubtotal < minAmount) {
      return { 
        valid: false, 
        discount: 0, 
        message: `Minimum order amount of ৳${minAmount.toLocaleString()} required for this coupon.` 
      };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((cartSubtotal * coupon.discount_value) / 100);
      const maxCap = coupon.max_discount ?? coupon.max_discount_amount;
      if (maxCap && discount > maxCap) {
        discount = maxCap;
      }
    } else {
      discount = coupon.discount_value;
    }

    return {
      valid: true,
      discount: Math.min(discount, cartSubtotal),
      message: `Coupon applied successfully! You saved ৳${discount.toLocaleString()}`,
      coupon
    };
  },

  async saveCoupon(couponData: Partial<Coupon> & { code: string; discount_value: number }): Promise<Coupon> {
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
    const existingIndex = list.findIndex(c => c.id === couponData.id || c.code.toUpperCase() === couponData.code.toUpperCase());

    let saved: Coupon;
    if (existingIndex >= 0) {
      saved = { ...list[existingIndex], ...couponData, code: couponData.code.toUpperCase() };
      list[existingIndex] = saved;
    } else {
      saved = {
        id: `c-${Date.now()}`,
        code: couponData.code.toUpperCase(),
        discount_type: couponData.discount_type || 'percentage',
        discount_value: Number(couponData.discount_value),
        min_order_value: Number(couponData.min_order_value || couponData.min_order_amount || 0),
        min_order_amount: Number(couponData.min_order_value || couponData.min_order_amount || 0),
        max_discount: couponData.max_discount || couponData.max_discount_amount,
        max_discount_amount: couponData.max_discount || couponData.max_discount_amount,
        start_date: couponData.start_date || new Date().toISOString(),
        expiry_date: couponData.expiry_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
        usage_limit: Number(couponData.usage_limit || 100),
        used_count: 0,
        is_active: couponData.is_active !== undefined ? Boolean(couponData.is_active) : true,
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }
    setStored(STORAGE_KEYS.COUPONS, list);
    return saved;
  },

  async createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
    return db.saveCoupon({
      code: couponData.code || 'PROMO',
      discount_value: couponData.discount_value || 10,
      ...couponData
    });
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
    const index = list.findIndex(c => c.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...updates };
    setStored(STORAGE_KEYS.COUPONS, list);
    return list[index];
  },

  async deleteCoupon(id: string): Promise<boolean> {
    let list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
    list = list.filter(c => c.id !== id);
    setStored(STORAGE_KEYS.COUPONS, list);
    return true;
  },

  // ----------------------------------------------------
  // REVIEWS
  // ----------------------------------------------------
  async getReviews(productId?: string): Promise<ProductReview[]> {
    const list = getStored<ProductReview[]>(STORAGE_KEYS.REVIEWS, [
      {
        id: 'rev-1',
        product_id: 'prod-1',
        user_name: 'Mahmudul Hasan',
        rating: 5,
        comment: '100% Master Grade Player version! The HEAT.RDY fabric feels exceptionally breathable for Bangladesh hot weather. Size L fits perfectly.',
        is_verified_purchase: true,
        is_approved: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      },
      {
        id: 'rev-2',
        product_id: 'prod-1',
        user_name: 'Rakibul Islam',
        rating: 5,
        comment: 'Fast delivery in Dhaka within 24 hours! Silicone badge and Bellingham print quality is spot-on.',
        is_verified_purchase: true,
        is_approved: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      },
      {
        id: 'rev-3',
        product_id: 'prod-3',
        user_name: 'Shakib Chowdhury',
        rating: 5,
        comment: 'The 3-star Gold patch Argentina jersey is a masterpiece. Wearing it for our weekly turf match.',
        is_verified_purchase: true,
        is_approved: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
      },
      {
        id: 'rev-4',
        product_id: 'prod-5',
        user_name: 'Imtiaz Ahmed',
        rating: 5,
        comment: 'Zidane 1998 retro kit material is heavyweight and authentic flock numbering. Highly recommended RAYVEN!',
        is_verified_purchase: true,
        is_approved: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
      }
    ]);

    if (productId) {
      return list.filter(r => r.product_id === productId && r.is_approved);
    }
    return list;
  },

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return db.getReviews(productId);
  },

  async addReview(review: Omit<ProductReview, 'id' | 'created_at' | 'is_approved'>): Promise<ProductReview> {
    const list = await db.getReviews();
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      is_approved: true,
      created_at: new Date().toISOString()
    };
    list.unshift(newReview);
    setStored(STORAGE_KEYS.REVIEWS, list);
    return newReview;
  },

  async createProductReview(review: Partial<ProductReview>): Promise<ProductReview> {
    return db.addReview({
      product_id: review.product_id || '',
      user_name: review.user_name || 'Football Fan',
      rating: review.rating || 5,
      comment: review.comment || 'Great quality jersey!'
    });
  },

  // ----------------------------------------------------
  // STORE SETTINGS & BANNERS
  // ----------------------------------------------------
  async getStoreSettings(): Promise<StoreSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
        if (!error && data) {
          const merged = { ...initialStoreSettings, ...data };
          setStored(STORAGE_KEYS.SETTINGS, merged);
          return merged as StoreSettings;
        }
      } catch (e) {
        console.warn('Supabase store_settings fallback to local:', e);
      }
    }
    return getStored<StoreSettings>(STORAGE_KEYS.SETTINGS, initialStoreSettings);
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await db.getStoreSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    setStored(STORAGE_KEYS.SETTINGS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('store_settings').upsert({
          id: current.id || 'store-settings-1',
          ...updated,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Supabase store_settings update fallback:', e);
      }
    }

    await db.logActivity('Admin User', 'admin', 'UPDATE_SETTINGS', 'Store, CMS, and delivery settings updated.', 'settings');
    return updated;
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    return db.updateStoreSettings(settings);
  },

  async getBanners(): Promise<Banner[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('banners').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          setStored(STORAGE_KEYS.BANNERS, data);
          return data as Banner[];
        }
      } catch (e) {
        console.warn('Supabase banners query fallback:', e);
      }
    }
    return getStored<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
  },

  async saveBanner(banner: Partial<Banner> & { title: string; image_url: string }): Promise<Banner> {
    const list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    const existingIndex = list.findIndex(b => b.id === banner.id);
    let saved: Banner;
    if (existingIndex >= 0) {
      saved = { ...list[existingIndex], ...banner };
      list[existingIndex] = saved;
    } else {
      saved = {
        id: banner.id || `b-${Date.now()}`,
        title: banner.title,
        subtitle: banner.subtitle || '',
        tag: banner.tag || 'NEW DROP',
        badge_text: banner.tag || banner.badge_text || 'NEW DROP',
        button_text: banner.button_text || 'SHOP NOW',
        cta_text: banner.button_text || banner.cta_text || 'SHOP NOW',
        link_url: banner.link_url || '/shop',
        cta_link: banner.link_url || banner.cta_link || '/shop',
        image_url: banner.image_url,
        position: banner.position || 'home_hero',
        display_order: banner.display_order || list.length + 1,
        sort_order: banner.display_order || list.length + 1,
        is_active: banner.is_active !== undefined ? Boolean(banner.is_active) : true,
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }
    setStored(STORAGE_KEYS.BANNERS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('banners').upsert(saved);
      } catch (e) {
        console.warn('Supabase banners upsert fallback:', e);
      }
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_BANNER', `Banner "${saved.title}" saved.`, 'banners', saved.id);
    return saved;
  },

  async createBanner(banner: Partial<Banner>): Promise<Banner> {
    return db.saveBanner({
      title: banner.title || 'Special Matchday Feature',
      image_url: banner.image_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=85',
      ...banner
    });
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    const list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    const index = list.findIndex(b => b.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...updates };
    setStored(STORAGE_KEYS.BANNERS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('banners').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase banner update error:', e);
      }
    }

    return list[index];
  },

  async deleteBanner(id: string): Promise<boolean> {
    let list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    list = list.filter(b => b.id !== id);
    setStored(STORAGE_KEYS.BANNERS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('banners').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase banner delete error:', e);
      }
    }

    await db.logActivity('Admin User', 'admin', 'DELETE_BANNER', `Banner ID ${id} deleted.`, 'banners', id);
    return true;
  },

  // ----------------------------------------------------
  // FAQ MANAGEMENT
  // ----------------------------------------------------
  async getFAQs(activeOnly = false): Promise<FAQItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let q = supabase.from('faq').select('*').order('display_order', { ascending: true });
        if (activeOnly) q = q.eq('is_active', true);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          setStored(STORAGE_KEYS.FAQS, data);
          return data as FAQItem[];
        }
      } catch (e) {
        console.warn('Supabase FAQ query fallback:', e);
      }
    }
    const list = getStored<FAQItem[]>(STORAGE_KEYS.FAQS, initialFAQs);
    if (activeOnly) return list.filter(f => f.is_active);
    return list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  },

  async saveFAQ(faq: Partial<FAQItem> & { question: string; answer: string }): Promise<FAQItem> {
    const list = getStored<FAQItem[]>(STORAGE_KEYS.FAQS, initialFAQs);
    const existingIndex = list.findIndex(f => f.id === faq.id);
    let saved: FAQItem;
    if (existingIndex >= 0) {
      saved = { ...list[existingIndex], ...faq };
      list[existingIndex] = saved;
    } else {
      saved = {
        id: faq.id || `faq-${Date.now()}`,
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order || list.length + 1,
        is_active: faq.is_active !== undefined ? Boolean(faq.is_active) : true,
        category: faq.category || 'General',
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }
    setStored(STORAGE_KEYS.FAQS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('faq').upsert(saved);
      } catch (e) {
        console.warn('Supabase FAQ upsert error:', e);
      }
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_FAQ', `FAQ "${saved.question.substring(0, 40)}..." saved.`, 'faq', saved.id);
    return saved;
  },

  async deleteFAQ(id: string): Promise<boolean> {
    let list = getStored<FAQItem[]>(STORAGE_KEYS.FAQS, initialFAQs);
    list = list.filter(f => f.id !== id);
    setStored(STORAGE_KEYS.FAQS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('faq').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase FAQ delete error:', e);
      }
    }

    await db.logActivity('Admin User', 'admin', 'DELETE_FAQ', `FAQ ID ${id} deleted.`, 'faq', id);
    return true;
  },

  // ----------------------------------------------------
  // CMS PAGES (About, Returns, Terms, Privacy, Shipping)
  // ----------------------------------------------------
  async getCMSPages(): Promise<CMSPage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('pages').select('*');
        if (!error && data && data.length > 0) {
          setStored(STORAGE_KEYS.PAGES, data);
          return data as CMSPage[];
        }
      } catch (e) {
        console.warn('Supabase pages query fallback:', e);
      }
    }
    return getStored<CMSPage[]>(STORAGE_KEYS.PAGES, initialCMSPages);
  },

  async getCMSPage(slug: string): Promise<CMSPage | null> {
    const list = await db.getCMSPages();
    return list.find(p => p.slug === slug) || null;
  },

  async saveCMSPage(page: Partial<CMSPage> & { slug: string; title: string; content: string }): Promise<CMSPage> {
    const list = getStored<CMSPage[]>(STORAGE_KEYS.PAGES, initialCMSPages);
    const existingIndex = list.findIndex(p => p.slug === page.slug || p.id === page.id);
    let saved: CMSPage;
    if (existingIndex >= 0) {
      saved = { ...list[existingIndex], ...page, updated_at: new Date().toISOString() };
      list[existingIndex] = saved;
    } else {
      saved = {
        id: page.id || `page-${page.slug}-${Date.now()}`,
        slug: page.slug,
        title: page.title,
        subtitle: page.subtitle || '',
        content: page.content,
        metadata: page.metadata || {},
        is_published: page.is_published !== undefined ? Boolean(page.is_published) : true,
        updated_at: new Date().toISOString()
      };
      list.push(saved);
    }
    setStored(STORAGE_KEYS.PAGES, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pages').upsert(saved);
      } catch (e) {
        console.warn('Supabase pages upsert error:', e);
      }
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_PAGE', `CMS Page "${saved.title}" (${saved.slug}) updated.`, 'pages', saved.id);
    return saved;
  },

  // ----------------------------------------------------
  // CONTACT MESSAGES (From Storefront Contact Form)
  // ----------------------------------------------------
  async getContactMessages(): Promise<ContactMessage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setStored(STORAGE_KEYS.MESSAGES, data);
          return data as ContactMessage[];
        }
      } catch (e) {
        console.warn('Supabase contact_messages fallback:', e);
      }
    }
    return getStored<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
  },

  async createContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'status'> & { status?: ContactMessage['status'] }): Promise<ContactMessage> {
    const list = getStored<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: msg.status || 'new',
      created_at: new Date().toISOString()
    };
    list.unshift(newMsg);
    setStored(STORAGE_KEYS.MESSAGES, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('contact_messages').insert(newMsg);
      } catch (e) {
        console.warn('Supabase contact message insert error:', e);
      }
    }

    await db.logActivity(newMsg.name, 'customer', 'CONTACT_SUBMIT', `Customer message received from ${newMsg.phone}`, 'messages', newMsg.id);
    return newMsg;
  },

  async updateContactMessageStatus(id: string, status: ContactMessage['status'], adminNotes?: string): Promise<ContactMessage | null> {
    const list = getStored<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    const index = list.findIndex(m => m.id === id);
    if (index < 0) return null;
    list[index].status = status;
    if (adminNotes !== undefined) list[index].admin_notes = adminNotes;
    setStored(STORAGE_KEYS.MESSAGES, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('contact_messages').update({ status, admin_notes: adminNotes }).eq('id', id);
      } catch (e) {
        console.warn('Supabase message update error:', e);
      }
    }

    await db.logActivity('Admin User', 'admin', 'UPDATE_MESSAGE_STATUS', `Message ${id} marked as ${status}`, 'messages', id);
    return list[index];
  },

  async deleteContactMessage(id: string): Promise<boolean> {
    let list = getStored<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    list = list.filter(m => m.id !== id);
    setStored(STORAGE_KEYS.MESSAGES, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('contact_messages').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase message delete error:', e);
      }
    }

    return true;
  },

  // ----------------------------------------------------
  // NEWSLETTER SUBSCRIBERS
  // ----------------------------------------------------
  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setStored(STORAGE_KEYS.SUBSCRIBERS, data);
          return data as NewsletterSubscriber[];
        }
      } catch (e) {
        console.warn('Supabase subscribers fallback:', e);
      }
    }
    return getStored<NewsletterSubscriber[]>(STORAGE_KEYS.SUBSCRIBERS, initialSubscribers);
  },

  async addNewsletterSubscriber(email: string): Promise<{ success: boolean; message: string; subscriber?: NewsletterSubscriber }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const list = getStored<NewsletterSubscriber[]>(STORAGE_KEYS.SUBSCRIBERS, initialSubscribers);
    const existing = list.find(s => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: true, message: 'You are already subscribed! Check your inbox for exclusive kit drop alerts.', subscriber: existing };
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      status: 'active',
      created_at: new Date().toISOString()
    };
    list.unshift(newSub);
    setStored(STORAGE_KEYS.SUBSCRIBERS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('newsletter_subscribers').insert(newSub);
      } catch (e) {
        console.warn('Supabase subscriber insert error:', e);
      }
    }

    await db.logActivity(cleanEmail, 'customer', 'NEWSLETTER_SUBSCRIBE', `New subscriber joined squad: ${cleanEmail}`, 'newsletter', newSub.id);
    return { success: true, message: 'Welcome to the RAYVEN squad! Use code RAYVEN10 for 10% off your next kit.', subscriber: newSub };
  },

  async deleteSubscriber(id: string): Promise<boolean> {
    let list = getStored<NewsletterSubscriber[]>(STORAGE_KEYS.SUBSCRIBERS, initialSubscribers);
    list = list.filter(s => s.id !== id && s.email !== id);
    setStored(STORAGE_KEYS.SUBSCRIBERS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('newsletter_subscribers').delete().or(`id.eq.${id},email.eq.${id}`);
      } catch (e) {
        console.warn('Supabase subscriber delete error:', e);
      }
    }

    return true;
  },

  async deleteNewsletterSubscriber(idOrEmail: string): Promise<boolean> {
    return db.deleteSubscriber(idOrEmail);
  },

  // ----------------------------------------------------
  // ACTIVITY LOGS
  // ----------------------------------------------------
  async getLogs(): Promise<ActivityLog[]> {
    return getStored<ActivityLog[]>(STORAGE_KEYS.LOGS, [
      {
        id: 'log-1',
        actor_name: 'Admin User',
        actor_role: 'super_admin',
        action: 'STORE_INITIALIZED',
        details: 'RAYVEN Football Sportswear database initialized with 2026/27 kits.',
        target_entity: 'system',
        created_at: new Date().toISOString()
      }
    ]);
  },

  async logActivity(actor_name: string, actor_role: string, action: string, details: string, target_entity: string, target_id?: string): Promise<void> {
    const logs = await db.getLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      actor_name,
      actor_role,
      action,
      details,
      target_entity,
      target_id,
      created_at: new Date().toISOString()
    });
    setStored(STORAGE_KEYS.LOGS, logs.slice(0, 100));
  },

  // ----------------------------------------------------
  // USER PROFILES & AUTH STATE HELPER
  // ----------------------------------------------------
  getCurrentUser(): UserProfile | null {
    return getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: UserProfile | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  }
};
