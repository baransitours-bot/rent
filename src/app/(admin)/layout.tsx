"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const isRTL = locale === "ar";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, user, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session || user?.role !== "admin") return null;

  const navItems = [
    { href: "/admin", label: t(locale, "adminDashboard"), icon: LayoutDashboard },
    { href: "/admin/tenants", label: t(locale, "tenantManagement"), icon: Users },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      <div className="lg:hidden flex items-center justify-between bg-white border-b px-4 py-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-bold text-gray-800">{t(locale, "admin")}</span>
        <div className="w-6" />
      </div>

      <div className="flex">
        <aside
          className={clsx(
            "fixed lg:sticky top-0 h-screen w-64 bg-white border-e shadow-sm z-40 flex flex-col transition-transform lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
          )}
        >
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{t(locale, "admin")}</h2>
                <p className="text-xs text-gray-500">{user?.name}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={() => {
                const { signOut } = require("next-auth/react");
                signOut({ callbackUrl: "/login" });
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
            >
              <LogOut className="w-5 h-5" />
              {t(locale, "logout")}
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-h-screen p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
