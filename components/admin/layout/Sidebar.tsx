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
    <nav aria-label="Admin navigation" className="h-full p-4 space-y-2 bg-card border-r border-border">
      <h1 className="text-lg font-semibold mb-6 text-foreground">Admin</h1>

      {navItems.map(({ href, label, icon: Icon, comingSoon }) => {
        const isActive = pathname === href;
        
        if (comingSoon) {
          return (
            <div
              key={href}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
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
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent'
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
