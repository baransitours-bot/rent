"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { t, type Locale, formatCurrency } from "@/i18n/translations";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface Payment {
  id: string;
  monthLabel: string;
  dueDate: string;
  amount: number;
  status: string;
  paidAt: string | null;
  notes: string;
}

interface RentalDetail {
  id: string;
  tenantName: string;
  monthlyAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  property: { title: string };
  payments: Payment[];
}

export default function PaymentsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [rental, setRental] = useState<RentalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const currency = user?.currency || "USD";
  const isRTL = locale === "ar";

  const load = () => {
    fetch(`/api/rentals/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setRental(data);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, [params.id]);

  const togglePayment = async (paymentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    await fetch(`/api/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!rental) return null;

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/rentals" className="p-2 hover:bg-gray-100 rounded-lg">
          <BackIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(locale, "paymentSchedule")}</h1>
          <p className="text-sm text-gray-500">
            {rental.property.title} — {rental.tenantName} — {formatCurrency(rental.monthlyAmount, currency)}/{locale === "ar" ? "شهر" : "mo"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        {rental.payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t(locale, "noPayments")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "monthLabel")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "dueDate")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "amount")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "status")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "paidAt")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "notes")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {rental.payments.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.monthLabel}</td>
                    <td className="p-3 text-gray-500">
                      {new Date(p.dueDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                    </td>
                    <td className="p-3">{formatCurrency(p.amount, currency)}</td>
                    <td className="p-3">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", p.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {t(locale, p.status as any)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "-"}
                    </td>
                    <td className="p-3 text-gray-500 text-xs max-w-[150px] truncate">{p.notes || "-"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => togglePayment(p.id, p.status)}
                        className={clsx(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          p.status === "paid"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        )}
                      >
                        {p.status === "paid" ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            {t(locale, "markUnpaid")}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t(locale, "markPaid")}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
