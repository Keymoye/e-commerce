"use client";

import Link from "next/link";
import { CartStore } from "@/store/cartStore";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";

interface CartLinkProps {
  onClick?: () => void;
}

export default function CartLink({ onClick }: CartLinkProps) {
  const itemCount = CartStore((s) => s.itemCount);

  return (
    <Link
      href="/cart"
      onClick={onClick}
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium hover:text-accent transition-colors"
    >
      <FaShoppingCart className="text-lg" />
      <span>Cart</span>

      {itemCount > 0 && (
        <motion.span
          key={itemCount}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
        >
          {itemCount}
        </motion.span>
      )}
    </Link>
  );
}
