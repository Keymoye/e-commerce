"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import StarRating from "@/components/ui/StarRating";
import CartButton from "@/components/ui/CartButton";
import { useWishlist } from "@/hooks/wishlist/useWishlist";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, handleToggle } = useWishlist(product);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="p-3 sm:p-4 relative bg-primary rounded-2xl shadow-sm flex flex-col items-stretch min-h-[400px] w-full max-w-[320px] mx-auto"
    >
      {/* IMAGE */}
      <Link
        href={`/products/${product.id}`}
        className="relative w-full"
        aria-label={product.name}
      >
        <div
          className="relative w-full overflow-hidden rounded-lg"
          style={{ aspectRatio: "4/3" }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.25 }}
          >
            <Image
              src={"/5.webp"}
              alt={`${product.name} - ${product.brand}`}
              fill
              style={{ objectFit: "contain" }}
              priority
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </motion.div>
        </div>
      </Link>

      {/* WISHLIST BUTTON */}
      <motion.button
        onClick={handleToggle}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-2 right-2 p-2 rounded-full bg-accent transition-colors ${
          isWishlisted ? "ring-2 ring-red-400" : ""
        }`}
      >
        <FaHeart
          className={isWishlisted ? "text-red-500" : "text-foreground"}
        />
      </motion.button>

      {/* DETAILS */}
      <div className="mt-3 flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold line-clamp-1 break-words">
            {product.name}
          </h3>
          <p className="text-xs text-foreground/70 line-clamp-1 break-words">
            {product.brand} • {product.category}
          </p>
          <p className="mt-1 text-sm line-clamp-2 break-words">
            {product.description}
          </p>
        </Link>
      </div>

      {/* PRICE + RATING */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <StarRating rating={product.rating} />
        <div className="text-right">
          <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
          <div className="text-xs text-accent">Stock: {product.stock}</div>
        </div>
      </div>

      {/* TAGS */}
      {product.tags && product.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 sm:gap-2 min-h-[2rem]">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-secondary/20 text-accent rounded-full truncate"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* CART BUTTON */}
      <div className="mt-2">
        <CartButton product={product} />
      </div>
    </motion.article>
  );
}

export default memo(ProductCard);
