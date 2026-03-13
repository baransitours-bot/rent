"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Amenity {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
}

export default function AmenitiesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", icon: "check" });
  const [saving, setSaving] = useState(false);

  const fetchAmenities = async () => {
    const res = await fetch("/api/admin/amenities");
    const data = await res.json();
    setAmenities(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nameAr: "", nameEn: "", icon: "check" });
    setShowModal(true);
  };

  const openEdit = (a: Amenity) => {
    setEditing(a);
    setForm({ nameAr: a.nameAr, nameEn: a.nameEn, icon: a.icon });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await fetch(`/api/admin/amenities/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/amenities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setShowModal(false);
    fetchAmenities();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t(locale, "deleteAmenityConfirm"))) return;
    await fetch(`/api/admin/amenities/${id}`, { method: "DELETE" });
    fetchAmenities();
  };

  const iconOptions = [
    "check", "wifi", "sofa", "car", "droplets", "shield", "wind",
    "building", "sun", "zap", "tv", "utensils", "dumbbell", "waves",
    "trees", "lock", "phone", "thermometer",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t(locale, "amenityManagement")}</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          {t(locale, "addAmenity")}
        </button>
      </div>

      {amenities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t(locale, "noAmenities")}</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-start p-3 font-medium text-gray-600">{t(locale, "amenityIcon")}</th>
                <th className="text-start p-3 font-medium text-gray-600">{t(locale, "amenityNameAr")}</th>
                <th className="text-start p-3 font-medium text-gray-600">{t(locale, "amenityNameEn")}</th>
                <th className="text-start p-3 font-medium text-gray-600">{t(locale, "actions")}</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium">
                      {a.icon}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{a.nameAr}</td>
                  <td className="p-3">{a.nameEn}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? t(locale, "editAmenity") : t(locale, "addAmenity")}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "amenityNameAr")} *</label>
                <input
                  type="text"
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "amenityNameEn")} *</label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "amenityIcon")}</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setForm({ ...form, icon: ico })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.icon === ico
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !form.nameAr || !form.nameEn}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? "..." : t(locale, "save")}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t(locale, "cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
