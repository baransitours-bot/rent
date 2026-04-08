"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, CURRENCIES } from "@/i18n/translations";
import { CheckCircle, Copy, ExternalLink, Upload, X, Palette } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [name, setName] = useState("");
  const [userLocale, setUserLocale] = useState("ar");
  const [currency, setCurrency] = useState("USD");
  const [whatsapp, setWhatsapp] = useState("");
  const [defaultFeeType, setDefaultFeeType] = useState("");
  const [defaultFeeValue, setDefaultFeeValue] = useState("");
  const [listInMarketplace, setListInMarketplace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [userSlug, setUserSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [brandColor, setBrandColor] = useState("#b45309");
  const [maxImages, setMaxImages] = useState(10);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      setName(data.name || "");
      setUserSlug(data.slug || "");
      setUserLocale(data.locale || "ar");
      setCurrency(data.currency || "USD");
      setWhatsapp(data.whatsapp || "");
      setDefaultFeeType(data.defaultFeeType || "");
      setDefaultFeeValue(data.defaultFeeValue?.toString() || "");
      setListInMarketplace(data.listInMarketplace || false);
      setLogo(data.logo || "");
      setBrandColor(data.brandColor || "#b45309");
      setMaxImages(data.maxImages || 10);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, locale: userLocale, currency, whatsapp, listInMarketplace, defaultFeeType: defaultFeeType || null, defaultFeeValue: defaultFeeValue ? parseFloat(defaultFeeValue) : null, logo, brandColor }),
    });
    const updated = await res.json();
    if (updated.slug) setUserSlug(updated.slug);
    await update({ name, locale: userLocale, currency });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    if (userLocale !== locale) window.location.reload();
  };

  const inputCls = "w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 transition-all";

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-900 mb-5">{t(locale, "settings")}</h1>

      <div className="max-w-lg space-y-4">
        {/* Public Link */}
        {user?.id && (
          <div className="card p-4">
            <h3 className="text-[13px] font-medium text-zinc-600 mb-2">{t(locale, "viewListing")}</h3>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={typeof window !== "undefined" ? `${window.location.origin}/listing/${userSlug || user.id}` : `/listing/${userSlug || user.id}`} className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[12px] text-zinc-500" dir="ltr" />
              <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/listing/${userSlug || user.id}`); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }} className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:bg-zinc-50">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a href={`/listing/${userSlug || user.id}`} target="_blank" className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:bg-zinc-50">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            {linkCopied && <p className="text-emerald-600 text-[11px] mt-1.5">{t(locale, "linkCopied")}</p>}
          </div>
        )}

        <form onSubmit={handleSave} className="card p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "displayName")}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "language")}</label>
              <select value={userLocale} onChange={(e) => setUserLocale(e.target.value)} className={inputCls}>
                <option value="ar">{t(locale, "arabic")}</option>
                <option value="en">{t(locale, "english")}</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "currency")}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                {Object.entries(CURRENCIES).map(([code, symbol]) => (<option key={code} value={code}>{code} ({symbol})</option>))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "whatsappNumber")}</label>
            <p className="text-[11px] text-zinc-400 mb-1">{t(locale, "whatsappHint")}</p>
            <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+970599123456" className={inputCls} dir="ltr" />
          </div>

          <div className="flex items-start gap-3 bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <input type="checkbox" id="marketplace" checked={listInMarketplace} onChange={(e) => setListInMarketplace(e.target.checked)} className="mt-0.5 w-4 h-4 rounded" />
            <div>
              <label htmlFor="marketplace" className="text-[13px] font-medium text-zinc-800 cursor-pointer">{t(locale, "listInMarketplace")}</label>
              <p className="text-[11px] text-zinc-400 mt-0.5">{t(locale, "listInMarketplaceHint")}</p>
            </div>
          </div>

          {/* Branding */}
          <div className="border-t border-zinc-100 pt-4">
            <h3 className="text-[13px] font-medium text-zinc-700 mb-3">{t(locale, "branding")}</h3>

            <div className="mb-3">
              <label className="block text-[11px] text-zinc-400 mb-1">{t(locale, "logoUpload")}</label>
              <div className="flex items-center gap-3">
                {logo ? (
                  <div className="relative">
                    <img src={logo} alt="Logo" className="w-14 h-14 object-contain border border-zinc-200 rounded-lg bg-white p-1" />
                    <button type="button" onClick={() => setLogo("")} className="absolute -top-1.5 -end-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ) : (
                  <div className="w-14 h-14 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-300"><Upload className="w-5 h-5" /></div>
                )}
                <label className="cursor-pointer px-3 py-2 border border-zinc-200 rounded-lg text-[13px] text-zinc-500 hover:bg-zinc-50">
                  {logo ? t(locale, "edit") : t(locale, "uploadImages")}
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setLogo(reader.result as string); reader.readAsDataURL(file); }} />
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] text-zinc-400 mb-1">{t(locale, "brandColor")}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-9 h-9 border border-zinc-200 rounded-lg cursor-pointer p-0.5" />
                <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-28 px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" dir="ltr" />
                <div className="flex-1 h-9 rounded-lg" style={{ backgroundColor: brandColor }} />
              </div>
            </div>

            <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-100">
              <p className="text-[11px] text-zinc-400">
                <Palette className="w-3 h-3 inline-block me-1" />
                {t(locale, "maxImages")}: <span className="font-medium text-zinc-600">{maxImages}</span>
                <span className="text-zinc-400 ms-1">({t(locale, "maxImagesHint")})</span>
              </p>
            </div>
          </div>

          {/* Fees */}
          <div className="border-t border-zinc-100 pt-4">
            <h3 className="text-[13px] font-medium text-zinc-700 mb-3">{t(locale, "defaultFeeSettings")}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">{t(locale, "feeType")}</label>
                <select value={defaultFeeType} onChange={(e) => setDefaultFeeType(e.target.value)} className={inputCls}>
                  <option value="">-</option>
                  <option value="fixed">{t(locale, "feeFixed")}</option>
                  <option value="percentage">{t(locale, "feePercentage")}</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">{t(locale, "feeValue")}</label>
                <input type="number" step="any" value={defaultFeeValue} onChange={(e) => setDefaultFeeValue(e.target.value)} className={inputCls} dir="ltr" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">
              {loading ? "..." : t(locale, "save")}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-emerald-600 text-[13px]">
                <CheckCircle className="w-3.5 h-3.5" />
                {t(locale, "settingsSaved")}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
