import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Product, ProductVariant, Category, Order, UserProfile, Banner, Coupon, StoreSettings, 
  ProductReview, CustomerAddress, ActivityLog, JerseySize, OrderStatus, PaymentStatus,
  FAQItem, CMSPage, ContactMessage, NewsletterSubscriber 
} from '../types';
import { 
  initialProducts, initialCategories, initialBanners, initialCoupons, 
  initialStoreSettings, initialOrders,
  initialFAQs, initialCMSPages, initialContactMessages, initialSubscribers 
} from './initialData';

// Local storage key ONLY for guest user cart / local UI session preferences
const STORAGE_KEYS = {
  CURRENT_USER: 'rayven_current_user_v1',
};

/**
 * UUID Helpers
 */
export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Checks if a Supabase error is caused by a missing table or outdated schema cache
 */
export function isSchemaOrTableMissing(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || '').toLowerCase();
  const code = String(error.code || '');
  return (
    code === 'PGRST205' || // Could not find the table in schema cache
    code === '42P01' ||    // relation does not exist
    code === 'PGRST204' || // column not found
    code === 'PGRST116' || // no rows returned
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    (msg.includes('relation') && msg.includes('does not exist')) ||
    msg.includes('does not exist')
  );
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes a raw product row from Supabase into our frontend Product interface
 */
export function formatProductFromDb(p: any): Product {
  const images = Array.isArray(p.images)
    ? p.images
    : typeof p.images === 'string'
      ? (p.images.startsWith('[') ? JSON.parse(p.images) : [p.images])
      : [];
  
  const details = Array.isArray(p.details)
    ? p.details
    : typeof p.details === 'string'
      ? (p.details.startsWith('[') ? JSON.parse(p.details) : [p.details])
      : [];

  const specifications = (p.specifications && typeof p.specifications === 'object')
    ? p.specifications
    : typeof p.specifications === 'string'
      ? (p.specifications.startsWith('{') ? JSON.parse(p.specifications) : {})
      : {};

  const size_guide = (p.size_guide && typeof p.size_guide === 'object')
    ? p.size_guide
    : typeof p.size_guide === 'string'
      ? (p.size_guide.startsWith('{') ? JSON.parse(p.size_guide) : {})
      : {};

  const rawVariants = Array.isArray(p.variants) ? p.variants : [];
  const variants: ProductVariant[] = rawVariants.map((v: any) => ({
    id: v.id,
    product_id: v.product_id || p.id,
    size: v.size as JerseySize,
    stock_quantity: Number(v.stock_quantity) || 0,
    sku: v.sku || `${p.sku || 'RAY'}-${v.size}`,
    price_adjustment: Number(v.price_adjustment) || 0,
  }));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    team: p.team || '',
    league: p.league || 'Club Football',
    season: p.season || '2025/26',
    category_id: p.category_id || '',
    category_name: p.category?.name || p.category_name || '',
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug
    } : undefined,
    description: p.description || '',
    details,
    features: details,
    price: Number(p.price) || 0,
    discount_price: p.discount_price !== null && p.discount_price !== undefined ? Number(p.discount_price) : undefined,
    original_price: p.discount_price ? Number(p.price) : undefined,
    sku: p.sku || `RAY-${p.id?.slice(0, 6)}`,
    product_type: p.product_type || 'jersey',
    jersey_version: p.jersey_version || 'fan',
    kit_type: p.kit_type || 'home',
    is_featured: Boolean(p.is_featured),
    is_new_arrival: Boolean(p.is_new_arrival),
    is_bestseller: Boolean(p.is_bestseller),
    is_published: p.is_published !== undefined ? Boolean(p.is_published) : true,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85'],
    variants,
    specifications,
    size_guide,
    rating: Number(p.rating_avg) || 5.0,
    rating_avg: Number(p.rating_avg) || 5.0,
    review_count: Number(p.review_count) || 0,
    meta_title: p.meta_title || '',
    meta_description: p.meta_description || '',
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString(),
  };
}

