"use client";

import { signOut, useSession } from "next-auth/react";
import { Building2, AlertTriangle } from "lucide-react";
import { t, type Locale } from "@/i18n/translations";

export default function ExpiredPage() {
  const { data: session } = useSession();
  const locale = ((session?.user as any)?.locale || "ar") as Locale;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t(locale, "subscriptionExpired")}
        </h1>
        <p className="text-gray-500 mb-6">
          {t(locale, "subscriptionExpiredMsg")}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          {t(locale, "logout")}
        </button>
      </div>
    </div>
  );
}
