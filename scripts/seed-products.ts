// scripts/seed-products.ts — updated for new schema
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Cosmetics',   slug: 'cosmetics'   },
  { name: 'Clothing',    slug: 'clothing'    },
];

async function seed() {
  // 1. Insert categories
  const { data: cats } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug' })
    .select();
  if (!cats?.length) throw new Error('Categories insert failed');

  // 2. Insert products
  const products = Array.from({ length: 50 }).map(() => {
    const cat = faker.helpers.arrayElement(cats);
    const name = faker.commerce.productName();
    return {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + faker.string.alphanumeric(4),
      brand: faker.company.name(),
      category_id: cat.id,
      description: faker.commerce.productDescription(),
      base_price_kes: Math.round(parseFloat(faker.commerce.price({ min: 1000, max: 50000 })) * 100),
      stock: faker.number.int({ min: 0, max: 100 }),
      tags: faker.helpers.arrayElements(['sale','new','popular','eco','trending'], 2),
      specs: { weight: faker.number.int({ min: 100, max: 1000 }) + 'g', color: faker.color.human() },
    };
  });

  const { data: insertedProducts, error } = await supabase.from('products').insert(products).select();
  if (error) throw error;

  // 3. Insert primary images
  const images = insertedProducts!.map(p => ({
    product_id: p.id,
    url: `https://source.unsplash.com/400x400/?product&sig=${faker.number.int({ min: 1, max: 9999 })}`,
    is_primary: true,
    sort_order: 0,
  }));
  await supabase.from('product_images').insert(images);

  console.log(`Seeded ${insertedProducts!.length} products`);
}

seed().catch((err) => console.error(err));
