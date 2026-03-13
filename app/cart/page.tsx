"use client";

import { useCart } from "@/hooks/cart/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUIStore } from '@/store/uiStore';
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

function CartFallback() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center my-8">
      <p className="font-medium text-red-700">Failed to load cart.</p>
      <p className="text-sm text-red-500 mt-1">Please refresh the page to try again.</p>
    </div>
  );
}

export default function CartPage() {
  const {
    items,
    total,
    handleIncrease,
    handleDecrease,
    handleRemove,
    handleClear,
  } = useCart();
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);

  const handleCheckout = () => {
    if (items.length === 0) {
      showToast({ type: 'warning', message: 'Cart is empty 🛒 Add items before proceeding to checkout.' });
      return;
    }

    showToast({ type: 'info', message: 'Redirecting to Checkout... Please wait while we prepare your order.' });

    setTimeout(() => router.push("/checkout"), 800);
  };

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
    <ErrorBoundary fallback={<CartFallback />}>
      <section className="p-6 max-w-3xl mx-auto">
      {/* Header */}
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
          onClick={handleClear}
          aria-label="Clear all items"
          className="text-sm text-background rounded-lg bg-secondary hover:bg-accent transition-colors py-2 px-4 shadow-sm"
        >
          Clear Cart
        </motion.button>
      </div>

      {/* Cart Items */}
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
                    onClick={() => handleDecrease(item.id)}
                    className="p-1.5 bg-secondary rounded-full hover:bg-accent transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <FaMinus className="text-xs" />
                  </motion.button>

                  <span className="min-w-6 text-center font-medium">
                    {item.quantity}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleIncrease(item.id)}
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
                  onClick={() => handleRemove(item.id)}
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

      {/* Total & Checkout */}
      <motion.div
        layout
        className="mt-8 border-t pt-4 flex flex-col sm:flex-row justify-between items-center font-bold text-lg gap-4"
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheckout}
          className="bg-secondary hover:bg-accent text-background font-semibold py-2 px-6 rounded-lg transition"
        >
          Proceed to Checkout →
        </motion.button>
      </motion.div>
    </section>
    </ErrorBoundary>
  );
}
