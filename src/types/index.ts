export type UserRole = 'customer' | 'admin' | 'super_admin';

export type ProductType = 'jersey' | 'training' | 'jacket' | 'shorts' | 'accessory';
export type JerseyVersion = 'fan' | 'player' | 'retro' | 'goalkeeper';
export type KitType = 'home' | 'away' | 'third' | 'special';
export type JerseySize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'cod' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'sslcommerz' | 'card';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description?: string;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
  product_count?: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: JerseySize;
  stock_quantity: number;
  sku: string;
  price_adjustment?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  team: string;
  league?: string;
  season: string;
  category_id: string;
  category_name?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  description: string;
  details?: string[];
  features?: string[];
  price: number;
  discount_price?: number;
  original_price?: number;
  sku?: string;
  product_type?: ProductType;
  jersey_version: JerseyVersion;
  kit_type?: KitType;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_published?: boolean;
  is_active?: boolean;
  images: string[];
  variants: ProductVariant[];
  specifications?: Record<string, string>;
  size_guide?: Record<string, { chest: string; length: string }>;
  rating?: number;
  rating_avg?: number;
  review_count: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product: Product;
  size: JerseySize;
  quantity: number;
  custom_name?: string;
  custom_number?: string;
  unit_price: number;
  total_price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  variant_id?: string;
  size: JerseySize;
  unit_price: number;
  quantity: number;
  total_price: number;
  custom_name?: string;
  custom_number?: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  district: string;
  thana?: string;
  city?: string;
  postal_code?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  delivery_address?: string;
  delivery_zone?: 'inside_dhaka' | 'outside_dhaka';
  area?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  notes?: string;
  courier_partner?: string;
  tracking_number?: string;
  delivery_charge: number;
  discount_amount: number;
  coupon_code?: string;
  subtotal: number;
  grand_total?: number;
  total_amount: number;
  status: OrderStatus;
  order_status?: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  admin_notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  phone: string;
  street_address: string;
  area: string;
  city: string;
  district: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  image_url?: string;
  is_verified_purchase?: boolean;
  is_approved?: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  min_order_amount?: number;
  max_discount?: number;
  max_discount_amount?: number;
  start_date?: string;
  expiry_date?: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  badge_text?: string;
  button_text?: string;
  cta_text?: string;
  link_url?: string;
  cta_link?: string;
  image_url: string;
  position?: string;
  display_order?: number;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
}

export interface SocialLinkConfig {
  url: string;
  enabled: boolean;
}

export interface PaymentMethodConfig {
  cod: {
    enabled: boolean;
    title: string;
    description: string;
  };
  bkash: {
    enabled: boolean;
    number: string;
    account_type: 'Merchant' | 'Personal' | 'Agent';
    instructions: string;
  };
  nagad: {
    enabled: boolean;
    number: string;
    account_type: 'Merchant' | 'Personal' | 'Agent';
    instructions: string;
  };
}

export interface HeroSectionConfig {
  enabled: boolean;
  badge_text: string;
  headline_primary: string;
  headline_highlight: string;
  description: string;
  button_primary_text: string;
  button_primary_url: string;
  button_secondary_text: string;
  button_secondary_url: string;
  image_url: string;
  mobile_image_url?: string;
  trust_badges: Array<{ title: string; subtitle: string }>;
}

export interface HomepageSectionsConfig {
  hero: boolean;
  categories: boolean;
  featured_products: boolean;
  new_arrivals: boolean;
  bestsellers: boolean;
  retro_classics: boolean;
  banners: boolean;
  why_rayven: boolean;
  reviews: boolean;
  newsletter: boolean;
}

export interface WhyRayvenBlock {
  icon: string;
  title: string;
  description: string;
}

export interface SEOConfig {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  badge: string;
  link_url?: string;
  placement: 'homepage' | 'checkout' | 'shop' | 'all' | 'none';
}

export interface FooterConfig {
  description: string;
  copyright_text: string;
  payment_text: string;
  show_delivery_info: boolean;
}

export interface StoreSettings {
  id: string;
  // 1. General Info
  store_name: string;
  store_tagline?: string;
  tagline?: string;
  store_description?: string;
  business_category?: string;
  currency_symbol?: string;
  order_prefix?: string;
  store_status: 'OPEN' | 'CLOSED' | 'MAINTENANCE';
  status_message?: string;

  // 2. Branding
  logo_url?: string;
  dark_logo_url?: string;
  light_logo_url?: string;
  favicon_url?: string;
  footer_logo_url?: string;
  primary_color?: string;
  secondary_color?: string;

  // 3. Contact Info
  phone: string;
  support_phone?: string;
  email: string;
  support_email?: string;
  whatsapp_number?: string;
  business_address?: string;
  city?: string;
  district?: string;
  country?: string;
  business_hours?: string;
  google_maps_url?: string;
  showroom_address?: string;

  // 4. Social Links
  social_links?: {
    facebook: SocialLinkConfig;
    instagram: SocialLinkConfig;
    tiktok: SocialLinkConfig;
    youtube: SocialLinkConfig;
    whatsapp: SocialLinkConfig;
    messenger: SocialLinkConfig;
  };
  facebook_url?: string;
  instagram_url?: string;

  // 5. Delivery & Shipping
  inside_dhaka_delivery_fee: number;
  outside_dhaka_delivery_fee: number;
  inside_dhaka_delivery_time?: string;
  outside_dhaka_delivery_time?: string;
  free_shipping_threshold: number;
  free_shipping_enabled?: boolean;
  shipping_note?: string;
  courier_partners?: string[];

  // 6. Payment Methods
  payment_methods?: PaymentMethodConfig;

  // 7. Homepage & Sections CMS
  hero_section?: HeroSectionConfig;
  homepage_sections?: HomepageSectionsConfig;
  why_rayven?: WhyRayvenBlock[];

  // 8. SEO
  seo?: SEOConfig;

  // 9. Announcement
  announcement_bar?: string;
  announcement_text?: string;
  announcement?: AnnouncementConfig;

  // 10. Footer
  footer?: FooterConfig;

  created_at: string;
  updated_at?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  category?: string;
  created_at?: string;
}

export interface CMSPage {
  id: string;
  slug: string; // 'about' | 'returns' | 'terms' | 'privacy' | 'shipping'
  title: string;
  subtitle?: string;
  content: string;
  metadata?: Record<string, any>;
  is_published: boolean;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_notes?: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  details: string;
  target_entity: string;
  target_id?: string;
  created_at: string;
}

