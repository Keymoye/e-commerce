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
    <>
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="p-4 bg-primary rounded-2xl shadow-sm flex flex-col items-stretch transition-all duration-300 cursor-pointer"
      >
        {/* IMAGE */}
        <Link href={`/products/${product.id}`}>
          <div className="relative overflow-hidden rounded-lg cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <Image
                src={product.image_urls || "/5.webp"}
                alt={`${product.name} - ${product.brand}`}
                width={320}
                height={240}
                className="object-contain w-full h-48 rounded-lg"
                loading="lazy"
              />
            </motion.div>
          </div>
        </Link>

        {/* WISHLIST BUTTON */}
        <motion.button
          onClick={handleToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 p-2 rounded-full bg-accent ${
            isWishlisted ? "ring-2 ring-red-400" : ""
          }`}
        >
          <FaHeart
            className={isWishlisted ? "text-red-500" : "text-foreground"}
          />
        </motion.button>

        {/* PRODUCT DETAILS */}
        <div className="mt-3 flex-1 cursor-pointer">
          <Link href={`/products/${product.id}`}>
            <h3 className="text-sm font-semibold line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-foreground/70">
              {product.brand} • {product.category}
            </p>
            <p className="mt-2 text-sm line-clamp-2">{product.description}</p>
          </Link>
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
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-secondary/20 text-accent rounded-full transition-transform"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CART BUTTON */}
        <CartButton product={product} />
      </motion.article>
    </>
  );
}

export default memo(ProductCard);
