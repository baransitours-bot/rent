"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Search, ArrowLeft, Users, Home, Shield, Phone } from "lucide-react";
import Analytics from "@/components/Analytics";

interface Property {
  id: string; slug: string; title: string; address: string; city: string; type: string; images: string; thumbnail: number;
  user: { id: string; slug: string; companyName: string; name: string };
  amenities: Array<{ amenity: { id: string; nameAr: string; nameEn: string } }>;
}

interface Agent { id: string; slug: string; name: string; companyName: string; phone: string; _count: { properties: number }; }
interface Branding { name: string; nameEn: string; logo: string; color: string; description: string; descriptionEn: string; }

const TYPE_LABELS: Record<string, string> = { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" };

export default function LandingPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gaTrackingId, setGaTrackingId] = useState("");
  const [brand, setBrand] = useState<Branding>({ name: "دارك", nameEn: "Darak", logo: "", color: "#b45309", description: "", descriptionEn: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/listing").then((r) => r.json()),
      fetch("/api/listing/agents").then((r) => r.json()),
      fetch("/api/branding").then((r) => r.json()).catch(() => null),
    ]).then(([listingData, agentsData, brandingData]) => {
      setProperties(listingData.properties || []);
      setAgents(agentsData || []);
      if (listingData.gaTrackingId) setGaTrackingId(listingData.gaTrackingId);
      if (brandingData) setBrand(brandingData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProperties = searchQuery
    ? properties.filter((p) => p.title.includes(searchQuery) || p.address.includes(searchQuery) || p.city.includes(searchQuery))
    : properties;

  const c = brand.color;

  return (
    <div dir="rtl" className="min-h-screen bg-[#fafafa] text-zinc-900">
      {gaTrackingId && <Analytics gaTrackingId={gaTrackingId} page="landing" />}

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c }}>
                <Home className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-sm font-semibold text-zinc-900">{brand.name}</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-zinc-400">
            <button onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-zinc-900 transition-colors">العقارات</button>
            <button onClick={() => document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-zinc-900 transition-colors">الوكلاء</button>
            <Link href="/listing" className="hover:text-zinc-900 transition-colors">السوق</Link>
          </div>

          <Link href="/login" className="px-4 py-2 text-white text-[13px] font-medium rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: c }}>
            تسجيل الدخول
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-14">
        <div className="relative bg-zinc-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTYwIDBIMFY2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
            <div className="max-w-2xl">
              <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                ابحث عن <span style={{ color: c }}>بيتك</span> القادم
              </h1>
              <p className="mt-5 text-base text-zinc-400 leading-relaxed max-w-lg">
                {brand.description || "منصتك الموثوقة للبحث عن العقارات المتاحة للإيجار. تصفّح العقارات وتواصل مباشرة مع الوكلاء المعتمدين."}
              </p>

              <div className="mt-8 flex bg-white rounded-lg overflow-hidden">
                <div className="flex-1 flex items-center px-4 gap-2.5">
                  <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input type="text" placeholder="ابحث بالمنطقة، المدينة، أو اسم العقار..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none bg-transparent" />
                </div>
                <Link href="/listing" className="px-6 py-3.5 text-white text-[13px] font-medium flex items-center gap-2 shrink-0 hover:opacity-90 transition-colors" style={{ backgroundColor: c }}>
                  تصفّح الكل <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-8 flex gap-10">
                {[{ v: properties.length, l: "عقار متاح" }, { v: agents.length, l: "وكيل معتمد" }, { v: new Set(properties.map((p) => p.city).filter(Boolean)).size, l: "منطقة" }].map((s, i) => (
                  <div key={i}><div className="text-2xl font-bold text-white">{s.v}+</div><div className="text-[12px] text-zinc-500 mt-0.5">{s.l}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: "بحث سريع", desc: "ابحث حسب المنطقة والنوع والخدمات المتاحة" },
              { icon: Shield, title: "وكلاء موثوقون", desc: "تواصل مباشرة مع وكلاء عقارات معتمدين" },
              { icon: Phone, title: "تواصل مباشر", desc: "واتساب، هاتف، أو نموذج استفسار مباشر" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: c + "12" }}>
                  <f.icon className="w-4 h-4" style={{ color: c }} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">{f.title}</h3>
                  <p className="text-[13px] text-zinc-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties */}
      <section id="properties" className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-zinc-900">عقارات متاحة</h2>
              <p className="text-zinc-400 mt-1 text-sm">أحدث العقارات المعروضة في السوق</p>
            </div>
            <Link href="/listing" className="hidden md:flex items-center gap-1.5 text-[13px] font-medium" style={{ color: c }}>
              عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-14 card">
              <Building2 className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">لا توجد عقارات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.slice(0, 6).map((prop) => {
                const images: string[] = JSON.parse(prop.images || "[]");
                const coverImg = images[prop.thumbnail || 0] || images[0];
                return (
                  <Link key={prop.id} href={`/listing/${prop.user.slug || prop.user.id}/${prop.slug || prop.id}`}
                    className="card overflow-hidden hover:shadow-lg transition-all group">
                    <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                      {coverImg ? (
                        <img src={coverImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-zinc-200" /></div>
                      )}
                      <span className="absolute top-2.5 start-2.5 px-2.5 py-0.5 text-[11px] font-medium bg-white/90 backdrop-blur text-zinc-700 rounded">
                        {TYPE_LABELS[prop.type] || prop.type}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-zinc-900 text-[15px] mb-1.5">{prop.title}</h3>
                      <p className="text-[13px] text-zinc-400 flex items-center gap-1.5 mb-2.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {prop.address} {prop.city && <span className="text-zinc-300">· {prop.city}</span>}
                      </p>
                      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-50">
                        <span className="text-[11px] font-medium" style={{ color: c }}>{prop.user.companyName || prop.user.name}</span>
                        {prop.amenities.length > 0 && <span className="text-[11px] text-zinc-300">{prop.amenities.length} خدمة</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {filteredProperties.length > 6 && (
            <div className="mt-8 text-center">
              <Link href="/listing" className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: c }}>
                تصفّح جميع العقارات ({filteredProperties.length}) <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Agents */}
      {agents.length > 0 && (
        <section id="agents" className="py-14 lg:py-20 bg-white border-t border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="text-xl lg:text-2xl font-bold text-zinc-900 mb-1">وكلاء العقارات</h2>
            <p className="text-zinc-400 text-sm mb-8">تصفّح وكلاء العقارات المعتمدين</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {agents.map((agent) => (
                <Link key={agent.id} href={`/listing/${agent.slug || agent.id}`} className="card p-5 hover:shadow-md transition-all">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: c }}>
                    <span className="text-lg font-bold text-white">{(agent.companyName || agent.name || "?").charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-0.5">{agent.companyName || agent.name}</h3>
                  {agent.phone && <p className="text-[12px] text-zinc-400 mb-2.5" dir="ltr">{agent.phone}</p>}
                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-50">
                    <span className="text-[11px] text-zinc-400">{agent._count.properties} عقار متاح</span>
                    <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: c }}>عرض العقارات <ArrowLeft className="w-3 h-3" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-20">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-xl lg:text-2xl font-bold text-white">هل أنت وكيل عقارات؟</h2>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed">انضم لمنصة {brand.name} وأدِر عقاراتك بسهولة. نظام متكامل لإدارة العقارات والمدفوعات.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="px-6 py-2.5 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors">تسجيل الدخول</Link>
              <Link href="/listing" className="px-6 py-2.5 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors">تصفّح السوق</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-7 h-7 object-contain" /> : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: c }}><Home className="w-3.5 h-3.5 text-white" /></div>
              )}
              <span className="font-semibold text-white text-sm">{brand.name}</span>
              <span className="text-[11px] text-zinc-600">· منصة إدارة العقارات</span>
            </div>
            <div className="flex items-center gap-5 text-[13px] text-zinc-500">
              <Link href="/listing" className="hover:text-zinc-300 transition-colors">السوق</Link>
              <Link href="/login" className="hover:text-zinc-300 transition-colors">دخول الوكلاء</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
