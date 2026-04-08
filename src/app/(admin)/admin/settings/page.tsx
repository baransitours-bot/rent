"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { CheckCircle, Settings2, BarChart3, Image } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [gaTrackingId, setGaTrackingId] = useState("");
  const [defaultMaxImages, setDefaultMaxImages] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setGaTrackingId(data.gaTrackingId || "");
        setDefaultMaxImages(data.defaultMaxImages || 10);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gaTrackingId, defaultMaxImages }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, "systemSettings")}</h1>

      <div className="max-w-lg space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Google Analytics */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t(locale, "googleAnalytics")}</h3>
                <p className="text-xs text-gray-500">{t(locale, "gaHint")}</p>
              </div>
            </div>
            <input
              type="text"
              value={gaTrackingId}
              onChange={(e) => setGaTrackingId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              dir="ltr"
            />
            <p className="text-xs text-gray-400 mt-2">
              {locale === "ar"
                ? "سيتم تضمين التتبع في جميع الصفحات العامة. يتم إرسال معرف المستأجر والعقار كأبعاد مخصصة."
                : "Tracking will be included on all public pages. Tenant ID and property ID are sent as custom dimensions."}
            </p>
          </div>

          {/* Default Max Images */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Image className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t(locale, "defaultMaxImages")}</h3>
                <p className="text-xs text-gray-500">{t(locale, "defaultMaxImagesHint")}</p>
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="50"
              value={defaultMaxImages}
              onChange={(e) => setDefaultMaxImages(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              {locale === "ar"
                ? "يمكنك تخصيص الحد لكل مستأجر من صفحة إدارة المستأجرين."
                : "You can customize the limit per tenant from the tenant management page."}
            </p>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? "..." : t(locale, "save")}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                {t(locale, "settingsSaved")}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
