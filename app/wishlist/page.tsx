"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaTrash, FaShoppingCart, FaHeartBroken } from "react-icons/fa";
import { WishlistStore } from "@/store/wishlistStore";
import { CartStore } from "@/store/cartStore";

export default function WishlistPage() {
  const items = WishlistStore((s) => s.items);
  const removeItem = WishlistStore((s) => s.removeItem);
  const clear = WishlistStore((s) => s.clear);

  const addToCart = CartStore((s) => s.addItem);

  if (items.length === 0)
    return (
      <div className="p-6 text-center">
        <FaHeartBroken className="text-4xl text-accent mx-auto mb-3" />
        <p className="text-lg font-semibold text-foreground/70">
          Your wishlist is empty 💔
        </p>
        <Link
          href="/"
          className="mt-4 inline-block bg-secondary text-background px-4 py-2 rounded-lg hover:bg-accent transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );

  return (
    <section className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Wishlist</h2>
        <button
          onClick={clear}
          aria-label="Clear wishlist"
          className="text-sm bg-secondary text-background px-3 py-2 rounded-lg hover:bg-accent transition"
        >
          Clear All
        </button>
      </div>

      <AnimatePresence>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="bg-primary rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative w-full">
                <Image
                  src={item.image_urls || "/5.webp"}
                  alt={item.name}
                  width={240}
                  height={200}
                  className="object-contain w-full h-48 rounded-lg"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2 right-2 bg-accent p-2 rounded-full text-background hover:bg-red-500 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="mt-3 text-center flex-1">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-foreground/70 mt-1 line-clamp-2">
                  {item.description}
                </p>
                <p className="mt-2 text-sm font-bold text-accent">
                  ${item.price.toFixed(2)}
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item, 1)}
                className="mt-4 flex items-center justify-center gap-2 w-full bg-secondary text-background py-2 rounded-lg hover:bg-accent transition"
              >
                <FaShoppingCart />
                Add to Cart
              </motion.button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </section>
  );
}
