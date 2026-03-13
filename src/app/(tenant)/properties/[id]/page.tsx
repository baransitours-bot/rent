"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { t, type Locale, formatCurrency } from "@/i18n/translations";
import { ArrowRight, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface PropertyDetail {
  id: string;
  title: string;
  address: string;
  type: string;
  description: string;
  images: string;
  status: string;
  ownershipType: string;
  ownerName: string | null;
  ownerPhone: string | null;
  feeType: string | null;
  feeValue: number | null;
  rentals: Array<{
    id: string;
    tenantName: string;
    monthlyAmount: number;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

export default function PropertyViewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const currency = user?.currency || "USD";
  const isRTL = locale === "ar";

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProperty(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!property) return null;

  const images: string[] = JSON.parse(property.images || "[]");
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const feeDisplay = () => {
    if (!property.feeType || property.feeValue == null) return null;
    if (property.feeType === "percentage") {
      return `${property.feeValue}% ${t(locale, "ofRent")}`;
    }
    return `${formatCurrency(property.feeValue, currency)} ${t(locale, "fixedPerMonth")}`;
  };

  const formatRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const months = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const fmt = (d: Date) => d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" });
    return `${fmt(s)} → ${fmt(e)} · ${months} ${t(locale, "months")}`;
  };

  const calculateFeeForRental = (monthlyAmount: number) => {
    if (!property.feeType || property.feeValue == null) return 0;
    if (property.feeType === "percentage") return (property.feeValue / 100) * monthlyAmount;
    return property.feeValue;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/properties" className="p-2 hover:bg-gray-100 rounded-lg">
          <BackIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t(locale, "propertyDetails")}</h1>
      </div>

      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
            <p className="text-gray-500">{property.address}</p>
            <div className="flex gap-2">
              <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", property.ownershipType === "owned" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>
                {t(locale, property.ownershipType as any)}
              </span>
              <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", property.status === "available" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                {t(locale, property.status as any)}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {t(locale, property.type as any)}
              </span>
            </div>
            {property.description && (
              <p className="text-gray-600 text-sm">{property.description}</p>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden border aspect-video">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Managed property info */}
        {property.ownershipType === "managed" && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium text-gray-700 mb-3">{t(locale, "ownerName")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {property.ownerName && (
                <div>
                  <span className="text-gray-500">{t(locale, "ownerName")}:</span>{" "}
                  <span className="font-medium">{property.ownerName}</span>
                </div>
              )}
              {property.ownerPhone && (
                <div>
                  <span className="text-gray-500">{t(locale, "ownerPhone")}:</span>{" "}
                  <span className="font-medium" dir="ltr">{property.ownerPhone}</span>
                </div>
              )}
              {feeDisplay() && (
                <div>
                  <span className="text-gray-500">{t(locale, "feeDisplay")}:</span>{" "}
                  <span className="font-medium">{feeDisplay()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rentals table */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-800">{t(locale, "rentals")}</h3>
        </div>
        {property.rentals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">{t(locale, "noRentals")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "tenantName")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "rentalPeriod")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "monthlyAmount")}</th>
                  {property.ownershipType === "managed" && (
                    <th className="text-start p-3 font-medium text-gray-600">{t(locale, "feeAmount")}</th>
                  )}
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "status")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {property.rentals.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{r.tenantName}</td>
                    <td className="p-3 text-gray-500 text-xs">{formatRange(r.startDate, r.endDate)}</td>
                    <td className="p-3">{formatCurrency(r.monthlyAmount, currency)}</td>
                    {property.ownershipType === "managed" && (
                      <td className="p-3">{formatCurrency(calculateFeeForRental(r.monthlyAmount), currency)}</td>
                    )}
                    <td className="p-3">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", r.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {t(locale, r.status as any)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/rentals/${r.id}/payments`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t(locale, "payments")}
                      </Link>
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
