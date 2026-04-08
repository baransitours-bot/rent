"use client";

import { useEffect, useState, useRef } from "react";
import { Building2, MapPin, Search, X, Home, ArrowLeft, Users, LogIn } from "lucide-react";
import Link from "next/link";
import { Dropdown, AmenityDropdown } from "@/components/FilterDropdowns";
import Analytics from "@/components/Analytics";

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
  city: string;
  type: string;
  description: string;
  images: string;
  thumbnail: number;
  status: string;
  userId: string;
  user: { id: string; slug: string; name: string; companyName: string; phone: string; whatsapp: string };
  amenities: Array<{ amenity: Amenity }>;
}

interface Agent {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  phone: string;
  _count: { properties: number };
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" },
  en: { apartment: "Apartment", house: "House", shop: "Shop", land: "Land", other: "Other" },
};

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [tab, setTab] = useState<"properties" | "agents">("properties");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gaTrackingId, setGaTrackingId] = useState("");
  const searchTimer = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("lang") === "en") setLocale("en");
  }, []);

  useEffect(() => {
    fetch("/api/amenities").then((r) => r.json()).then(setAllAmenities).catch(() => {});
    fetch("/api/listing/agents").then((r) => r.json()).then(setAgents).catch(() => {});
    fetch("/api/auth/session").then((r) => r.json()).then((s) => {
      if (s?.user) setIsLoggedIn(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (typeFilter) qs.set("type", typeFilter);
    if (cityFilter) qs.set("city", cityFilter);
    if (searchQuery) qs.set("search", searchQuery);
    if (amenityFilter.length > 0) qs.set("amenities", amenityFilter.join(","));

    fetch(`/api/listing?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProperties(d.properties || []);
        setCities(d.cities || []);
        if (d.gaTrackingId) setGaTrackingId(d.gaTrackingId);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [typeFilter, cityFilter, searchQuery, amenityFilter]);

  const handleSearch = (val: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(val), 400);
  };

  const isRTL = locale === "ar";
  const hasFilters = typeFilter || cityFilter || searchQuery || amenityFilter.length > 0;

  const clearAll = () => {
    setTypeFilter("");
    setCityFilter("");
    setSearchQuery("");
    setAmenityFilter([]);
  };

  const typeOptions = [
    { value: "", label: locale === "ar" ? "جميع الأنواع" : "All Types" },
    ...["apartment", "house", "shop", "land", "other"].map((tp) => ({
      value: tp,
      label: TYPE_LABELS[locale][tp],
    })),
  ];

  const cityOptions = [
    { value: "", label: locale === "ar" ? "جميع المدن" : "All Cities" },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  const txt = {
    ar: {
      marketplace: "السوق العام",
      properties: "العقارات",
      agents: "الوكلاء",
      search: "بحث عن عقارات...",
      clearFilters: "مسح الفلاتر",
      result: "نتيجة",
      noProperties: "لا توجد عقارات متاحة حالياً",
      noAgents: "لا يوجد وكلاء حالياً",
      switchLang: "English",
      backToDashboard: "لوحة التحكم",
      login: "دخول",
      availableProps: "عقار متاح",
      viewProperties: "عرض العقارات",
    },
    en: {
      marketplace: "Marketplace",
      properties: "Properties",
      agents: "Agents",
      search: "Search properties...",
      clearFilters: "Clear filters",
      result: "result",
      noProperties: "No properties available at the moment",
      noAgents: "No agents available at the moment",
      switchLang: "العربية",
      backToDashboard: "Dashboard",
      login: "Sign In",
      availableProps: "available",
      viewProperties: "View",
    },
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-stone-50">
      {gaTrackingId && <Analytics gaTrackingId={gaTrackingId} page="marketplace" />}
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-700 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">دارك</span>
            </Link>
            <span className="text-stone-300">|</span>
            <h1 className="font-semibold text-gray-700 text-sm">
              {txt[locale].marketplace}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="text-sm text-stone-500 hover:text-stone-700 font-medium"
            >
              {txt[locale].switchLang}
            </button>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition-colors flex items-center gap-2"
              >
                {txt[locale].backToDashboard}
                {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : null}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                {txt[locale].login}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-stone-200">
          <button
            onClick={() => setTab("properties")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === "properties"
                ? "border-amber-700 text-amber-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {txt[locale].properties}
            </span>
          </button>
          <button
            onClick={() => setTab("agents")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === "agents"
                ? "border-amber-700 text-amber-800"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {txt[locale].agents}
              {agents.length > 0 && (
                <span className="bg-stone-200 text-stone-600 text-xs font-semibold px-1.5 py-0.5">{agents.length}</span>
              )}
            </span>
          </button>
        </div>

        {tab === "properties" && (
          <>
            {/* Filters */}
            <div className="bg-white border border-stone-200 p-5 mb-8">
              <div className="relative mb-4">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={txt[locale].search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full ps-11 pe-4 py-3 border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-stone-50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Dropdown label={locale === "ar" ? "النوع" : "Type"} value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
                {cities.length > 0 && (
                  <Dropdown label={locale === "ar" ? "المدينة" : "City"} value={cityFilter} options={cityOptions} onChange={setCityFilter} />
                )}
                {allAmenities.length > 0 && (
                  <AmenityDropdown amenities={allAmenities} selected={amenityFilter} onChange={setAmenityFilter} locale={locale} />
                )}
                {hasFilters && (
                  <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                    <X className="w-3 h-3" />
                    {txt[locale].clearFilters}
                  </button>
                )}
                <span className="ms-auto text-xs text-stone-400">{properties.length} {txt[locale].result}</span>
              </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-700 rounded-full animate-spin" />
              </div>
            ) : properties.length === 0 ? (
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
                    <Link
                      key={prop.id}
                      href={`/listing/${prop.user.slug || prop.user.id}/${prop.slug || prop.id}`}
                      className="bg-white border border-stone-200 overflow-hidden hover:shadow-lg transition-all group"
                    >
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
                          {prop.city && <span className="text-stone-400">· {prop.city}</span>}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                          <span className="text-xs font-medium text-amber-700">{prop.user.companyName || prop.user.name}</span>
                          {prop.amenities.length > 0 && (
                            <div className="flex gap-1">
                              {prop.amenities.slice(0, 3).map((pa) => (
                                <span key={pa.amenity.id} className="px-2 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-600">
                                  {locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}
                                </span>
                              ))}
                              {prop.amenities.length > 3 && (
                                <span className="px-2 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500">+{prop.amenities.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "agents" && (
          <>
            {agents.length === 0 ? (
              <div className="text-center py-20 bg-white border border-stone-200">
                <Users className="w-14 h-14 text-stone-300 mx-auto mb-3" />
                <p className="text-gray-500">{txt[locale].noAgents}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {agents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/listing/${agent.slug || agent.id}`}
                    className="bg-white border border-stone-200 p-6 hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 bg-amber-700 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-white">
                        {(agent.companyName || agent.name || "?").charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{agent.companyName || agent.name}</h3>
                    {agent.phone && <p className="text-sm text-gray-500 mb-3" dir="ltr">{agent.phone}</p>}
                    <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                      <span className="text-xs text-stone-500">{agent._count.properties} {txt[locale].availableProps}</span>
                      <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-800 flex items-center gap-1">
                        {txt[locale].viewProperties}
                        {isRTL ? <ArrowLeft className="w-3 h-3" /> : null}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
