"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import CartLink from "@/components/ui/cartLink";
import { useUserSession } from "@/hooks/useUserSession";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUserSession();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully 👋" });
    router.push("/");
  };

  const navLinks = [
    { href: "/categories", label: "Categories" },
    { href: "/wishlist", label: "Wishlist" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur-sm shadow-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-wide hover:text-accent transition-colors"
        >
          keystore
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative px-3 py-2 rounded-lg text-base font-medium transition-all hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-accent origin-left scale-x-0"
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </li>
          ))}

          {/* 🛒 Cart */}
          <li>
            <CartLink />
          </li>

          {/* 👤 Auth CTA */}
          {!loading && (
            <li>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                  >
                    <FaUserCircle className="text-2xl" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-secondary text-background hover:bg-accent transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 rounded-md text-sm font-medium border border-secondary text-secondary hover:bg-secondary hover:text-background transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle menu"
        >
          {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-sm"
          >
            <ul className="flex flex-col items-center py-4 space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              <li>
                <CartLink onClick={() => setIsOpen(false)} />
              </li>

              {/* Auth CTA - mobile */}
              {!loading && (
                <li>
                  {user ? (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="text-red-500 hover:text-red-600 font-medium"
                    >
                      Logout
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-md bg-secondary text-background hover:bg-accent text-center transition"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-md border border-secondary text-secondary hover:bg-secondary hover:text-background text-center transition"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
