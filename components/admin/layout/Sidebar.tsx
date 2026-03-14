"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { FaBox } from "react-icons/fa";
import { HiChartBar } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import { FiShoppingCart } from "react-icons/fi";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: MdDashboard },
  { href: "/admin/products", label: "Products", icon: FaBox },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { href: "/admin/analytics", label: "Analytics", icon: HiChartBar, comingSoon: true },
  { href: "/admin/settings", label: "Settings", icon: FiSettings, comingSoon: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="h-full p-4 space-y-2 bg-white border-r border-gray-200">
      <h1 className="text-lg font-semibold mb-6 text-gray-900">Admin</h1>

      {navItems.map(({ href, label, icon: Icon, comingSoon }) => {
        const isActive = pathname === href;
        
        if (comingSoon) {
          return (
            <div
              key={href}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                Coming Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
          >
            <Icon size={18} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
