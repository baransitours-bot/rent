"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, CURRENCIES } from "@/i18n/translations";
import { CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [name, setName] = useState("");
  const [userLocale, setUserLocale] = useState("ar");
  const [currency, setCurrency] = useState("USD");
  const [defaultFeeType, setDefaultFeeType] = useState("");
  const [defaultFeeValue, setDefaultFeeValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || "");
        setUserLocale(data.locale || "ar");
        setCurrency(data.currency || "USD");
        setDefaultFeeType(data.defaultFeeType || "");
        setDefaultFeeValue(data.defaultFeeValue?.toString() || "");
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        locale: userLocale,
        currency,
        defaultFeeType: defaultFeeType || null,
        defaultFeeValue: defaultFeeValue ? parseFloat(defaultFeeValue) : null,
      }),
    });

    await update({
      name,
      locale: userLocale,
      currency,
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // Reload to apply locale change
    if (userLocale !== locale) {
      window.location.reload();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, "settings")}</h1>

      <div className="max-w-lg">
        <form onSubmit={handleSave} className="bg-white rounded-xl border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(locale, "displayName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(locale, "language")}
            </label>
            <select
              value={userLocale}
              onChange={(e) => setUserLocale(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="ar">{t(locale, "arabic")}</option>
              <option value="en">{t(locale, "english")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(locale, "currency")}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {Object.entries(CURRENCIES).map(([code, symbol]) => (
                <option key={code} value={code}>
                  {code} ({symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-5">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t(locale, "defaultFeeSettings")}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t(locale, "feeType")}
                </label>
                <select
                  value={defaultFeeType}
                  onChange={(e) => setDefaultFeeType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">-</option>
                  <option value="fixed">{t(locale, "feeFixed")}</option>
                  <option value="percentage">{t(locale, "feePercentage")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t(locale, "feeValue")}
                </label>
                <input
                  type="number"
                  step="any"
                  value={defaultFeeValue}
                  onChange={(e) => setDefaultFeeValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : t(locale, "save")}
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
