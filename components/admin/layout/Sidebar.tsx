import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { FaBox } from "react-icons/fa";
import { HiChartBar } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: MdDashboard },
  { href: "/admin/products", label: "Products", icon: FaBox },
  { href: "/admin/analytics", label: "Analytics", icon: HiChartBar },
  { href: "/admin/settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar() {
  return (
    <nav aria-label="Admin navigation" className="h-full p-4 space-y-2">
      <h1 className="text-lg font-semibold mb-6">Admin</h1>

      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                     hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <Icon size={18} aria-hidden />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
