"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, Share2, Home, LogIn, ArrowLeft, MessageCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { Dropdown, AmenityDropdown } from "@/components/FilterDropdowns";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [linkCopied, setLinkCopied] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchTimer = useRef<NodeJS.Timeout>(null);

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
    ar: {
      available: "العقارات المتاحة",
      noProperties: "لا توجد عقارات متاحة حالياً",
      allTypes: "جميع الأنواع",
      switchLang: "English",
      shareCopied: "تم نسخ الرابط!",
      marketplace: "السوق العام",
      backToDashboard: "لوحة التحكم",
      login: "دخول",
      propertyCount: "عقار متاح",
      whatsapp: "تواصل واتساب",
      call: "اتصل",
      search: "بحث في العقارات...",
      clearFilters: "مسح الفلاتر",
      result: "نتيجة",
    },
    en: {
      available: "Available Properties",
      noProperties: "No properties available at the moment",
      allTypes: "All Types",
      switchLang: "العربية",
      shareCopied: "Link copied!",
      marketplace: "Marketplace",
      backToDashboard: "Dashboard",
      login: "Sign In",
      propertyCount: "available properties",
      whatsapp: "WhatsApp",
      call: "Call",
      search: "Search properties...",
      clearFilters: "Clear filters",
      result: "result",
    },
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSearch = (val: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(val), 300);
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

  // Client-side search filter
  const filteredProperties = searchQuery
    ? properties.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : properties;

  const typeOptions = [
    { value: "", label: txt[locale].allTypes },
    ...["apartment", "house", "shop", "land", "other"].map((tp) => ({
      value: tp,
      label: TYPE_LABELS[locale][tp],
    })),
  ];

  const hasFilters = typeFilter || amenityFilter.length > 0 || searchQuery;

  const clearAll = () => {
    setTypeFilter("");
    setAmenityFilter([]);
    setSearchQuery("");
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-stone-50">
      {/* ──── Header ──── */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-700 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
            </Link>
            <span className="text-stone-300">|</span>
            <span className="font-bold text-gray-900 text-sm">{user.companyName || user.name}</span>
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

      {/* ──── Agent Profile Hero ──── */}
      <section className="bg-stone-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-amber-700 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white">
                {(user.companyName || user.name || "?").charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {user.companyName || user.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="text-sm text-stone-400">
                  {properties.length} {txt[locale].propertyCount}
                </span>
                {user.phone && (
                  <span className="text-sm text-stone-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">{user.phone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 shrink-0">
              {user.whatsapp && (
                <a
                  href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {txt[locale].whatsapp}
                </a>
              )}
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-600 text-stone-300 text-sm font-semibold hover:bg-stone-800 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {txt[locale].call}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ──── Content ──── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{txt[locale].available}</h2>

        {/* ──── Filters (same dropdown style as marketplace) ──── */}
        <div className="bg-white border border-stone-200 p-5 mb-8">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={txt[locale].search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full ps-11 pe-4 py-3 border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-stone-50"
            />
          </div>
          {/* Dropdown filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown
              label={locale === "ar" ? "النوع" : "Type"}
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
            />
            {allAmenities.length > 0 && (
              <AmenityDropdown
                amenities={allAmenities}
                selected={amenityFilter}
                onChange={setAmenityFilter}
                locale={locale}
              />
            )}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="w-3 h-3" />
                {txt[locale].clearFilters}
              </button>
            )}
            <span className="ms-auto text-xs text-stone-400">
              {filteredProperties.length} {txt[locale].result}
            </span>
          </div>
        </div>

        {/* ──── Properties Grid ──── */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200">
            <Building2 className="w-14 h-14 text-stone-300 mx-auto mb-3" />
            <p className="text-gray-500">{txt[locale].noProperties}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => {
              const images: string[] = JSON.parse(prop.images || "[]");
              const coverImg = images[prop.thumbnail || 0] || images[0];
              return (
                <Link
                  key={prop.id}
                  href={`/listing/${user.slug || params.tenantId}/${prop.slug || prop.id}`}
                  className="bg-white border border-stone-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                    {coverImg ? (
                      <img src={coverImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-14 h-14 text-stone-300" />
                      </div>
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
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">
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
