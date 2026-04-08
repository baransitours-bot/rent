"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, formatCurrency } from "@/i18n/translations";
import { Clock } from "lucide-react";
import clsx from "clsx";

interface HistoryPayment {
  id: string;
  monthLabel: string;
  dueDate: string;
  amount: number;
  status: string;
  paidAt: string | null;
  rental: {
    tenantName: string;
    monthlyAmount: number;
    property: { title: string; ownershipType: string; feeType: string | null; feeValue: number | null };
  };
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<HistoryPayment[]>([]);
  const [properties, setProperties] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filterProperty, setFilterProperty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const currency = user?.currency || "USD";

  const load = () => {
    const params = new URLSearchParams();
    if (filterProperty) params.set("propertyId", filterProperty);
    if (filterStatus) params.set("status", filterStatus);
    if (filterFrom) params.set("dateFrom", filterFrom);
    if (filterTo) params.set("dateTo", filterTo);
    fetch(`/api/payments?${params}`).then((r) => r.json()).then((data) => { setPayments(data); setLoading(false); });
  };

  useEffect(() => { fetch("/api/properties").then((r) => r.json()).then(setProperties); }, []);
  useEffect(() => { load(); }, [filterProperty, filterStatus, filterFrom, filterTo]);

  const calculateFee = (payment: HistoryPayment) => {
    const prop = payment.rental.property;
    if (prop.ownershipType !== "managed" || !prop.feeType || prop.feeValue == null) return null;
    if (prop.feeType === "percentage") return (prop.feeValue / 100) * payment.rental.monthlyAmount;
    return prop.feeValue;
  };

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-900 mb-5">{t(locale, "paymentHistory")}</h1>

      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="p-3 border-b border-zinc-100 flex flex-wrap gap-2">
          <select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50">
            <option value="">{t(locale, "filterByProperty")}</option>
            {properties.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50">
            <option value="">{t(locale, "filterByStatus")}</option>
            <option value="paid">{t(locale, "paid")}</option>
            <option value="unpaid">{t(locale, "unpaid")}</option>
          </select>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">{t(locale, "from")}</span>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">{t(locale, "to")}</span>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-10 h-10 mx-auto mb-2 text-zinc-200" />
            <p className="text-zinc-400 text-[13px]">{t(locale, "noPayments")}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "propertyName")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "tenantName")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "monthLabel")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "amount")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "feeAmount")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "status")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "paidAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const fee = calculateFee(p);
                    return (
                      <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                        <td className="p-3">
                          <span className="font-medium text-zinc-900">{p.rental.property.title}</span>
                          <span className={clsx("ms-2 px-2 py-0.5 rounded text-[10px] font-medium", p.rental.property.ownershipType === "owned" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600")}>{t(locale, p.rental.property.ownershipType as any)}</span>
                        </td>
                        <td className="p-3 text-zinc-600">{p.rental.tenantName}</td>
                        <td className="p-3 text-zinc-600">{p.monthLabel}</td>
                        <td className="p-3 text-zinc-900 font-medium">{formatCurrency(p.amount, currency)}</td>
                        <td className="p-3 text-zinc-500">{fee != null ? formatCurrency(fee, currency) : "-"}</td>
                        <td className="p-3">
                          <span className={clsx("px-2 py-0.5 rounded text-[11px] font-medium", p.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>{t(locale, p.status as any)}</span>
                        </td>
                        <td className="p-3 text-zinc-400 text-[12px]">{p.paidAt ? new Date(p.paidAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-zinc-50">
              {payments.map((p) => {
                const fee = calculateFee(p);
                return (
                  <div key={p.id} className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-[13px] text-zinc-900">{p.rental.property.title}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{p.rental.tenantName} · {p.monthLabel}</p>
                      </div>
                      <span className={clsx("px-2 py-0.5 rounded text-[10px] font-medium shrink-0", p.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>{t(locale, p.status as any)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[12px] text-zinc-500">
                      <span className="font-medium text-zinc-900">{formatCurrency(p.amount, currency)}</span>
                      {fee != null && <span>{t(locale, "feeAmount")}: {formatCurrency(fee, currency)}</span>}
                      {p.paidAt && <span>{new Date(p.paidAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
