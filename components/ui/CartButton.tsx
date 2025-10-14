"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";

type CartButtonProps = {
  productId: string;
  onAdd: (quantity: number) => void;
};

export default function CartButton({ onAdd }: CartButtonProps) {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onAdd(newQty);
  };

  const handleSub = () => {
    const newQty = Math.max(0, quantity - 1);
    setQuantity(newQty);
    if (newQty > 0) onAdd(newQty);
  };

  return (
    <div className="flex justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 w-full bg-secondary text-background py-2 rounded-lg hover:bg-accent transition font-medium"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <FaShoppingCart />
            Add to Cart
          </motion.button>
        ) : (
          <motion.div
            key="quantity"
            className="flex items-center justify-between gap-4 bg-secondary text-background py-2 px-4 rounded-lg w-full shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button onClick={handleSub} className="hover:text-foreground">
              <FaMinus />
            </button>
            <span>{quantity}</span>
            <button onClick={handleAdd} className="hover:text-foreground">
              <FaPlus />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
