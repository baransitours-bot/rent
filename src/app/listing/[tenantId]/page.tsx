"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, Filter } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

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

export default function ListingPage() {
  const params = useParams();
  const [data, setData] = useState<{ user: TenantUser; properties: Property[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [locale, setLocale] = useState<"ar" | "en">("ar");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang");
    if (lang === "en") setLocale("en");
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (typeFilter) qs.set("type", typeFilter);
    if (amenityFilter.length > 0) qs.set("amenities", amenityFilter.join(","));

    fetch(`/api/listing/${params.tenantId}?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.user?.locale) setLocale(d.user.locale as "ar" | "en");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.tenantId, typeFilter, amenityFilter]);

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  useEffect(() => {
    fetch("/api/amenities")
      .then((r) => r.json())
      .then(setAllAmenities)
      .catch(() => {});
  }, []);

  const isRTL = locale === "ar";
  const txt = {
    ar: {
      available: "العقارات المتاحة",
      noProperties: "لا توجد عقارات متاحة حالياً",
      allTypes: "جميع الأنواع",
      viewDetails: "عرض التفاصيل",
      contact: "تواصل معنا",
      switchLang: "English",
    },
    en: {
      available: "Available Properties",
      noProperties: "No properties available at the moment",
      allTypes: "All Types",
      viewDetails: "View Details",
      contact: "Contact Us",
      switchLang: "العربية",
    },
  };

  const toggleAmenityFilter = (id: string) => {
    setAmenityFilter((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Not found</p>
      </div>
    );
  }

  const { user, properties } = data;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{user.companyName || user.name}</h1>
              {user.phone && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr">{user.phone}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {txt[locale].switchLang}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{txt[locale].available}</h2>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Filter className="w-4 h-4" />
            {locale === "ar" ? "تصفية" : "Filter"}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                !typeFilter ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {txt[locale].allTypes}
            </button>
            {["apartment", "house", "shop", "land", "other"].map((tp) => (
              <button
                key={tp}
                onClick={() => setTypeFilter(tp)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  typeFilter === tp ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                {TYPE_LABELS[locale][tp]}
              </button>
            ))}
          </div>

          {allAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allAmenities.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleAmenityFilter(a.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    amenityFilter.includes(a.id)
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {locale === "ar" ? a.nameAr : a.nameEn}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-16 text-gray-500">{txt[locale].noProperties}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => {
              const images: string[] = JSON.parse(prop.images || "[]");
              return (
                <Link
                  key={prop.id}
                  href={`/listing/${params.tenantId}/${prop.id}`}
                  className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {images.length > 0 ? (
                      <img src={images[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <span className="absolute top-2 start-2 px-2 py-1 rounded-lg text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                      {TYPE_LABELS[locale][prop.type] || prop.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{prop.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {prop.address}
                    </p>
                    {prop.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prop.amenities.slice(0, 4).map((pa) => (
                          <span key={pa.amenity.id} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                            {locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}
                          </span>
                        ))}
                        {prop.amenities.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                            +{prop.amenities.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
