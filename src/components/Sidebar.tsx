"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  Building2,
  Key,
  Clock,
  Settings,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { t, type Locale } from "@/i18n/translations";

interface NavItem {
  href: string;
  labelKey: "dashboard" | "properties" | "rentals" | "history" | "settings" | "admin" | "tenantManagement";
  icon: React.ElementType;
}

const tenantNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/properties", labelKey: "properties", icon: Building2 },
  { href: "/rentals", labelKey: "rentals", icon: Key },
  { href: "/history", labelKey: "history", icon: Clock },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin", labelKey: "admin", icon: Shield },
  { href: "/admin/tenants", labelKey: "tenantManagement", icon: Users },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const locale: Locale = (session?.user as any)?.locale || "ar";
  const role = (session?.user as any)?.role;
  const isRtl = locale === "ar";
  const navItems = role === "admin" ? adminNav : tenantNav;

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* App name */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-200">
        <Building2 className="h-6 w-6 text-blue-600 shrink-0" />
        <span className="text-lg font-bold text-gray-900 truncate">
          {t(locale, "appName")}
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={clsx("h-5 w-5 shrink-0", active ? "text-blue-700" : "text-gray-400")} />
              <span>{t(locale, item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0 text-gray-400" />
          <span>{t(locale, "logout")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 start-3 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 z-50 w-64 bg-white border-e border-gray-200 transform transition-transform duration-200 md:hidden",
          isRtl ? "right-0" : "left-0",
          mobileOpen
            ? "translate-x-0"
            : isRtl
              ? "translate-x-full"
              : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 end-3 p-1 rounded-md hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:start-0 md:w-64 bg-white border-e border-gray-200">
        {sidebarContent}
      </aside>
    </div>
  );
}
