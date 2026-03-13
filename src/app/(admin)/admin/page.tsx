"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import clsx from "clsx";

interface AdminStats {
  totalTenants: number;
  activeTenants: number;
  expiringCount: number;
  expiringTenants: Array<{ id: string; name: string; email: string; subscriptionExpiryDate: string }>;
  suspendedAndPaused: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  useEffect(() => {
    fetch("/api/admin/dashboard")
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

  const s = stats || { totalTenants: 0, activeTenants: 0, expiringCount: 0, expiringTenants: [], suspendedAndPaused: 0 };

  const widgets = [
    { label: t(locale, "totalTenants"), value: s.totalTenants, icon: Users, color: "blue" },
    { label: t(locale, "activeTenants"), value: s.activeTenants, icon: UserCheck, color: "green" },
    { label: t(locale, "expiringIn30Days"), value: s.expiringCount, icon: Clock, color: "amber" },
    { label: t(locale, "suspendedAndPaused"), value: s.suspendedAndPaused, icon: UserX, color: "red" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, "adminDashboard")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {widgets.map((w, i) => (
          <div key={i} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{w.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[w.color]}`}>
                <w.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{w.value}</p>
          </div>
        ))}
      </div>

      {/* Expiring tenants list */}
      {s.expiringTenants.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-800">{t(locale, "expiringIn30Days")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "name")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "email")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "subscriptionExpiry")}</th>
                </tr>
              </thead>
              <tbody>
                {s.expiringTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{tenant.name}</td>
                    <td className="p-3 text-gray-500">{tenant.email}</td>
                    <td className="p-3 text-gray-500">
                      {tenant.subscriptionExpiryDate
                        ? new Date(tenant.subscriptionExpiryDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
