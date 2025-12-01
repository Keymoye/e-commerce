# Database Upgrade Guide: Mock Data → Supabase

This guide explains how to migrate the e-commerce application from client-side mock data to a production Supabase PostgreSQL database.

## Current State: Mock Data

Currently, the app uses mock product data in `lib/products.ts`:

- 7 hardcoded products
- No persistent storage
- Cart/wishlist stored in browser localStorage (client-side only)
- No order history or user profile data
- Perfect for local development and MVP

**Limitations:**

- No server-side filtering or search
- No inventory management
- No order tracking
- No reviews persistence
- Single-user (per browser)

## Target State: Supabase PostgreSQL

**Benefits:**

- Persistent product catalog
- Server-side filtering, search, and pagination (better performance)
- User-specific cart and wishlist
- Order history and tracking
- Reviews and ratings stored server-side
- Multi-user support
- Analytics and business intelligence

## Database Schema

### Table: `products`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  specs JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);
```

### Table: `product_reviews`

```sql
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(product_id, user_id) -- One review per user per product
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
```

### Table: `user_carts`

```sql
CREATE TABLE user_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, product_id) -- One cart entry per user per product
);

CREATE INDEX idx_user_carts_user_id ON user_carts(user_id);
```

### Table: `user_wishlists`

```sql
CREATE TABLE user_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_user_wishlists_user_id ON user_wishlists(user_id);
```

### Table: `orders`

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Table: `order_items`
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,

  UNIQUE(order_id, product_id)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

## Migration Steps

### Step 1: Set Up Supabase Project

1. Create account at [supabase.com](https://supabase.com)
2. Create new project (choose PostgreSQL region closest to your users)
3. Wait for database initialization (~2 minutes)
4. Copy credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Step 2: Create Database Schema

In Supabase dashboard:

1. Go to **SQL Editor**
2. Create new query
3. Copy-paste the SQL schema above (products, product_reviews, user_carts, user_wishlists, orders, order_items tables)
4. Execute query
5. Verify tables created in **Table Editor**

**Or via CLI:**

```bash
# Create migrations folder
mkdir supabase/migrations

# Create migration file
cat > supabase/migrations/001_init_schema.sql << 'EOF'
-- Paste schema SQL here
EOF

# Apply migration
supabase migration up --project-id your-project-id
```

### Step 3: Seed Initial Product Data

1. Go to Supabase **Table Editor**
2. Click `products` table
3. Add rows with data from `lib/products.ts`:

```json
{
  "name": "Cureline Powder",
  "brand": "Keynature",
  "category": "Powders",
  "description": "High-quality medical-grade powder",
  "price": 249.99,
  "stock": 100,
  "rating": 4.5,
  "image_urls": ["https://..."],
  "specs": {
    "Active Ingredient": "Ibuprofen 400mg",
    "Quantity": "100 sachets"
  },
  "tags": ["pain-relief", "medical-grade"]
}
```

**Or programmatically (Node.js script):**

```typescript
// scripts/seed-products.ts
import { createClient } from "@supabase/supabase-js";
import { mockProducts } from "../lib/products";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

async function seed() {
  const { error } = await supabase.from("products").insert(mockProducts);
  if (error) throw error;
  console.log("✅ Seeded", mockProducts.length, "products");
}

