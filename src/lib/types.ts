export interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  price: number;
  inventory: number;
  active: boolean;
  image_url?: string | null;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface DeliveryZone {
  name: string;
  day: string;
  fee: number;
}

export interface DeliveryInfoCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  deliveryZone: string;
  deliveryInfo: { name: string; day: string };
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  image_url?: string | null;
  published: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
}
