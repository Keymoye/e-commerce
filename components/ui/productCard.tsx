"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { WishlistStore } from "@/store/wishlistStore";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import StarRating from "@/components/ui/StarRating";
import CartButton from "@/components/ui/CartButton";
import { useToast } from "@/components/ui/toast";

export default function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = WishlistStore();
  const { toast } = useToast();

  const handleWishlist = () => {
    const currentlyWishlisted = isWishlisted(product.id);
    toggleWishlist(product);

    toast({
      title: currentlyWishlisted ? "Removed 💔" : "Saved ❤️",
      description: currentlyWishlisted
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist.`,
    });
  };

  const inWishlist = isWishlisted(product.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
      className="p-4 bg-primary rounded-2xl shadow-sm flex flex-col items-stretch transition-all duration-300"
    >
      {/* IMAGE + WISHLIST */}
      <div className="relative overflow-hidden rounded-lg">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Image
            src="/5.webp"
            alt={product.name}
            width={320}
            height={240}
            className="object-contain w-full h-48 rounded-lg"
          />
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ rotate: 10 }}
          onClick={handleWishlist}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 p-2 rounded-full bg-accent transition-colors ${
            inWishlist ? "ring-2 ring-red-400" : ""
          }`}
        >
          <motion.div
            animate={{ scale: inWishlist ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaHeart
              className={`text-lg ${
                inWishlist ? "text-red-500" : "text-foreground"
              }`}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mt-3 flex-1">
        <h3 className="text-sm font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-xs text-foreground/70">
          {product.brand} • {product.category}
        </p>
        <p className="mt-2 text-sm line-clamp-2">{product.description}</p>
      </div>

      {/* PRICE + RATING */}
      <div className="mt-3 flex items-center justify-between">
        <StarRating rating={product.rating} />
        <div className="px-4 text-right">
          <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
          <div className="text-xs text-accent">Stock: {product.stock}</div>
        </div>
      </div>

      {/* TAGS */}
      {product.tags && product.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <motion.span
              whileHover={{ scale: 1.1 }}
              key={tag}
              className="px-2 py-1 text-xs bg-secondary/20 text-accent rounded-full transition-transform"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
      )}

      {/* CART BUTTON */}
      <div className="mt-3">
        <CartButton />
      </div>
    </motion.article>
  );
}
