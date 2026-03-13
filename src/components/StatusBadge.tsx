import clsx from "clsx";
import { t, type Locale, type TranslationKey } from "@/i18n/translations";

interface StatusBadgeProps {
  status: string;
  type?: string;
  locale?: Locale;
}

const colorMap: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  available: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  rented: "bg-amber-100 text-amber-700",
  paused: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
  ended: "bg-red-100 text-red-700",
  unpaid: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
  owned: "bg-blue-100 text-blue-700",
  managed: "bg-purple-100 text-purple-700",
};

export default function StatusBadge({ status, type, locale = "ar" }: StatusBadgeProps) {
  const key = type || status;
  const colors = colorMap[key.toLowerCase()] || "bg-gray-100 text-gray-700";

  // Attempt to use the status as a translation key; fall back to raw string
  const translationKey = status.toLowerCase() as TranslationKey;
  const label = t(locale, translationKey);

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors
      )}
    >
      {label}
    </span>
  );
}