seed().catch(console.error);
```

Run: `pnpm tsx scripts/seed-products.ts`

### Step 4: Update API Routes

**Before (using mock data):**

```typescript
// services/products.ts
export async function getProducts() {
  return mockProducts; // Hardcoded
}
```

**After (using Supabase):**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  sortBy?: "price" | "rating" | "newest";
  limit?: number;
}) {
  let query = supabase.from("products").select("*");

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters?.sortBy === "price") {
    query = query.order("price", { ascending: true });
  } else if (filters?.sortBy === "rating") {
    query = query.order("rating", { ascending: false });
  } else if (filters?.sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

### Step 5: Implement Server-Side Cart/Wishlist

**Before (client-side Zustand store):**

```typescript
// store/cartStore.ts
export const useCart = create(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => {
        /* ... */
      },
    }),
    { name: "cart" }
  )
);
```

**After (server + client hybrid):**

Create API routes:

```typescript
// app/api/cart/add/route.ts
export async function POST(req: NextRequest) {
  const { product_id, quantity } = await req.json();
  const session = await getSession(req);

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("user_carts").upsert(
    {
      user_id: session.user.id,
      product_id,
      quantity,
    },
    { onConflict: "user_id,product_id" }
  );

  if (error) throw new AppError(error.message, 400);
  return NextResponse.json({ success: true });
}
```

Client hook:

```typescript
// hooks/useServerCart.ts
export function useServerCart(userId?: string) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchCart = async () => {
      const { data } = await supabase
        .from("user_carts")
        .select("*, product:products(*)")
        .eq("user_id", userId);
      setItems(data);
    };

    fetchCart();
  }, [userId]);

  return { items };
}
```

### Step 6: Update Product Reviews

**Before (mock data in product object):**

```typescript
const mockProducts = [
  {
    reviews: [{ author: "John Doe", rating: 5, comment: "Great product!" }],
  },
];
```

**After (separate table with user reference):**

```typescript
// services/reviews.ts
export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, rating, comment, created_at, user:auth.users(user_metadata)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addReview(
  productId: string,
  userId: string,
  rating: number,
  comment: string
) {
  const { error } = await supabase.from("product_reviews").insert({
    product_id: productId,
    user_id: userId,
    rating,
    comment,
  });

  if (error) throw error;
}
```

### Step 7: Set Up Row Level Security (RLS)

Protect data with RLS policies:

```sql
-- Enable RLS on user_carts
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart
CREATE POLICY cart_user_policy ON user_carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY cart_insert_policy ON user_carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Same for wishlist, reviews, orders
-- See Supabase docs for RLS patterns
```

### Step 8: Test Migration

```bash
# Clear localStorage (simulates fresh user)
# In browser console:
localStorage.clear();

# Reload app
# Should show products from Supabase

# Try adding to cart → should call /api/cart/add
# Check Supabase user_carts table → should have entry

# Place order → order should be in orders table
```

## Gradual Migration Strategy

To avoid breaking existing functionality:

**Phase 1: Read-only**

- Keep client-side cart/wishlist in localStorage
- Read products from Supabase (hybrid: fallback to mock if DB fails)
- No user accounts required yet

**Phase 2: User sync**

- Add login/signup
- Sync localStorage cart to Supabase when user logs in
- New users get empty cart from DB

**Phase 3: Server-side persistence**

- Remove localStorage cart/wishlist
- All cart ops go to server
- Cart data only in Supabase

**Phase 4: Analytics**

- Order history in Supabase
- User reviews and ratings
- Business intelligence queries

## Rollback Plan

If migration fails:

```bash
# Restore backup
supabase db pull-backup
```

**Or revert code:**

```typescript
// services/products.ts
export async function getProducts() {
  // Check env flag
  if (process.env.USE_MOCK_DATA) {
    return mockProducts;
  }
  return supabase.from("products").select("*");
}
```

## Performance Optimization

Once on Supabase:

```sql
-- Add indexes for common queries
CREATE INDEX idx_products_search ON products
  USING GIN (to_tsvector('english', name || ' ' || description));

-- Enable full-text search
SELECT * FROM products
WHERE to_tsvector('english', name) @@ plainto_tsquery('english', 'pain relief');
```

**API Route with caching:**

```typescript
export async function GET(req: NextRequest) {
  const cacheKey = `products:${JSON.stringify(req.nextUrl.searchParams)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const products = await getProducts({...});
  await redis.setex(cacheKey, 3600, products); // Cache 1 hour
  return NextResponse.json(products);
}
```

## Monitoring & Debugging

**Supabase Dashboard:**

- **Logs:** Database query performance, errors
- **Storage:** File uploads for product images
- **Extensions:** Enable pgvector for recommendations (future)

**Application Logs:**

```typescript
logger.info("Product fetched", {
  productId,
  cacheHit: false,
  queryTime: 145, // ms
});
```

## Related Documentation

- [`docs/SETUP.md`](./SETUP.md) for environment setup
- [`docs/AUTH_FLOW.md`](./AUTH_FLOW.md) for user authentication
- Supabase docs: https://supabase.com/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
