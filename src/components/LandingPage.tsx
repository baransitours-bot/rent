"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Search, ArrowLeft, Users, Home, Shield, Phone, ChevronLeft } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/listing?limit=6").then((r) => r.json()),
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredProperties = searchQuery
    ? properties.filter((p) => p.title.includes(searchQuery) || p.address.includes(searchQuery) || p.city.includes(searchQuery))
    : properties;

  const c = brand.color;

  return (
    <div dir="rtl" className="min-h-screen bg-white text-zinc-900">
      {gaTrackingId && <Analytics gaTrackingId={gaTrackingId} page="landing" />}

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-zinc-100" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-9 h-9 object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: c }}>
                <Home className="w-4 h-4 text-white" />
              </div>
            )}
            <span className={`text-[15px] font-bold transition-colors ${scrolled ? "text-zinc-900" : "text-white"}`}>{brand.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${scrolled ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                العقارات
              </button>
              <button onClick={() => document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" })}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${scrolled ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                الوكلاء
              </button>
              <Link href="/listing"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${scrolled ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                السوق
              </Link>
            </div>
            <Link href="/login" className="px-4 py-2 text-white text-[13px] font-semibold rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: c }}>
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[520px] lg:min-h-[600px] flex items-center" style={{ background: `linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)` }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-6xl mx-auto px-5 lg:px-8 py-24 lg:py-32 w-full">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-[12px] text-white/80 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {properties.length}+ عقار متاح الآن
            </div>
            <h1 className="text-4xl lg:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight">
              ابحث عن
              <br />
              <span style={{ color: c }}>بيتك</span> القادم
            </h1>
            <p className="mt-4 text-[15px] text-zinc-400 leading-relaxed max-w-md">
              {brand.description || "منصتك الموثوقة للبحث عن العقارات المتاحة للإيجار. تصفّح العقارات وتواصل مباشرة مع الوكلاء."}
            </p>

            <div className="mt-8 flex bg-white rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
              <div className="flex-1 flex items-center px-4 gap-2.5">
                <Search className="w-4 h-4 text-zinc-300 shrink-0" />
                <input type="text" placeholder="ابحث بالمنطقة أو المدينة..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none bg-transparent" />
              </div>
              <Link href="/listing" className="px-5 lg:px-7 flex items-center gap-2 text-white text-[13px] font-semibold shrink-0 hover:opacity-90 transition-all" style={{ backgroundColor: c }}>
                <span className="hidden sm:inline">تصفّح الكل</span>
                <span className="sm:hidden">بحث</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-10 flex gap-8">
              {[
                { v: properties.length, l: "عقار متاح" },
                { v: agents.length, l: "وكيل معتمد" },
                { v: new Set(properties.map((p) => p.city).filter(Boolean)).size, l: "منطقة" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl lg:text-3xl font-bold text-white">{s.v}<span className="text-zinc-500 text-lg">+</span></div>
                  <div className="text-[12px] text-zinc-500 mt-0.5 font-medium">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "بحث سريع", desc: "ابحث حسب المنطقة والنوع والخدمات" },
              { icon: Shield, title: "وكلاء موثوقون", desc: "تواصل مع وكلاء عقارات معتمدين" },
              { icon: Phone, title: "تواصل مباشر", desc: "واتساب، هاتف، أو نموذج استفسار" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-zinc-50">
                  <f.icon className="w-[18px] h-[18px] text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-[15px]">{f.title}</h3>
                  <p className="text-[13px] text-zinc-400 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Properties ── */}
      <section id="properties" className="py-16 lg:py-20 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: c }}>العقارات</p>
              <h2 className="text-2xl lg:text-[1.75rem] font-bold text-zinc-900">أحدث العقارات المتاحة</h2>
            </div>
            <Link href="/listing" className="hidden md:flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-80 transition-opacity" style={{ color: c }}>
              عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (<div key={i} className="skeleton h-72 rounded-xl" />))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100">
              <Building2 className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400 text-[15px]">لا توجد عقارات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProperties.slice(0, 6).map((prop) => {
                const images: string[] = JSON.parse(prop.images || "[]");
                const coverImg = images[prop.thumbnail || 0] || images[0];
                return (
                  <Link key={prop.id} href={`/listing/${prop.user.slug || prop.user.id}/${prop.slug || prop.id}`}
                    className="bg-white rounded-xl overflow-hidden border border-zinc-100 hover:shadow-lg hover:shadow-zinc-200/50 hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="aspect-[16/11] bg-zinc-100 relative overflow-hidden">
                      {coverImg ? (
                        <img src={coverImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-zinc-200" /></div>
                      )}
                      <span className="absolute top-3 start-3 px-2.5 py-1 text-[11px] font-semibold bg-white/95 backdrop-blur-sm text-zinc-700 rounded-lg">
                        {TYPE_LABELS[prop.type] || prop.type}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-zinc-900 text-[15px] mb-2 line-clamp-1">{prop.title}</h3>
                      <p className="text-[13px] text-zinc-400 flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{prop.address}{prop.city && ` · ${prop.city}`}</span>
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                        <span className="text-[12px] font-semibold" style={{ color: c }}>{prop.user.companyName || prop.user.name}</span>
                        {prop.amenities.length > 0 && <span className="text-[11px] text-zinc-300 font-medium">{prop.amenities.length} خدمة</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link href="/listing" className="inline-flex items-center gap-2 text-[13px] font-semibold" style={{ color: c }}>
              عرض جميع العقارات <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredProperties.length > 6 && (
            <div className="mt-10 text-center">
              <Link href="/listing" className="inline-flex items-center gap-2 px-7 py-3 text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg" style={{ backgroundColor: c, boxShadow: `0 8px 24px ${c}30` }}>
                تصفّح جميع العقارات ({filteredProperties.length}) <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Agents ── */}
      {agents.length > 0 && (
        <section id="agents" className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-5 lg:px-8">
            <p className="text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: c }}>الوكلاء</p>
            <h2 className="text-2xl lg:text-[1.75rem] font-bold text-zinc-900 mb-8">وكلاء العقارات المعتمدين</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <Link key={agent.id} href={`/listing/${agent.slug || agent.id}`}
                  className="bg-[#fafafa] rounded-xl p-5 hover:bg-white hover:shadow-lg hover:shadow-zinc-200/50 hover:-translate-y-0.5 border border-zinc-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: c }}>
                    <span className="text-lg font-bold text-white">{(agent.companyName || agent.name || "?").charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 text-[15px] mb-0.5">{agent.companyName || agent.name}</h3>
                  {agent.phone && <p className="text-[12px] text-zinc-400 mb-3" dir="ltr">{agent.phone}</p>}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <span className="text-[12px] text-zinc-400 font-medium">{agent._count.properties} عقار</span>
                    <span className="text-[12px] font-semibold flex items-center gap-1" style={{ color: c }}>عرض <ArrowLeft className="w-3 h-3" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ background: `linear-gradient(135deg, #18181b 0%, #27272a 100%)` }}>
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">هل أنت وكيل عقارات؟</h2>
            <p className="text-zinc-400 text-[15px] leading-relaxed mb-8">انضم لمنصة {brand.name} وأدِر عقاراتك بسهولة. نظام متكامل لإدارة العقارات والمدفوعات.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="px-7 py-3 bg-white text-zinc-900 text-[14px] font-semibold rounded-xl hover:bg-zinc-100 transition-colors">تسجيل الدخول</Link>
              <Link href="/listing" className="px-7 py-3 border border-zinc-700 text-zinc-300 text-[14px] font-semibold rounded-xl hover:bg-zinc-800 transition-colors">تصفّح السوق</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-zinc-950">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-7 h-7 object-contain" /> : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: c }}><Home className="w-3.5 h-3.5 text-white" /></div>
              )}
              <span className="font-bold text-white text-[14px]">{brand.name}</span>
              <span className="text-[11px] text-zinc-600 font-medium">منصة إدارة العقارات</span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-zinc-500 font-medium">
              <Link href="/listing" className="hover:text-zinc-300 transition-colors">السوق</Link>
              <Link href="/login" className="hover:text-zinc-300 transition-colors">دخول الوكلاء</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
