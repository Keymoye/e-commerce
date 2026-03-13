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
          description: string | null;
          base_price_kes: number;
          base_price_usd: number | null;
          stock: number;
          has_variants: boolean;
          rating: number;
          review_count: number;
          tags: string[];
          specs: Record<string, string | number | boolean> | null;
          is_active: boolean;
          is_featured: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          name: string;
          option_1_type: string | null;
          option_1_value: string | null;
          option_2_type: string | null;
          option_2_value: string | null;
          option_3_type: string | null;
          option_3_value: string | null;
          price_kes: number | null;
          price_usd: number | null;
          stock: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['product_variants']['Row']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          order_number: string;
          subtotal_kes: number;
          subtotal_usd: number | null;
          shipping_fee_kes: number;
          total_kes: number;
          total_usd: number | null;
          currency: 'KES' | 'USD';
          shipping_name: string;
          shipping_phone: string;
          shipping_line_1: string;
          shipping_line_2: string | null;
          shipping_city: string;
          shipping_county: string | null;
          shipping_country: string;
          notes: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          method: 'mpesa' | 'stripe' | 'cash_on_delivery';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
          amount: number;
          currency: 'KES' | 'USD';
          mpesa_checkout_request_id: string | null;
          mpesa_receipt_number: string | null;
          mpesa_phone: string | null;
          mpesa_result_code: number | null;
          mpesa_result_desc: string | null;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          stripe_client_secret: string | null;
          provider_payload: Record<string, unknown> | null;
          paid_at: string | null;
          failed_at: string | null;
          refunded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cart_items']['Row']>;
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          currency_pref: 'KES' | 'USD';
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string;
          line_1: string;
          line_2: string | null;
          city: string;
          county: string | null;
          country_code: string;
          postal_code: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['addresses']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          body: string | null;
          is_verified: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
    };
  };
};
