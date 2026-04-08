"use client";

import { signOut, useSession } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import { t, type Locale } from "@/i18n/translations";

export default function ExpiredPage() {
  const { data: session } = useSession();
  const locale = ((session?.user as any)?.locale || "ar") as Locale;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-sm w-full text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-50 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 mb-2">
          {t(locale, "subscriptionExpired")}
        </h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          {t(locale, "subscriptionExpiredMsg")}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          {t(locale, "logout")}
        </button>
      </div>
    </div>
  );
}
