export type RoleType = 'administrator' | 'secretary' | 'customer';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: RoleType;
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  role_name?: string;
  occupation?: string | null;
  equipment_info?: string | null;
  notes?: string | null;
  driver_uuid?: string | null;
  rider_code?: string | null;
  driver_category?: string | null;
  vehicle_info?: string | null;
}

export interface CustomerProfile {
  id?: number;
  user_id?: number;
  occupation?: string;
  equipment_info?: string;
  notes?: string;
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  is_primary: boolean | number;
  display_order?: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  purchase_price?: number;
  stock_quantity: number;
  min_stock_alert?: number;
  is_active: number | boolean;
  category_id?: number;
  supplier_id?: number;
  categoria_nombre?: string;
  categoria_slug?: string;
  proveedor_nombre?: string;
  imagen_principal?: string | null;
  margin_percentage?: number;
  created_at?: string;
  updated_at?: string;
  images?: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  is_active?: number | boolean;
  total_productos?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  is_active: number | boolean;
  product_count?: number;
  created_at?: string;
}

export interface CartItem {
  id: number | string; // number from API, or temp id for guests
  product_id: number;
  quantity: number;
  product_name: string;
  price: number;
  sku?: string;
  imagen?: string | null;
}

export interface CartData {
  items: CartItem[];
  total_items: number;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'pago_movil' | 'banesco' | 'binance' | 'zinli' | 'zelle' | 'efectivo';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  imagen?: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  shipping_address_id: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | string;
  payment_reference?: string | null;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  notes?: string | null;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  shipping_address?: string;
  items?: OrderItem[];
}

export interface Address {
  id: number;
  user_id?: number;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  is_default: number | boolean;
  created_at?: string;
}

export interface InventoryLog {
  id: number;
  product_id: number;
  user_id: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity_changed: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  created_at: string;
  product_name?: string;
  sku?: string;
  user_name?: string;
}

export interface InventorySummary {
  total_products: number;
  total_units: number;
  low_stock_count: number;
  out_of_stock_count: number;
  low_stock_alerts: {
    id: number;
    name: string;
    sku: string;
    stock_quantity: number;
    min_stock_alert: number;
    categoria: string;
  }[];
  recent_logs: InventoryLog[];
}

export interface WarrantyLog {
  id: number;
  product_id: number;
  supplier_id: number;
  user_id: number;
  failure_reason: string;
  claim_status: 'pending' | 'accepted' | 'rejected' | 'refunded';
  supplier_resolution?: string | null;
  created_at: string;
  product_name?: string;
  supplier_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface Pagination {
  pagina_actual: number;
  por_pagina: number;
  total_productos: number;
  total_paginas: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  paginacion?: Pagination;
  token?: string;
  expires_at?: string;
  user?: User;
  order_id?: number;
  order_number?: string;
  total?: number;
  address_id?: number;
  product_id?: number;
  supplier_id?: number;
}
