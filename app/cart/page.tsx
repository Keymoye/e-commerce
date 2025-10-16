"use client";

import { CartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";

export default function CartPage() {
  const items = CartStore((s) => s.items);
  const total = CartStore((s) => s.total);
  const removeItem = CartStore((s) => s.removeItem);
  const updateQuantity = CartStore((s) => s.updateQuantity);
  const clear = CartStore((s) => s.clear);

  if (items.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-center text-foreground/80"
      >
        Your cart is empty 🛒
      </motion.div>
    );

  return (
    <section className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          layoutId="cart-title"
          className="text-2xl font-bold tracking-tight"
        >
          Your Cart
        </motion.h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clear}
          aria-label="Clear all items"
          className="text-sm text-background rounded-lg bg-secondary hover:bg-accent transition-colors py-2 px-4 shadow-sm"
        >
          Clear Cart
        </motion.button>
      </div>

      <AnimatePresence>
        <ul className="space-y-4">
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between items-center bg-primary p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-foreground/70">
                  ${item.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="p-1.5 bg-secondary rounded-full hover:bg-accent transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <FaMinus className="text-xs" />
                  </motion.button>

                  <span className="min-w-[24px] text-center font-medium">
                    {item.quantity}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 bg-secondary rounded-full hover:bg-accent transition-colors"
                    aria-label="Increase quantity"
                  >
                    <FaPlus className="text-xs" />
                  </motion.button>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <motion.p layout className="font-semibold text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </motion.p>

                <motion.button
                  whileHover={{ scale: 1.1, color: "#ef4444" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeItem(item.id)}
                  className="text-xs mt-2 transition-colors"
                  aria-label="Remove item"
                >
                  <FaTrash />
                </motion.button>
              </div>
            </motion.li>
          ))}
        </ul>
      </AnimatePresence>

      <motion.div
        layout
        className="mt-8 border-t pt-4 flex justify-between items-center font-bold text-lg"
      >
        <span>Total:</span>
        <motion.span
          key={total}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          ${total.toFixed(2)}
        </motion.span>
      </motion.div>
    </section>
  );
}
