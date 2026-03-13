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
