"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaSadTear } from "react-icons/fa";

export default function NotFound() {
  console.log("page not found...");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <FaSadTear className="text-6xl text-accent mb-4" />
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-sm text-foreground/70 mb-6">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          href="/"
          className="bg-accent text-background px-5 py-2 rounded-lg font-medium hover:bg-secondary transition"
        >
          Go Back Home
        </Link>
      </motion.div>
    </div>
  );
}
