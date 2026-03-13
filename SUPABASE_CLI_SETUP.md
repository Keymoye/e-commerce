# Supabase CLI Setup Guide

## Problem
The `pnpm db:types` command fails because the Supabase CLI is not properly linked to your project.

## Solution

### 1. Install Supabase CLI (Already Done)
```bash
pnpm add -D supabase
```

### 2. Login to Supabase
```bash
npx supabase login
```
This will open a browser window to authenticate with your Supabase account.

### 3. Link to Your Project
You need your project reference ID. Find it in your Supabase dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Project Reference" (looks like `abcdefghijklmnopqrstuvwxyz`)

Then run:
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Generate Types
After linking, you can generate types:
```bash
pnpm db:types
```

### 5. Alternative: Use Local Schema
If you haven't created the Supabase project yet, you can use the local schema:
```bash
npx supabase gen types typescript --local > types/supabase.types.ts
```

## Current Status

✅ **Temporary types file created** - `types/supabase.types.ts` has been populated with the correct schema types for your new database structure.

✅ **CLI installed** - Supabase CLI is installed as a dev dependency.

🔄 **Next step** - Link to your Supabase project to generate real types.

## What's in the Temporary Types File

The temporary file includes all the new schema types:
- `categories` with hierarchy support
- `products` with new pricing structure (`base_price_kes`)
- `product_variants` with option types
- `product_images` with primary image support
- `user_profiles` with currency preferences
- `addresses` with East African format
- `orders` with multi-currency support
- `payments` with M-Pesa + Stripe fields
- `cart_items` for server-side cart
- `reviews` with rating denormalization

## After Database Migration

Once you run the database migrations in Supabase:
1. Link your project with the CLI
2. Run `pnpm db:types` to replace the temporary file
3. Your TypeScript types will be perfectly synchronized with your database

## Troubleshooting

### "supabase not recognized" Error
This means the CLI isn't in your PATH. Use `npx supabase` instead.

### "Project not linked" Error
Run `npx supabase link --project-ref YOUR_REF` first.

### "Permission denied" Error
Make sure you have the correct permissions on your Supabase project.

## Quick Commands

```bash
# Check if CLI is working
npx supabase --version

# Login (one-time)
npx supabase login

# Link to project (one-time per project)
npx supabase link --project-ref YOUR_PROJECT_REF

# Generate types (after migrations)
pnpm db:types

# Alternative: Local types (before migrations)
npx supabase gen types typescript --local > types/supabase.types.ts
```

The temporary types file will work for development until you're ready to set up the actual Supabase project.
