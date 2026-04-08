"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { CheckCircle, BarChart3, Image, Upload, X, Palette, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [gaTrackingId, setGaTrackingId] = useState("");
  const [defaultMaxImages, setDefaultMaxImages] = useState(10);

  // SaaS Branding
  const [platformName, setPlatformName] = useState("دارك");
  const [platformNameEn, setPlatformNameEn] = useState("Darak");
  const [platformLogo, setPlatformLogo] = useState("");
  const [platformColor, setPlatformColor] = useState("#b45309");
  const [platformDescription, setPlatformDescription] = useState("");
  const [platformDescriptionEn, setPlatformDescriptionEn] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setGaTrackingId(data.gaTrackingId || "");
        setDefaultMaxImages(data.defaultMaxImages || 10);
        setPlatformName(data.platformName || "دارك");
        setPlatformNameEn(data.platformNameEn || "Darak");
        setPlatformLogo(data.platformLogo || "");
        setPlatformColor(data.platformColor || "#b45309");
        setPlatformDescription(data.platformDescription || "");
        setPlatformDescriptionEn(data.platformDescriptionEn || "");
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
      body: JSON.stringify({
        gaTrackingId,
        defaultMaxImages,
        platformName,
        platformNameEn,
        platformLogo,
        platformColor,
        platformDescription,
        platformDescriptionEn,
      }),
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

  const txt = locale === "ar" ? {
    saasBranding: "هوية المنصة",
    saasBrandingHint: "تحكم في اسم وشعار ولون المنصة الذي يظهر في جميع الصفحات العامة وصفحة الدخول",
    platformNameAr: "اسم المنصة (عربي)",
    platformNameEn: "اسم المنصة (إنجليزي)",
    platformLogo: "شعار المنصة",
    platformLogoHint: "ارفع شعار المنصة (يظهر في الهيدر والفوتر والصفحة الرئيسية)",
    platformColor: "اللون الرئيسي للمنصة",
    platformColorHint: "يستخدم في الأزرار والعناوين والعلامات البارزة",
    platformDescAr: "وصف المنصة (عربي)",
    platformDescEn: "وصف المنصة (إنجليزي)",
    platformDescHint: "وصف قصير يظهر في نتائج البحث (SEO)",
    preview: "معاينة",
  } : {
    saasBranding: "Platform Identity",
    saasBrandingHint: "Control the platform name, logo and color shown across all public pages and login",
    platformNameAr: "Platform Name (Arabic)",
    platformNameEn: "Platform Name (English)",
    platformLogo: "Platform Logo",
    platformLogoHint: "Upload the platform logo (displayed in header, footer, and landing page)",
    platformColor: "Platform Primary Color",
    platformColorHint: "Used for buttons, headings, and accent elements",
    platformDescAr: "Platform Description (Arabic)",
    platformDescEn: "Platform Description (English)",
    platformDescHint: "Short description for search engine results (SEO)",
    preview: "Preview",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, "systemSettings")}</h1>

      <div className="max-w-lg space-y-6">
        <form onSubmit={handleSave} className="space-y-6">

          {/* SaaS Platform Branding */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{txt.saasBranding}</h3>
                <p className="text-xs text-gray-500">{txt.saasBrandingHint}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Platform Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{txt.platformNameAr}</label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{txt.platformNameEn}</label>
                  <input
                    type="text"
                    value={platformNameEn}
                    onChange={(e) => setPlatformNameEn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{txt.platformLogo}</label>
                <p className="text-xs text-gray-400 mb-2">{txt.platformLogoHint}</p>
                <div className="flex items-center gap-4">
                  {platformLogo ? (
                    <div className="relative">
                      <img src={platformLogo} alt="Logo" className="w-14 h-14 object-contain border border-gray-200 rounded-lg bg-white p-1" />
                      <button
                        type="button"
                        onClick={() => setPlatformLogo("")}
                        className="absolute -top-2 -end-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    {platformLogo ? t(locale, "edit") : t(locale, "uploadImages")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setPlatformLogo(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{txt.platformColor}</label>
                <p className="text-xs text-gray-400 mb-2">{txt.platformColorHint}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={platformColor}
                    onChange={(e) => setPlatformColor(e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={platformColor}
                    onChange={(e) => setPlatformColor(e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                    dir="ltr"
                  />
                  <div className="flex-1 h-10 rounded-lg" style={{ backgroundColor: platformColor }} />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{txt.platformDescAr}</label>
                <p className="text-xs text-gray-400 mb-1">{txt.platformDescHint}</p>
                <textarea
                  value={platformDescription}
                  onChange={(e) => setPlatformDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{txt.platformDescEn}</label>
                <textarea
                  value={platformDescriptionEn}
                  onChange={(e) => setPlatformDescriptionEn(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  dir="ltr"
                />
              </div>

              {/* Preview */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-3 font-medium">{txt.preview}</p>
                <div className="flex items-center gap-3 p-4 bg-stone-900 rounded-lg">
                  {platformLogo ? (
                    <img src={platformLogo} alt="" className="w-9 h-9 object-contain" />
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center rounded" style={{ backgroundColor: platformColor }}>
                      <span className="text-white font-bold text-sm">{(platformName || "D").charAt(0)}</span>
                    </div>
                  )}
                  <span className="font-bold text-white">{platformName}</span>
                  <span className="text-stone-400 text-sm">|</span>
                  <span className="text-stone-400 text-sm">{platformNameEn}</span>
                </div>
              </div>
            </div>
          </div>

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
