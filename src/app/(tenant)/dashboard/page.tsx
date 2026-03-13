"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, formatCurrency } from "@/i18n/translations";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Percent } from "lucide-react";

interface DashboardStats {
  totalRentThisMonth: number;
  collectedThisMonth: number;
  remainingThisMonth: number;
  allTimeCollected: number;
  totalFeesThisMonth: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const currency = user?.currency || "USD";

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const s = stats || {
    totalRentThisMonth: 0,
    collectedThisMonth: 0,
    remainingThisMonth: 0,
    allTimeCollected: 0,
    totalFeesThisMonth: 0,
  };

  const collectionPercent =
    s.totalRentThisMonth > 0
      ? Math.round((s.collectedThisMonth / s.totalRentThisMonth) * 100)
      : 0;

  const widgets = [
    {
      label: t(locale, "totalRentThisMonth"),
      value: formatCurrency(s.totalRentThisMonth, currency),
      icon: DollarSign,
      color: "blue",
    },
    {
      label: t(locale, "collectedThisMonth"),
      value: formatCurrency(s.collectedThisMonth, currency),
      icon: TrendingUp,
      color: "green",
    },
    {
      label: t(locale, "remainingThisMonth"),
      value: formatCurrency(s.remainingThisMonth, currency),
      icon: TrendingDown,
      color: "amber",
    },
    {
      label: t(locale, "allTimeCollected"),
      value: formatCurrency(s.allTimeCollected, currency),
      icon: Wallet,
      color: "purple",
    },
    {
      label: t(locale, "totalFeesThisMonth"),
      value: formatCurrency(s.totalFeesThisMonth, currency),
      icon: Percent,
      color: "indigo",
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, "dashboard")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {widgets.map((w, i) => (
          <div key={i} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{w.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[w.color]}`}>
                <w.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{w.value}</p>
          </div>
        ))}
      </div>

      {/* Collection progress bar */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            {t(locale, "collected")} vs {t(locale, "remaining")}
          </span>
          <span className="text-sm font-bold text-gray-900">{collectionPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${collectionPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>
            {t(locale, "collected")}: {formatCurrency(s.collectedThisMonth, currency)}
          </span>
          <span>
            {t(locale, "remaining")}: {formatCurrency(s.remainingThisMonth, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
