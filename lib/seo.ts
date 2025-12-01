import { Metadata } from "next";
import { Product } from "@/types/product";

export function productMetadata(product: Product): Metadata {
  const title = `${product.name} | Keystore`;
  const description = `Buy ${product.name} by ${product.brand} - $${product.price.toFixed(
    2
  )}. Rating: ${product.rating}/5. ${product.description}`;
  const url = `https://${process.env.NEXT_PUBLIC_SITE_URL || "localhost:3000"}/products/${product.id}`;

  return {
    title,
    description,
    keywords: [product.category, product.brand, ...product.tags],
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [
        {
          url: product.image_urls || "/5.webp",
          width: 400,
          height: 400,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image_urls || "/5.webp"],
    },
  };
}

export function categoriesMetadata(): Metadata {
  return {
    title: "Shop by Category | Keystore",
    description: "Browse products by category. Find exactly what you need.",
    keywords: ["categories", "shop", "products"],
    openGraph: {
      type: "website",
      title: "Shop by Category | Keystore",
      description: "Browse products by category.",
    },
  };
}

export function homeMetadata(): Metadata {
  return {
    title: "Keystore - Premium Health & Wellness Products",
    description:
      "Discover high-quality health and wellness products. Fast shipping, best prices, trusted brands.",
    keywords: ["health", "wellness", "pharmacy", "pain relief", "products"],
    openGraph: {
      type: "website",
      title: "Keystore - Premium Health & Wellness Products",
      description:
        "Discover high-quality health and wellness products. Fast shipping, best prices, trusted brands.",
      images: [
        {
          url: `https://${process.env.NEXT_PUBLIC_SITE_URL || "localhost:3000"}/5.webp`,
          width: 1200,
          height: 630,
          alt: "Keystore",
        },
      ],
    },
  };
}

/**
 * Generate JSON-LD structured data for products
 */
export function productJsonLd(product: Product): string {
  return JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.image_urls || "/5.webp",
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `https://${process.env.NEXT_PUBLIC_SITE_URL || "localhost:3000"}/products/${product.id}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "InStock" : "OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      ratingCount: 1,
    },
  });
}
