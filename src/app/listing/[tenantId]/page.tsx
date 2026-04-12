"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, Share2, Home, LogIn, ArrowLeft, MessageCircle, Search, X, Loader2, ChevronDown, Send } from "lucide-react";
import Link from "next/link";
import { Dropdown, AmenityDropdown } from "@/components/FilterDropdowns";
import Analytics from "@/components/Analytics";

interface Amenity { id: string; nameAr: string; nameEn: string; icon: string; }
interface Property { id: string; slug: string; title: string; address: string; type: string; description: string; images: string; thumbnail: number; status: string; amenities: Array<{ amenity: Amenity }>; }
interface TenantUser { id: string; slug: string; name: string; companyName: string; phone: string; whatsapp: string; locale: string; currency: string; logo: string; brandColor: string; }

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" },
  en: { apartment: "Apartment", house: "House", shop: "Shop", land: "Land", other: "Other" },
};

export default function ListingPage() {
  const params = useParams();
  const [user, setUser] = useState<TenantUser | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [gaTrackingId, setGaTrackingId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [linkCopied, setLinkCopied] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ senderName: "", senderPhone: "", message: "" });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const searchTimer = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lang") === "en") setLocale("en");
    fetch("/api/auth/session").then((r) => r.json()).then((s) => { if (s?.user) setIsLoggedIn(true); }).catch(() => {});
  }, []);

  const buildQuery = useCallback((cursor?: string) => {
    const qs = new URLSearchParams();
    if (typeFilter) qs.set("type", typeFilter);
    if (amenityFilter.length > 0) qs.set("amenities", amenityFilter.join(","));
    if (cursor) qs.set("cursor", cursor);
    return qs.toString();
  }, [typeFilter, amenityFilter]);

  useEffect(() => {
    setLoading(true);
    setNextCursor(null);
    setHasMore(false);
    fetch(`/api/listing/${params.tenantId}?${buildQuery()}`).then((r) => r.json()).then((d) => {
      setUser(d.user || null);
      setProperties(d.properties || []);
      setGaTrackingId(d.gaTrackingId);
      setNextCursor(d.nextCursor || null);
      setHasMore(d.hasMore || false);
      if (initialLoad && d.user?.locale) { setLocale(d.user.locale as "ar" | "en"); setInitialLoad(false); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.tenantId, buildQuery]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/listing/${params.tenantId}?${buildQuery(nextCursor)}`);
      const d = await res.json();
      setProperties((prev) => [...prev, ...(d.properties || [])]);
      setNextCursor(d.nextCursor || null);
      setHasMore(d.hasMore || false);
    } catch {}
    setLoadingMore(false);
  };

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  useEffect(() => { fetch("/api/amenities").then((r) => r.json()).then(setAllAmenities).catch(() => {}); }, []);

  const isRTL = locale === "ar";
  const txt = {
    ar: { available: "العقارات المتاحة", noProperties: "لا توجد عقارات", allTypes: "جميع الأنواع", switchLang: "English", shareCopied: "تم نسخ!", marketplace: "السوق", backToDashboard: "لوحة التحكم", login: "دخول", propertyCount: "عقار", whatsapp: "واتساب", call: "اتصل", search: "بحث...", clearFilters: "مسح", result: "نتيجة", loadMore: "عرض المزيد", loading: "جاري التحميل...", contact: "تواصل معنا", yourName: "اسمك", yourPhone: "رقم هاتفك", yourMessage: "رسالتك", send: "إرسال", close: "إغلاق", inquirySent: "تم إرسال طلبك بنجاح!", sendInquiry: "إرسال استفسار" },
    en: { available: "Available Properties", noProperties: "No properties available", allTypes: "All Types", switchLang: "العربية", shareCopied: "Copied!", marketplace: "Marketplace", backToDashboard: "Dashboard", login: "Sign In", propertyCount: "available", whatsapp: "WhatsApp", call: "Call", search: "Search...", clearFilters: "Clear", result: "results", loadMore: "Load More", loading: "Loading...", contact: "Contact Us", yourName: "Your Name", yourPhone: "Your Phone", yourMessage: "Your Message", send: "Send", close: "Close", inquirySent: "Inquiry sent!", sendInquiry: "Send Inquiry" },
  };

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); };
  const handleSearch = (val: string) => { if (searchTimer.current) clearTimeout(searchTimer.current); searchTimer.current = setTimeout(() => setSearchQuery(val), 300); };
  const handleWhatsApp = () => {
    if (!user) return;
    const msg = locale === "ar" ? `مرحباً، أود التواصل معكم بخصوص عقاراتكم.\n${window.location.href}` : `Hello, I'd like to inquire about your properties.\n${window.location.href}`;
    window.open(`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return; setSendingInquiry(true);
    await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, senderName: inquiryForm.senderName, senderPhone: inquiryForm.senderPhone, message: inquiryForm.message }) });
    setSendingInquiry(false); setInquirySent(true); setShowContact(false); setInquiryForm({ senderName: "", senderPhone: "", message: "" }); setTimeout(() => setInquirySent(false), 4000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]"><p className="text-zinc-400 text-sm">Not found</p></div>;

  const bc = user.brandColor || "#b45309";
  const filteredProperties = searchQuery ? properties.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.address.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())) : properties;
  const typeOptions = [{ value: "", label: txt[locale].allTypes }, ...["apartment", "house", "shop", "land", "other"].map((tp) => ({ value: tp, label: TYPE_LABELS[locale][tp] }))];
  const hasFilters = typeFilter || amenityFilter.length > 0 || searchQuery;
  const clearAll = () => { setTypeFilter(""); setAmenityFilter([]); setSearchQuery(""); };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#fafafa]">
      {/* ── Contact Modal ── */}
      {showContact && user && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-zinc-900">{txt[locale].contact}</h3>
              <button onClick={() => setShowContact(false)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 mb-4">
              {user.whatsapp && (
                <button onClick={handleWhatsApp} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-colors">
                  <MessageCircle className="w-4 h-4" />{txt[locale].whatsapp}
                </button>
              )}
              {user.phone && (
                <a href={`tel:${user.phone}`} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-[13px] font-semibold hover:opacity-90 transition-colors" style={{ backgroundColor: bc }}>
                  <Phone className="w-4 h-4" /><span dir="ltr">{user.phone}</span>
                </a>
              )}
            </div>
            <form onSubmit={handleInquirySubmit} className="border-t border-zinc-100 pt-4 space-y-2.5">
              <p className="text-[13px] font-semibold text-zinc-700 mb-2">{txt[locale].sendInquiry}</p>
              <input type="text" required placeholder={txt[locale].yourName} value={inquiryForm.senderName} onChange={(e) => setInquiryForm({ ...inquiryForm, senderName: e.target.value })} className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 focus:bg-white focus:border-zinc-300 transition-colors" />
              <input type="text" placeholder={txt[locale].yourPhone} value={inquiryForm.senderPhone} onChange={(e) => setInquiryForm({ ...inquiryForm, senderPhone: e.target.value })} className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 focus:bg-white focus:border-zinc-300 transition-colors" dir="ltr" />
              <textarea placeholder={txt[locale].yourMessage} value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 focus:bg-white focus:border-zinc-300 transition-colors resize-none" />
              <div className="flex gap-2">
                <button type="submit" disabled={sendingInquiry} className="flex-1 px-4 py-2.5 text-white rounded-xl text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 transition-colors" style={{ backgroundColor: bc }}>{sendingInquiry ? "..." : txt[locale].send}</button>
                <button type="button" onClick={() => setShowContact(false)} className="px-4 py-2.5 border border-zinc-200 text-zinc-500 rounded-xl text-[13px] font-semibold hover:bg-zinc-50 transition-colors">{txt[locale].close}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {inquirySent && <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-600 text-[13px] font-semibold shadow-lg animate-fade-up">{txt[locale].inquirySent}</div>}

      {/* ── Header ── */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="shrink-0">
              {user.logo ? <img src={user.logo} alt="" className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bc }}><Home className="w-3.5 h-3.5 text-white" /></div>}
            </Link>
            <span className="text-[13px] sm:text-[14px] font-bold text-zinc-900 truncate">{user.companyName || user.name}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link href="/listing" className="text-[12px] sm:text-[13px] text-zinc-400 hover:text-zinc-600 hidden sm:block font-medium px-1.5 py-1">{txt[locale].marketplace}</Link>
            <button onClick={handleShare} className="p-1.5 sm:p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 relative">
              <Share2 className="w-3.5 h-3.5" />
              {linkCopied && <span className="absolute -bottom-7 start-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded-lg whitespace-nowrap z-10">{txt[locale].shareCopied}</span>}
            </button>
            <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-[12px] sm:text-[13px] text-zinc-400 hover:text-zinc-600 font-medium px-1 sm:px-2 py-1">{txt[locale].switchLang}</button>
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-white text-[12px] sm:text-[13px] font-semibold rounded-xl whitespace-nowrap" style={{ backgroundColor: bc }}>
                <span className="hidden sm:inline">{txt[locale].backToDashboard}</span>
                <span className="sm:hidden">{locale === "ar" ? "التحكم" : "Dash"}</span>
              </Link>
            ) : (
              <Link href="/login" className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-white text-[12px] sm:text-[13px] font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap" style={{ backgroundColor: bc }}><LogIn className="w-3.5 h-3.5" /><span className="hidden sm:inline">{txt[locale].login}</span></Link>
            )}
          </div>
        </div>
      </header>

      <Analytics gaTrackingId={gaTrackingId} userId={user.id} page="profile" />

      {/* ── Agent Hero ── */}
      <section style={{ background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)" }}>
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {user.logo ? <img src={user.logo} alt="" className="w-16 h-16 object-contain bg-white p-2 rounded-xl shrink-0" /> : (
              <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bc }}><span className="text-2xl font-bold text-white">{(user.companyName || user.name || "?").charAt(0)}</span></div>
            )}
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-white">{user.companyName || user.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-[13px] text-zinc-400 font-medium">{properties.length} {txt[locale].propertyCount}</span>
                {user.phone && <span className="text-[13px] text-zinc-400 flex items-center gap-1"><Phone className="w-3 h-3" /><span dir="ltr">{user.phone}</span></span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              {user.whatsapp && <a href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white text-[12px] sm:text-[13px] font-semibold rounded-xl hover:bg-emerald-700 transition-colors"><MessageCircle className="w-3.5 h-3.5" />{txt[locale].whatsapp}</a>}
              {user.phone && <a href={`tel:${user.phone}`} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-zinc-600 text-zinc-300 text-[12px] sm:text-[13px] font-semibold rounded-xl hover:bg-zinc-800 transition-colors"><Phone className="w-3.5 h-3.5" />{txt[locale].call}</a>}
              <button onClick={() => setShowContact(true)} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-zinc-600 text-zinc-300 text-[12px] sm:text-[13px] font-semibold rounded-xl hover:bg-zinc-800 transition-colors"><Send className="w-3.5 h-3.5" />{locale === "ar" ? "استفسار" : "Inquire"}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Properties ── */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">{txt[locale].available}</h2>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-zinc-100 p-4 mb-6">
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input type="text" placeholder={txt[locale].search} onChange={(e) => handleSearch(e.target.value)}
              className="w-full ps-10 pe-3 py-2.5 border border-zinc-200 rounded-xl text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 focus:bg-white focus:border-zinc-300 transition-colors" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown label={locale === "ar" ? "النوع" : "Type"} value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
            {allAmenities.length > 0 && <AmenityDropdown amenities={allAmenities} selected={amenityFilter} onChange={setAmenityFilter} locale={locale} />}
            {hasFilters && <button onClick={clearAll} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-red-500 hover:bg-red-50 rounded-lg font-medium"><X className="w-3 h-3" />{txt[locale].clearFilters}</button>}
            <span className="ms-auto text-[12px] text-zinc-400 font-medium">{filteredProperties.length} {txt[locale].result}</span>
          </div>
        </div>

        {/* Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100">
            <Building2 className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
            <p className="text-zinc-400 text-[15px]">{txt[locale].noProperties}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProperties.map((prop) => {
                const images: string[] = JSON.parse(prop.images || "[]");
                const coverImg = images[prop.thumbnail || 0] || images[0];
                return (
                  <Link key={prop.id} href={`/listing/${user.slug || params.tenantId}/${prop.slug || prop.id}`}
                    className="bg-white rounded-xl overflow-hidden border border-zinc-100 hover:shadow-lg hover:shadow-zinc-200/50 hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="aspect-[16/11] bg-zinc-100 relative overflow-hidden">
                      {coverImg ? <img src={coverImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <img src="/placeholder-property.svg" alt="" className="w-full h-full object-cover" />}
                      <span className="absolute top-3 start-3 px-2.5 py-1 text-[11px] font-semibold bg-white/95 backdrop-blur-sm text-zinc-700 rounded-lg">{TYPE_LABELS[locale][prop.type] || prop.type}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-zinc-900 text-[15px] mb-2 line-clamp-1">{prop.title}</h3>
                      <p className="text-[13px] text-zinc-400 flex items-center gap-1.5 mb-3"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="line-clamp-1">{prop.address}</span></p>
                      {prop.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-3 border-t border-zinc-100">
                          {prop.amenities.slice(0, 3).map((pa) => (<span key={pa.amenity.id} className="px-1.5 py-0.5 text-[9px] font-semibold bg-zinc-50 text-zinc-500 rounded">{locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}</span>))}
                          {prop.amenities.length > 3 && <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-zinc-50 text-zinc-400 rounded">+{prop.amenities.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button onClick={loadMore} disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-zinc-200 text-zinc-700 text-[14px] font-semibold rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50">
                  {loadingMore ? (<><Loader2 className="w-4 h-4 animate-spin" />{txt[locale].loading}</>) : (<><ChevronDown className="w-4 h-4" />{txt[locale].loadMore}</>)}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
