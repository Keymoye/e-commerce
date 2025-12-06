// scripts/seed-products.ts
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // <-- FORCE LOAD THIS FILE

import { createClient } from "@supabase/supabase-js";

// 1️⃣ Setup Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
console.log("Loaded URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "Loaded Service Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 6)
);

// 2️⃣ Define categories and related image keywords
const categories = [
  { name: "Electronics", keywords: ["smartphone", "laptop", "headphones"] },
  { name: "Cosmetics", keywords: ["lipstick", "skincare", "perfume"] },
  { name: "Clothing", keywords: ["shirt", "jacket", "shoes"] },
];

// 3️⃣ Function to generate a realistic image URL
function generateProductImage(categoryName: string) {
  const cat = categories.find((c) => c.name === categoryName);
  const keyword = faker.helpers.arrayElement(cat?.keywords || ["product"]);
  const randomSeed = faker.number.int({ min: 1, max: 1000 });
  return `https://source.unsplash.com/400x400/?${keyword}&sig=${randomSeed}`;
}

// 4️⃣ Generate mock products
function generateMockProducts(count: number) {
  return Array.from({ length: count }).map(() => {
    const category = faker.helpers.arrayElement(categories.map((c) => c.name));
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      brand: faker.company.name(),
      category,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
      stock: faker.number.int({ min: 0, max: 100 }),
      rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
      image_urls: [generateProductImage(category)],
      tags: faker.helpers.arrayElements(
        ["sale", "new", "popular", "eco", "trending"],
        2
      ),
      specs: {
        weight: `${faker.number.int({ min: 100, max: 1000 })}g`,
        color: faker.color.human(),
      },
    };
  });
}

// 5️⃣ Insert products into Supabase
async function seed() {
  const mockProducts = generateMockProducts(50); // Generate 50 products
  const { error } = await supabase.from("products").insert(mockProducts);
  if (error) throw error;
  console.log("✅ Seeded", mockProducts.length, "products into Supabase!");
}

// Run
seed().catch((err) => console.error(err));
