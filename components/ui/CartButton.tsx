"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/hooks/cart/useCart";

export default function CartButton({
  product,
}: {
  product: import("@/types/product").Product;
}) {
  const { handleAdd, handleSub, quantity } = useCart({ product });

  return (
    <div className="flex justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className="flex items-center justify-center gap-2 w-full bg-secondary text-background py-2 rounded-lg font-medium shadow-sm hover:shadow-md hover:bg-accent transition-all duration-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShoppingCart className="text-sm" />
            Add to Cart
          </motion.button>
        ) : (
          <motion.div
            key="quantity"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-4 bg-secondary text-background py-2 px-4 rounded-lg w-full shadow-sm hover:shadow-md transition-all duration-200"
          >
            <motion.button
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSub}
              aria-label="Decrease quantity"
              className="p-1.5 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
            >
              <FaMinus className="text-xs" />
            </motion.button>

            <motion.span
              layout
              aria-live="polite"
              className="font-semibold text-lg tracking-tight"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {quantity}
            </motion.span>

            <motion.button
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAdd}
              aria-label="Increase quantity"
              className="p-1.5 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
            >
              <FaPlus className="text-xs" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
