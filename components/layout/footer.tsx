import Link from "next/link";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <>
      <footer className="bg-background text-foreground py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo + Intro */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Keystore</h2>
            <p className="text-sm leading-relaxed">
              Delivering trusted pharmaceuticals to improve lives with care,
              quality, and accessibility.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Center */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Help Center</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-accent transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-accent transition">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-accent transition">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-accent transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
            <div className="flex space-x-4 text-2xl">
              <a
                href="#"
                className="hover:text-accent transition"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a
                href="#"
                className="hover:text-accent transition"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="hover:text-accent transition"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                className="hover:text-accent transition"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-10 text-sm border-t border-foreground pt-4">
          © {new Date().getFullYear()} Keystore. All rights reserved.
        </div>
      </footer>
    </>
  );
}
export default Footer;
