"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale, formatCurrency } from "@/i18n/translations";
import { Search, Clock } from "lucide-react";
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
    property: {
      title: string;
      ownershipType: string;
      feeType: string | null;
      feeValue: number | null;
    };
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

    fetch(`/api/payments?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPayments(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then(setProperties);
  }, []);

  useEffect(() => { load(); }, [filterProperty, filterStatus, filterFrom, filterTo]);

  const calculateFee = (payment: HistoryPayment) => {
    const prop = payment.rental.property;
    if (prop.ownershipType !== "managed" || !prop.feeType || prop.feeValue == null) return null;
    if (prop.feeType === "percentage") return (prop.feeValue / 100) * payment.rental.monthlyAmount;
    return prop.feeValue;
  };

  const ownershipColors: Record<string, string> = {
    owned: "bg-blue-100 text-blue-700",
    managed: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, "paymentHistory")}</h1>

      <div className="bg-white rounded-xl border">
        {/* Filters */}
        <div className="p-4 border-b flex flex-wrap gap-3">
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">{t(locale, "filterByProperty")}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">{t(locale, "filterByStatus")}</option>
            <option value="paid">{t(locale, "paid")}</option>
            <option value="unpaid">{t(locale, "unpaid")}</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t(locale, "from")}</span>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t(locale, "to")}</span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t(locale, "noPayments")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "propertyName")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "ownershipType")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "tenantName")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "monthLabel")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "dueDate")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "amount")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "feeAmount")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "status")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "paidAt")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const fee = calculateFee(p);
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{p.rental.property.title}</td>
                      <td className="p-3">
                        <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", ownershipColors[p.rental.property.ownershipType])}>
                          {t(locale, p.rental.property.ownershipType as any)}
                        </span>
                      </td>
                      <td className="p-3">{p.rental.tenantName}</td>
                      <td className="p-3">{p.monthLabel}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(p.dueDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                      </td>
                      <td className="p-3">{formatCurrency(p.amount, currency)}</td>
                      <td className="p-3">
                        {fee != null ? formatCurrency(fee, currency) : "-"}
                      </td>
                      <td className="p-3">
                        <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", p.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          {t(locale, p.status as any)}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
