import type { Product, DeliveryZone, DeliveryInfoCard } from './types';

export const DEFAULT_ZONES: Record<string, DeliveryZone> = {
  'hilt-hornbrook': { name: 'Hilt / Hornbrook', day: 'Monday', fee: 2 },
  'weed-shastina': { name: 'Weed / Lake Shastina', day: 'Tuesday', fee: 2 },
  'mtshasta-dunsmuir': { name: 'Mt Shasta / Dunsmuir / McCloud', day: 'Wednesday', fee: 2 },
  'yreka-grenada': { name: 'Yreka / Grenada / Montague', day: 'Thursday', fee: 2 },
  'fortjones-etna': { name: 'Fort Jones / Greenview / Quartz Valley / Etna', day: 'Friday', fee: 2 },
  'pickup': { name: 'Yreka Pickup (Sunday)', day: 'Sunday', fee: 0 },
};

export const DEFAULT_DELIVERY_INFO: DeliveryInfoCard[] = [
  { id: '1', icon: '\u{1F4E6}', title: '$25 Minimum', description: 'All orders' },
  { id: '2', icon: '\u{1F69A}', title: '$2 Delivery', description: 'To your zone' },
  { id: '3', icon: '\u{1F3E1}', title: 'Free Pickup', description: 'Sundays in Yreka' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'mush-4oz', name: 'Mixed Mushrooms', category: 'mushrooms', size: '4 oz', price: 8, inventory: 20, active: true },
  { id: 'mush-8oz', name: 'Mixed Mushrooms', category: 'mushrooms', size: '8 oz', price: 15, inventory: 15, active: true },
  { id: 'mush-1lb', name: 'Mixed Mushrooms', category: 'mushrooms', size: '1 lb', price: 28, inventory: 10, active: true },
  { id: 'greens-1lb', name: 'Radish Greens', category: 'greens', size: '1 lb', price: 6, inventory: 25, active: true },
  { id: 'greens-2lb', name: 'Radish Greens', category: 'greens', size: '2 lb', price: 11, inventory: 15, active: true },
];

export const PRODUCT_CATEGORIES = ['all', 'mushrooms', 'greens', 'herbs'] as const;

export const ORDER_STATUSES = ['pending', 'confirmed', 'completed'] as const;

export const SITE_URL = 'https://siskiyoufarmstead.com';
export const SITE_NAME = 'Siskiyou Farmstead';
export const SITE_DESCRIPTION = 'Fresh greens and gourmet mushrooms grown locally in Siskiyou County, California. Weekly delivery throughout the region.';
