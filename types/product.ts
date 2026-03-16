// types/product.ts — updated for new schema
export interface Product {
  id:             string;
  name:           string;
  slug:           string;
  brand:          string | null;
  category_id:    string;
  description:    string | null;
  base_price_kes: number;   // integer subunits — divide by 100 to display
  base_price_usd: number | null;
  stock:          number;
  has_variants:   boolean;
  rating:         number;
  review_count:   number;
  tags:           string[];
  specs:          Record<string, string | number | boolean> | null;
  is_active:      boolean;
  is_featured:    boolean;
  deleted_at:     string | null;
  created_at:     string;
  updated_at:     string;
  // Relations (when joined)
  images?:        ProductImage[];
  variants?:      ProductVariant[];
  category?:      Category;
}

export interface ProductVariant {
  id:              string;
  product_id:      string;
  sku:             string;
  name:            string;
  option_1_type:   string | null;
  option_1_value:  string | null;
  option_2_type:   string | null;
  option_2_value:  string | null;
  option_3_type:   string | null;
  option_3_value:  string | null;
  price_kes:       number | null;
  price_usd:       number | null;
  stock:           number;
  is_active:       boolean;
}

export interface ProductImage {
  id:         string;
  product_id: string;
  url:        string;
  alt_text:   string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  parent_id:   string | null;
  image_url:   string | null;
  is_active:   boolean;
}

export interface CategoryStats {
  name:     string;
  count:    number;
  avgPrice: number;  // in KES subunits
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  slug: string;
  brand: string | null;
  category_id: string;
  category?: { id: string; name: string } | null;
  base_price_kes: number;
  base_price_usd: number;
  stock: number;
  has_variants: boolean;
  is_active: boolean;
  tags: string[];
  images: { url: string; alt?: string }[];
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProductsResult {
  products: AdminProduct[];
  totalPages: number;
  total: number;
}

export interface GetProductsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface ImageItem {
  url: string;
  alt?: string;
  uploading?: boolean;
  error?: string;
}

// Admin order types
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface AdminOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price_kes: number;
  total_kes: number;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  currency: string;
  subtotal_kes: number;
  shipping_fee_kes: number;
  total_kes: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_line_1: string;
  shipping_line_2: string | null;
  shipping_city: string;
  shipping_county: string | null;
  shipping_country: string;
  created_at: string;
  cancelled_at: string | null;
  auth_users: {
    email: string;
  };
  order_items?: AdminOrderItem[];
}

export interface AdminOrdersResult {
  orders: AdminOrder[];
  totalPages: number;
  total: number;
}

export interface AdminOrderFilters {
  page: number;
  pageSize: number;
  search?: string;
  status?: OrderStatus | '';
  dateFrom?: string;
  dateTo?: string;
}
