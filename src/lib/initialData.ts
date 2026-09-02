import { 
  Category, Product, Banner, Coupon, StoreSettings, UserProfile, Order,
  FAQItem, CMSPage, ContactMessage, NewsletterSubscriber 
} from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Real Madrid',
    slug: 'real-madrid',
    image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    description: 'Official Real Madrid home, away, third, and authentic player edition kits.',
    is_featured: true,
    display_order: 1,
    product_count: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Barcelona',
    slug: 'barcelona',
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    description: 'FC Barcelona Blaugrana home, away, and historic retro kits.',
    is_featured: true,
    display_order: 2,
    product_count: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Manchester United',
    slug: 'manchester-united',
    image_url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
    description: 'Red Devils matchday kits, fan jerseys, and retro classic collections.',
    is_featured: true,
    display_order: 3,
    product_count: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Manchester City',
    slug: 'manchester-city',
    image_url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80',
    description: 'Manchester City Sky Blue champions edition kits and training wear.',
    is_featured: true,
    display_order: 4,
    product_count: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    name: 'Liverpool FC',
    slug: 'liverpool',
    image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    description: 'The Reds Anfield classic home, away, and YNWA anthem jackets.',
    is_featured: true,
    display_order: 5,
    product_count: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-6',
    name: 'Arsenal FC',
    slug: 'arsenal',
    image_url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
    description: 'Gunners Emirates Stadium official home and away match kits.',
    is_featured: true,
    display_order: 6,
    product_count: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-7',
    name: 'National Teams',
    slug: 'national-teams',
    image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    description: 'Argentina 3-Star World Champions, Brazil, France, Portugal, England, Germany, and Bangladesh.',
    is_featured: true,
    display_order: 7,
    product_count: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-8',
    name: 'Retro Classics',
    slug: 'retro-classics',
    image_url: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=800&q=80',
    description: 'Legendary vintage kits: Zidane 1998, Ronaldinho 2006, Messi 2011, CR7 2008, Maradona 1986.',
    is_featured: true,
    display_order: 8,
    product_count: 6,
    created_at: new Date().toISOString(),
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Real Madrid Home Jersey 2026/27 (Player Edition)',
    slug: 'real-madrid-home-jersey-2026-27-player-edition',
    team: 'Real Madrid',
    season: '2026/27',
    category_id: 'cat-1',
    category_name: 'Real Madrid',
    description: 'The pinnacle of athletic innovation. Worn by the Galácticos on European nights at the Santiago Bernabéu. Engineered with ultra-breathable HEAT.RDY yarn, heat-applied silicon crest, and gold houndstooth micro-ventilation patterns.',
    details: [
      'Official Authentic Player Issue matchday spec',
      'Ultra-lightweight breathable athletic cut with curved hemline',
      'Heat-transferred 3D silicone club crest and sponsor logos',
      'Gold trim piping honoring UEFA Champions League heritage',
      '100% Recycled Ocean-bound Polyester with moisture-wicking technology'
    ],
    price: 1850,
    discount_price: 1450,
    sku: 'RMA-2627-HM-PL',
    product_type: 'jersey',
    jersey_version: 'player',
    is_featured: true,
    is_new_arrival: true,
    is_bestseller: true,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-1-s', product_id: 'prod-1', size: 'S', stock_quantity: 12, sku: 'RMA-2627-HM-PL-S' },
      { id: 'v-1-m', product_id: 'prod-1', size: 'M', stock_quantity: 24, sku: 'RMA-2627-HM-PL-M' },
      { id: 'v-1-l', product_id: 'prod-1', size: 'L', stock_quantity: 18, sku: 'RMA-2627-HM-PL-L' },
      { id: 'v-1-xl', product_id: 'prod-1', size: 'XL', stock_quantity: 9, sku: 'RMA-2627-HM-PL-XL' },
      { id: 'v-1-xxl', product_id: 'prod-1', size: 'XXL', stock_quantity: 4, sku: 'RMA-2627-HM-PL-XXL' },
    ],
    specifications: {
      'Fit': 'Slim Athlete Fit (If you prefer regular fit, size up)',
      'Material': '100% Recycled Polyester HEAT.RDY',
      'Country of Origin': 'Thailand High Grade Master Copy (1:1 AAA+)',
      'Care': 'Machine wash cold inside out, do not iron over prints',
      'Sleeve': 'Short Sleeve with ribbed cuff'
    },
    size_guide: {
      'S': { chest: '36-38 in (91-96 cm)', length: '27 in (69 cm)' },
      'M': { chest: '38-40 in (96-101 cm)', length: '28 in (71 cm)' },
      'L': { chest: '40-42 in (101-106 cm)', length: '29 in (74 cm)' },
      'XL': { chest: '42-44 in (106-111 cm)', length: '30 in (76 cm)' },
      'XXL': { chest: '44-46 in (111-117 cm)', length: '31 in (79 cm)' }
    },
    rating_avg: 4.95,
    review_count: 38,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'prod-2',
    name: 'FC Barcelona Home Jersey 2026/27 (Fan Edition)',
    slug: 'barcelona-home-jersey-2026-27-fan-edition',
    team: 'FC Barcelona',
    season: '2026/27',
    category_id: 'cat-2',
    category_name: 'Barcelona',
    description: 'Celebrate the iconic Blaugrana stripes celebrating Camp Nou rebirth. High-definition embroidered crest, comfortable regular fan fit, and Dri-FIT sweat management for Bangladesh climate.',
    details: [
      'Official Fan Edition with embroidered crest and Spotify sponsor print',
      'Comfortable regular cut suitable for street wear and turf matches',
      'Dri-FIT moisture-wicking technology',
      'Ribbed V-neck collar for lasting comfort'
    ],
    price: 1350,
    discount_price: 1150,
    sku: 'FCB-2627-HM-FN',
    product_type: 'jersey',
    jersey_version: 'fan',
    is_featured: true,
    is_new_arrival: true,
    is_bestseller: true,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-2-s', product_id: 'prod-2', size: 'S', stock_quantity: 8, sku: 'FCB-2627-HM-FN-S' },
      { id: 'v-2-m', product_id: 'prod-2', size: 'M', stock_quantity: 20, sku: 'FCB-2627-HM-FN-M' },
      { id: 'v-2-l', product_id: 'prod-2', size: 'L', stock_quantity: 15, sku: 'FCB-2627-HM-FN-L' },
      { id: 'v-2-xl', product_id: 'prod-2', size: 'XL', stock_quantity: 10, sku: 'FCB-2627-HM-FN-XL' },
      { id: 'v-2-xxl', product_id: 'prod-2', size: 'XXL', stock_quantity: 5, sku: 'FCB-2627-HM-FN-XXL' },
    ],
    specifications: {
      'Fit': 'Standard Regular Fit',
      'Material': '100% Breathable Micro-Polyester',
      'Country of Origin': 'Thailand Premium Edition',
      'Care': 'Gentle wash 30°C'
    },
    rating_avg: 4.88,
    review_count: 29,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Argentina 3-Star World Champions Home Jersey (Player Edition)',
    slug: 'argentina-3-star-world-cup-home-jersey-player-edition',
    team: 'Argentina',
    season: '2026',
    category_id: 'cat-7',
    category_name: 'National Teams',
    description: 'The historic Albiceleste kit featuring the prestigious gold 3 Stars and FIFA World Champions central gold badge. Worn by Lionel Messi and La Scaloneta.',
    details: [
      '3 Embroidered/Silicon Golden Stars above the AFA crest',
      'Central FIFA World Champions 2022 Shield',
      'Sun of May embossed detailing on upper back neck',
      'Ultra breathable Heat.RDY player edition mesh structure'
    ],
    price: 1950,
    discount_price: 1550,
    sku: 'ARG-3STAR-HM-PL',
    product_type: 'jersey',
    jersey_version: 'player',
    is_featured: true,
    is_new_arrival: false,
    is_bestseller: true,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-3-s', product_id: 'prod-3', size: 'S', stock_quantity: 14, sku: 'ARG-3STAR-HM-PL-S' },
      { id: 'v-3-m', product_id: 'prod-3', size: 'M', stock_quantity: 35, sku: 'ARG-3STAR-HM-PL-M' },
      { id: 'v-3-l', product_id: 'prod-3', size: 'L', stock_quantity: 28, sku: 'ARG-3STAR-HM-PL-L' },
      { id: 'v-3-xl', product_id: 'prod-3', size: 'XL', stock_quantity: 16, sku: 'ARG-3STAR-HM-PL-XL' },
      { id: 'v-3-xxl', product_id: 'prod-3', size: 'XXL', stock_quantity: 8, sku: 'ARG-3STAR-HM-PL-XXL' },
    ],
    specifications: {
      'Fit': 'Athletic Slim Fit',
      'Material': '100% Recycled Polyester Heat.RDY',
      'Patches': 'World Cup Champions Gold Crest included',
      'Country of Origin': 'Thailand High Grade 1:1'
    },
    rating_avg: 4.98,
    review_count: 64,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Manchester United Home Jersey 2026/27 (Fan Edition)',
    slug: 'manchester-united-home-jersey-2026-27-fan-edition',
    team: 'Manchester United',
    season: '2026/27',
    category_id: 'cat-3',
    category_name: 'Manchester United',
    description: 'Glory Glory Man United! The iconic crimson red home jersey for Old Trafford matchdays. Features woven club crest and premium moisture-absorbing fabric.',
    details: [
      'Stitched Manchester United crest with devil detail',
      'Snapdragon sponsor high durability chest print',
      'AEROREADY moisture-wicking technology',
      'Comfortable crewneck design'
    ],
    price: 1350,
    discount_price: 1100,
    sku: 'MNU-2627-HM-FN',
    product_type: 'jersey',
    jersey_version: 'fan',
    is_featured: true,
    is_new_arrival: true,
    is_bestseller: false,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-4-s', product_id: 'prod-4', size: 'S', stock_quantity: 10, sku: 'MNU-2627-HM-FN-S' },
      { id: 'v-4-m', product_id: 'prod-4', size: 'M', stock_quantity: 18, sku: 'MNU-2627-HM-FN-M' },
      { id: 'v-4-l', product_id: 'prod-4', size: 'L', stock_quantity: 14, sku: 'MNU-2627-HM-FN-L' },
      { id: 'v-4-xl', product_id: 'prod-4', size: 'XL', stock_quantity: 7, sku: 'MNU-2627-HM-FN-XL' },
      { id: 'v-4-xxl', product_id: 'prod-4', size: 'XXL', stock_quantity: 3, sku: 'MNU-2627-HM-FN-XXL' },
    ],
    specifications: {
      'Fit': 'Standard Regular Fit',
      'Material': '100% Recycled Polyester AEROREADY',
      'Care': 'Machine wash cold'
    },
    rating_avg: 4.82,
    review_count: 22,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Zinedine Zidane France 1998 World Cup Final Retro Jersey',
    slug: 'zidane-france-1998-world-cup-final-retro-jersey',
    team: 'France / Retro',
    season: '1998',
    category_id: 'cat-8',
    category_name: 'Retro Classics',
    description: 'The legendary vintage jersey from the Stade de France final where Zidane scored two iconic headers to lift the 1998 World Cup. Features vintage polo collar, tri-color stripes, and velvet number 10 print.',
    details: [
      'Vintage 1998 Final matchday embroidery on chest',
      'Classic retro oversized silhouette with ribbed polo collar',
      'Flock velvet ZIDANE 10 back and front numbering',
      'Sublimated vintage French Football Federation cockerel crest'
    ],
    price: 1800,
    discount_price: 1450,
    sku: 'RET-FRA-1998-ZIZOU',
    product_type: 'jersey',
    jersey_version: 'retro',
    is_featured: true,
    is_new_arrival: false,
    is_bestseller: true,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-5-s', product_id: 'prod-5', size: 'S', stock_quantity: 6, sku: 'RET-FRA-1998-S' },
      { id: 'v-5-m', product_id: 'prod-5', size: 'M', stock_quantity: 14, sku: 'RET-FRA-1998-M' },
      { id: 'v-5-l', product_id: 'prod-5', size: 'L', stock_quantity: 12, sku: 'RET-FRA-1998-L' },
      { id: 'v-5-xl', product_id: 'prod-5', size: 'XL', stock_quantity: 5, sku: 'RET-FRA-1998-XL' },
      { id: 'v-5-xxl', product_id: 'prod-5', size: 'XXL', stock_quantity: 2, sku: 'RET-FRA-1998-XXL' },
    ],
    specifications: {
      'Fit': 'Retro Relaxed Boxy Fit',
      'Material': 'Heavyweight Premium Jacquard Polyester',
      'Print': 'High-density velvet flock printing',
      'Heritage': '1998 World Cup Champions'
    },
    rating_avg: 4.97,
    review_count: 51,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Arsenal FC Away Black & Gold Jersey 2026/27 (Player Edition)',
    slug: 'arsenal-away-black-gold-jersey-2026-27-player-edition',
    team: 'Arsenal',
    season: '2026/27',
    category_id: 'cat-6',
    category_name: 'Arsenal FC',
    description: 'North London elegance in deep black and metallic gold. Clean monochrome Gothic cannon crest with ultra-light performance construction.',
    details: [
      'Gothic Cannon 3D metallic heat-pressed badge',
      'Metallic gold sponsor and sleeve trim',
      'Engineered mesh panels on ribs and underarms',
      'HEAT.RDY athlete performance technology'
    ],
    price: 1850,
    discount_price: 1450,
    sku: 'ARS-2627-AW-PL',
    product_type: 'jersey',
    jersey_version: 'player',
    is_featured: true,
    is_new_arrival: true,
    is_bestseller: false,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-6-s', product_id: 'prod-6', size: 'S', stock_quantity: 9, sku: 'ARS-2627-AW-PL-S' },
      { id: 'v-6-m', product_id: 'prod-6', size: 'M', stock_quantity: 16, sku: 'ARS-2627-AW-PL-M' },
      { id: 'v-6-l', product_id: 'prod-6', size: 'L', stock_quantity: 11, sku: 'ARS-2627-AW-PL-L' },
      { id: 'v-6-xl', product_id: 'prod-6', size: 'XL', stock_quantity: 6, sku: 'ARS-2627-AW-PL-XL' },
      { id: 'v-6-xxl', product_id: 'prod-6', size: 'XXL', stock_quantity: 3, sku: 'ARS-2627-AW-PL-XXL' },
    ],
    specifications: {
      'Fit': 'Slim Performance Athlete Fit',
      'Material': '100% Recycled Polyester HEAT.RDY',
      'Details': 'Metallic Gold Accents'
    },
    rating_avg: 4.90,
    review_count: 17,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Brazil Seleção 2002 World Cup Ronaldo #9 Retro Jersey',
    slug: 'brazil-2002-world-cup-ronaldo-retro-jersey',
    team: 'Brazil / Retro',
    season: '2002',
    category_id: 'cat-8',
    category_name: 'Retro Classics',
    description: 'The Golden Pentacampeão kit from Yokohama 2002. R9 Ronaldo Fenômeno legendary kit with original font number 9 and 4-star CBF crest of the champions.',
    details: [
      'Iconic 2002 dual-tone Nike Total 90 collar construction',
      'Classic CBF crest with 4 Stars honoring 1958, 62, 70, 94',
      'Official RONALDO 9 back lettering',
      'Lightweight breathable fabric with mesh ventilation inserts'
    ],
    price: 1750,
    discount_price: 1390,
    sku: 'RET-BRA-2002-R9',
    product_type: 'jersey',
    jersey_version: 'retro',
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: true,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-7-s', product_id: 'prod-7', size: 'S', stock_quantity: 4, sku: 'RET-BRA-2002-S' },
      { id: 'v-7-m', product_id: 'prod-7', size: 'M', stock_quantity: 15, sku: 'RET-BRA-2002-M' },
      { id: 'v-7-l', product_id: 'prod-7', size: 'L', stock_quantity: 12, sku: 'RET-BRA-2002-L' },
      { id: 'v-7-xl', product_id: 'prod-7', size: 'XL', stock_quantity: 5, sku: 'RET-BRA-2002-XL' },
      { id: 'v-7-xxl', product_id: 'prod-7', size: 'XXL', stock_quantity: 1, sku: 'RET-BRA-2002-XXL' },
    ],
    specifications: {
      'Fit': 'Retro Classic Fit',
      'Material': '100% Breathable Vintage Micro-Mesh',
      'Heritage': '2002 World Cup Winners'
    },
    rating_avg: 4.96,
    review_count: 43,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Manchester City Treble Winners Champions Special Edition Jersey',
    slug: 'manchester-city-treble-winners-champions-edition-jersey',
    team: 'Manchester City',
    season: '2026/27',
    category_id: 'cat-4',
    category_name: 'Manchester City',
    description: 'Celebrate the sky blue dominance. Special golden sleeve badges, Etihad Airways sponsor, and lightweight moisture management system.',
    details: [
      'Sky blue tonal graphic print inspired by Etihad Stadium arches',
      'Golden Premier League & UEFA Champions League sleeve patches',
      'dryCELL moisture-wicking technology keeps you dry',
      'Embroidered club badge and Puma cat logo'
    ],
    price: 1400,
    discount_price: 1190,
    sku: 'MCI-2627-HM-FN',
    product_type: 'jersey',
    jersey_version: 'fan',
    is_featured: false,
    is_new_arrival: true,
    is_bestseller: false,
    is_published: true,
    images: [
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [
      { id: 'v-8-s', product_id: 'prod-8', size: 'S', stock_quantity: 7, sku: 'MCI-2627-HM-FN-S' },
      { id: 'v-8-m', product_id: 'prod-8', size: 'M', stock_quantity: 14, sku: 'MCI-2627-HM-FN-M' },
      { id: 'v-8-l', product_id: 'prod-8', size: 'L', stock_quantity: 10, sku: 'MCI-2627-HM-FN-L' },
      { id: 'v-8-xl', product_id: 'prod-8', size: 'XL', stock_quantity: 5, sku: 'MCI-2627-HM-FN-XL' },
      { id: 'v-8-xxl', product_id: 'prod-8', size: 'XXL', stock_quantity: 2, sku: 'MCI-2627-HM-FN-XXL' },
    ],
    specifications: {
      'Fit': 'Standard Fan Fit',
      'Material': '100% Recycled dryCELL Polyester'
    },
    rating_avg: 4.86,
    review_count: 19,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  }
];

