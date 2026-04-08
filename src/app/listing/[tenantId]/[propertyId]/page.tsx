"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, ArrowRight, ArrowLeft, Check, Share2, MessageCircle, Send, X, ChevronLeft, ChevronRight, Home, LogIn } from "lucide-react";
import Link from "next/link";
import Analytics from "@/components/Analytics";

interface Amenity { id: string; nameAr: string; nameEn: string; icon: string; }
interface Property { id: string; title: string; address: string; type: string; description: string; images: string; thumbnail: number; status: string; amenities: Array<{ amenity: Amenity }>; }
interface TenantUser { id: string; slug: string; name: string; companyName: string; phone: string; whatsapp: string; locale: string; currency: string; logo: string; brandColor: string; }

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" },
  en: { apartment: "Apartment", house: "House", shop: "Shop", land: "Land", other: "Other" },
};

function Lightbox({ images, startIndex, onClose, isRTL }: { images: string[]; startIndex: number; onClose: () => void; isRTL: boolean }) {
  const [current, setCurrent] = useState(startIndex);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length); if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length); };
    document.addEventListener("keydown", handler); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 end-4 text-white/80 hover:text-white z-10 p-2"><X className="w-5 h-5" /></button>
      <div className="absolute top-4 start-4 text-white/60 text-sm z-10 font-medium">{current + 1} / {images.length}</div>
      <div className="relative w-full h-full flex items-center justify-center px-16" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} className="absolute start-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white z-10 backdrop-blur-sm">{isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}</button>
            <button onClick={() => setCurrent((c) => (c + 1) % images.length)} className="absolute end-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white z-10 backdrop-blur-sm">{isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}</button>
          </>
        )}
        <img src={images[current]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-xl select-none" draggable={false} />
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const [data, setData] = useState<{ user: TenantUser; property: Property; gaTrackingId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [activeImage, setActiveImage] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ senderName: "", senderPhone: "", message: "" });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const autoSlideTimer = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lang") === "en") setLocale("en");
    fetch("/api/auth/session").then((r) => r.json()).then((s) => { if (s?.user) setIsLoggedIn(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/listing/${params.tenantId}/${params.propertyId}`).then((r) => r.json()).then((d) => {
      setData(d); if (d.user?.locale) setLocale(d.user.locale as "ar" | "en"); if (d.property) setActiveImage(d.property.thumbnail || 0); setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.tenantId, params.propertyId]);

  const images = data?.property ? JSON.parse(data.property.images || "[]") as string[] : [];

  const startAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    if (images.length > 1 && !isPaused) { autoSlideTimer.current = setInterval(() => setActiveImage((prev) => (prev + 1) % images.length), 4000); }
  }, [images.length, isPaused]);

  useEffect(() => { startAutoSlide(); return () => { if (autoSlideTimer.current) clearInterval(autoSlideTimer.current); }; }, [startAutoSlide]);

  const goToImage = (i: number) => { setActiveImage(i); setIsPaused(true); setTimeout(() => setIsPaused(false), 8000); };

  const isRTL = locale === "ar";
  const txt = {
    ar: { contact: "تواصل معنا", whatsappChat: "واتساب", sendInquiry: "إرسال طلب", yourName: "اسمك", yourPhone: "رقم هاتفك", yourMessage: "رسالتك", send: "إرسال", inquirySent: "تم إرسال طلبك بنجاح!", shareCopied: "تم نسخ!", switchLang: "English", services: "الخدمات المشمولة", close: "إغلاق", backToProperties: "العقارات", dashboard: "لوحة التحكم", login: "دخول" },
    en: { contact: "Contact Us", whatsappChat: "WhatsApp", sendInquiry: "Send Inquiry", yourName: "Your Name", yourPhone: "Your Phone", yourMessage: "Your Message", send: "Send", inquirySent: "Inquiry sent!", shareCopied: "Copied!", switchLang: "العربية", services: "Included Services", close: "Close", backToProperties: "Properties", dashboard: "Dashboard", login: "Sign In" },
  };

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); };
  const handleWhatsApp = () => {
    if (!data) return; const { user, property } = data;
    const msg = locale === "ar" ? `مرحباً، أنا مهتم بالعقار:\n${property.title}\n${property.address}\n${window.location.href}` : `Hello, I'm interested in:\n${property.title}\n${property.address}\n${window.location.href}`;
    window.open(`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSendingInquiry(true);
    await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: data.user.id, propertyId: data.property.id, propertyTitle: data.property.title, senderName: inquiryForm.senderName, senderPhone: inquiryForm.senderPhone, message: inquiryForm.message }) });
    setSendingInquiry(false); setInquirySent(true); setShowInquiry(false); setInquiryForm({ senderName: "", senderPhone: "", message: "" }); setTimeout(() => setInquirySent(false), 4000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>;
  if (!data?.property) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]"><p className="text-zinc-400 text-sm">Not found</p></div>;

  const { user, property } = data;
  const bc = user.brandColor || "#b45309";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const inputCls = "w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 focus:bg-white focus:border-zinc-300 transition-colors";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#fafafa]">
      {lightboxOpen && images.length > 0 && <Lightbox images={images} startIndex={activeImage} onClose={() => setLightboxOpen(false)} isRTL={isRTL} />}
      <Analytics gaTrackingId={data.gaTrackingId} userId={user.id} propertyId={property.id} page="property" />

      {/* ── Header ── */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href={`/listing/${user.slug || params.tenantId}`} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-500"><BackIcon className="w-4 h-4" /></Link>
            <div className="flex items-center gap-2">
              {user.logo ? <img src={user.logo} alt="" className="w-7 h-7 object-contain" /> : <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: bc }}><span className="text-[11px] font-bold text-white">{(user.companyName || user.name || "?").charAt(0)}</span></div>}
              <span className="font-bold text-zinc-900 text-[13px]">{user.companyName || user.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleShare} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 relative">
              <Share2 className="w-3.5 h-3.5" />
              {linkCopied && <span className="absolute -bottom-7 start-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded-lg whitespace-nowrap z-10">{txt[locale].shareCopied}</span>}
            </button>
            <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-[13px] text-zinc-400 hover:text-zinc-600 font-medium px-2 py-1">{txt[locale].switchLang}</button>
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-3 py-1.5 text-white text-[13px] font-semibold rounded-xl" style={{ backgroundColor: bc }}>{txt[locale].dashboard}</Link>
            ) : (
              <Link href="/login" className="px-3 py-1.5 text-white text-[13px] font-semibold rounded-xl flex items-center gap-1.5" style={{ backgroundColor: bc }}><LogIn className="w-3 h-3" />{txt[locale].login}</Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6">
        {/* ── Image Carousel ── */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-100 relative cursor-pointer group" onClick={() => setLightboxOpen(true)}>
              <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover transition-transform duration-500" />
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); goToImage((activeImage - 1 + images.length) % images.length); }} className="absolute start-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); goToImage((activeImage + 1) % images.length); }} className="absolute end-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="absolute bottom-3 start-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (<button key={i} onClick={(e) => { e.stopPropagation(); goToImage(i); }} className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? "bg-white w-5" : "bg-white/40 hover:bg-white/60"}`} />))}
                  </div>
                </>
              )}
              <span className="absolute top-3 end-3 bg-black/40 text-white text-[11px] px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium">{activeImage + 1}/{images.length}</span>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-2.5 pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => goToImage(i)} className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activeImage === i ? "border-zinc-900 ring-1 ring-zinc-300" : "border-transparent opacity-50 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Main Info ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-zinc-900 mb-2">{property.title}</h1>
                  <p className="text-zinc-400 text-[14px] flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" />{property.address}</p>
                </div>
                <span className="px-3 py-1 rounded-lg text-[12px] font-semibold shrink-0" style={{ backgroundColor: bc + "15", color: bc }}>{TYPE_LABELS[locale][property.type] || property.type}</span>
              </div>
              {property.description && <p className="text-zinc-500 text-[14px] leading-relaxed">{property.description}</p>}
            </div>

            {property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h3 className="text-[14px] font-bold text-zinc-900 mb-3">{txt[locale].services}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.amenities.map((pa) => (
                    <div key={pa.amenity.id} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-[13px] font-medium">
                      <Check className="w-3.5 h-3.5 shrink-0" />{locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar: Contact ── */}
          <div className="space-y-5">
            {inquirySent && <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-600 text-[13px] font-semibold text-center">{txt[locale].inquirySent}</div>}

            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <h3 className="text-[14px] font-bold text-zinc-900 mb-4">{txt[locale].contact}</h3>
              <div className="space-y-2">
                {user.whatsapp && (
                  <button onClick={handleWhatsApp} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-colors">
                    <MessageCircle className="w-4 h-4" />{txt[locale].whatsappChat}
                  </button>
                )}
                {user.phone && (
                  <a href={`tel:${user.phone}`} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-[13px] font-semibold hover:opacity-90 transition-colors" style={{ backgroundColor: bc }}>
                    <Phone className="w-4 h-4" /><span dir="ltr">{user.phone}</span>
                  </a>
                )}
                <button onClick={() => setShowInquiry(!showInquiry)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-[13px] font-semibold hover:bg-zinc-50 transition-colors">
                  <Send className="w-4 h-4" />{txt[locale].sendInquiry}
                </button>
              </div>

              {showInquiry && (
                <form onSubmit={handleInquirySubmit} className="mt-4 border-t border-zinc-100 pt-4 space-y-2.5">
                  <input type="text" required placeholder={txt[locale].yourName} value={inquiryForm.senderName} onChange={(e) => setInquiryForm({ ...inquiryForm, senderName: e.target.value })} className={inputCls} />
                  <input type="text" placeholder={txt[locale].yourPhone} value={inquiryForm.senderPhone} onChange={(e) => setInquiryForm({ ...inquiryForm, senderPhone: e.target.value })} className={inputCls} dir="ltr" />
                  <textarea placeholder={txt[locale].yourMessage} value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={sendingInquiry} className="flex-1 px-4 py-2.5 text-white rounded-xl text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 transition-colors" style={{ backgroundColor: bc }}>{sendingInquiry ? "..." : txt[locale].send}</button>
                    <button type="button" onClick={() => setShowInquiry(false)} className="px-4 py-2.5 border border-zinc-200 text-zinc-500 rounded-xl text-[13px] font-semibold hover:bg-zinc-50 transition-colors">{txt[locale].close}</button>
                  </div>
                </form>
              )}
            </div>

            {/* Agent card */}
            <Link href={`/listing/${user.slug || params.tenantId}`} className="block bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                {user.logo ? <img src={user.logo} alt="" className="w-11 h-11 object-contain rounded-xl" /> : (
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bc }}>
                    <span className="text-lg font-bold text-white">{(user.companyName || user.name || "?").charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 text-[14px] truncate">{user.companyName || user.name}</p>
                  <p className="text-[12px] font-medium flex items-center gap-1" style={{ color: bc }}>{txt[locale].backToProperties} <ArrowLeft className="w-3 h-3" /></p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
