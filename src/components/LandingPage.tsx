"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Search,
  ArrowLeft,
  ArrowRight,
  Users,
  Home,
  Shield,
  Phone,
  ChevronDown,
} from "lucide-react";
import Analytics from "@/components/Analytics";

interface Property {
  id: string;
  slug: string;
  title: string;
  address: string;
  city: string;
  type: string;
  images: string;
  thumbnail: number;
  user: { id: string; slug: string; companyName: string; name: string };
  amenities: Array<{ amenity: { id: string; nameAr: string; nameEn: string } }>;
}

interface Agent {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  phone: string;
  _count: { properties: number };
}

interface Branding {
  name: string;
  nameEn: string;
  logo: string;
  color: string;
  description: string;
  descriptionEn: string;
}

const TYPE_LABELS: Record<string, string> = {
  apartment: "شقة",
  house: "منزل",
  shop: "محل",
  land: "أرض",
  other: "أخرى",
};

export default function LandingPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gaTrackingId, setGaTrackingId] = useState("");
  const [brand, setBrand] = useState<Branding>({
    name: "دارك",
    nameEn: "Darak",
    logo: "",
    color: "#b45309",
    description: "",
    descriptionEn: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/listing").then((r) => r.json()),
      fetch("/api/listing/agents").then((r) => r.json()),
      fetch("/api/branding").then((r) => r.json()).catch(() => null),
    ])
      .then(([listingData, agentsData, brandingData]) => {
        setProperties(listingData.properties || []);
        setAgents(agentsData || []);
        if (listingData.gaTrackingId) setGaTrackingId(listingData.gaTrackingId);
        if (brandingData) setBrand(brandingData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProperties = searchQuery
    ? properties.filter(
        (p) =>
          p.title.includes(searchQuery) ||
          p.address.includes(searchQuery) ||
          p.city.includes(searchQuery)
      )
    : properties;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const c = brand.color; // shorthand for brand color

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50 text-gray-900">
      {gaTrackingId && <Analytics gaTrackingId={gaTrackingId} page="landing" />}
      {/* ──── Navigation ──── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-9 h-9 object-contain" />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: c }}>
                <Home className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-lg font-bold tracking-tight text-gray-900">
              {brand.name}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <button
              onClick={() => scrollToSection("properties")}
              className="hover:text-gray-900 transition-colors"
            >
              العقارات
            </button>
            <button
              onClick={() => scrollToSection("agents")}
              className="hover:text-gray-900 transition-colors"
            >
              الوكلاء
            </button>
            <Link
              href="/listing"
              className="hover:text-gray-900 transition-colors"
            >
              السوق
            </Link>
          </div>

          <Link
            href="/login"
            className="px-5 py-2 text-white text-sm font-semibold transition-colors"
            style={{ backgroundColor: c }}
          >
            تسجيل الدخول
          </Link>
        </div>
      </nav>

      {/* ──── Hero ──── */}
      <section className="pt-16">
        <div className="relative bg-stone-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTYwIDBIMFY2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50"></div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-36">
            <div className="max-w-2xl">
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                ابحث عن
                <span style={{ color: c }}> بيتك </span>
                القادم
              </h1>
              <p className="mt-6 text-lg text-stone-300 leading-relaxed max-w-lg">
                {brand.description ||
                  "منصتك الموثوقة للبحث عن العقارات المتاحة للإيجار. تصفّح العقارات وتواصل مباشرة مع الوكلاء المعتمدين."}
              </p>

              {/* Search Bar */}
              <div className="mt-10 flex bg-white">
                <div className="flex-1 flex items-center px-4 gap-3">
                  <Search className="w-5 h-5 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="ابحث بالمنطقة، المدينة، أو اسم العقار..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-4 text-gray-900 placeholder-stone-400 outline-none bg-transparent"
                  />
                </div>
                <Link
                  href="/listing"
                  className="px-8 py-4 text-white font-semibold transition-colors flex items-center gap-2 shrink-0"
                  style={{ backgroundColor: c }}
                >
                  تصفّح الكل
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-10 flex gap-12">
                <div>
                  <div className="text-3xl font-bold text-white">
                    {properties.length}+
                  </div>
                  <div className="text-sm text-stone-400 mt-1">عقار متاح</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {agents.length}+
                  </div>
                  <div className="text-sm text-stone-400 mt-1">وكيل معتمد</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {new Set(properties.map((p) => p.city).filter(Boolean)).size}+
                  </div>
                  <div className="text-sm text-stone-400 mt-1">منطقة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Features Strip ──── */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ backgroundColor: c + "15" }}>
                <Search className="w-5 h-5" style={{ color: c }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">بحث سريع</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  ابحث حسب المنطقة والنوع والخدمات المتاحة
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ backgroundColor: c + "15" }}>
                <Shield className="w-5 h-5" style={{ color: c }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">وكلاء موثوقون</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  تواصل مباشرة مع وكلاء عقارات معتمدين
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ backgroundColor: c + "15" }}>
                <Phone className="w-5 h-5" style={{ color: c }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">تواصل مباشر</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  واتساب، هاتف، أو نموذج استفسار مباشر
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Featured Properties ──── */}
      <section id="properties" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                عقارات متاحة
              </h2>
              <p className="text-gray-500 mt-2">
                أحدث العقارات المعروضة في السوق
              </p>
            </div>
            <Link
              href="/listing"
              className="hidden md:flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: c }}
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-stone-300 rounded-full animate-spin" style={{ borderTopColor: c }} />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200">
              <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد عقارات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.slice(0, 6).map((prop) => {
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
                        <img
                          src={coverImg}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-14 h-14 text-stone-300" />
                        </div>
                      )}
                      <span className="absolute top-3 start-3 px-3 py-1 text-xs font-semibold bg-white text-gray-800">
                        {TYPE_LABELS[prop.type] || prop.type}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {prop.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {prop.address}
                        {prop.city && (
                          <span className="text-stone-400">· {prop.city}</span>
                        )}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <span className="text-xs font-medium" style={{ color: c }}>
                          {prop.user.companyName || prop.user.name}
                        </span>
                        {prop.amenities.length > 0 && (
                          <span className="text-xs text-stone-400">
                            {prop.amenities.length} خدمة
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {filteredProperties.length > 6 && (
            <div className="mt-10 text-center">
              <Link
                href="/listing"
                className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors"
              >
                تصفّح جميع العقارات ({filteredProperties.length})
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ──── Agents Section ──── */}
      {agents.length > 0 && (
        <section
          id="agents"
          className="py-16 lg:py-24 bg-white border-t border-stone-200"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  وكلاء العقارات
                </h2>
                <p className="text-gray-500 mt-2">
                  تصفّح وكلاء العقارات المعتمدين وتواصل معهم مباشرة
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/listing/${agent.slug || agent.id}`}
                  className="border border-stone-200 p-6 hover:shadow-md transition-all group bg-stone-50 hover:bg-white"
                >
                  <div className="w-14 h-14 flex items-center justify-center mb-4" style={{ backgroundColor: c }}>
                    <span className="text-xl font-bold text-white">
                      {(agent.companyName || agent.name || "?").charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {agent.companyName || agent.name}
                  </h3>
                  {agent.phone && (
                    <p className="text-sm text-gray-500 mb-3" dir="ltr">
                      {agent.phone}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                    <span className="text-xs text-stone-500">
                      {agent._count.properties} عقار متاح
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: c }}>
                      عرض العقارات
                      <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──── CTA Section ──── */}
      <section className="bg-stone-900 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              هل أنت وكيل عقارات؟
            </h2>
            <p className="mt-4 text-stone-400 leading-relaxed">
              انضم لمنصة {brand.name} وأدِر عقاراتك بسهولة. نظام متكامل لإدارة
              العقارات، المستأجرين، المدفوعات، والمزيد.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 text-white font-semibold transition-colors"
                style={{ backgroundColor: c }}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/listing"
                className="px-8 py-3 border border-stone-600 text-stone-300 font-semibold hover:bg-stone-800 hover:text-white transition-colors"
              >
                تصفّح السوق
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="bg-stone-950 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: c }}>
                  <Home className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-bold text-white">{brand.name}</span>
              <span className="text-sm text-stone-500">
                · منصة إدارة العقارات
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <Link href="/listing" className="hover:text-stone-300 transition-colors">
                السوق
              </Link>
              <Link href="/login" className="hover:text-stone-300 transition-colors">
                دخول الوكلاء
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
