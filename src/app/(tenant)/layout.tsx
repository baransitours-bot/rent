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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

function TenantLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
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

  // Bottom nav shows first 5 items on mobile
  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#fafafa] text-zinc-900">
      {/* Paused banner */}
      {isPaused && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-800 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {t(locale, "accountPausedNotice")}
        </div>
      )}

      <div className="flex min-h-screen">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex w-60 bg-white border-e border-zinc-100 flex-col sticky top-0 h-screen">
          {/* Logo area */}
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{t(locale, "appName")}</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-zinc-100">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
              {t(locale, "logout")}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-h-screen pb-20 lg:pb-0">
          {/* Mobile top bar */}
          <div className="lg:hidden glass sticky top-0 z-30 border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-zinc-900">{user?.name}</span>
            </div>
            <Link href="/settings" className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-4 lg:p-8 max-w-6xl mx-auto animate-fade-up">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-100 bottom-nav">
        <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[3.5rem] transition-all",
                  isActive
                    ? "text-zinc-900"
                    : "text-zinc-400"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive && "text-zinc-900")} />
                <span className={clsx("text-[10px] font-medium", isActive ? "text-zinc-900" : "text-zinc-400")}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-zinc-900 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
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
