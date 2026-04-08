"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, formatCurrency } from "@/i18n/translations";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Percent, Eye, BarChart3, Building2, Users } from "lucide-react";

interface DashboardStats {
  totalRentThisMonth: number;
  collectedThisMonth: number;
  remainingThisMonth: number;
  allTimeCollected: number;
  totalFeesThisMonth: number;
}

interface AnalyticsStats {
  totalViews: number;
  monthViews: number;
  weekViews: number;
  profileViews: number;
  propertyViews: number;
  topProperties: Array<{ propertyId: string; title: string; slug: string; views: number }>;
  dailyChart: Array<{ date: string; views: number }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const currency = user?.currency || "USD";

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/analytics/stats").then((r) => r.json()).catch(() => null),
    ]).then(([dashData, analyticsData]) => {
      setStats(dashData);
      if (analyticsData && !analyticsData.error) setAnalytics(analyticsData);
      setLoading(false);
    }).catch(() => setLoading(false));
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

      {/* Analytics Section */}
      {analytics && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            {t(locale, "analytics")}
          </h2>

          {/* Analytics stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{t(locale, "totalViews")}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{analytics.totalViews}</p>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{t(locale, "viewsThisMonth")}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{analytics.monthViews}</p>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{t(locale, "profileViews")}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{analytics.profileViews}</p>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{t(locale, "propertyViews")}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{analytics.propertyViews}</p>
            </div>
          </div>

          {/* Mini chart - last 30 days bar chart */}
          {analytics.dailyChart && analytics.dailyChart.some((d) => d.views > 0) && (
            <div className="bg-white rounded-xl border p-6 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">{t(locale, "viewsThisMonth")}</h3>
              <div className="flex items-end gap-[2px] h-24">
                {analytics.dailyChart.map((day, i) => {
                  const maxViews = Math.max(...analytics.dailyChart.map((d) => d.views), 1);
                  const height = (day.views / maxViews) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-amber-200 hover:bg-amber-400 transition-colors rounded-t relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.date}: ${day.views} ${t(locale, "views")}`}
                    >
                      <div className="absolute -top-8 start-1/2 -translate-x-1/2 bg-stone-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {day.views}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                <span>{analytics.dailyChart[0]?.date?.slice(5)}</span>
                <span>{analytics.dailyChart[analytics.dailyChart.length - 1]?.date?.slice(5)}</span>
              </div>
            </div>
          )}

          {/* Top Properties */}
          {analytics.topProperties.length > 0 && (
            <div className="bg-white rounded-xl border">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-800">{t(locale, "topProperties")}</h3>
              </div>
              <div className="divide-y">
                {analytics.topProperties.map((prop, i) => (
                  <div key={prop.propertyId} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{prop.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {prop.views} {t(locale, "views")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analytics.totalViews === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">{t(locale, "noViewsYet")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
