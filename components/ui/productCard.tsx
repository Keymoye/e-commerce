"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { useCartStore } from "@/hooks/useCartStore";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { FaHeart } from "react-icons/fa";
import StarRating from "@/components/ui/StarRating";
import CartButton from "@/components/ui/CartButton";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const inWishlist = isWishlisted(product.id);

  return (
    <article className="p-4 bg-primary rounded-2xl shadow-sm flex flex-col items-stretch">
      {/* IMAGE + WISHLIST */}
      <div className="relative">
        <Image
          src="/5.webp"
          alt={product.name}
          width={320}
          height={240}
          className="object-contain rounded-lg"
        />
        <button
          onClick={() => toggleWishlist(product)}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 p-2 bg-foreground/80 rounded-full"
        >
          <FaHeart
            className={`transition-colors ${
              inWishlist ? "text-red-500" : "text-foreground"
            }`}
          />
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mt-3 flex-1">
        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="text-xs text-foreground/70">
          {product.brand} • {product.category}
        </p>
        <p className="mt-2 text-sm line-clamp-2">{product.description}</p>
      </div>

      {/* PRICE + RATING */}
      <div className="mt-3 flex items-center justify-between">
        <StarRating rating={product.rating} />
        <div>
          <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
          <div className="text-xs text-accent">Stock: {product.stock}</div>
        </div>
      </div>

      {/* CART BUTTON */}
      <div className="mt-3">
        <CartButton
          productId={product.id}
          onAdd={(qty) => addToCart(product, qty)}
        />
      </div>
    </article>
  );
}
