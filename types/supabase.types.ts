// Placeholder for Supabase generated types
// This should be replaced with: npx supabase gen types typescript --local > types/supabase.types.ts
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          category: string;
          description: string;
          price: number;
          stock: number;
          rating: number;
          tags: string[];
          image_urls: string[];
          created_at: string;
          specs?: Record<string, string | number | boolean>;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
    };
  };
};
