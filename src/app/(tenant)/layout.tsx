"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import {
  LayoutDashboard,
  Building2,
  Key,
  Clock,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

function TenantLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const isRTL = locale === "ar";
  const isPaused = user?.subscriptionStatus === "paused";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/admin");
    } else if (user?.subscriptionStatus === "expired") {
      router.push("/expired");
    }
  }, [status, user, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  const navItems = [
    { href: "/dashboard", label: t(locale, "dashboard"), icon: LayoutDashboard },
    { href: "/properties", label: t(locale, "properties"), icon: Building2 },
    { href: "/rentals", label: t(locale, "rentals"), icon: Key },
    { href: "/history", label: t(locale, "history"), icon: Clock },
    { href: "/inquiries", label: t(locale, "inquiries"), icon: MessageCircle },
    { href: "/settings", label: t(locale, "settings"), icon: Settings },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 text-gray-900">
      {isPaused && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 py-2.5 text-amber-800 text-sm flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {t(locale, "accountPausedNotice")}
        </div>
      )}

      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-bold text-gray-800">{t(locale, "appName")}</span>
        <div className="w-6" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed lg:sticky top-0 h-screen w-64 bg-white border-e border-gray-200 shadow-sm z-40 flex flex-col transition-transform lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
          )}
        >
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{t(locale, "appName")}</h2>
                <p className="text-xs text-gray-500">{user?.name}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t(locale, "logout")}
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TenantLayoutInner>{children}</TenantLayoutInner>
    </SessionProvider>
  );
}
