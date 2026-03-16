export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          brand: string | null;
          category_id: string;
          base_price_kes: number;
          base_price_usd: number;
          stock: number;
          has_variants: boolean;
          is_active: boolean;
          tags: string[];
          images: { url: string; alt?: string }[];
          description: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price_kes: number;
          price_usd: number;
          stock: number;
          sku: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          currency: string;
          subtotal_kes: number;
          subtotal_usd: number;
          shipping_fee_kes: number;
          shipping_fee_usd: number;
          total_kes: number;
          total_usd: number;
          shipping_name: string;
          shipping_phone: string;
          shipping_line_1: string;
          shipping_line_2: string | null;
          shipping_city: string;
          shipping_county: string | null;
          shipping_country: string;
          created_at: string;
          updated_at: string;
          cancelled_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          product_name: string;
          variant_name: string | null;
          unit_price_kes: number;
          unit_price_usd: number;
          quantity: number;
          total_kes: number;
          total_usd: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          method: string;
          status: string;
          amount: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          stripe_client_secret: string | null;
          mpesa_checkout_request_id: string | null;
          mpesa_receipt_number: string | null;
          mpesa_phone: string | null;
          mpesa_result_code: string | null;
          mpesa_result_desc: string | null;
          provider_payload: Record<string, unknown> | null;
          paid_at: string | null;
          failed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
