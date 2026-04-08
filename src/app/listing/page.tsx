"use client";

import { useEffect, useState, useRef } from "react";
import { Building2, MapPin, Search, X, Home, ArrowLeft, Users, LogIn } from "lucide-react";
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

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (typeFilter) qs.set("type", typeFilter);
    if (cityFilter) qs.set("city", cityFilter);
    if (searchQuery) qs.set("search", searchQuery);
    if (amenityFilter.length > 0) qs.set("amenities", amenityFilter.join(","));
    fetch(`/api/listing?${qs.toString()}`).then((r) => r.json()).then((d) => {
      setProperties(d.properties || []); setCities(d.cities || []);
      if (d.gaTrackingId) setGaTrackingId(d.gaTrackingId); setLoading(false);
    }).catch(() => setLoading(false));
  }, [typeFilter, cityFilter, searchQuery, amenityFilter]);

  const handleSearch = (val: string) => { if (searchTimer.current) clearTimeout(searchTimer.current); searchTimer.current = setTimeout(() => setSearchQuery(val), 400); };
  const isRTL = locale === "ar";
  const hasFilters = typeFilter || cityFilter || searchQuery || amenityFilter.length > 0;
  const clearAll = () => { setTypeFilter(""); setCityFilter(""); setSearchQuery(""); setAmenityFilter([]); };

  const typeOptions = [{ value: "", label: locale === "ar" ? "جميع الأنواع" : "All Types" }, ...["apartment", "house", "shop", "land", "other"].map((tp) => ({ value: tp, label: TYPE_LABELS[locale][tp] }))];
  const cityOptions = [{ value: "", label: locale === "ar" ? "جميع المدن" : "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))];

  const txt = {
    ar: { marketplace: "السوق العام", properties: "العقارات", agents: "الوكلاء", search: "بحث عن عقارات...", clearFilters: "مسح", result: "نتيجة", noProperties: "لا توجد عقارات", noAgents: "لا يوجد وكلاء", switchLang: "English", backToDashboard: "لوحة التحكم", login: "دخول", availableProps: "عقار", viewProperties: "عرض" },
    en: { marketplace: "Marketplace", properties: "Properties", agents: "Agents", search: "Search...", clearFilters: "Clear", result: "result", noProperties: "No properties available", noAgents: "No agents available", switchLang: "العربية", backToDashboard: "Dashboard", login: "Sign In", availableProps: "available", viewProperties: "View" },
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#fafafa]">
      {gaTrackingId && <Analytics gaTrackingId={gaTrackingId} page="marketplace" />}

      <header className="glass border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" /> : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: brand.color }}><Home className="w-4 h-4 text-white" /></div>
              )}
              <span className="text-sm font-semibold text-zinc-900">{locale === "ar" ? brand.name : brand.nameEn}</span>
            </Link>
            <span className="text-zinc-200">|</span>
            <span className="text-[13px] font-medium text-zinc-500">{txt[locale].marketplace}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-[13px] text-zinc-400 hover:text-zinc-600 font-medium">{txt[locale].switchLang}</button>
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-3.5 py-2 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors">{txt[locale].backToDashboard}</Link>
            ) : (
              <Link href="/login" className="px-3.5 py-2 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"><LogIn className="w-3.5 h-3.5" />{txt[locale].login}</Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-200">
          {[{ key: "properties" as const, icon: Building2, label: txt[locale].properties }, { key: "agents" as const, icon: Users, label: txt[locale].agents }].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${tab === t.key ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {t.key === "agents" && agents.length > 0 && <span className="bg-zinc-100 text-zinc-500 text-[10px] font-semibold px-1.5 py-0.5 rounded">{agents.length}</span>}
            </button>
          ))}
        </div>

        {tab === "properties" && (
          <>
            <div className="card p-4 mb-6">
              <div className="relative mb-3">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input type="text" placeholder={txt[locale].search} onChange={(e) => handleSearch(e.target.value)} className="w-full ps-9 pe-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 placeholder-zinc-400" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Dropdown label={locale === "ar" ? "النوع" : "Type"} value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
                {cities.length > 0 && <Dropdown label={locale === "ar" ? "المدينة" : "City"} value={cityFilter} options={cityOptions} onChange={setCityFilter} />}
                {allAmenities.length > 0 && <AmenityDropdown amenities={allAmenities} selected={amenityFilter} onChange={setAmenityFilter} locale={locale} />}
                {hasFilters && <button onClick={clearAll} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-red-500 hover:bg-red-50 rounded-lg"><X className="w-3 h-3" />{txt[locale].clearFilters}</button>}
                <span className="ms-auto text-[11px] text-zinc-400">{properties.length} {txt[locale].result}</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 card"><Building2 className="w-10 h-10 text-zinc-200 mx-auto mb-2" /><p className="text-zinc-400 text-sm">{txt[locale].noProperties}</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((prop) => {
                  const images: string[] = JSON.parse(prop.images || "[]");
                  const coverImg = images[prop.thumbnail || 0] || images[0];
                  return (
                    <Link key={prop.id} href={`/listing/${prop.user.slug || prop.user.id}/${prop.slug || prop.id}`} className="card overflow-hidden hover:shadow-lg transition-all group">
                      <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                        {coverImg ? <img src={coverImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-zinc-200" /></div>}
                        <span className="absolute top-2.5 start-2.5 px-2.5 py-0.5 text-[11px] font-medium bg-white/90 backdrop-blur text-zinc-700 rounded">{TYPE_LABELS[locale][prop.type] || prop.type}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-zinc-900 text-[15px] mb-1.5">{prop.title}</h3>
                        <p className="text-[13px] text-zinc-400 flex items-center gap-1.5 mb-2.5"><MapPin className="w-3 h-3 shrink-0" />{prop.address}{prop.city && <span className="text-zinc-300">· {prop.city}</span>}</p>
                        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-50">
                          <span className="text-[11px] font-medium" style={{ color: brand.color }}>{prop.user.companyName || prop.user.name}</span>
                          {prop.amenities.length > 0 && (
                            <div className="flex gap-1">
                              {prop.amenities.slice(0, 3).map((pa) => (<span key={pa.amenity.id} className="px-1.5 py-0.5 text-[9px] font-medium bg-zinc-100 text-zinc-500 rounded">{locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}</span>))}
                              {prop.amenities.length > 3 && <span className="px-1.5 py-0.5 text-[9px] font-medium bg-zinc-100 text-zinc-400 rounded">+{prop.amenities.length - 3}</span>}
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
              <div className="text-center py-16 card"><Users className="w-10 h-10 text-zinc-200 mx-auto mb-2" /><p className="text-zinc-400 text-sm">{txt[locale].noAgents}</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {agents.map((agent) => (
                  <Link key={agent.id} href={`/listing/${agent.slug || agent.id}`} className="card p-5 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: brand.color }}><span className="text-lg font-bold text-white">{(agent.companyName || agent.name || "?").charAt(0)}</span></div>
                    <h3 className="font-semibold text-zinc-900 mb-0.5">{agent.companyName || agent.name}</h3>
                    {agent.phone && <p className="text-[12px] text-zinc-400 mb-2.5" dir="ltr">{agent.phone}</p>}
                    <div className="flex items-center justify-between pt-2.5 border-t border-zinc-50">
                      <span className="text-[11px] text-zinc-400">{agent._count.properties} {txt[locale].availableProps}</span>
                      <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: brand.color }}>{txt[locale].viewProperties}{isRTL && <ArrowLeft className="w-3 h-3" />}</span>
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
