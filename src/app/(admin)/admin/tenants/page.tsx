"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, CURRENCIES } from "@/i18n/translations";
import { Plus, Search, Users, Eye, Pencil, KeyRound, Play, Pause, Ban, Trash2, X } from "lucide-react";
import clsx from "clsx";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  currency: string;
  locale: string;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionExpiryDate: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count?: { properties: number; };
  activeRentalsCount?: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
};

export default function TenantsPage() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantDetail, setTenantDetail] = useState<any>(null);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", companyName: "", password: "",
    currency: "USD", locale: "ar",
    subscriptionStartDate: "", subscriptionExpiryDate: "",
    maxImages: 10,
  });
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/tenants")
      .then((r) => r.json())
      .then((data) => { setTenants(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowCreateModal(false);
    load();
  };

  const handleView = async (tenant: Tenant) => {
    const res = await fetch(`/api/admin/tenants/${tenant.id}`);
    const data = await res.json();
    setTenantDetail(data);
    setShowViewModal(true);
  };

  const handleEditOpen = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setForm({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      companyName: tenant.companyName,
      password: "",
      currency: tenant.currency,
      locale: tenant.locale,
      subscriptionStartDate: tenant.subscriptionStartDate ? new Date(tenant.subscriptionStartDate).toISOString().split("T")[0] : "",
      subscriptionExpiryDate: tenant.subscriptionExpiryDate ? new Date(tenant.subscriptionExpiryDate).toISOString().split("T")[0] : "",
      maxImages: (tenant as any).maxImages || 10,
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setSaving(true);
    await fetch(`/api/admin/tenants/${selectedTenant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName,
        currency: form.currency,
        locale: form.locale,
        subscriptionStartDate: form.subscriptionStartDate || null,
        subscriptionExpiryDate: form.subscriptionExpiryDate || null,
        maxImages: form.maxImages,
      }),
    });
    setSaving(false);
    setShowEditModal(false);
    load();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setSaving(true);
    await fetch(`/api/admin/tenants/${selectedTenant.id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setSaving(false);
    setShowPasswordModal(false);
    setNewPassword("");
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/admin/tenants/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t(locale, "deleteTenantConfirm"))) return;
    await fetch(`/api/admin/tenants/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = tenants.filter(
    (tn) =>
      tn.name.toLowerCase().includes(search.toLowerCase()) ||
      tn.email.toLowerCase().includes(search.toLowerCase()) ||
      tn.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t(locale, "tenantManagement")}</h1>
        <button
          onClick={() => {
            setForm({ name: "", email: "", phone: "", companyName: "", password: "", currency: "USD", locale: "ar", subscriptionStartDate: new Date().toISOString().split("T")[0], subscriptionExpiryDate: "", maxImages: 10 });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          {t(locale, "createTenant")}
        </button>
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
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t(locale, "noData")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "name")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "email")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "companyName")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "subscriptionStatus")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "subscriptionExpiry")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "lastLogin")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "createdAt")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tn) => (
                  <tr key={tn.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{tn.name}</td>
                    <td className="p-3 text-gray-500">{tn.email}</td>
                    <td className="p-3 text-gray-500">{tn.companyName || "-"}</td>
                    <td className="p-3">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusColors[tn.subscriptionStatus])}>
                        {t(locale, tn.subscriptionStatus as any)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{fmtDate(tn.subscriptionExpiryDate)}</td>
                    <td className="p-3 text-gray-500">{tn.lastLoginAt ? fmtDate(tn.lastLoginAt) : t(locale, "never")}</td>
                    <td className="p-3 text-gray-500">{fmtDate(tn.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={() => handleView(tn)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title={t(locale, "viewProfile")}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditOpen(tn)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded" title={t(locale, "edit")}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedTenant(tn); setNewPassword(""); setShowPasswordModal(true); }} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded" title={t(locale, "changePassword")}>
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {tn.subscriptionStatus !== "active" && (
                          <button onClick={() => handleStatusChange(tn.id, "active")} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded" title={t(locale, "activate")}>
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {tn.subscriptionStatus !== "paused" && (
                          <button onClick={() => handleStatusChange(tn.id, "paused")} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded" title={t(locale, "pause")}>
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {tn.subscriptionStatus !== "suspended" && (
                          <button onClick={() => handleStatusChange(tn.id, "suspended")} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title={t(locale, "suspend")}>
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(tn.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title={t(locale, "delete")}>
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
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t(locale, "createTenant")}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "name")} *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "email")} *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "phone")}</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "companyName")}</label>
                  <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "password")} *</label>
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "currency")}</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    {Object.entries(CURRENCIES).map(([code, symbol]) => (
                      <option key={code} value={code}>{code} ({symbol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "language")}</label>
                  <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="ar">{t(locale, "arabic")}</option>
                    <option value="en">{t(locale, "english")}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "subscriptionStart")}</label>
                  <input type="date" value={form.subscriptionStartDate} onChange={(e) => setForm({ ...form, subscriptionStartDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "subscriptionExpiry")}</label>
                  <input type="date" value={form.subscriptionExpiryDate} onChange={(e) => setForm({ ...form, subscriptionExpiryDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
                  {saving ? "..." : t(locale, "create")}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm">
                  {t(locale, "cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewModal && tenantDetail && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t(locale, "viewProfile")}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                [t(locale, "name"), tenantDetail.name],
                [t(locale, "email"), tenantDetail.email],
                [t(locale, "phone"), tenantDetail.phone || "-"],
                [t(locale, "companyName"), tenantDetail.companyName || "-"],
                [t(locale, "currency"), tenantDetail.currency],
                [t(locale, "language"), tenantDetail.locale === "ar" ? t(locale, "arabic") : t(locale, "english")],
                [t(locale, "subscriptionStatus"), tenantDetail.subscriptionStatus],
                [t(locale, "subscriptionStart"), fmtDate(tenantDetail.subscriptionStartDate)],
                [t(locale, "subscriptionExpiry"), fmtDate(tenantDetail.subscriptionExpiryDate)],
                [t(locale, "lastLogin"), tenantDetail.lastLoginAt ? fmtDate(tenantDetail.lastLoginAt) : t(locale, "never")],
                [t(locale, "createdAt"), fmtDate(tenantDetail.createdAt)],
                [t(locale, "totalProperties"), tenantDetail.totalProperties],
                [t(locale, "activeRentals"), tenantDetail.activeRentals],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t(locale, "editTenant")}</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "name")} *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "email")} *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "phone")}</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "companyName")}</label>
                  <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "currency")}</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                    {Object.entries(CURRENCIES).map(([code, symbol]) => (
                      <option key={code} value={code}>{code} ({symbol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "language")}</label>
                  <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                    <option value="ar">{t(locale, "arabic")}</option>
                    <option value="en">{t(locale, "english")}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "subscriptionStart")}</label>
                  <input type="date" value={form.subscriptionStartDate} onChange={(e) => setForm({ ...form, subscriptionStartDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "subscriptionExpiry")}</label>
                  <input type="date" value={form.subscriptionExpiryDate} onChange={(e) => setForm({ ...form, subscriptionExpiryDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "maxImages")}</label>
                <p className="text-xs text-gray-400 mb-1">{t(locale, "maxImagesHint")}</p>
                <input type="number" min="1" max="50" value={form.maxImages} onChange={(e) => setForm({ ...form, maxImages: parseInt(e.target.value) || 10 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm">{saving ? "..." : t(locale, "save")}</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm">{t(locale, "cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t(locale, "changePassword")}</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedTenant.name} ({selectedTenant.email})</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, "newPassword")} *</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" dir="ltr" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm">{saving ? "..." : t(locale, "save")}</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm">{t(locale, "cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
