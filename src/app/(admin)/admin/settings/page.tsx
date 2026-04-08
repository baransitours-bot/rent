"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { CheckCircle, BarChart3, Image, Upload, X, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [gaTrackingId, setGaTrackingId] = useState("");
  const [defaultMaxImages, setDefaultMaxImages] = useState(10);
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
    fetch("/api/admin/settings").then((r) => r.json()).then((data) => {
      setGaTrackingId(data.gaTrackingId || ""); setDefaultMaxImages(data.defaultMaxImages || 10);
      setPlatformName(data.platformName || "دارك"); setPlatformNameEn(data.platformNameEn || "Darak");
      setPlatformLogo(data.platformLogo || ""); setPlatformColor(data.platformColor || "#b45309");
      setPlatformDescription(data.platformDescription || ""); setPlatformDescriptionEn(data.platformDescriptionEn || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gaTrackingId, defaultMaxImages, platformName, platformNameEn, platformLogo, platformColor, platformDescription, platformDescriptionEn }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>);
  }

  const txt = locale === "ar" ? {
    saasBranding: "هوية المنصة", saasBrandingHint: "تحكم في اسم وشعار ولون المنصة",
    platformNameAr: "اسم المنصة (عربي)", platformNameEn: "اسم المنصة (إنجليزي)",
    platformLogo: "شعار المنصة", platformLogoHint: "ارفع شعار المنصة",
    platformColor: "اللون الرئيسي", platformColorHint: "يستخدم في الأزرار والعناوين",
    platformDescAr: "وصف المنصة (عربي)", platformDescEn: "وصف المنصة (إنجليزي)",
    platformDescHint: "وصف قصير يظهر في نتائج البحث (SEO)", preview: "معاينة",
  } : {
    saasBranding: "Platform Identity", saasBrandingHint: "Control the platform name, logo and color",
    platformNameAr: "Platform Name (Arabic)", platformNameEn: "Platform Name (English)",
    platformLogo: "Platform Logo", platformLogoHint: "Upload the platform logo",
    platformColor: "Primary Color", platformColorHint: "Used for buttons and accent elements",
    platformDescAr: "Description (Arabic)", platformDescEn: "Description (English)",
    platformDescHint: "Short description for SEO", preview: "Preview",
  };

  const inputCls = "w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50";

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-900 mb-5">{t(locale, "systemSettings")}</h1>

      <div className="max-w-lg space-y-4">
        <form onSubmit={handleSave} className="space-y-4">

          {/* SaaS Branding */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-zinc-900">{txt.saasBranding}</h3>
                <p className="text-[11px] text-zinc-400">{txt.saasBrandingHint}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-zinc-500 mb-1">{txt.platformNameAr}</label><input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className={inputCls} /></div>
                <div><label className="block text-[11px] font-medium text-zinc-500 mb-1">{txt.platformNameEn}</label><input type="text" value={platformNameEn} onChange={(e) => setPlatformNameEn(e.target.value)} className={inputCls} dir="ltr" /></div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">{txt.platformLogo}</label>
                <div className="flex items-center gap-3">
                  {platformLogo ? (
                    <div className="relative">
                      <img src={platformLogo} alt="Logo" className="w-12 h-12 object-contain border border-zinc-200 rounded-lg bg-white p-1" />
                      <button type="button" onClick={() => setPlatformLogo("")} className="absolute -top-1.5 -end-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-300"><Upload className="w-4 h-4" /></div>
                  )}
                  <label className="cursor-pointer px-3 py-2 border border-zinc-200 rounded-lg text-[13px] text-zinc-500 hover:bg-zinc-50">
                    {platformLogo ? t(locale, "edit") : t(locale, "uploadImages")}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setPlatformLogo(reader.result as string); reader.readAsDataURL(file); }} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">{txt.platformColor}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={platformColor} onChange={(e) => setPlatformColor(e.target.value)} className="w-9 h-9 border border-zinc-200 rounded-lg cursor-pointer p-0.5" />
                  <input type="text" value={platformColor} onChange={(e) => setPlatformColor(e.target.value)} className="w-24 px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" dir="ltr" />
                  <div className="flex-1 h-9 rounded-lg" style={{ backgroundColor: platformColor }} />
                </div>
              </div>

              <div><label className="block text-[11px] font-medium text-zinc-500 mb-1">{txt.platformDescAr}</label><textarea value={platformDescription} onChange={(e) => setPlatformDescription(e.target.value)} rows={2} className={inputCls + " resize-none"} /></div>
              <div><label className="block text-[11px] font-medium text-zinc-500 mb-1">{txt.platformDescEn}</label><textarea value={platformDescriptionEn} onChange={(e) => setPlatformDescriptionEn(e.target.value)} rows={2} className={inputCls + " resize-none"} dir="ltr" /></div>

              <div className="border-t border-zinc-100 pt-3">
                <p className="text-[11px] text-zinc-400 mb-2 font-medium">{txt.preview}</p>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-900 rounded-lg">
                  {platformLogo ? <img src={platformLogo} alt="" className="w-8 h-8 object-contain" /> : (
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: platformColor }}><span className="text-white font-bold text-sm">{(platformName || "D").charAt(0)}</span></div>
                  )}
                  <span className="font-semibold text-white text-sm">{platformName}</span>
                  <span className="text-zinc-500 text-[11px]">|</span>
                  <span className="text-zinc-500 text-[11px]">{platformNameEn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Google Analytics */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-blue-600" /></div>
              <div>
                <h3 className="text-[13px] font-semibold text-zinc-900">{t(locale, "googleAnalytics")}</h3>
                <p className="text-[11px] text-zinc-400">{t(locale, "gaHint")}</p>
              </div>
            </div>
            <input type="text" value={gaTrackingId} onChange={(e) => setGaTrackingId(e.target.value)} placeholder="G-XXXXXXXXXX" className={inputCls} dir="ltr" />
          </div>

          {/* Default Max Images */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Image className="w-4 h-4 text-amber-600" /></div>
              <div>
                <h3 className="text-[13px] font-semibold text-zinc-900">{t(locale, "defaultMaxImages")}</h3>
                <p className="text-[11px] text-zinc-400">{t(locale, "defaultMaxImagesHint")}</p>
              </div>
            </div>
            <input type="number" min="1" max="50" value={defaultMaxImages} onChange={(e) => setDefaultMaxImages(parseInt(e.target.value) || 10)} className={inputCls} />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "..." : t(locale, "save")}</button>
            {saved && <span className="flex items-center gap-1 text-emerald-600 text-[13px]"><CheckCircle className="w-3.5 h-3.5" />{t(locale, "settingsSaved")}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
