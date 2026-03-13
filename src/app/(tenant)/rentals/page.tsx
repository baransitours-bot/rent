"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
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
  property: {
    id: string;
    title: string;
    ownershipType: string;
  };
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

  const [form, setForm] = useState({
    propertyId: "",
    tenantName: "",
    tenantPhone: "",
    monthlyAmount: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/rentals")
      .then((r) => r.json())
      .then((data) => {
        setRentals(data);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const loadProperties = () => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then(setProperties);
  };

  const getDaysLeft = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return daysInMonth - now.getDate();
  };

  const getCurrentMonthName = () => {
    const months = locale === "ar"
      ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
      : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[new Date().getMonth()];
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
      await fetch(`/api/rentals/${editingRental.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: form.tenantName,
          tenantPhone: form.tenantPhone,
          monthlyAmount: parseFloat(form.monthlyAmount),
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      });
    } else {
      await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: form.propertyId,
          tenantName: form.tenantName,
          tenantPhone: form.tenantPhone,
          monthlyAmount: parseFloat(form.monthlyAmount),
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      });
    }

    setSaving(false);
    setShowAddModal(false);
    load();
  };

  const handleEnd = async (id: string) => {
    if (!confirm(t(locale, "endRentalConfirm"))) return;
    await fetch(`/api/rentals/${id}/end`, { method: "PUT" });
    setOpenMenu(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t(locale, "deleteRentalConfirm"))) return;
    await fetch(`/api/rentals/${id}`, { method: "DELETE" });
    setOpenMenu(null);
    load();
  };

  const filtered = rentals.filter(
    (r) =>
      r.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      r.property.title.toLowerCase().includes(search.toLowerCase())
  );

  const ownershipColors: Record<string, string> = {
    owned: "bg-blue-100 text-blue-700",
    managed: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t(locale, "rentals")}</h1>
        {!isPaused && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {t(locale, "addRental")}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t(locale, "search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t(locale, "noRentals")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "propertyName")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "ownershipType")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "tenantName")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "monthlyAmount")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "rentalPeriod")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "daysLeftInMonth")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "status")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{r.property.title}</td>
                    <td className="p-3">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", ownershipColors[r.property.ownershipType])}>
                        {t(locale, r.property.ownershipType as any)}
                      </span>
                    </td>
                    <td className="p-3">{r.tenantName}</td>
                    <td className="p-3">{formatCurrency(r.monthlyAmount, currency)}</td>
                    <td className="p-3 text-gray-500 text-xs">{formatRange(r.startDate, r.endDate)}</td>
                    <td className="p-3 text-gray-500 text-xs">
                      {getDaysLeft()} {t(locale, "daysLeftInMonth")} {getCurrentMonthName()}
                    </td>
                    <td className="p-3">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", r.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {t(locale, r.status as any)}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          if (openMenu === r.id) {
                            setOpenMenu(null);
                            setMenuPos(null);
                          } else {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 4, left: rect.left - 150 });
                            setOpenMenu(r.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fixed dropdown menu */}
      {openMenu && menuPos && (() => {
        const r = filtered.find((r) => r.id === openMenu);
        if (!r) return null;
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setOpenMenu(null); setMenuPos(null); }} />
            <div
              className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-52 py-1"
              style={{ top: menuPos.top, left: Math.max(8, menuPos.left) }}
            >
              <Link
                href={`/rentals/${r.id}/payments`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                onClick={() => { setOpenMenu(null); setMenuPos(null); }}
              >
                <CreditCard className="w-4 h-4" />
                {t(locale, "payments")}
              </Link>
              {!isPaused && (
                <button onClick={() => { handleEdit(r); setMenuPos(null); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full">
                  <Pencil className="w-4 h-4" />
                  {t(locale, "editRental")}
                </button>
              )}
              {!isPaused && r.status === "active" && (
                <button onClick={() => { handleEnd(r.id); setMenuPos(null); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 w-full">
                  <XCircle className="w-4 h-4" />
                  {t(locale, "endRental")}
                </button>
              )}
              {!isPaused && (
                <button onClick={() => { handleDelete(r.id); setMenuPos(null); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                  <Trash2 className="w-4 h-4" />
                  {t(locale, "delete")}
                </button>
              )}
            </div>
          </>
        );
      })()}

      {/* Add/Edit Rental Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingRental ? t(locale, "editRental") : t(locale, "addRental")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingRental && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "selectProperty")} *</label>
                  <select
                    required
                    value={form.propertyId}
                    onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">--</option>
                    {properties.filter((p) => p.status === "available").map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "tenantName")} *</label>
                  <input type="text" required value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "tenantPhone")}</label>
                  <input type="text" value={form.tenantPhone} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "monthlyAmount")} *</label>
                <input type="number" required step="any" value={form.monthlyAmount} onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "startDate")} *</label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "endDate")} *</label>
                  <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
                  {saving ? "..." : t(locale, "save")}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                  {t(locale, "cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
