"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Amenity { id: string; nameAr: string; nameEn: string; icon: string; }

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

  const fetchAmenities = async () => { const res = await fetch("/api/admin/amenities"); setAmenities(await res.json()); setLoading(false); };
  useEffect(() => { fetchAmenities(); }, []);

  const openCreate = () => { setEditing(null); setForm({ nameAr: "", nameEn: "", icon: "check" }); setShowModal(true); };
  const openEdit = (a: Amenity) => { setEditing(a); setForm({ nameAr: a.nameAr, nameEn: a.nameEn, icon: a.icon }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    if (editing) { await fetch(`/api/admin/amenities/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); }
    else { await fetch("/api/admin/amenities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); }
    setSaving(false); setShowModal(false); fetchAmenities();
  };

  const handleDelete = async (id: string) => { if (!confirm(t(locale, "deleteAmenityConfirm"))) return; await fetch(`/api/admin/amenities/${id}`, { method: "DELETE" }); fetchAmenities(); };

  const iconOptions = ["check", "wifi", "sofa", "car", "droplets", "shield", "wind", "building", "sun", "zap", "tv", "utensils", "dumbbell", "waves", "trees", "lock", "phone", "thermometer"];

  if (loading) {
    return (<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-zinc-900">{t(locale, "amenityManagement")}</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors text-[13px]">
          <Plus className="w-3.5 h-3.5" /> {t(locale, "addAmenity")}
        </button>
      </div>

      {amenities.length === 0 ? (
        <div className="text-center py-12 card text-zinc-400 text-[13px]">{t(locale, "noAmenities")}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "amenityIcon")}</th>
                <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "amenityNameAr")}</th>
                <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "amenityNameEn")}</th>
                <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "actions")}</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((a) => (
                <tr key={a.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="p-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-medium">{a.icon}</span>
                  </td>
                  <td className="p-3 font-medium text-zinc-900">{a.nameAr}</td>
                  <td className="p-3 text-zinc-600">{a.nameEn}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-900">{editing ? t(locale, "editAmenity") : t(locale, "addAmenity")}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-zinc-100 rounded-lg"><X className="w-4 h-4 text-zinc-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "amenityNameAr")} *</label>
                <input type="text" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" dir="rtl" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "amenityNameEn")} *</label>
                <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" dir="ltr" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "amenityIcon")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {iconOptions.map((ico) => (
                    <button key={ico} type="button" onClick={() => setForm({ ...form, icon: ico })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${form.icon === ico ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >{ico}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} disabled={saving || !form.nameAr || !form.nameEn} className="flex-1 bg-zinc-900 text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "..." : t(locale, "save")}</button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg text-[13px] font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50">{t(locale, "cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
