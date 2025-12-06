"use client";

import type { Product } from "@/types/product";
import Image from "next/image";
import { CartStore } from "@/store/cartStore";
import { WishlistStore } from "@/store/wishlistStore";
import { motion } from "framer-motion";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import StarRating from "@/components/ui/StarRating";
import { useToast } from "@/components/ui/toast";
import { useEffect } from "react";
import { productJsonLd } from "@/lib/seo";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const { addItem: addToCart } = CartStore();
  const { toggleWishlist, isWishlisted } = WishlistStore();
  const { toast } = useToast();

  const inWishlist = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast({
      title: "Added to cart 🛒",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast({
      title: inWishlist ? "Removed from wishlist 💔" : "Added to wishlist ❤️",
      description: inWishlist
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist.`,
    });
  };

  // Inject JSON-LD structured data
  useEffect(() => {
    if (!product) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = productJsonLd(product);
    document.head.appendChild(script);

    // Cleanup: remove the script
    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Image */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-primary rounded-xl p-6 shadow-md"
        >
          <Image
            src={product.image_urls?.[0] || "/5.webp"}
            alt={`${product.name} - ${product.brand}`}
            width={400}
            height={400}
            className="w-full h-auto object-contain rounded-lg"
            priority
          />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {product.name}
          </h1>
          <p className="text-sm text-foreground/70">
            {product.brand} • {product.category}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} />
            <span className="text-sm text-foreground/70">
              {product.rating || 0} / 5
            </span>
          </div>

          {/* Price & Stock */}
          <div className="bg-primary/10 p-4 rounded-lg mb-6">
            <div className="text-2xl font-bold text-accent mb-2">
              ${product.price.toFixed(2)}
            </div>
            <p
              className={`text-sm font-semibold ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : "Out of Stock"}
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-foreground/80 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary/20 text-accent text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Specifications</h2>
              <ul className="space-y-2 text-sm">
                {Object.entries(product.specs).map(([key, value]) => (
                  <li
                    key={key}
                    className="flex justify-between border-b border-foreground/10 pb-2"
                  >
                    <span className="font-medium">{key}</span>
                    <span>{value as string}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-background py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaShoppingCart /> Add to Cart
            </button>

            <button
              onClick={handleWishlist}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold border-2 transition ${
                inWishlist
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : "border-foreground/20 hover:border-accent hover:text-accent"
              }`}
            >
              <FaHeart className={inWishlist ? "fill-current" : ""} />
              {inWishlist ? "Wishlisted" : "Wishlist"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
