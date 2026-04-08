"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, formatCurrency } from "@/i18n/translations";
import { Plus, Search, Key, MoreVertical, CreditCard, Pencil, XCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface Rental {
  id: string;
  tenantName: string;
  tenantPhone: string;
  monthlyAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  property: { id: string; title: string; ownershipType: string };
}

export default function RentalsPage() {
  const { data: session } = useSession();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [properties, setProperties] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const currency = user?.currency || "USD";
  const isPaused = user?.subscriptionStatus === "paused";

  const [form, setForm] = useState({ propertyId: "", tenantName: "", tenantPhone: "", monthlyAmount: "", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);

  const load = () => { fetch("/api/rentals").then((r) => r.json()).then((data) => { setRentals(data); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const loadProperties = () => { fetch("/api/properties").then((r) => r.json()).then(setProperties); };

  const getDaysLeft = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  };

  const formatRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const months = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const fmt = (d: Date) => d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" });
    return `${fmt(s)} → ${fmt(e)} · ${months} ${t(locale, "months")}`;
  };

  const handleAdd = () => {
    loadProperties();
    setForm({ propertyId: "", tenantName: "", tenantPhone: "", monthlyAmount: "", startDate: "", endDate: "" });
    setEditingRental(null);
    setShowAddModal(true);
  };

  const handleEdit = (rental: Rental) => {
    setEditingRental(rental);
    setForm({
      propertyId: rental.property.id,
      tenantName: rental.tenantName,
      tenantPhone: rental.tenantPhone || "",
      monthlyAmount: rental.monthlyAmount.toString(),
      startDate: new Date(rental.startDate).toISOString().split("T")[0],
      endDate: new Date(rental.endDate).toISOString().split("T")[0],
    });
    setShowAddModal(true);
    setOpenMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingRental) {
      await fetch(`/api/rentals/${editingRental.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantName: form.tenantName, tenantPhone: form.tenantPhone, monthlyAmount: parseFloat(form.monthlyAmount), startDate: form.startDate, endDate: form.endDate }) });
    } else {
      await fetch("/api/rentals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId: form.propertyId, tenantName: form.tenantName, tenantPhone: form.tenantPhone, monthlyAmount: parseFloat(form.monthlyAmount), startDate: form.startDate, endDate: form.endDate }) });
    }
    setSaving(false);
    setShowAddModal(false);
    load();
  };

  const handleEnd = async (id: string) => { if (!confirm(t(locale, "endRentalConfirm"))) return; await fetch(`/api/rentals/${id}/end`, { method: "PUT" }); setOpenMenu(null); load(); };
  const handleDelete = async (id: string) => { if (!confirm(t(locale, "deleteRentalConfirm"))) return; await fetch(`/api/rentals/${id}`, { method: "DELETE" }); setOpenMenu(null); load(); };

  const filtered = rentals.filter((r) => r.tenantName.toLowerCase().includes(search.toLowerCase()) || r.property.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-zinc-900">{t(locale, "rentals")}</h1>
        {!isPaused && (
          <button onClick={handleAdd} className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors text-[13px]">
            <Plus className="w-3.5 h-3.5" />
            {t(locale, "addRental")}
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="p-3 border-b border-zinc-100">
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-zinc-400" />
            <input type="text" placeholder={t(locale, "search")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full ps-9 pe-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 placeholder-zinc-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-10 h-10 mx-auto mb-2 text-zinc-200" />
            <p className="text-zinc-400 text-[13px]">{t(locale, "noRentals")}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "propertyName")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "tenantName")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "monthlyAmount")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "rentalPeriod")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "status")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="p-3">
                        <span className="font-medium text-zinc-900">{r.property.title}</span>
                        <span className={clsx("ms-2 px-2 py-0.5 rounded text-[10px] font-medium", r.property.ownershipType === "owned" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600")}>{t(locale, r.property.ownershipType as any)}</span>
                      </td>
                      <td className="p-3 text-zinc-600">{r.tenantName}</td>
                      <td className="p-3 text-zinc-900 font-medium">{formatCurrency(r.monthlyAmount, currency)}</td>
                      <td className="p-3 text-zinc-400 text-[11px]">{formatRange(r.startDate, r.endDate)}</td>
                      <td className="p-3">
                        <span className={clsx("px-2 py-0.5 rounded text-[11px] font-medium", r.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>{t(locale, r.status as any)}</span>
                      </td>
                      <td className="p-3">
                        <button onClick={(e) => {
                          if (openMenu === r.id) { setOpenMenu(null); setMenuPos(null); } else { const rect = (e.target as HTMLElement).getBoundingClientRect(); setMenuPos({ top: rect.bottom + 4, left: rect.left - 150 }); setOpenMenu(r.id); }
                        }} className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded-lg">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-zinc-50">
              {filtered.map((r) => (
                <div key={r.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[13px] text-zinc-900">{r.property.title}</p>
                      <p className="text-[12px] text-zinc-500 mt-0.5">{r.tenantName} · {formatCurrency(r.monthlyAmount, currency)}</p>
                    </div>
                    <button onClick={(e) => {
                      if (openMenu === r.id) { setOpenMenu(null); setMenuPos(null); } else { const rect = (e.target as HTMLElement).getBoundingClientRect(); setMenuPos({ top: rect.bottom + 4, left: rect.left - 150 }); setOpenMenu(r.id); }
                    }} className="p-1.5 text-zinc-400 rounded-lg shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-medium", r.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>{t(locale, r.status as any)}</span>
                    <span className="text-[10px] text-zinc-400">{getDaysLeft()} {t(locale, "daysLeftInMonth")}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dropdown menu */}
      {openMenu && menuPos && (() => {
        const r = filtered.find((r) => r.id === openMenu);
        if (!r) return null;
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setOpenMenu(null); setMenuPos(null); }} />
            <div className="fixed z-50 bg-white border border-zinc-100 rounded-lg shadow-lg w-48 py-1" style={{ top: menuPos.top, left: Math.max(8, menuPos.left) }}>
              <Link href={`/rentals/${r.id}/payments`} className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 w-full" onClick={() => { setOpenMenu(null); setMenuPos(null); }}>
                <CreditCard className="w-3.5 h-3.5" /> {t(locale, "payments")}
              </Link>
              {!isPaused && <button onClick={() => { handleEdit(r); setMenuPos(null); }} className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 w-full"><Pencil className="w-3.5 h-3.5" /> {t(locale, "editRental")}</button>}
              {!isPaused && r.status === "active" && <button onClick={() => { handleEnd(r.id); setMenuPos(null); }} className="flex items-center gap-2 px-3 py-2 text-[13px] text-amber-600 hover:bg-amber-50 w-full"><XCircle className="w-3.5 h-3.5" /> {t(locale, "endRental")}</button>}
              {!isPaused && <button onClick={() => { handleDelete(r.id); setMenuPos(null); }} className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 w-full"><Trash2 className="w-3.5 h-3.5" /> {t(locale, "delete")}</button>}
            </div>
          </>
        );
      })()}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 animate-slide-up">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">{editingRental ? t(locale, "editRental") : t(locale, "addRental")}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingRental && (
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "selectProperty")} *</label>
                  <select required value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50">
                    <option value="">--</option>
                    {properties.filter((p) => p.status === "available").map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "tenantName")} *</label>
                  <input type="text" required value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "tenantPhone")}</label>
                  <input type="text" value={form.tenantPhone} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "monthlyAmount")} *</label>
                <input type="number" required step="any" value={form.monthlyAmount} onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "startDate")} *</label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "endDate")} *</label>
                  <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "..." : t(locale, "save")}</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-lg text-[13px] font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50">{t(locale, "cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
