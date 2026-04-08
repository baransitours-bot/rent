"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, CURRENCIES } from "@/i18n/translations";
import { Plus, Search, Users, Eye, Pencil, KeyRound, Play, Pause, Ban, Trash2, X } from "lucide-react";
import clsx from "clsx";

interface Tenant {
  id: string; name: string; email: string; phone: string; companyName: string; currency: string; locale: string;
  subscriptionStatus: string; subscriptionStartDate: string | null; subscriptionExpiryDate: string | null;
  lastLoginAt: string | null; createdAt: string; _count?: { properties: number }; activeRentalsCount?: number;
}

const statusBadge: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-600",
  paused: "bg-amber-50 text-amber-600",
  suspended: "bg-red-50 text-red-600",
  expired: "bg-zinc-100 text-zinc-500",
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

  const [form, setForm] = useState({ name: "", email: "", phone: "", companyName: "", password: "", currency: "USD", locale: "ar", subscriptionStartDate: "", subscriptionExpiryDate: "", maxImages: 10 });
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => { fetch("/api/admin/tenants").then((r) => r.json()).then((data) => { setTenants(data); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); await fetch("/api/admin/tenants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setSaving(false); setShowCreateModal(false); load(); };

  const handleView = async (tenant: Tenant) => { const res = await fetch(`/api/admin/tenants/${tenant.id}`); setTenantDetail(await res.json()); setShowViewModal(true); };

  const handleEditOpen = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setForm({ name: tenant.name, email: tenant.email, phone: tenant.phone, companyName: tenant.companyName, password: "", currency: tenant.currency, locale: tenant.locale,
      subscriptionStartDate: tenant.subscriptionStartDate ? new Date(tenant.subscriptionStartDate).toISOString().split("T")[0] : "",
      subscriptionExpiryDate: tenant.subscriptionExpiryDate ? new Date(tenant.subscriptionExpiryDate).toISOString().split("T")[0] : "",
      maxImages: (tenant as any).maxImages || 10 });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedTenant) return; setSaving(true);
    await fetch(`/api/admin/tenants/${selectedTenant.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, companyName: form.companyName, currency: form.currency, locale: form.locale, subscriptionStartDate: form.subscriptionStartDate || null, subscriptionExpiryDate: form.subscriptionExpiryDate || null, maxImages: form.maxImages }) });
    setSaving(false); setShowEditModal(false); load();
  };

  const handleChangePassword = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedTenant) return; setSaving(true); await fetch(`/api/admin/tenants/${selectedTenant.id}/password`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: newPassword }) }); setSaving(false); setShowPasswordModal(false); setNewPassword(""); };
  const handleStatusChange = async (id: string, status: string) => { await fetch(`/api/admin/tenants/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); load(); };
  const handleDelete = async (id: string) => { if (!confirm(t(locale, "deleteTenantConfirm"))) return; await fetch(`/api/admin/tenants/${id}`, { method: "DELETE" }); load(); };

  const filtered = tenants.filter((tn) => tn.name.toLowerCase().includes(search.toLowerCase()) || tn.email.toLowerCase().includes(search.toLowerCase()) || tn.companyName.toLowerCase().includes(search.toLowerCase()));
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "-";

  const inputCls = "w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-zinc-900">{t(locale, "tenantManagement")}</h1>
        <button onClick={() => { setForm({ name: "", email: "", phone: "", companyName: "", password: "", currency: "USD", locale: "ar", subscriptionStartDate: new Date().toISOString().split("T")[0], subscriptionExpiryDate: "", maxImages: 10 }); setShowCreateModal(true); }}
          className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors text-[13px]">
          <Plus className="w-3.5 h-3.5" /> {t(locale, "createTenant")}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-3 border-b border-zinc-100">
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-zinc-400" />
            <input type="text" placeholder={t(locale, "search")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full ps-9 pe-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 placeholder-zinc-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><Users className="w-10 h-10 mx-auto mb-2 text-zinc-200" /><p className="text-zinc-400 text-[13px]">{t(locale, "noData")}</p></div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "name")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "email")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "subscriptionStatus")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "subscriptionExpiry")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tn) => (
                    <tr key={tn.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="p-3">
                        <div className="font-medium text-zinc-900">{tn.name}</div>
                        {tn.companyName && <div className="text-[11px] text-zinc-400">{tn.companyName}</div>}
                      </td>
                      <td className="p-3 text-zinc-500">{tn.email}</td>
                      <td className="p-3"><span className={clsx("px-2 py-0.5 rounded text-[11px] font-medium", statusBadge[tn.subscriptionStatus])}>{t(locale, tn.subscriptionStatus as any)}</span></td>
                      <td className="p-3 text-zinc-400 text-[12px]">{fmtDate(tn.subscriptionExpiryDate)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-0.5 flex-wrap">
                          <button onClick={() => handleView(tn)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg" title={t(locale, "viewProfile")}><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleEditOpen(tn)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg" title={t(locale, "edit")}><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setSelectedTenant(tn); setNewPassword(""); setShowPasswordModal(true); }} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg" title={t(locale, "changePassword")}><KeyRound className="w-3.5 h-3.5" /></button>
                          {tn.subscriptionStatus !== "active" && <button onClick={() => handleStatusChange(tn.id, "active")} className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Play className="w-3.5 h-3.5" /></button>}
                          {tn.subscriptionStatus !== "paused" && <button onClick={() => handleStatusChange(tn.id, "paused")} className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Pause className="w-3.5 h-3.5" /></button>}
                          {tn.subscriptionStatus !== "suspended" && <button onClick={() => handleStatusChange(tn.id, "suspended")} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Ban className="w-3.5 h-3.5" /></button>}
                          <button onClick={() => handleDelete(tn.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-zinc-50">
              {filtered.map((tn) => (
                <div key={tn.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[13px] text-zinc-900">{tn.name}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{tn.email}</p>
                    </div>
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-medium shrink-0", statusBadge[tn.subscriptionStatus])}>{t(locale, tn.subscriptionStatus as any)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <button onClick={() => handleView(tn)} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleEditOpen(tn)} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setSelectedTenant(tn); setNewPassword(""); setShowPasswordModal(true); }} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg"><KeyRound className="w-3.5 h-3.5" /></button>
                    {tn.subscriptionStatus !== "active" && <button onClick={() => handleStatusChange(tn.id, "active")} className="p-1.5 text-zinc-400 hover:text-emerald-600 rounded-lg"><Play className="w-3.5 h-3.5" /></button>}
                    <button onClick={() => handleDelete(tn.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-900">{t(locale, "createTenant")}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-zinc-100 rounded-lg"><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "name")} *</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "email")} *</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} dir="ltr" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "phone")}</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} dir="ltr" /></div>
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "companyName")}</label><input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "password")} *</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} dir="ltr" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "currency")}</label><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>{Object.entries(CURRENCIES).map(([code, symbol]) => (<option key={code} value={code}>{code} ({symbol})</option>))}</select></div>
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "language")}</label><select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className={inputCls}><option value="ar">{t(locale, "arabic")}</option><option value="en">{t(locale, "english")}</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "subscriptionStart")}</label><input type="date" value={form.subscriptionStartDate} onChange={(e) => setForm({ ...form, subscriptionStartDate: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "subscriptionExpiry")}</label><input type="date" value={form.subscriptionExpiryDate} onChange={(e) => setForm({ ...form, subscriptionExpiryDate: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "..." : t(locale, "create")}</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg text-[13px] font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50">{t(locale, "cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && tenantDetail && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-900">{t(locale, "viewProfile")}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-zinc-100 rounded-lg"><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <div className="space-y-1.5 text-[13px]">
              {[
                [t(locale, "name"), tenantDetail.name], [t(locale, "email"), tenantDetail.email], [t(locale, "phone"), tenantDetail.phone || "-"],
                [t(locale, "companyName"), tenantDetail.companyName || "-"], [t(locale, "subscriptionStatus"), tenantDetail.subscriptionStatus],
                [t(locale, "subscriptionStart"), fmtDate(tenantDetail.subscriptionStartDate)], [t(locale, "subscriptionExpiry"), fmtDate(tenantDetail.subscriptionExpiryDate)],
                [t(locale, "lastLogin"), tenantDetail.lastLoginAt ? fmtDate(tenantDetail.lastLoginAt) : t(locale, "never")],
                [t(locale, "totalProperties"), tenantDetail.totalProperties], [t(locale, "activeRentals"), tenantDetail.activeRentals],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between py-2 border-b border-zinc-50">
                  <span className="text-zinc-400">{label}</span>
                  <span className="font-medium text-zinc-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-900">{t(locale, "editTenant")}</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-zinc-100 rounded-lg"><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "name")} *</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "email")} *</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} dir="ltr" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "phone")}</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} dir="ltr" /></div>
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "companyName")}</label><input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "subscriptionStart")}</label><input type="date" value={form.subscriptionStartDate} onChange={(e) => setForm({ ...form, subscriptionStartDate: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "subscriptionExpiry")}</label><input type="date" value={form.subscriptionExpiryDate} onChange={(e) => setForm({ ...form, subscriptionExpiryDate: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "maxImages")}</label><input type="number" min="1" max="50" value={form.maxImages} onChange={(e) => setForm({ ...form, maxImages: parseInt(e.target.value) || 10 })} className={inputCls} /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "..." : t(locale, "save")}</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-lg text-[13px] font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50">{t(locale, "cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedTenant && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-900">{t(locale, "changePassword")}</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-zinc-100 rounded-lg"><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <p className="text-[13px] text-zinc-400 mb-3">{selectedTenant.name} ({selectedTenant.email})</p>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div><label className="block text-[13px] font-medium text-zinc-700 mb-1">{t(locale, "newPassword")} *</label><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} dir="ltr" /></div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "..." : t(locale, "save")}</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2.5 rounded-lg text-[13px] font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50">{t(locale, "cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
