"use client";

import { useSession } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import { t, type Locale } from "@/i18n/translations";

export default function PausedBanner() {
  const { data: session } = useSession();

  const user = session?.user as any;
  const subscriptionStatus = user?.subscriptionStatus;
  const locale: Locale = user?.locale || "ar";

  if (subscriptionStatus !== "paused") return null;

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="bg-amber-50 border-b border-amber-200 px-4 py-3"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm font-medium text-amber-800">
          {t(locale, "accountPausedNotice")}
        </p>
      </div>
    </div>
  );
}
