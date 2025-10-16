"use client";

import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <FaSpinner className="text-4xl text-accent" />
      </motion.div>
      <p className="mt-4 text-sm text-foreground/70">Loading, please wait...</p>
    </div>
  );
}