export const db = {
  // ----------------------------------------------------
  // PRODUCTS (SUPABASE AS SINGLE SOURCE OF TRUTH)
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
    sortBy?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'price_high' | 'price_low' | 'rating';
    inStockOnly?: boolean;
    inStock?: boolean;
    limit?: number;
    includeUnpublished?: boolean;
  }): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured. Returning empty product list.');
      return [];
    }

    try {
      let query = supabase
        .from('products')
        .select(`*, variants:product_variants(*), category:categories(*)`);

      if (!params?.includeUnpublished) {
        query = query.eq('is_published', true);
      }
      if (params?.featured !== undefined) {
        query = query.eq('is_featured', params.featured);
      }
      if (params?.newArrival !== undefined) {
        query = query.eq('is_new_arrival', params.newArrival);
      }
      if (params?.bestseller !== undefined) {
        query = query.eq('is_bestseller', params.bestseller);
      }
      if (params?.version) {
        query = query.eq('jersey_version', params.version);
      }
      if (params?.type) {
        query = query.eq('product_type', params.type);
      }
      if (params?.team) {
        query = query.ilike('team', `%${params.team}%`);
      }
      if (params?.season) {
        query = query.eq('season', params.season);
      }
      if (params?.search) {
        const q = params.search.trim();
        query = query.or(`name.ilike.%${q}%,team.ilike.%${q}%,sku.ilike.%${q}%`);
      }

      // Sorting
      if (params?.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (params?.sortBy === 'price_asc' || params?.sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (params?.sortBy === 'price_desc' || params?.sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (params?.sortBy === 'rating') {
        query = query.order('rating_avg', { ascending: false });
      } else {
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getProducts notice:', error.message);
        }
        return initialProducts;
      }

      if (!data || data.length === 0) {
        return initialProducts;
      }

      let formatted = data.map(formatProductFromDb);

      if (params?.categorySlug) {
        formatted = formatted.filter(p => 
          p.category?.slug === params.categorySlug || 
          p.category_id === params.categorySlug
        );
      }
      if (params?.minPrice !== undefined) {
        formatted = formatted.filter(p => (p.discount_price ?? p.price) >= params.minPrice!);
      }
      if (params?.maxPrice !== undefined) {
        formatted = formatted.filter(p => (p.discount_price ?? p.price) <= params.maxPrice!);
      }
      if (params?.size) {
        formatted = formatted.filter(p => p.variants?.some(v => v.size === params.size && v.stock_quantity > 0));
      }
      if (params?.inStockOnly || params?.inStock) {
        formatted = formatted.filter(p => p.variants?.some(v => v.stock_quantity > 0));
      }

      return formatted;
    } catch (err: any) {
      return initialProducts;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured || !supabase) {
      return initialProducts.find(p => p.slug === slug || p.id === slug) || null;
    }

    try {
      let query = supabase
        .from('products')
        .select(`*, variants:product_variants(*), category:categories(*)`);

      if (isValidUuid(slug)) {
        query = query.or(`slug.eq.${slug},id.eq.${slug}`);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.maybeSingle();
      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getProductBySlug notice:', error.message);
        }
        return initialProducts.find(p => p.slug === slug || p.id === slug) || null;
      }

      if (!data) {
        return initialProducts.find(p => p.slug === slug || p.id === slug) || null;
      }
      return formatProductFromDb(data);
    } catch (e) {
      return initialProducts.find(p => p.slug === slug || p.id === slug) || null;
    }
  },

  async saveProduct(product: Partial<Product> & { name: string; price: number; team: string }): Promise<Product> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase database is not configured. Please check your credentials.');
    }

    const productId = isValidUuid(product.id) ? product.id! : generateUuid();
    const slug = product.slug || generateSlug(product.name);
    const categoryId = isValidUuid(product.category_id) ? product.category_id : null;

    // Database columns matching public.products table exactly
    const dbPayload = {
      id: productId,
      name: product.name,
      slug,
      team: product.team || '',
      season: product.season || '2026/27',
      category_id: categoryId,
      description: product.description || '',
      details: Array.isArray(product.details) ? product.details : (Array.isArray(product.features) ? product.features : ['100% Master Grade Quality', 'Official Matchday Fit']),
      price: Number(product.price) || 0,
      discount_price: product.discount_price !== undefined && product.discount_price !== null ? Number(product.discount_price) : null,
      sku: product.sku || `RAY-${Date.now().toString().slice(-6)}`,
      product_type: (['jersey', 'training', 'jacket', 'shorts', 'accessory'].includes(product.product_type || '') ? product.product_type : 'jersey'),
      jersey_version: (['fan', 'player', 'retro', 'goalkeeper'].includes(product.jersey_version || '') ? product.jersey_version : 'fan'),
      is_featured: Boolean(product.is_featured),
      is_new_arrival: product.is_new_arrival !== undefined ? Boolean(product.is_new_arrival) : true,
      is_bestseller: Boolean(product.is_bestseller),
      is_published: product.is_published !== undefined ? Boolean(product.is_published) : true,
      images: Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85'],
      specifications: (product.specifications && typeof product.specifications === 'object') ? product.specifications : { 'Material': '100% Recycled Polyester HEAT.RDY', 'Fit': 'Athlete Fit' },
      size_guide: (product.size_guide && typeof product.size_guide === 'object') ? product.size_guide : {
        'S': { chest: '36-38 in', length: '27 in' },
        'M': { chest: '38-40 in', length: '28 in' },
        'L': { chest: '40-42 in', length: '29 in' },
        'XL': { chest: '42-44 in', length: '30 in' },
        'XXL': { chest: '44-46 in', length: '31 in' }
      },
      rating_avg: Number(product.rating_avg || product.rating) || 5.0,
      review_count: Number(product.review_count) || 0,
      updated_at: new Date().toISOString(),
    };

    console.log('[CRUD DEBUG] product payload:', dbPayload);

    // 1. Upsert Product Row into Supabase
    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .upsert(dbPayload, { onConflict: 'id' })
      .select('*');

    console.log('[CRUD DEBUG] result data:', prodData);
    console.log('[CRUD DEBUG] result error:', prodErr);

    if (prodErr) {
      console.error('[CRUD DEBUG] error.code:', prodErr.code);
      console.error('[CRUD DEBUG] error.message:', prodErr.message);
      console.error('[CRUD DEBUG] error.details:', prodErr.details);
      console.error('[CRUD DEBUG] error.hint:', prodErr.hint);
      throw new Error(`Failed to save product in Supabase: ${prodErr.message}`);
    }

    // 2. Upsert Variants into product_variants
    const standardSizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const rawVariants = (product.variants && product.variants.length > 0)
      ? product.variants
      : standardSizes.map(sz => ({
          id: generateUuid(),
          product_id: productId,
          size: sz,
          stock_quantity: 15,
          sku: `${dbPayload.sku}-${sz}`,
          price_adjustment: 0
        }));

    const variantRows = rawVariants.map(v => ({
      id: isValidUuid(v.id) ? v.id : generateUuid(),
      product_id: productId,
      size: (standardSizes.includes(v.size as JerseySize) ? v.size : 'M') as JerseySize,
      stock_quantity: Math.max(0, Math.round(Number(v.stock_quantity) || 0)),
      sku: v.sku || `${dbPayload.sku}-${v.size}`,
      price_adjustment: Number(v.price_adjustment) || 0
    }));

    const { data: varData, error: varErr } = await supabase
      .from('product_variants')
      .upsert(variantRows, { onConflict: 'product_id,size' })
      .select('*');

    if (varErr) {
      console.warn('[CRUD DEBUG] product_variants upsert warning:', varErr.message);
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_PRODUCT', `Product "${dbPayload.name}" saved in Supabase.`, 'products', productId);

    // Fetch and return true single-source-of-truth product from Supabase
    const fresh = await db.getProductBySlug(productId);
    if (fresh) return fresh;

    const freshBySlug = await db.getProductBySlug(slug);
    if (freshBySlug) return freshBySlug;

    return formatProductFromDb({ ...dbPayload, variants: variantRows });
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
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase database is not configured.');
    }

    const current = await db.getProductBySlug(productId);
    const merged = {
      ...(current || {}),
      ...updates,
      id: productId,
      name: updates.name || current?.name || 'Football Jersey',
      price: updates.price !== undefined ? Number(updates.price) : (current?.price || 1650),
      team: updates.team || current?.team || 'Club',
    };

    return db.saveProduct(merged);
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    console.log('[CRUD DEBUG] deleteProduct target ID:', productId);

    // Delete variants first
    const { error: varDelErr } = await supabase.from('product_variants').delete().eq('product_id', productId);
    if (varDelErr) {
      console.warn('[CRUD DEBUG] delete variants error:', varDelErr);
    }
    
    // Delete product
    const { data: delData, error: delErr } = await supabase.from('products').delete().eq('id', productId).select('*');
    console.log('[CRUD DEBUG] delete product result data:', delData);
    console.log('[CRUD DEBUG] delete product result error:', delErr);

    if (delErr) {
      console.error('[CRUD DEBUG] delete error.code:', delErr.code);
      console.error('[CRUD DEBUG] delete error.message:', delErr.message);
      console.error('[CRUD DEBUG] delete error.details:', delErr.details);
      console.error('[CRUD DEBUG] delete error.hint:', delErr.hint);
      throw new Error(`Failed to delete product from Supabase: ${delErr.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'DELETE_PRODUCT', `Product ID ${productId} deleted from Supabase.`, 'products', productId);
    return true;
  },

  async updateStock(productId: string, size: JerseySize, newStock: number): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const qty = Math.max(0, Math.round(newStock));
    const { error } = await supabase
      .from('product_variants')
      .update({ stock_quantity: qty })
      .eq('product_id', productId)
      .eq('size', size);

    if (error) {
      // If variant row does not exist yet, upsert it
      await supabase.from('product_variants').upsert({
        id: generateUuid(),
        product_id: productId,
        size,
        stock_quantity: qty,
        sku: `RAY-${size}`
      }, { onConflict: 'product_id,size' });
    }

    return true;
  },

  async updateVariantStock(productId: string, size: JerseySize, newStock: number): Promise<boolean> {
    return db.updateStock(productId, size, newStock);
  },

  // ----------------------------------------------------
  // CATEGORIES (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured || !supabase) return initialCategories;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getCategories notice:', error.message);
        }
        return initialCategories;
      }
      return (data && data.length > 0) ? (data as Category[]) : initialCategories;
    } catch (e) {
      return initialCategories;
    }
  },

  async saveCategory(cat: Partial<Category> & { name: string }): Promise<Category> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const catId = isValidUuid(cat.id) ? cat.id! : generateUuid();
    const slug = cat.slug || generateSlug(cat.name);
    const row = {
      id: catId,
      name: cat.name,
      slug,
      image_url: cat.image_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      description: cat.description || '',
      is_featured: Boolean(cat.is_featured),
      display_order: Number(cat.display_order) || 0,
      created_at: cat.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('categories')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Supabase saveCategory error:', error);
      throw new Error(`Failed to save category to Supabase: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_CATEGORY', `Category "${row.name}" saved in Supabase.`, 'categories', catId);
    return data as Category;
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    return db.saveCategory({
      name: cat.name || 'New Club Category',
      ...cat
    });
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const cats = await db.getCategories();
    const current = cats.find(c => c.id === id);
    if (!current) throw new Error(`Category ${id} not found.`);
    return db.saveCategory({ ...current, ...updates, id });
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteCategory error:', error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'DELETE_CATEGORY', `Category ID ${id} deleted from Supabase.`, 'categories', id);
    return true;
  },

  // ----------------------------------------------------
  // STORE SETTINGS (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getStoreSettings(): Promise<StoreSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return {
            ...initialStoreSettings,
            ...data
          } as StoreSettings;
        }

        // If settings table is currently empty in Supabase, auto-seed the initial store settings
        if (!error && !data) {
          const defaultId = generateUuid();
          const toInsert = {
            id: defaultId,
            store_name: initialStoreSettings.store_name,
            store_tagline: initialStoreSettings.store_tagline,
            logo_url: initialStoreSettings.logo_url,
            phone: initialStoreSettings.phone,
            email: initialStoreSettings.email,
            announcement_bar: initialStoreSettings.announcement_bar,
            inside_dhaka_delivery_fee: initialStoreSettings.inside_dhaka_delivery_fee,
            outside_dhaka_delivery_fee: initialStoreSettings.outside_dhaka_delivery_fee,
            free_shipping_threshold: initialStoreSettings.free_shipping_threshold,
            currency_symbol: initialStoreSettings.currency_symbol,
            order_prefix: initialStoreSettings.order_prefix,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          const { data: inserted } = await supabase
            .from('store_settings')
            .insert(toInsert)
            .select()
            .single();

          if (inserted) return { ...initialStoreSettings, ...inserted } as StoreSettings;
        }
      } catch (e) {
        // Fall back to initial settings
      }
    }
    return initialStoreSettings;
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const current = await db.getStoreSettings();
    const id = isValidUuid(current.id) ? current.id : generateUuid();

    // Clean payload containing ONLY columns in public.store_settings
    const dbPayload = {
      id,
      store_name: settings.store_name !== undefined ? settings.store_name : current.store_name,
      store_tagline: settings.store_tagline !== undefined ? settings.store_tagline : current.store_tagline,
      logo_url: settings.logo_url !== undefined ? settings.logo_url : current.logo_url,
      phone: settings.phone !== undefined ? settings.phone : (settings.support_phone !== undefined ? settings.support_phone : current.phone),
      email: settings.email !== undefined ? settings.email : (settings.support_email !== undefined ? settings.support_email : current.email),
      announcement_bar: settings.announcement_bar !== undefined ? settings.announcement_bar : current.announcement_bar,
      inside_dhaka_delivery_fee: Number(settings.inside_dhaka_delivery_fee !== undefined ? settings.inside_dhaka_delivery_fee : current.inside_dhaka_delivery_fee) || 70,
      outside_dhaka_delivery_fee: Number(settings.outside_dhaka_delivery_fee !== undefined ? settings.outside_dhaka_delivery_fee : current.outside_dhaka_delivery_fee) || 130,
      free_shipping_threshold: Number(settings.free_shipping_threshold !== undefined ? settings.free_shipping_threshold : current.free_shipping_threshold) || 3000,
      currency_symbol: settings.currency_symbol !== undefined ? settings.currency_symbol : current.currency_symbol,
      order_prefix: settings.order_prefix !== undefined ? settings.order_prefix : current.order_prefix,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('store_settings')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateStoreSettings error:', error);
      throw new Error(`Failed to save store settings to Supabase: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'UPDATE_SETTINGS', 'Store branding, delivery fees, and CMS settings updated.', 'settings', id);
    
    return {
      ...current,
      ...settings,
      ...(data || dbPayload)
    } as StoreSettings;
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    return db.updateStoreSettings(settings);
  },

  // ----------------------------------------------------
  // BANNERS (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getBanners(): Promise<Banner[]> {
    if (!isSupabaseConfigured || !supabase) return initialBanners;

    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getBanners notice:', error.message);
        }
        return initialBanners;
      }
      return (data && data.length > 0) ? (data as Banner[]) : initialBanners;
    } catch (e) {
      return initialBanners;
    }
  },

  async saveBanner(banner: Partial<Banner> & { title: string; image_url: string }): Promise<Banner> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const bannerId = isValidUuid(banner.id) ? banner.id! : generateUuid();
    const row = {
      id: bannerId,
      title: banner.title,
      subtitle: banner.subtitle || '',
      badge_text: banner.badge_text || banner.tag || 'NEW SEASON',
      cta_text: banner.cta_text || banner.button_text || 'SHOP NOW',
      cta_link: banner.cta_link || banner.link_url || '/shop',
      image_url: banner.image_url,
      display_order: Number(banner.display_order ?? banner.sort_order) || 0,
      is_active: banner.is_active !== undefined ? Boolean(banner.is_active) : true,
      created_at: banner.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('banners')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Supabase saveBanner error:', error);
      throw new Error(`Failed to save banner: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_BANNER', `Banner "${row.title}" saved in Supabase.`, 'banners', bannerId);
    return data as Banner;
  },

  async createBanner(banner: Partial<Banner>): Promise<Banner> {
    return db.saveBanner({
      title: banner.title || 'Special Matchday Feature',
      image_url: banner.image_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=85',
      ...banner
    });
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    const banners = await db.getBanners();
    const current = banners.find(b => b.id === id);
    if (!current) throw new Error(`Banner ${id} not found.`);
    return db.saveBanner({ ...current, ...updates, id });
  },

  async deleteBanner(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteBanner error:', error);
      throw new Error(`Failed to delete banner: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'DELETE_BANNER', `Banner ID ${id} deleted from Supabase.`, 'banners', id);
    return true;
  },

  // ----------------------------------------------------
  // COUPONS (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getCoupons(): Promise<Coupon[]> {
    if (!isSupabaseConfigured || !supabase) return initialCoupons;

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getCoupons notice:', error.message);
        }
        return initialCoupons;
      }
      return (data && data.length > 0) ? (data as Coupon[]) : initialCoupons;
    } catch (e) {
      return initialCoupons;
    }
  },

  async validateCoupon(code: string, cartSubtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discount: 0, message: 'Please enter a coupon code.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .ilike('code', cleanCode)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !data) {
          return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
        }

        const coupon = data as Coupon;
        const minAmount = Number(coupon.min_order_amount ?? coupon.min_order_value) || 0;
        if (cartSubtotal < minAmount) {
          return { 
            valid: false, 
            discount: 0, 
            message: `Minimum order amount of ৳${minAmount.toLocaleString()} required for this coupon.` 
          };
        }

        if (coupon.expiry_date && new Date(coupon.expiry_date).getTime() < Date.now()) {
          return { valid: false, discount: 0, message: 'This coupon code has expired.' };
        }

        let discount = 0;
        if (coupon.discount_type === 'percentage') {
          discount = Math.round((cartSubtotal * coupon.discount_value) / 100);
          const maxCap = coupon.max_discount_amount ?? coupon.max_discount;
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
      } catch (e) {
        console.error('Supabase validateCoupon error:', e);
      }
    }
    return { valid: false, discount: 0, message: 'Invalid coupon code.' };
  },

  async saveCoupon(couponData: Partial<Coupon> & { code: string; discount_value: number }): Promise<Coupon> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const couponId = isValidUuid(couponData.id) ? couponData.id! : generateUuid();
    const row = {
      id: couponId,
      code: couponData.code.toUpperCase(),
      discount_type: couponData.discount_type || 'percentage',
      discount_value: Number(couponData.discount_value) || 10,
      min_order_amount: Number(couponData.min_order_amount ?? couponData.min_order_value) || 0,
      max_discount_amount: couponData.max_discount_amount ? Number(couponData.max_discount_amount) : (couponData.max_discount ? Number(couponData.max_discount) : null),
      start_date: couponData.start_date || new Date().toISOString(),
      expiry_date: couponData.expiry_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      usage_limit: Number(couponData.usage_limit) || 100,
      used_count: Number(couponData.used_count) || 0,
      is_active: couponData.is_active !== undefined ? Boolean(couponData.is_active) : true,
      created_at: couponData.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('coupons')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Supabase saveCoupon error:', error);
      throw new Error(`Failed to save coupon: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_COUPON', `Coupon code "${row.code}" saved in Supabase.`, 'coupons', couponId);
    return data as Coupon;
  },

  async createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
    return db.saveCoupon({
      code: couponData.code || 'PROMO',
      discount_value: couponData.discount_value || 10,
      ...couponData
    });
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    const coupons = await db.getCoupons();
    const current = coupons.find(c => c.id === id);
    if (!current) throw new Error(`Coupon ${id} not found.`);
    return db.saveCoupon({ ...current, ...updates, id });
  },

  async deleteCoupon(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteCoupon error:', error);
      throw new Error(`Failed to delete coupon: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'DELETE_COUPON', `Coupon ID ${id} deleted from Supabase.`, 'coupons', id);
    return true;
  },

  // ----------------------------------------------------
  // ORDERS & CHECKOUT (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getOrders(userId?: string): Promise<Order[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('customer_id', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase getOrders error:', error.message);
        return [];
      }

      return (data || []).map((o: any) => ({
        ...o,
        total_amount: Number(o.grand_total ?? o.total_amount) || 0,
        subtotal: Number(o.subtotal) || 0,
        delivery_charge: Number(o.delivery_charge) || 0,
        discount_amount: Number(o.discount_amount) || 0,
        status: o.order_status || o.status || 'pending',
        shipping_address: {
          full_name: o.customer_name,
          phone: o.customer_phone,
          address_line1: o.delivery_address,
          district: o.district || 'Dhaka',
          city: o.city || 'Dhaka',
          thana: o.area || '',
          postal_code: o.postal_code || ''
        },
        items: (o.items || []).map((it: any) => ({
          ...it,
          unit_price: Number(it.unit_price) || 0,
          total_price: Number(it.total_price) || 0,
          quantity: Number(it.quantity) || 1
        }))
      })) as Order[];
    } catch (e) {
      console.error('Supabase getOrders exception:', e);
      return [];
    }
  },

  async getOrderById(idOrNumber: string): Promise<Order | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      let query = supabase.from('orders').select('*, items:order_items(*)');
      if (isValidUuid(idOrNumber)) {
        query = query.or(`id.eq.${idOrNumber},order_number.ilike.${idOrNumber}`);
      } else {
        query = query.ilike('order_number', idOrNumber);
      }

      const { data, error } = await query.maybeSingle();
      if (error || !data) return null;

      return {
        ...data,
        total_amount: Number(data.grand_total ?? data.total_amount) || 0,
        subtotal: Number(data.subtotal) || 0,
        delivery_charge: Number(data.delivery_charge) || 0,
        discount_amount: Number(data.discount_amount) || 0,
        status: data.order_status || data.status || 'pending',
        shipping_address: {
          full_name: data.customer_name,
          phone: data.customer_phone,
          address_line1: data.delivery_address,
          district: data.district || 'Dhaka',
          city: data.city || 'Dhaka',
          thana: data.area || '',
          postal_code: data.postal_code || ''
        },
        items: (data.items || []).map((it: any) => ({
          ...it,
          unit_price: Number(it.unit_price) || 0,
          total_price: Number(it.total_price) || 0,
          quantity: Number(it.quantity) || 1
        }))
      } as Order;
    } catch (e) {
      console.error('Supabase getOrderById exception:', e);
      return null;
    }
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return db.getOrderById(orderNumber);
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const settings = await db.getStoreSettings();
    const prefix = settings.order_prefix || 'RAY';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `${prefix}-${dateStr}-${randNum}`;
    const orderId = isValidUuid(orderData.id) ? orderData.id! : generateUuid();

    const orderRow = {
      id: orderId,
      order_number: orderNumber,
      customer_id: isValidUuid(orderData.customer_id || orderData.user_id) ? (orderData.customer_id || orderData.user_id) : null,
      customer_name: orderData.customer_name || 'Customer',
      customer_email: orderData.customer_email || 'customer@rayven.com',
      customer_phone: orderData.customer_phone || '01700000000',
      delivery_address: orderData.delivery_address || orderData.shipping_address?.address_line1 || 'Dhaka',
      area: orderData.area || orderData.shipping_address?.thana || 'Dhaka Area',
      city: orderData.city || orderData.shipping_address?.city || 'Dhaka',
      district: orderData.district || orderData.shipping_address?.district || 'Dhaka',
      postal_code: orderData.postal_code || orderData.shipping_address?.postal_code || '',
      notes: orderData.notes || '',
      delivery_charge: Number(orderData.delivery_charge) || 60,
      discount_amount: Number(orderData.discount_amount) || 0,
      coupon_code: orderData.coupon_code || null,
      subtotal: Number(orderData.subtotal) || 0,
      grand_total: Number(orderData.total_amount ?? orderData.grand_total) || 0,
      order_status: (orderData.status || orderData.order_status || 'pending') as OrderStatus,
      payment_status: (orderData.payment_status || 'cod') as PaymentStatus,
      payment_method: (orderData.payment_method || 'cod') as any,
      admin_notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Insert order
    const { error: orderErr } = await supabase
      .from('orders')
      .insert(orderRow);

    if (orderErr) {
      console.error('Supabase createOrder error:', orderErr);
      throw new Error(`Failed to place order in Supabase: ${orderErr.message}`);
    }

    // 2. Insert order items
    if (orderData.items && orderData.items.length > 0) {
      const itemRows = orderData.items.map(it => ({
        id: isValidUuid(it.id) ? it.id : generateUuid(),
        order_id: orderId,
        product_id: isValidUuid(it.product_id) ? it.product_id : generateUuid(),
        product_name: it.product_name || 'Football Jersey',
        product_image: it.product_image || '',
        variant_id: isValidUuid(it.variant_id) ? it.variant_id : null,
        size: it.size || 'M',
        unit_price: Number(it.unit_price) || 0,
        quantity: Number(it.quantity) || 1,
        total_price: Number(it.total_price) || 0,
        custom_name: it.custom_name || null,
        custom_number: it.custom_number || null,
        created_at: new Date().toISOString()
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
      if (itemsErr) {
        console.warn('Supabase order_items insert warning:', itemsErr.message);
      }

      // 3. Deduct stock for each variant in Supabase
      for (const it of orderData.items) {
        if (it.product_id && it.size) {
          try {
            const { data: vData } = await supabase
              .from('product_variants')
              .select('id, stock_quantity')
              .eq('product_id', it.product_id)
              .eq('size', it.size)
              .maybeSingle();

            if (vData) {
              const newStock = Math.max(0, (vData.stock_quantity || 0) - it.quantity);
              await supabase
                .from('product_variants')
                .update({ stock_quantity: newStock })
                .eq('id', vData.id);
            }
          } catch (vErr) {
            console.warn('Failed to update variant stock on order:', vErr);
          }
        }
      }
    }

    // 4. Increment coupon usage
    if (orderRow.coupon_code) {
      try {
        const { data: cData } = await supabase
          .from('coupons')
          .select('id, used_count')
          .ilike('code', orderRow.coupon_code)
          .maybeSingle();
        if (cData) {
          await supabase
            .from('coupons')
            .update({ used_count: (cData.used_count || 0) + 1 })
            .eq('id', cData.id);
        }
      } catch (cErr) {
        console.warn('Coupon counter update error:', cErr);
      }
    }

    await db.logActivity(orderRow.customer_name, 'customer', 'CREATE_ORDER', `New Order ${orderRow.order_number} placed for ৳${orderRow.grand_total}`, 'orders', orderRow.id);

    const fullOrder = await db.getOrderById(orderId);
    if (fullOrder) return fullOrder;

    return {
      ...orderRow,
      total_amount: orderRow.grand_total,
      status: orderRow.order_status,
      items: orderData.items || []
    } as Order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, adminNotes?: string): Promise<Order | null> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const updates: any = {
      order_status: status,
      updated_at: new Date().toISOString()
    };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error('Supabase updateOrderStatus error:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'UPDATE_ORDER_STATUS', `Order status updated to ${status.toUpperCase()}`, 'orders', orderId);
    return db.getOrderById(orderId);
  },

  async updateOrderTracking(orderId: string, trackingNumber: string, courierPartner?: string): Promise<Order | null> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const updates: any = {
      order_status: 'shipped',
      updated_at: new Date().toISOString()
    };
    if (trackingNumber) updates.notes = `Tracking: ${trackingNumber} ${courierPartner ? `(${courierPartner})` : ''}`;

    await supabase.from('orders').update(updates).eq('id', orderId);
    return db.getOrderById(orderId);
  },

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return !error;
  },

  // ----------------------------------------------------
  // REVIEWS (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getReviews(productId?: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId).eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase getReviews error:', error.message);
        return [];
      }
      return (data || []) as ProductReview[];
    } catch (e) {
      console.error('Supabase getReviews exception:', e);
      return [];
    }
  },

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return db.getReviews(productId);
  },

  async addReview(review: Omit<ProductReview, 'id' | 'created_at' | 'is_approved'>): Promise<ProductReview> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const revId = generateUuid();
    const row = {
      id: revId,
      product_id: review.product_id,
      user_name: review.user_name || 'Verified Customer',
      user_avatar: review.user_avatar || '',
      rating: Number(review.rating) || 5,
      comment: review.comment || '',
      image_url: review.image_url || '',
      is_verified_purchase: review.is_verified_purchase !== undefined ? Boolean(review.is_verified_purchase) : true,
      is_approved: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Supabase addReview error:', error);
      throw new Error(`Failed to submit review: ${error.message}`);
    }

    return data as ProductReview;
  },

  async createProductReview(review: Partial<ProductReview>): Promise<ProductReview> {
    return db.addReview({
      product_id: review.product_id || '',
      user_name: review.user_name || 'Football Fan',
      rating: review.rating || 5,
      comment: review.comment || 'Great authentic quality!'
    });
  },

  // ----------------------------------------------------
  // FAQ MANAGEMENT (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getFAQs(activeOnly = false): Promise<FAQItem[]> {
    if (!isSupabaseConfigured || !supabase) {
      return activeOnly ? initialFAQs.filter(f => f.is_active !== false) : initialFAQs;
    }

    try {
      let query = supabase
        .from('faq')
        .select('*')
        .order('display_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getFAQs notice:', error.message);
        }
        return activeOnly ? initialFAQs.filter(f => f.is_active !== false) : initialFAQs;
      }
      const mapped = (data || []).map((f: any) => ({
        ...f,
        is_active: f.is_published ?? f.is_active ?? true,
        is_published: f.is_published ?? f.is_active ?? true
      })) as FAQItem[];

      return mapped.length > 0 ? mapped : (activeOnly ? initialFAQs.filter(f => f.is_active !== false) : initialFAQs);
    } catch (e) {
      return activeOnly ? initialFAQs.filter(f => f.is_active !== false) : initialFAQs;
    }
  },

  async saveFAQ(faq: Partial<FAQItem> & { question: string; answer: string; is_published?: boolean }): Promise<FAQItem> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const faqId = isValidUuid(faq.id) ? faq.id! : generateUuid();
    const row = {
      id: faqId,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      display_order: Number(faq.display_order) || 0,
      is_published: faq.is_active !== undefined ? Boolean(faq.is_active) : (faq.is_published !== undefined ? Boolean(faq.is_published) : true),
      created_at: faq.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('faq')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error('Supabase saveFAQ error:', error);
      throw new Error(`Failed to save FAQ: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_FAQ', `FAQ "${row.question.substring(0, 30)}..." saved in Supabase.`, 'faq', faqId);
    return { ...data, is_active: data.is_published } as FAQItem;
  },

  async deleteFAQ(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const { error } = await supabase.from('faq').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteFAQ error:', error);
      throw new Error(`Failed to delete FAQ: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'DELETE_FAQ', `FAQ ID ${id} deleted from Supabase.`, 'faq', id);
    return true;
  },

  // ----------------------------------------------------
  // CMS PAGES (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getCMSPages(): Promise<CMSPage[]> {
    if (!isSupabaseConfigured || !supabase) return initialCMSPages;

    try {
      const { data, error } = await supabase.from('pages').select('*');
      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getCMSPages notice:', error.message);
        }
        return initialCMSPages;
      }
      return (data && data.length > 0) ? (data as CMSPage[]) : initialCMSPages;
    } catch (e) {
      return initialCMSPages;
    }
  },

  async getCMSPage(slug: string): Promise<CMSPage | null> {
    if (!isSupabaseConfigured || !supabase) {
      return initialCMSPages.find(p => p.slug === slug) || null;
    }

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return initialCMSPages.find(p => p.slug === slug) || null;
      }
      return data as CMSPage;
    } catch (e) {
      return initialCMSPages.find(p => p.slug === slug) || null;
    }
  },

  async saveCMSPage(page: Partial<CMSPage> & { slug: string; title: string; content: string; meta_title?: string; meta_description?: string }): Promise<CMSPage> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const pageId = isValidUuid(page.id) ? page.id! : generateUuid();
    const row = {
      id: pageId,
      slug: page.slug,
      title: page.title,
      content: page.content,
      meta_title: page.meta_title || page.metadata?.meta_title || '',
      meta_description: page.meta_description || page.metadata?.meta_description || '',
      is_published: page.is_published !== undefined ? Boolean(page.is_published) : true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('pages')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error('Supabase saveCMSPage error:', error);
      throw new Error(`Failed to save CMS page: ${error.message}`);
    }

    await db.logActivity('Admin User', 'admin', 'SAVE_PAGE', `CMS Page "${row.title}" saved in Supabase.`, 'pages', pageId);
    return data as CMSPage;
  },

  // ----------------------------------------------------
  // CONTACT MESSAGES (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getContactMessages(): Promise<ContactMessage[]> {
    if (!isSupabaseConfigured || !supabase) return initialContactMessages;

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getContactMessages notice:', error.message);
        }
        return initialContactMessages;
      }
      return (data && data.length > 0) ? (data as ContactMessage[]) : initialContactMessages;
    } catch (e) {
      return initialContactMessages;
    }
  },

  async createContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'status'> & { status?: ContactMessage['status'] }): Promise<ContactMessage> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');

    const msgId = generateUuid();
    const row = {
      id: msgId,
      name: msg.name,
      email: msg.email || '',
      phone: msg.phone,
      subject: msg.subject || 'General Inquiry',
      message: msg.message,
      status: msg.status || 'unread',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('contact_messages')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Supabase createContactMessage error:', error);
      throw new Error(`Failed to submit message: ${error.message}`);
    }

    await db.logActivity(row.name, 'customer', 'CONTACT_SUBMIT', `Contact message from ${row.phone}`, 'messages', msgId);
    return data as ContactMessage;
  },

  async updateContactMessageStatus(id: string, status: ContactMessage['status'], adminNotes?: string): Promise<ContactMessage | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateContactMessageStatus error:', error);
      return null;
    }

    await db.logActivity('Admin User', 'admin', 'UPDATE_MESSAGE_STATUS', `Message ${id} marked as ${status}`, 'messages', id);
    return data as ContactMessage;
  },

  async deleteContactMessage(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    return !error;
  },

  // ----------------------------------------------------
  // NEWSLETTER SUBSCRIBERS (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    if (!isSupabaseConfigured || !supabase) return initialSubscribers;

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (!isSchemaOrTableMissing(error)) {
          console.warn('Supabase getNewsletterSubscribers notice:', error.message);
        }
        return initialSubscribers;
      }
      return (data && data.length > 0) ? (data.map((s: any) => ({
        ...s,
        status: s.is_active !== false ? 'active' : 'unsubscribed'
      })) as NewsletterSubscriber[]) : initialSubscribers;
    } catch (e) {
      return initialSubscribers;
    }
  },

  async addNewsletterSubscriber(email: string): Promise<{ success: boolean; message: string; subscriber?: NewsletterSubscriber }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const subId = generateUuid();
        const row = {
          id: subId,
          email: cleanEmail,
          is_active: true,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .upsert(row, { onConflict: 'email' })
          .select()
          .single();

        if (error) {
          console.warn('Supabase newsletter subscriber warning:', error.message);
        }

        await db.logActivity(cleanEmail, 'customer', 'NEWSLETTER_SUBSCRIBE', `Subscriber joined: ${cleanEmail}`, 'newsletter', subId);
        return { 
          success: true, 
          message: 'Welcome to the RAYVEN squad! You will receive exclusive early-access drop notifications.', 
          subscriber: data ? { ...data, status: 'active' } : { id: subId, email: cleanEmail, status: 'active', created_at: row.created_at } 
        };
      } catch (e) {
        console.error('Newsletter subscribe error:', e);
      }
    }

    return { success: true, message: 'Welcome to RAYVEN squad!' };
  },

  async deleteSubscriber(idOrEmail: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    if (isValidUuid(idOrEmail)) {
      await supabase.from('newsletter_subscribers').delete().eq('id', idOrEmail);
    } else {
      await supabase.from('newsletter_subscribers').delete().eq('email', idOrEmail);
    }
    return true;
  },

  async deleteNewsletterSubscriber(idOrEmail: string): Promise<boolean> {
    return db.deleteSubscriber(idOrEmail);
  },

  // ----------------------------------------------------
  // ACTIVITY LOGS (SUPABASE DIRECT)
  // ----------------------------------------------------
  async getLogs(): Promise<ActivityLog[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Supabase getLogs error:', error.message);
        return [];
      }
      return (data || []) as ActivityLog[];
    } catch (e) {
      return [];
    }
  },

  async logActivity(actor_name: string, actor_role: string, action: string, details: string, target_entity: string, target_id?: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const logRow = {
        id: generateUuid(),
        actor_name: actor_name || 'System',
        actor_role: actor_role || 'system',
        action,
        details: details || '',
        target_entity: target_entity || 'general',
        target_id: isValidUuid(target_id) ? target_id : null,
        created_at: new Date().toISOString()
      };

      await supabase.from('activity_logs').insert(logRow);
    } catch (e) {
      // Quietly ignore logging failures
    }
  },

  // ----------------------------------------------------
  // USER PROFILES & AUTH STATE HELPER
  // ----------------------------------------------------
  getCurrentUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.warn('Failed to set current user in localStorage:', e);
    }
  },

  // ----------------------------------------------------
  // 1-CLICK MASTER CATALOG SEEDING TO SUPABASE
  // ----------------------------------------------------
  async seedCatalogToSupabase(): Promise<{ success: boolean; message: string; categoriesCount: number; productsCount: number }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase database credentials are not configured.');
    }

    try {
      // 1. Seed Categories with valid UUIDs
      const categoryIdMap = new Map<string, string>();
      for (const cat of initialCategories) {
        const catUuid = generateUuid();
        categoryIdMap.set(cat.id, catUuid);
        categoryIdMap.set(cat.slug, catUuid);

        await supabase.from('categories').upsert({
          id: catUuid,
          name: cat.name,
          slug: cat.slug,
          image_url: cat.image_url,
          description: cat.description || '',
          is_featured: Boolean(cat.is_featured),
          display_order: cat.display_order || 0
        }, { onConflict: 'slug' });
      }

      // Fetch fresh category UUID map from Supabase
      const { data: dbCategories } = await supabase.from('categories').select('id, slug, name');
      if (dbCategories) {
        for (const c of dbCategories) {
          categoryIdMap.set(c.slug, c.id);
          categoryIdMap.set(c.name.toLowerCase(), c.id);
        }
      }

      // 2. Seed Products with valid UUIDs & Product Variants
      let seededProductsCount = 0;
      for (const prod of initialProducts) {
        const prodUuid = generateUuid();
        const matchedCatId = categoryIdMap.get(prod.category_id) || categoryIdMap.get(prod.category_name?.toLowerCase() || '') || null;

        const prodRow = {
          id: prodUuid,
          name: prod.name,
          slug: prod.slug,
          team: prod.team,
          season: prod.season || '2026/27',
          category_id: matchedCatId,
          description: prod.description || '',
          details: prod.details || [],
          price: Number(prod.price) || 0,
          discount_price: prod.discount_price ? Number(prod.discount_price) : null,
          sku: prod.sku || `RAY-${seededProductsCount + 100}`,
          product_type: prod.product_type || 'jersey',
          jersey_version: prod.jersey_version || 'fan',
          is_featured: Boolean(prod.is_featured),
          is_new_arrival: Boolean(prod.is_new_arrival),
          is_bestseller: Boolean(prod.is_bestseller),
          is_published: true,
          images: prod.images || [],
          specifications: prod.specifications || {},
          size_guide: prod.size_guide || {},
          rating_avg: Number(prod.rating_avg) || 5.0,
          review_count: Number(prod.review_count) || 0,
          meta_title: prod.meta_title || '',
          meta_description: prod.meta_description || ''
        };

        const { data: insertedProd, error: pErr } = await supabase
          .from('products')
          .upsert(prodRow, { onConflict: 'slug' })
          .select('id')
          .single();

        if (!pErr) {
          seededProductsCount++;
          const effectiveProdId = insertedProd?.id || prodUuid;

          // Insert variants
          const standardSizes: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
          const variantsToInsert = standardSizes.map(sz => ({
            id: generateUuid(),
            product_id: effectiveProdId,
            size: sz,
            stock_quantity: 15,
            sku: `${prodRow.sku}-${sz}`,
            price_adjustment: 0
          }));

          await supabase.from('product_variants').upsert(variantsToInsert, { onConflict: 'product_id,size' });
        }
      }

      // 3. Seed Banners
      try {
        for (const banner of initialBanners) {
          await supabase.from('banners').upsert({
            id: generateUuid(),
            title: banner.title,
            subtitle: banner.subtitle || '',
            badge_text: banner.badge_text || banner.tag || 'NEW DROP',
            cta_text: banner.cta_text || banner.button_text || 'SHOP NOW',
            cta_link: banner.cta_link || banner.link_url || '/shop',
            image_url: banner.image_url,
            display_order: Number(banner.display_order || banner.sort_order) || 0,
            is_active: true
          });
        }
      } catch (bErr) {
        console.warn('Seed banners notice:', bErr);
      }

      // 4. Seed Store Settings
      try {
        const storeSettingsPayload = {
          id: generateUuid(),
          store_name: initialStoreSettings.store_name,
          store_tagline: initialStoreSettings.store_tagline,
          logo_url: initialStoreSettings.logo_url,
          phone: initialStoreSettings.phone,
          email: initialStoreSettings.email,
          announcement_bar: initialStoreSettings.announcement_bar,
          inside_dhaka_delivery_fee: initialStoreSettings.inside_dhaka_delivery_fee,
          outside_dhaka_delivery_fee: initialStoreSettings.outside_dhaka_delivery_fee,
          free_shipping_threshold: initialStoreSettings.free_shipping_threshold,
          currency_symbol: initialStoreSettings.currency_symbol,
          order_prefix: initialStoreSettings.order_prefix,
          updated_at: new Date().toISOString()
        };
        await supabase.from('store_settings').upsert(storeSettingsPayload);
      } catch (sErr) {
        console.warn('Seed store_settings notice:', sErr);
      }

      // 5. Seed Coupons
      try {
        for (const coupon of initialCoupons) {
          await supabase.from('coupons').upsert({
            id: generateUuid(),
            code: coupon.code.toUpperCase(),
            discount_type: coupon.discount_type || 'percentage',
            discount_value: Number(coupon.discount_value) || 10,
            min_order_amount: Number(coupon.min_order_amount ?? coupon.min_order_value) || 0,
            max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
            start_date: new Date().toISOString(),
            expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
            usage_limit: Number(coupon.usage_limit) || 200,
            used_count: 0,
            is_active: true
          }, { onConflict: 'code' });
        }
      } catch (cErr) {
        console.warn('Seed coupons notice:', cErr);
      }

      // 6. Seed FAQs
      try {
        for (const faq of initialFAQs) {
          await supabase.from('faq').upsert({
            id: generateUuid(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category || 'General',
            display_order: Number(faq.display_order) || 0,
            is_published: true
          });
        }
      } catch (fErr) {
        console.warn('Seed FAQs notice:', fErr);
      }

      // 7. Seed CMS Pages
      try {
        for (const page of initialCMSPages) {
          await supabase.from('pages').upsert({
            id: generateUuid(),
            slug: page.slug,
            title: page.title,
            content: page.content,
            meta_title: page.metadata?.meta_title || '',
            meta_description: page.metadata?.meta_description || '',
            is_published: true
          }, { onConflict: 'slug' });
        }
      } catch (pErr) {
        console.warn('Seed pages notice:', pErr);
      }

      await db.logActivity('Admin User', 'admin', 'SEED_DATABASE', 'Complete 2026/27 football jersey catalog seeded to Supabase.', 'system');

      return {
        success: true,
        message: `Successfully synchronized ${initialCategories.length} categories, ${seededProductsCount} products with size variants, banners, and settings to Supabase!`,
        categoriesCount: initialCategories.length,
        productsCount: seededProductsCount
      };
    } catch (err: any) {
      console.error('Seed database error:', err);
      throw new Error(`Catalog seeding failed: ${err.message}`);
    }
  }
};

export const seedCatalogToSupabase = db.seedCatalogToSupabase;

