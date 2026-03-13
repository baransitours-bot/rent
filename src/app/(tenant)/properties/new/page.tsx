"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { t, type Locale } from "@/i18n/translations";
import { ArrowRight, ArrowLeft, Upload, Check, Star } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const isRTL = locale === "ar";

  const [form, setForm] = useState({
    title: "",
    address: "",
    city: "",
    type: "apartment",
    description: "",
    ownershipType: "owned",
    ownerName: "",
    ownerPhone: "",
    feeType: "",
    feeValue: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amenities, setAmenities] = useState<Array<{ id: string; nameAr: string; nameEn: string }>>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Load default fee settings and amenities
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.defaultFeeType) {
          setForm((f) => ({
            ...f,
            feeType: data.defaultFeeType || "",
            feeValue: data.defaultFeeValue?.toString() || "",
          }));
        }
      });
    fetch("/api/amenities")
      .then((r) => r.json())
      .then(setAmenities)
      .catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImages((prev) => [...prev, ...data.paths]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        feeValue: form.feeValue ? parseFloat(form.feeValue) : null,
        feeType: form.ownershipType === "managed" ? form.feeType || null : null,
        ownerName: form.ownershipType === "managed" ? form.ownerName || null : null,
        ownerPhone: form.ownershipType === "managed" ? form.ownerPhone || null : null,
        images,
        thumbnail,
        amenityIds: selectedAmenities,
      }),
    });

    router.push("/properties");
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/properties" className="p-2 hover:bg-gray-100 rounded-lg">
          <BackIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t(locale, "addProperty")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(locale, "propertyTitle")} *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(locale, "propertyType")} *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {["apartment", "house", "shop", "land", "other"].map((tp) => (
                <option key={tp} value={tp}>
                  {t(locale, tp as any)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t(locale, "propertyAddress")} *
          </label>
          <input
            type="text"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t(locale, "propertyCity")}
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t(locale, "propertyDescription")}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t(locale, "propertyImages")}
          </label>
          <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500">
            <Upload className="w-4 h-4" />
            {uploading ? "..." : t(locale, "uploadImages")}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${thumbnail === i ? "border-yellow-400" : "border-gray-200"}`} onClick={() => setThumbnail(i)}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {thumbnail === i && (
                    <span className="absolute top-0.5 start-0.5 bg-yellow-400 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <Star className="w-3 h-3" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); const newImages = images.filter((_, j) => j !== i); setImages(newImages); if (thumbnail >= newImages.length) setThumbnail(Math.max(0, newImages.length - 1)); else if (thumbnail > i) setThumbnail(thumbnail - 1); }}
                    className="absolute top-0.5 end-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length > 1 && (
            <p className="text-xs text-gray-400 mt-1">{locale === "ar" ? "اضغط على الصورة لتعيينها كصورة رئيسية" : "Click an image to set it as cover photo"}</p>
          )}
        </div>

        {/* Amenities selection */}
        {amenities.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(locale, "selectAmenities")}
            </label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    setSelectedAmenities((prev) =>
                      prev.includes(a.id) ? prev.filter((id) => id !== a.id) : [...prev, a.id]
                    )
                  }
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedAmenities.includes(a.id)
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {selectedAmenities.includes(a.id) && <Check className="w-3 h-3" />}
                  {locale === "ar" ? a.nameAr : a.nameEn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ownership type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t(locale, "ownershipType")} *
          </label>
          <div className="flex gap-3">
            {["owned", "managed"].map((ot) => (
              <button
                key={ot}
                type="button"
                onClick={() => setForm({ ...form, ownershipType: ot })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.ownershipType === ot
                    ? ot === "owned"
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-purple-50 border-purple-300 text-purple-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t(locale, ot as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Managed property fields */}
        {form.ownershipType === "managed" && (
          <div className="border rounded-lg p-4 space-y-4 bg-purple-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(locale, "ownerName")}
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(locale, "ownerPhone")}
                </label>
                <input
                  type="text"
                  value={form.ownerPhone}
                  onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(locale, "feeType")}
                </label>
                <select
                  value={form.feeType}
                  onChange={(e) => setForm({ ...form, feeType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">-</option>
                  <option value="fixed">{t(locale, "feeFixed")}</option>
                  <option value="percentage">{t(locale, "feePercentage")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(locale, "feeValue")}
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.feeValue}
                  onChange={(e) => setForm({ ...form, feeValue: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "..." : t(locale, "create")}
          </button>
          <Link
            href="/properties"
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t(locale, "cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
