"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { t, type Locale } from "@/i18n/translations";
import { ArrowRight, ArrowLeft, Upload, Check } from "lucide-react";
import Link from "next/link";

export default function EditPropertyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<Array<{ id: string; nameAr: string; nameEn: string }>>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title,
          address: data.address,
          city: data.city || "",
          type: data.type,
          description: data.description || "",
          ownershipType: data.ownershipType,
          ownerName: data.ownerName || "",
          ownerPhone: data.ownerPhone || "",
          feeType: data.feeType || "",
          feeValue: data.feeValue?.toString() || "",
        });
        setImages(JSON.parse(data.images || "[]"));
        setSelectedAmenities(data.amenities?.map((a: any) => a.amenityId) || []);
        setLoading(false);
      });
    fetch("/api/amenities")
      .then((r) => r.json())
      .then(setAmenities)
      .catch(() => {});
  }, [params.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImages((prev) => [...prev, ...data.paths]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/properties/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        feeValue: form.feeValue ? parseFloat(form.feeValue) : null,
        feeType: form.ownershipType === "managed" ? form.feeType || null : null,
        ownerName: form.ownershipType === "managed" ? form.ownerName || null : null,
        ownerPhone: form.ownershipType === "managed" ? form.ownerPhone || null : null,
        images,
        amenityIds: selectedAmenities,
      }),
    });
    router.push(`/properties/${params.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/properties/${params.id}`} className="p-2 hover:bg-gray-100 rounded-lg">
          <BackIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t(locale, "editProperty")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "propertyTitle")} *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "propertyType")} *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              {["apartment", "house", "shop", "land", "other"].map((tp) => (
                <option key={tp} value={tp}>{t(locale, tp as any)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "propertyAddress")} *</label>
          <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "propertyCity")}</label>
          <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "propertyDescription")}</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "propertyImages")}</label>
          <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500">
            <Upload className="w-4 h-4" />
            {uploading ? "..." : t(locale, "uploadImages")}
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-0.5 end-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t(locale, "ownershipType")} *</label>
          <div className="flex gap-3">
            {["owned", "managed"].map((ot) => (
              <button key={ot} type="button" onClick={() => setForm({ ...form, ownershipType: ot })} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.ownershipType === ot ? (ot === "owned" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-purple-50 border-purple-300 text-purple-700") : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {t(locale, ot as any)}
              </button>
            ))}
          </div>
        </div>

        {form.ownershipType === "managed" && (
          <div className="border rounded-lg p-4 space-y-4 bg-purple-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "ownerName")}</label>
                <input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "ownerPhone")}</label>
                <input type="text" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "feeType")}</label>
                <select value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="">-</option>
                  <option value="fixed">{t(locale, "feeFixed")}</option>
                  <option value="percentage">{t(locale, "feePercentage")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "feeValue")}</label>
                <input type="number" step="any" value={form.feeValue} onChange={(e) => setForm({ ...form, feeValue: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" dir="ltr" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? "..." : t(locale, "save")}
          </button>
          <Link href={`/properties/${params.id}`} className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            {t(locale, "cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
