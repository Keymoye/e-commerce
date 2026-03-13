# Database Migration Guide

## Overview
This guide walks you through migrating your e-commerce platform to the production-ready database schema with proper RLS policies, multi-currency support, and East African market considerations.

## Prerequisites
- Supabase project created and configured
- Environment variables set in `.env.local`
- Supabase CLI installed and linked to your project

## Installation
```bash
# Install Supabase CLI (already done)
pnpm add -D supabase

# Link to your project (run once)
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# Alternative: Use local types before project setup
npx supabase gen types typescript --local > types/supabase.types.ts
```

## CLI Setup Issues?
If `pnpm db:types` fails, see `SUPABASE_CLI_SETUP.md` for detailed troubleshooting.

## Migration Execution Order

Run these SQL files in the Supabase SQL Editor **in the exact order below**. Each file depends on the previous one. If any file fails, fix it before proceeding — do not skip.

| Order | File | Notes |
|-------|------|-------|
| 1 | `00_extensions.sql` | Must run first — creates ENUMs used by all tables |
| 2 | `01_categories.sql` | No dependencies |
| 3 | `02_products.sql` | Depends on categories |
| 4 | `03_product_variants.sql` | Depends on products |
| 5 | `04_product_images.sql` | Depends on products |
| 6 | `05_user_profiles.sql` | Depends on auth.users (built-in) |
| 7 | `06_addresses.sql` | Depends on auth.users |
| 8 | `07_orders.sql` | Depends on auth.users |
| 9 | `08_order_items.sql` | Depends on orders, products, product_variants |
| 10 | `09_payments.sql` | Depends on orders, auth.users |
| 11 | `10_cart_items.sql` | Depends on auth.users, products, product_variants |
| 12 | `11_reviews.sql` | Depends on products, auth.users |
| 13 | `12_enable_rls.sql` | Enable RLS on all tables — run after all tables exist |
| 14 | `13a_catalogue_rls.sql` | Catalogue policies |
| 15 | `13b_user_rls.sql` | User data policies |
| 16 | `13c_orders_rls.sql` | Orders and payments policies |
| 17 | `13d_cart_reviews_rls.sql` | Cart and reviews policies |

## Post-Migration Steps

### 1. Regenerate TypeScript Types
```bash
# After all migrations are complete
pnpm db:types
```

### 2. Update Application Code
The product types have already been updated in `types/product.ts` to match the new schema.

### 3. Seed Test Data
```bash
# Run the updated seed script
pnpm tsx scripts/seed-products.ts
```

### 4. Verify TypeScript Compilation
```bash
pnpm tsc --noEmit
# Should show zero errors
```

## Key Schema Changes

### Currency Handling
- All monetary values stored as integer subunits (cents)
- KES: 100 = KES 1.00, USD: 100 = $1.00
- Divide by 100 in application layer for display

### Product Structure
- `products` table now has proper foreign key to `categories`
- `product_images` replaces the `image_urls[]` array
- `product_variants` supports full variant functionality
- Full-text search vector for better search performance

### User Management
- `user_profiles` auto-created on signup via trigger
- Proper address management with East African format
- Row Level Security ensures users only see their own data

### Order Management
- Complete order lifecycle with proper status tracking
- Order snapshots preserve data at time of purchase
- Support for both M-Pesa and Stripe payments

### Security
- RLS enabled on all tables
- Proper admin role management
- Service role bypasses RLS for server-side operations

## Testing the Migration

1. **Create a test user** via the signup flow
2. **Verify profile creation** in `user_profiles` table
3. **Add products to cart** and check `cart_items` table
4. **Place a test order** and verify all related tables
5. **Check RLS policies** by querying as different user roles

## Troubleshooting

### Common Issues
- **Migration fails**: Check that previous migrations completed successfully
- **RLS issues**: Verify policies are created after tables exist
- **Type errors**: Run `pnpm db:types` after schema changes
- **Seed script fails**: Ensure categories were created successfully

### Getting Help
- Check Supabase logs for detailed error messages
- Verify environment variables are correctly set
- Ensure Supabase CLI is properly linked to your project

## Production Considerations

1. **Backup**: Create a database backup before migration
2. **Downtime**: Plan for minimal downtime during migration
3. **Testing**: Test thoroughly in staging before production
4. **Monitoring**: Set up monitoring for database performance
5. **Security**: Review RLS policies match your security requirements

## Next Steps

After migration:
1. Update API endpoints to use new schema
2. Implement M-Pesa and Stripe payment integrations
3. Add product variant management UI
4. Implement proper order management system
5. Set up analytics and reporting

---

**Important**: Never skip migrations in the sequence. Each file builds upon the previous ones, and skipping can cause data integrity issues.