export const initialBanners: Banner[] = [
  {
    id: 'b-1',
    title: 'NEW SEASON 2026/27 DROPS',
    subtitle: 'Official Authentic Player & Fan Edition Match Kits for Real Madrid, Barça, Arsenal, Man City & More.',
    badge_text: '⚡ OFFICIAL DROP 2026/27',
    cta_text: 'EXPLORE KITS',
    cta_link: '/shop',
    image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=85',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b-2',
    title: 'ICONIC RETRO LEGENDS VAULT',
    subtitle: 'Relive the glory: Zidane 1998, Ronaldinho 2006, Messi 2011 & R9 2002 in premium heavyweight jacquard.',
    badge_text: '🏆 VINTAGE HERITAGE',
    cta_text: 'SHOP RETRO',
    cta_link: '/shop?category=retro-classics',
    image_url: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=1400&q=85',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

export const initialCoupons: Coupon[] = [
  {
    id: 'c-1',
    code: 'RAYVEN10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1000,
    max_discount_amount: 500,
    start_date: '2026-01-01T00:00:00Z',
    expiry_date: '2027-12-31T23:59:59Z',
    usage_limit: 500,
    used_count: 42,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c-2',
    code: 'EID500',
    discount_type: 'fixed',
    discount_value: 200,
    min_order_amount: 2500,
    start_date: '2026-01-01T00:00:00Z',
    expiry_date: '2027-12-31T23:59:59Z',
    usage_limit: 200,
    used_count: 18,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c-3',
    code: 'CHAMPIONS20',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 3000,
    max_discount_amount: 800,
    start_date: '2026-01-01T00:00:00Z',
    expiry_date: '2027-12-31T23:59:59Z',
    usage_limit: 100,
    used_count: 9,
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

export const initialStoreSettings: StoreSettings = {
  id: 'store-settings-1',
  store_name: 'RAYVEN',
  store_tagline: 'Premium Football Jerseys & Sportswear in Bangladesh',
  tagline: 'Premium Football Jerseys & Sportswear in Bangladesh',
  store_description: 'Bangladesh’s premier football sportswear hub for authentic player editions, club kits, retro classics, and custom name/number prints.',
  business_category: 'Sportswear & Football Kits',
  currency_symbol: '৳',
  order_prefix: 'RAY',
  store_status: 'OPEN',
  status_message: 'We are accepting orders normally with express delivery across all 64 districts.',

  // Branding
  logo_url: '',
  dark_logo_url: '',
  light_logo_url: '',
  favicon_url: '',
  footer_logo_url: '',
  primary_color: '#6D35C8',
  secondary_color: '#8B5AD9',

  // Contact Info
  phone: '+880 1711-234567',
  support_phone: '+880 1711-234567',
  email: 'orders@rayven.store',
  support_email: 'support@rayven.store',
  whatsapp_number: '+8801711234567',
  business_address: 'House 42, Road 11, Block D, Banani',
  city: 'Dhaka',
  district: 'Dhaka',
  country: 'Bangladesh',
  business_hours: 'Everyday: 10:00 AM - 11:00 PM (GMT+6)',
  google_maps_url: 'https://maps.google.com/?q=Banani+Dhaka+Bangladesh',
  showroom_address: 'House 42, Road 11, Block D, Banani, Dhaka 1213, Bangladesh',

  // Social Links
  social_links: {
    facebook: { url: 'https://facebook.com/rayvenfootball', enabled: true },
    instagram: { url: 'https://instagram.com/rayven.bd', enabled: true },
    tiktok: { url: 'https://tiktok.com/@rayvenfootball', enabled: true },
    youtube: { url: 'https://youtube.com/@rayvensportswear', enabled: true },
    whatsapp: { url: 'https://wa.me/8801711234567', enabled: true },
    messenger: { url: 'https://m.me/rayvenfootball', enabled: true },
  },
  facebook_url: 'https://facebook.com/rayvenfootball',
  instagram_url: 'https://instagram.com/rayven.bd',

  // Delivery & Shipping
  inside_dhaka_delivery_fee: 60,
  outside_dhaka_delivery_fee: 120,
  inside_dhaka_delivery_time: '24-48 Hours',
  outside_dhaka_delivery_time: '48-72 Hours',
  free_shipping_threshold: 3000,
  free_shipping_enabled: true,
  shipping_note: 'Parcels are insured and shipped via SteadFast Courier & Pathao Express with live tracking.',
  courier_partners: ['SteadFast Courier', 'Pathao Express', 'RedX', 'eCourier'],

  // Payment Methods
  payment_methods: {
    cod: {
      enabled: true,
      title: 'Cash on Delivery (COD)',
      description: 'Inspect your football kit parcel right at your doorstep before paying.',
    },
    bkash: {
      enabled: true,
      number: '01711234567',
      account_type: 'Merchant',
      instructions: 'Send money / payment to our official bKash Merchant number with Order ID in reference.',
    },
    nagad: {
      enabled: true,
      number: '01711234567',
      account_type: 'Merchant',
      instructions: 'Pay directly to our Nagad Merchant account with your Order ID in reference.',
    },
  },

  // Homepage CMS
  hero_section: {
    enabled: true,
    badge_text: 'RAYVEN FOOTBALL LAB',
    headline_primary: 'WEAR THE PASSION.',
    headline_highlight: 'FEEL THE GLORY.',
    description: "Premium Football Jerseys for fans who live the game. Bangladesh's premier destination for master-grade player issue kits, fan editions, retro legends, and bespoke heat-press customization.",
    button_primary_text: 'SHOP JERSEYS',
    button_primary_url: '/shop',
    button_secondary_text: 'EXPLORE COLLECTION',
    button_secondary_url: '/shop?version=player',
    image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85',
    trust_badges: [
      { title: '100% MASTER', subtitle: 'Grade 1:1 Authentic Quality' },
      { title: '24-48H DHAKA', subtitle: 'Express Courier Delivery' },
      { title: '7-DAY FIT', subtitle: 'Hassle-Free Size Exchange' },
    ],
  },
  homepage_sections: {
    hero: true,
    categories: true,
    featured_products: true,
    new_arrivals: true,
    bestsellers: true,
    retro_classics: true,
    banners: true,
    why_rayven: true,
    reviews: true,
    newsletter: true,
  },
  why_rayven: [
    {
      icon: 'Award',
      title: '100% Authentic Quality',
      description: 'High grade master-issue & fan edition football kits with high-density silicone crests and breathable yarn.'
    },
    {
      icon: 'Truck',
      title: 'Express Delivery Across Bangladesh',
      description: 'Dhaka delivery in 24-48 hours. All other 63 districts delivered within 48-72 hours with real-time tracking.'
    },
    {
      icon: 'RotateCcw',
      title: '7 Days Easy Exchange',
      description: 'Hassle-free size replacement support across all 64 districts. Perfect match fit guaranteed.'
    },
    {
      icon: 'ShieldCheck',
      title: 'Doorstep Cash on Delivery',
      description: 'Inspect and verify your football kit parcel right at your doorstep before handing over cash.'
    }
  ],

  // SEO
  seo: {
    meta_title: 'RAYVEN | Premium Football Jerseys & Authentic Club Kits in Bangladesh',
    meta_description: 'Buy 100% master-grade authentic player edition football kits, European club jerseys, retro classics, and custom name prints in Bangladesh with Cash on Delivery.',
    meta_keywords: 'football jerseys bangladesh, authentic player edition, real madrid jersey dhaka, barcelona kit, retro jerseys bd, cash on delivery',
    og_title: 'RAYVEN — Premium Football Sportswear Lab Bangladesh',
    og_description: 'Engineered for true football passion. Player editions, fan cuts, and retro vaults with express delivery across Bangladesh.',
    og_image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85',
  },

  // Announcement
  announcement_bar: '🔥 100% MASTER GRADE KITS | ⚡ INSIDE DHAKA ৳60 / OUTSIDE DHAKA ৳120 | 📦 FREE SHIPPING ON ৳3,000+',
  announcement_text: '🔥 100% MASTER GRADE KITS | ⚡ INSIDE DHAKA ৳60 / OUTSIDE DHAKA ৳120 | 📦 FREE SHIPPING ON ৳3,000+',
  announcement: {
    enabled: true,
    text: '🔥 100% MASTER GRADE KITS | ⚡ INSIDE DHAKA ৳60 / OUTSIDE DHAKA ৳120 | 📦 FREE SHIPPING ON ৳3,000+',
    badge: 'EXCLUSIVE MATCHDAY DROP',
    link_url: '/shop?version=player',
    placement: 'all',
  },

  // Footer
  footer: {
    description: 'Bangladesh’s premier football sportswear hub for authentic player editions, club kits, retro classics, and custom name/number prints.',
    copyright_text: '© 2026 RAYVEN Football Sportswear. All rights reserved.',
    payment_text: 'Accepted In Bangladesh: Cash on Delivery (COD) • bKash • Nagad',
    show_delivery_info: true,
  },

  created_at: new Date().toISOString(),
};

export const initialFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Are your jerseys authentic master-quality editions?',
    answer: 'Yes, 100%. RAYVEN specializes in high-density silicone crests, pro-grade AEROREADY & HEAT.RDY fabrications, and authentic rubber heat-transfer player printing identical to what players wear on European matchdays.',
    display_order: 1,
    is_active: true,
    category: 'Product Quality'
  },
  {
    id: 'faq-2',
    question: 'What is the delivery timeline and cost across Bangladesh?',
    answer: 'Inside Dhaka: ৳60 (delivered within 24 to 48 hours). Outside Dhaka (all 64 districts): ৳120 (delivered within 48 to 72 hours via SteadFast/Pathao). Orders over ৳3,000 receive FREE delivery.',
    display_order: 2,
    is_active: true,
    category: 'Shipping & Delivery'
  },
  {
    id: 'faq-3',
    question: 'Can I inspect the jersey before paying on Cash on Delivery (COD)?',
    answer: 'Yes, absolutely! You are encouraged to open the parcel and inspect the fabric, size tag, and crest quality in front of the delivery agent before paying.',
    display_order: 3,
    is_active: true,
    category: 'Payment'
  },
  {
    id: 'faq-4',
    question: 'What is your size exchange policy?',
    answer: 'We provide a 7-day hassle-free size replacement policy. As long as the jersey tags are attached and the garment is unworn, we will dispatch a replacement size to your doorstep.',
    display_order: 4,
    is_active: true,
    category: 'Returns & Exchange'
  },
  {
    id: 'faq-5',
    question: 'Can I get custom player name and number printing?',
    answer: 'Yes! We offer official font custom name and number printing (e.g. MESSI 10, BELLINGHAM 5, MBAPPE 9) with high-density heat-press flock at zero additional charge.',
    display_order: 5,
    is_active: true,
    category: 'Customization'
  }
];

export const initialCMSPages: CMSPage[] = [
  {
    id: 'page-about',
    slug: 'about',
    title: 'About RAYVEN Football',
    subtitle: 'Forged by passionate football fanatics for the vibrant Bangladeshi football community.',
    content: `Founded in Dhaka, **RAYVEN** was born out of a desire to eliminate poor-quality sportswear counterfeits and provide Bangladeshi football lovers with tournament-grade matchday kits.

Whether you are supporting Real Madrid in the Champions League, cheering on Argentina's 3-Star legacy, or rocking a vintage Zidane 1998 classic on a weekend turf match, we make sure every stitch, silicone crest, and breathable fiber delivers pure excellence.`,
    metadata: {
      stats: [
        { label: 'Jerseys Delivered', value: '10,000+' },
        { label: 'Districts Covered', value: '64' },
        { label: 'Customer Rating', value: '4.9 ★' },
      ],
      mission: 'To make authentic tournament-grade football kits and retro heritage apparel accessible to every fan across Bangladesh.',
      vision: 'To build the most trusted and culturally vibrant football sportswear ecosystem in South Asia.'
    },
    is_published: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-returns',
    slug: 'returns',
    title: '7 Days Exchange & Return Policy',
    subtitle: 'Hassle-free size replacement support across all 64 districts of Bangladesh.',
    content: `### Size Replacement Guarantee
We want you to have the perfect match fit. If the jersey you received is too snug or loose, you can initiate a size exchange within **7 days** of parcel arrival.

### Eligibility Conditions
- Garment must have original tags attached and packaging intact.
- Item must be unworn, unwashed, and without damage.
- Customized jerseys with personal custom names are eligible for exchange in case of printing error or fabric defect.

### How To Request An Exchange
1. Contact our WhatsApp helpline with your Order ID.
2. Our team will verify and dispatch your replacement size via reverse courier pickup.`,
    is_published: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-shipping',
    slug: 'shipping',
    title: 'Shipping & Delivery Policy',
    subtitle: 'Express door-to-door courier dispatch across all 64 districts of Bangladesh.',
    content: `### Delivery Coverage & Charges
- **Inside Dhaka City:** ৳60 — Delivered within 24 to 48 hours.
- **Outside Dhaka (All 64 Districts):** ৳120 — Delivered within 48 to 72 hours.
- **Free Shipping:** All orders of ৳3,000 or more qualify for automated free delivery.

### Courier Partners
We partner with SteadFast Courier and Pathao Express for prompt cash on delivery parcel deliveries with automated SMS tracking.`,
    is_published: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-terms',
    slug: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Standard retail conditions and purchase terms for RAYVEN Sportswear customers.',
    content: `By accessing and purchasing from RAYVEN Football Sportswear, you agree to the sales terms, delivery covenants, and exchange policies governed under Bangladeshi consumer trade regulations.

Prices, promotions, and inventory availability are subject to change without prior notice. All orders placed via Cash on Delivery are verified by our team before courier handover.`,
    is_published: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-privacy',
    slug: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How we respect and safeguard your personal information.',
    content: `RAYVEN respects customer data privacy. Your contact details, phone numbers, and delivery addresses are used exclusively for fulfilling parcel shipments and tracking updates.

We do not sell, rent, or trade your personal data to any external advertising aggregators. All digital transactions are processed securely through accredited mobile financial gateways.`,
    is_published: true,
    updated_at: new Date().toISOString(),
  }
];

export const initialContactMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Fahim Shahriar',
    email: 'fahim.s@gmail.com',
    phone: '01719876543',
    subject: 'Bulk Jersey Order for Turf League',
    message: 'We are organizing an 8-team corporate football tournament in Dhaka next month. Can we order 80 customized kits with player names and corporate logos?',
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'msg-2',
    name: 'Sabbir Rahman',
    email: 'sabbir.bd@yahoo.com',
    phone: '01811223344',
    subject: 'Size exchange for Real Madrid kit',
    message: 'Ordered Large but need Medium for player cut. Tags are completely intact. Please let me know how to exchange.',
    status: 'read',
    admin_notes: 'Customer contacted via WhatsApp, exchange parcel dispatched.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  }
];

export const initialSubscribers: NewsletterSubscriber[] = [
  {
    id: 'sub-1',
    email: 'nabilmubashir730@gmail.com',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'sub-2',
    email: 'footballer.dhaka@gmail.com',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'sub-3',
    email: 'tanvir.sports@outlook.com',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  }
];


export const demoAdminUser: UserProfile = {
  id: 'admin-usr-1',
  email: 'admin@rayven.store',
  full_name: 'Rayven Super Admin',
  phone: '+880 1711-234567',
  role: 'super_admin',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  created_at: new Date().toISOString(),
};

export const demoCustomerUser: UserProfile = {
  id: 'cust-usr-1',
  email: 'nabilmubashir730@gmail.com',
  full_name: 'Nabil Mubashir',
  phone: '01712345678',
  role: 'customer',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  created_at: new Date().toISOString(),
};

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    order_number: 'RAY-20260901-0012',
    customer_id: 'cust-usr-1',
    customer_name: 'Nabil Mubashir',
    customer_email: 'nabilmubashir730@gmail.com',
    customer_phone: '01712345678',
    shipping_address: {
      full_name: 'Nabil Mubashir',
      phone: '01712345678',
      address_line1: 'House 42, Road 11, Block D, Banani',
      city: 'Dhaka',
      district: 'Dhaka',
      postal_code: '1213'
    },
    delivery_address: 'House 42, Road 11, Block D',
    area: 'Banani',
    city: 'Dhaka',
    district: 'Dhaka',
    postal_code: '1213',
    notes: 'Please call before delivery',
    delivery_charge: 60,
    discount_amount: 145,
    coupon_code: 'RAYVEN10',
    subtotal: 1450,
    grand_total: 1365,
    total_amount: 1365,
    status: 'delivered',
    order_status: 'delivered',
    payment_status: 'cod',
    payment_method: 'cod',
    admin_notes: 'Delivered by SteadFast courier tracking #SF-8842',
    items: [
      {
        id: 'ord-item-1',
        order_id: 'ord-101',
        product_id: 'prod-1',
        product_name: 'Real Madrid Home Jersey 2026/27 (Player Edition)',
        product_image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80',
        size: 'L',
        unit_price: 1450,
        quantity: 1,
        total_price: 1450,
        custom_name: 'BELLINGHAM',
        custom_number: '5',
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'ord-102',
    order_number: 'RAY-20260901-0013',
    customer_id: null,
    customer_name: 'Tanvir Hossain',
    customer_email: 'tanvir.football@gmail.com',
    customer_phone: '01819876543',
    shipping_address: {
      full_name: 'Tanvir Hossain',
      phone: '01819876543',
      address_line1: 'GEC Circle, Nasirabad',
      city: 'Chittagong',
      district: 'Chittagong',
      postal_code: '4000'
    },
    delivery_address: 'GEC Circle, Nasirabad',
    area: 'GEC',
    city: 'Chittagong',
    district: 'Chittagong',
    postal_code: '4000',
    notes: 'Fast delivery requested',
    delivery_charge: 120,
    discount_amount: 0,
    subtotal: 2700,
    grand_total: 2820,
    total_amount: 2820,
    status: 'processing',
    order_status: 'processing',
    payment_status: 'cod',
    payment_method: 'cod',
    items: [
      {
        id: 'ord-item-2',
        order_id: 'ord-102',
        product_id: 'prod-2',
        product_name: 'FC Barcelona Home Jersey 2026/27 (Fan Edition)',
        product_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
        size: 'M',
        unit_price: 1150,
        quantity: 1,
        total_price: 1150,
      },
      {
        id: 'ord-item-3',
        order_id: 'ord-102',
        product_id: 'prod-3',
        product_name: 'Argentina 3-Star World Champions Home Jersey',
        product_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
        size: 'M',
        unit_price: 1550,
        quantity: 1,
        total_price: 1550,
        custom_name: 'MESSI',
        custom_number: '10'
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  }
];
