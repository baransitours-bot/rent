"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, Share2, Check, Home, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Amenity {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
}

interface Property {
  id: string;
  slug: string;
  title: string;
  address: string;
  type: string;
  description: string;
  images: string;
  thumbnail: number;
  status: string;
  amenities: Array<{ amenity: Amenity }>;
}

interface TenantUser {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  phone: string;
  whatsapp: string;
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("lang") === "en") setLocale("en");
    fetch("/api/auth/session").then((r) => r.json()).then((s) => {
      if (s?.user) setIsLoggedIn(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (typeFilter) qs.set("type", typeFilter);
    if (amenityFilter.length > 0) qs.set("amenities", amenityFilter.join(","));

    fetch(`/api/listing/${params.tenantId}?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (initialLoad && d.user?.locale) {
          setLocale(d.user.locale as "ar" | "en");
          setInitialLoad(false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.tenantId, typeFilter, amenityFilter]);

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  useEffect(() => {
    fetch("/api/amenities").then((r) => r.json()).then(setAllAmenities).catch(() => {});
  }, []);

  const isRTL = locale === "ar";
  const txt = {
    ar: { available: "العقارات المتاحة", noProperties: "لا توجد عقارات متاحة حالياً", allTypes: "جميع الأنواع", switchLang: "English", shareCopied: "تم نسخ الرابط!", marketplace: "السوق العام", filter: "تصفية", backToDashboard: "لوحة التحكم", login: "دخول" },
    en: { available: "Available Properties", noProperties: "No properties available at the moment", allTypes: "All Types", switchLang: "العربية", shareCopied: "Link copied!", marketplace: "Marketplace", filter: "Filter", backToDashboard: "Dashboard", login: "Sign In" },
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-gray-500">Not found</p>
      </div>
    );
  }

  const { user, properties } = data;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-700 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
            </Link>
            <span className="text-stone-300">|</span>
            <div>
              <h1 className="font-bold text-gray-900">{user.companyName || user.name}</h1>
              {user.phone && (
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr">{user.phone}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/listing" className="text-xs text-stone-500 hover:text-stone-700 hidden sm:block font-medium">
              {txt[locale].marketplace}
            </Link>
            <button onClick={handleShare} className="p-2 hover:bg-stone-100 text-stone-500 relative">
              <Share2 className="w-4 h-4" />
              {linkCopied && (
                <span className="absolute -bottom-7 start-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 whitespace-nowrap z-10">
                  {txt[locale].shareCopied}
                </span>
              )}
            </button>
            <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-sm text-stone-500 hover:text-stone-700 font-medium">
              {txt[locale].switchLang}
            </button>
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-4 py-2 bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition-colors">
                {txt[locale].backToDashboard}
              </Link>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition-colors flex items-center gap-2">
                <LogIn className="w-3.5 h-3.5" />
                {txt[locale].login}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{txt[locale].available}</h2>

        {/* Filters */}
        <div className="bg-white border border-stone-200 p-5 mb-8">
          <div className="flex items-center gap-2 text-sm text-stone-500 font-medium mb-3">
            {txt[locale].filter}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTypeFilter("")} className={`px-4 py-2 text-xs font-semibold border transition-colors ${!typeFilter ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
              {txt[locale].allTypes}
            </button>
            {["apartment", "house", "shop", "land", "other"].map((tp) => (
              <button key={tp} onClick={() => setTypeFilter(tp)} className={`px-4 py-2 text-xs font-semibold border transition-colors ${typeFilter === tp ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                {TYPE_LABELS[locale][tp]}
              </button>
            ))}
          </div>
          {allAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100">
              {allAmenities.map((a) => {
                const isSelected = amenityFilter.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => setAmenityFilter((prev) => prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id])}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border transition-colors ${isSelected ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"}`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {locale === "ar" ? a.nameAr : a.nameEn}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Properties */}
        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200">
            <Building2 className="w-14 h-14 text-stone-300 mx-auto mb-3" />
            <p className="text-gray-500">{txt[locale].noProperties}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => {
              const images: string[] = JSON.parse(prop.images || "[]");
              const coverImg = images[prop.thumbnail || 0] || images[0];
              return (
                <Link key={prop.id} href={`/listing/${user.slug || params.tenantId}/${prop.slug || prop.id}`} className="bg-white border border-stone-200 overflow-hidden hover:shadow-lg transition-all group">
                  <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                    {coverImg ? (
                      <img src={coverImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Building2 className="w-14 h-14 text-stone-300" /></div>
                    )}
                    <span className="absolute top-3 start-3 px-3 py-1 text-xs font-semibold bg-white text-gray-800">
                      {TYPE_LABELS[locale][prop.type] || prop.type}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{prop.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {prop.address}
                    </p>
                    {prop.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prop.amenities.slice(0, 4).map((pa) => (
                          <span key={pa.amenity.id} className="px-2 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-600">
                            {locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}
                          </span>
                        ))}
                        {prop.amenities.length > 4 && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">+{prop.amenities.length - 4}</span>
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
