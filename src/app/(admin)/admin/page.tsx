"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { Users, UserCheck, Clock, UserX } from "lucide-react";

interface AdminStats {
  totalTenants: number;
  activeTenants: number;
  expiringCount: number;
  expiringTenants: Array<{ id: string; name: string; email: string; subscriptionExpiryDate: string }>;
  suspendedAndPaused: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  useEffect(() => {
    fetch("/api/admin/dashboard").then((r) => r.json()).then((data) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats || { totalTenants: 0, activeTenants: 0, expiringCount: 0, expiringTenants: [], suspendedAndPaused: 0 };

  const widgets = [
    { label: t(locale, "totalTenants"), value: s.totalTenants, icon: Users, bg: "bg-blue-50", fg: "text-blue-600" },
    { label: t(locale, "activeTenants"), value: s.activeTenants, icon: UserCheck, bg: "bg-emerald-50", fg: "text-emerald-600" },
    { label: t(locale, "expiringIn30Days"), value: s.expiringCount, icon: Clock, bg: "bg-amber-50", fg: "text-amber-600" },
    { label: t(locale, "suspendedAndPaused"), value: s.suspendedAndPaused, icon: UserX, bg: "bg-red-50", fg: "text-red-600" },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-900 mb-5">{t(locale, "adminDashboard")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {widgets.map((w, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] text-zinc-400 font-medium">{w.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${w.bg}`}>
                <w.icon className={`w-3.5 h-3.5 ${w.fg}`} />
              </div>
            </div>
            <p className="text-xl font-semibold text-zinc-900">{w.value}</p>
          </div>
        ))}
      </div>

      {s.expiringTenants.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h3 className="text-[13px] font-medium text-zinc-700">{t(locale, "expiringIn30Days")}</h3>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "name")}</th>
                  <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "email")}</th>
                  <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "subscriptionExpiry")}</th>
                </tr>
              </thead>
              <tbody>
                {s.expiringTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="p-3 font-medium text-zinc-900">{tenant.name}</td>
                    <td className="p-3 text-zinc-500">{tenant.email}</td>
                    <td className="p-3 text-zinc-500">{tenant.subscriptionExpiryDate ? new Date(tenant.subscriptionExpiryDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-zinc-50">
            {s.expiringTenants.map((tenant) => (
              <div key={tenant.id} className="p-3.5">
                <p className="font-medium text-[13px] text-zinc-900">{tenant.name}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{tenant.email} · {tenant.subscriptionExpiryDate ? new Date(tenant.subscriptionExpiryDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
