"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, ArrowRight, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

interface Amenity {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  type: string;
  description: string;
  images: string;
  status: string;
  amenities: Array<{ amenity: Amenity }>;
}

interface TenantUser {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  locale: string;
  currency: string;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" },
  en: { apartment: "Apartment", house: "House", shop: "Shop", land: "Land", other: "Other" },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const [data, setData] = useState<{ user: TenantUser; property: Property } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/listing/${params.tenantId}/${params.propertyId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.user?.locale) setLocale(d.user.locale as "ar" | "en");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.tenantId, params.propertyId]);

  const isRTL = locale === "ar";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data?.property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Not found</p>
      </div>
    );
  }

  const { user, property } = data;
  const images: string[] = JSON.parse(property.images || "[]");
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/listing/${params.tenantId}`}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <BackIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">{user.companyName || user.name}</span>
            </div>
          </div>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
              <img
                src={images[activeImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                      activeImage === i ? "border-blue-500" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Info */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4 shrink-0" />
                {property.address}
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
              {TYPE_LABELS[locale][property.type] || property.type}
            </span>
          </div>

          {property.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{property.description}</p>
          )}

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                {locale === "ar" ? "الخدمات المشمولة" : "Included Services"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.amenities.map((pa) => (
                  <div
                    key={pa.amenity.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    {locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        {user.phone && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              {locale === "ar" ? "تواصل معنا" : "Contact Us"}
            </h3>
            <a
              href={`tel:${user.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">{user.phone}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
