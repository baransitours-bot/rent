"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Building2, MapPin, Search, X, Home, ArrowLeft, Users, LogIn, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Dropdown, AmenityDropdown } from "@/components/FilterDropdowns";
import Analytics from "@/components/Analytics";

interface Amenity { id: string; nameAr: string; nameEn: string; icon: string; }
interface Property {
  id: string; slug: string; title: string; address: string; city: string; type: string; description: string; images: string; thumbnail: number; status: string; userId: string;
  user: { id: string; slug: string; name: string; companyName: string; phone: string; whatsapp: string };
  amenities: Array<{ amenity: Amenity }>;
}
interface Agent { id: string; slug: string; name: string; companyName: string; phone: string; _count: { properties: number }; }

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" },
  en: { apartment: "Apartment", house: "House", shop: "Shop", land: "Land", other: "Other" },
};

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [tab, setTab] = useState<"properties" | "agents">("properties");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gaTrackingId, setGaTrackingId] = useState("");
  const [brand, setBrand] = useState({ name: "دارك", nameEn: "Darak", logo: "", color: "#b45309" });
  const searchTimer = useRef<NodeJS.Timeout>(null);

  useEffect(() => { if (new URLSearchParams(window.location.search).get("lang") === "en") setLocale("en"); }, []);

  useEffect(() => {
    fetch("/api/amenities").then((r) => r.json()).then(setAllAmenities).catch(() => {});
    fetch("/api/listing/agents").then((r) => r.json()).then(setAgents).catch(() => {});
    fetch("/api/auth/session").then((r) => r.json()).then((s) => { if (s?.user) setIsLoggedIn(true); }).catch(() => {});
    fetch("/api/branding").then((r) => r.json()).then((data) => { if (data) setBrand({ name: data.name || "دارك", nameEn: data.nameEn || "Darak", logo: data.logo || "", color: data.color || "#b45309" }); }).catch(() => {});
  }, []);

  const buildQuery = useCallback((cursor?: string) => {
    const qs = new URLSearchParams();
    if (typeFilter) qs.set("type", typeFilter);
    if (cityFilter) qs.set("city", cityFilter);
    if (searchQuery) qs.set("search", searchQuery);
    if (amenityFilter.length > 0) qs.set("amenities", amenityFilter.join(","));
    if (cursor) qs.set("cursor", cursor);
    return qs.toString();
  }, [typeFilter, cityFilter, searchQuery, amenityFilter]);

  useEffect(() => {
    setLoading(true);
    setNextCursor(null);
    setHasMore(false);
    fetch(`/api/listing?${buildQuery()}`).then((r) => r.json()).then((d) => {
      setProperties(d.properties || []);
      setCities(d.cities || []);
      setNextCursor(d.nextCursor || null);
      setHasMore(d.hasMore || false);
      if (d.gaTrackingId) setGaTrackingId(d.gaTrackingId);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [buildQuery]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/listing?${buildQuery(nextCursor)}`);
      const d = await res.json();
      setProperties((prev) => [...prev, ...(d.properties || [])]);
      setNextCursor(d.nextCursor || null);
      setHasMore(d.hasMore || false);
    } catch {}
    setLoadingMore(false);
  };

  const handleSearch = (val: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(val), 400);
  };

  const isRTL = locale === "ar";
  const hasFilters = typeFilter || cityFilter || searchQuery || amenityFilter.length > 0;
  const clearAll = () => { setTypeFilter(""); setCityFilter(""); setSearchQuery(""); setAmenityFilter([]); };

  const typeOptions = [{ value: "", label: locale === "ar" ? "جميع الأنواع" : "All Types" }, ...["apartment", "house", "shop", "land", "other"].map((tp) => ({ value: tp, label: TYPE_LABELS[locale][tp] }))];
  const cityOptions = [{ value: "", label: locale === "ar" ? "جميع المدن" : "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))];

  const txt = {
    ar: { marketplace: "السوق", properties: "العقارات", agents: "الوكلاء", search: "بحث عن عقارات...", clearFilters: "مسح", result: "نتيجة", noProperties: "لا توجد عقارات", noAgents: "لا يوجد وكلاء", switchLang: "English", backToDashboard: "لوحة التحكم", login: "دخول", availableProps: "عقار", viewProperties: "عرض", loadMore: "عرض المزيد", loading: "جاري التحميل..." },
    en: { marketplace: "Marketplace", properties: "Properties", agents: "Agents", search: "Search...", clearFilters: "Clear", result: "results", noProperties: "No properties available", noAgents: "No agents available", switchLang: "العربية", backToDashboard: "Dashboard", login: "Sign In", availableProps: "available", viewProperties: "View", loadMore: "Load More", loading: "Loading..." },
  };

  const bc = brand.color;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#fafafa]">
      {gaTrackingId && <Analytics gaTrackingId={gaTrackingId} page="marketplace" />}

      {/* ── Header ── */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2">
              {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" /> : (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bc }}><Home className="w-3.5 h-3.5 text-white" /></div>
              )}
              <span className="text-[14px] font-bold text-zinc-900">{locale === "ar" ? brand.name : brand.nameEn}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-[13px] text-zinc-400 hover:text-zinc-600 font-medium px-2 py-1">{txt[locale].switchLang}</button>
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-3.5 py-2 text-white text-[13px] font-semibold rounded-xl hover:opacity-90 transition-colors" style={{ backgroundColor: bc }}>{txt[locale].backToDashboard}</Link>
            ) : (
              <Link href="/login" className="px-3.5 py-2 text-white text-[13px] font-semibold rounded-xl hover:opacity-90 flex items-center gap-1.5 transition-colors" style={{ backgroundColor: bc }}><LogIn className="w-3.5 h-3.5" />{txt[locale].login}</Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6">
        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6">
          {[
            { key: "properties" as const, icon: Building2, label: txt[locale].properties },
            { key: "agents" as const, icon: Users, label: txt[locale].agents },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                tab === t.key
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              }`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {t.key === "agents" && agents.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}>{agents.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Properties Tab ── */}
        {tab === "properties" && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-zinc-100 p-4 mb-6">
              <div className="relative mb-3">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                <input type="text" placeholder={txt[locale].search} onChange={(e) => handleSearch(e.target.value)}
                  className="w-full ps-10 pe-3 py-2.5 border border-zinc-200 rounded-xl text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 focus:bg-white focus:border-zinc-300 transition-colors" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Dropdown label={locale === "ar" ? "النوع" : "Type"} value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
                {cities.length > 0 && <Dropdown label={locale === "ar" ? "المدينة" : "City"} value={cityFilter} options={cityOptions} onChange={setCityFilter} />}
                {allAmenities.length > 0 && <AmenityDropdown amenities={allAmenities} selected={amenityFilter} onChange={setAmenityFilter} locale={locale} />}
                {hasFilters && (
                  <button onClick={clearAll} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-red-500 hover:bg-red-50 rounded-lg font-medium">
                    <X className="w-3 h-3" />{txt[locale].clearFilters}
                  </button>
                )}
                <span className="ms-auto text-[12px] text-zinc-400 font-medium">{properties.length} {txt[locale].result}</span>
              </div>
            </div>

            {/* Property Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="skeleton h-72 rounded-xl" />))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100">
                <Building2 className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400 text-[15px]">{txt[locale].noProperties}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {properties.map((prop) => {
                    const images: string[] = JSON.parse(prop.images || "[]");
                    const coverImg = images[prop.thumbnail || 0] || images[0];
                    return (
                      <Link key={prop.id} href={`/listing/${prop.user.slug || prop.user.id}/${prop.slug || prop.id}`}
                        className="bg-white rounded-xl overflow-hidden border border-zinc-100 hover:shadow-lg hover:shadow-zinc-200/50 hover:-translate-y-0.5 transition-all duration-300 group">
                        <div className="aspect-[16/11] bg-zinc-100 relative overflow-hidden">
                          {coverImg ? <img src={coverImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-zinc-200" /></div>}
                          <span className="absolute top-3 start-3 px-2.5 py-1 text-[11px] font-semibold bg-white/95 backdrop-blur-sm text-zinc-700 rounded-lg">{TYPE_LABELS[locale][prop.type] || prop.type}</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-zinc-900 text-[15px] mb-2 line-clamp-1">{prop.title}</h3>
                          <p className="text-[13px] text-zinc-400 flex items-center gap-1.5 mb-3">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="line-clamp-1">{prop.address}{prop.city && ` · ${prop.city}`}</span>
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                            <span className="text-[12px] font-semibold" style={{ color: bc }}>{prop.user.companyName || prop.user.name}</span>
                            {prop.amenities.length > 0 && (
                              <div className="flex gap-1">
                                {prop.amenities.slice(0, 2).map((pa) => (<span key={pa.amenity.id} className="px-1.5 py-0.5 text-[9px] font-semibold bg-zinc-50 text-zinc-500 rounded">{locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}</span>))}
                                {prop.amenities.length > 2 && <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-zinc-50 text-zinc-400 rounded">+{prop.amenities.length - 2}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-zinc-200 text-zinc-700 text-[14px] font-semibold rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />{txt[locale].loading}</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" />{txt[locale].loadMore}</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Agents Tab ── */}
        {tab === "agents" && (
          <>
            {agents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100">
                <Users className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400 text-[15px]">{txt[locale].noAgents}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agents.map((agent) => (
                  <Link key={agent.id} href={`/listing/${agent.slug || agent.id}`}
                    className="bg-white rounded-xl p-5 border border-zinc-100 hover:shadow-lg hover:shadow-zinc-200/50 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bc }}>
                      <span className="text-lg font-bold text-white">{(agent.companyName || agent.name || "?").charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-zinc-900 text-[15px] mb-0.5">{agent.companyName || agent.name}</h3>
                    {agent.phone && <p className="text-[12px] text-zinc-400 mb-3" dir="ltr">{agent.phone}</p>}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <span className="text-[12px] text-zinc-400 font-medium">{agent._count.properties} {txt[locale].availableProps}</span>
                      <span className="text-[12px] font-semibold flex items-center gap-1" style={{ color: bc }}>{txt[locale].viewProperties}{isRTL && <ArrowLeft className="w-3 h-3" />}</span>
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
