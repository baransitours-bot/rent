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
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
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
    { label: t(locale, "totalRentThisMonth"), value: formatCurrency(s.totalRentThisMonth, currency), icon: DollarSign, bg: "bg-blue-50", fg: "text-blue-600" },
    { label: t(locale, "collectedThisMonth"), value: formatCurrency(s.collectedThisMonth, currency), icon: TrendingUp, bg: "bg-emerald-50", fg: "text-emerald-600" },
    { label: t(locale, "remainingThisMonth"), value: formatCurrency(s.remainingThisMonth, currency), icon: TrendingDown, bg: "bg-amber-50", fg: "text-amber-600" },
    { label: t(locale, "allTimeCollected"), value: formatCurrency(s.allTimeCollected, currency), icon: Wallet, bg: "bg-violet-50", fg: "text-violet-600" },
    { label: t(locale, "totalFeesThisMonth"), value: formatCurrency(s.totalFeesThisMonth, currency), icon: Percent, bg: "bg-indigo-50", fg: "text-indigo-600" },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-900 mb-5">{t(locale, "dashboard")}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {widgets.map((w, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] text-zinc-400 font-medium">{w.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${w.bg}`}>
                <w.icon className={`w-3.5 h-3.5 ${w.fg}`} />
              </div>
            </div>
            <p className="text-lg font-semibold text-zinc-900">{w.value}</p>
          </div>
        ))}
      </div>

      {/* Collection progress */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] font-medium text-zinc-600">
            {t(locale, "collected")} vs {t(locale, "remaining")}
          </span>
          <span className="text-[13px] font-semibold text-zinc-900">{collectionPercent}%</span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${collectionPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-zinc-400">
          <span>{t(locale, "collected")}: {formatCurrency(s.collectedThisMonth, currency)}</span>
          <span>{t(locale, "remaining")}: {formatCurrency(s.remainingThisMonth, currency)}</span>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            {t(locale, "analytics")}
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: t(locale, "totalViews"), value: analytics.totalViews, icon: Eye, bg: "bg-amber-50", fg: "text-amber-600" },
              { label: t(locale, "viewsThisMonth"), value: analytics.monthViews, icon: BarChart3, bg: "bg-blue-50", fg: "text-blue-600" },
              { label: t(locale, "profileViews"), value: analytics.profileViews, icon: Users, bg: "bg-emerald-50", fg: "text-emerald-600" },
              { label: t(locale, "propertyViews"), value: analytics.propertyViews, icon: Building2, bg: "bg-violet-50", fg: "text-violet-600" },
            ].map((w, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] text-zinc-400 font-medium">{w.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${w.bg}`}>
                    <w.icon className={`w-3.5 h-3.5 ${w.fg}`} />
                  </div>
                </div>
                <p className="text-lg font-semibold text-zinc-900">{w.value}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          {analytics.dailyChart && analytics.dailyChart.some((d) => d.views > 0) && (
            <div className="card p-5 mb-4">
              <h3 className="text-[13px] font-medium text-zinc-600 mb-3">{t(locale, "viewsThisMonth")}</h3>
              <div className="flex items-end gap-[2px] h-20">
                {analytics.dailyChart.map((day, i) => {
                  const maxViews = Math.max(...analytics.dailyChart.map((d) => d.views), 1);
                  const height = (day.views / maxViews) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-zinc-200 hover:bg-zinc-400 transition-colors rounded-t relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.date}: ${day.views}`}
                    >
                      <div className="absolute -top-7 start-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {day.views}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-zinc-400">
                <span>{analytics.dailyChart[0]?.date?.slice(5)}</span>
                <span>{analytics.dailyChart[analytics.dailyChart.length - 1]?.date?.slice(5)}</span>
              </div>
            </div>
          )}

          {/* Top Properties */}
          {analytics.topProperties.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100">
                <h3 className="text-[13px] font-medium text-zinc-700">{t(locale, "topProperties")}</h3>
              </div>
              <div className="divide-y divide-zinc-50">
                {analytics.topProperties.map((prop, i) => (
                  <div key={prop.propertyId} className="px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-semibold text-zinc-300 w-4">{i + 1}</span>
                      <span className="text-[13px] font-medium text-zinc-800">{prop.title}</span>
                    </div>
                    <span className="text-[12px] text-zinc-400">
                      {prop.views} {t(locale, "views")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analytics.totalViews === 0 && (
            <div className="text-center py-10 card">
              <Eye className="w-10 h-10 mx-auto mb-2 text-zinc-200" />
              <p className="text-zinc-400 text-[13px]">{t(locale, "noViewsYet")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
