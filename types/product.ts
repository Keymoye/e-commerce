export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  tags: string[];
  image_urls: string;
  created_at: string;
}
