"use client";
import { FiLogOut } from "react-icons/fi";
import { useLogout } from "@/hooks/auth/useLogout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopBar() {
  const { logout } = useLogout();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get user email from localStorage or auth context
    const email = localStorage.getItem('user_email') || 'Admin User';
    setUserEmail(email);
  }, []);

  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length === 1 && pathSegments[0] === 'admin') {
      return 'Dashboard';
    }
    if (pathSegments.length >= 2) {
      const page = pathSegments[1];
      return page.charAt(0).toUpperCase() + page.slice(1);
    }
    return 'Admin';
  };

  return (
    <header
      className="h-14 border-b border-gray-200 px-6 flex items-center justify-between bg-white"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          {userEmail}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-900 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          aria-label="Sign out"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
