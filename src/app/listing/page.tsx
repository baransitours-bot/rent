"use client";

import { useEffect, useState, useRef } from "react";
import { Building2, MapPin, Search, ChevronDown, X } from "lucide-react";
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

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" },
  en: { apartment: "Apartment", house: "House", shop: "Shop", land: "Land", other: "Other" },
};

function Dropdown({ label, value, options, onChange, locale }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  locale: "ar" | "en";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors min-w-[120px]"
      >
        <span className="text-gray-500 text-xs">{label}</span>
        <span className="font-medium text-gray-800 truncate">{selected?.label || label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ms-auto shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 start-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px] py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-start px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${value === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AmenityDropdown({ amenities, selected, onChange, locale }: {
  amenities: Amenity[];
  selected: string[];
  onChange: (ids: string[]) => void;
  locale: "ar" | "en";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
      >
        <span className="text-gray-500 text-xs">{locale === "ar" ? "الخدمات" : "Amenities"}</span>
        {selected.length > 0 && (
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded">{selected.length}</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 start-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[220px] py-1 max-h-60 overflow-y-auto">
          {amenities.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`w-full text-start px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${selected.includes(a.id) ? "bg-green-50" : ""}`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected.includes(a.id) ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}>
                {selected.includes(a.id) && <span className="text-[10px]">✓</span>}
              </span>
              {locale === "ar" ? a.nameAr : a.nameEn}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-start px-3 py-2 text-xs text-red-500 hover:bg-red-50 border-t"
            >
              {locale === "ar" ? "مسح الكل" : "Clear all"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const searchTimer = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("lang") === "en") setLocale("en");
  }, []);

  useEffect(() => {
    fetch("/api/amenities").then((r) => r.json()).then(setAllAmenities).catch(() => {});
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

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-gray-900">
              {locale === "ar" ? "السوق العام" : "Marketplace"}
            </h1>
          </div>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search + Filters Bar */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === "ar" ? "بحث عن عقارات..." : "Search properties..."}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown
              label={locale === "ar" ? "النوع" : "Type"}
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
              locale={locale}
            />
            {cities.length > 0 && (
              <Dropdown
                label={locale === "ar" ? "المدينة" : "City"}
                value={cityFilter}
                options={cityOptions}
                onChange={setCityFilter}
                locale={locale}
              />
            )}
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
                className="flex items-center gap-1 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                {locale === "ar" ? "مسح الفلاتر" : "Clear filters"}
              </button>
            )}
            <span className="ms-auto text-xs text-gray-400">
              {properties.length} {locale === "ar" ? "نتيجة" : properties.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {locale === "ar" ? "لا توجد عقارات متاحة حالياً" : "No properties available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => {
              const images: string[] = JSON.parse(prop.images || "[]");
              const thumbIdx = prop.thumbnail || 0;
              const coverImg = images[thumbIdx] || images[0];
              return (
                <Link
                  key={prop.id}
                  href={`/listing/${prop.user.slug || prop.user.id}/${prop.slug || prop.id}`}
                  className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
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
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {prop.address}
                      {prop.city && <span className="text-gray-400">· {prop.city}</span>}
                    </p>
                    <p className="text-xs text-blue-600 mb-2">
                      {prop.user.companyName || prop.user.name}
                    </p>
                    {prop.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prop.amenities.slice(0, 4).map((pa) => (
                          <span
                            key={pa.amenity.id}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600"
                          >
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
