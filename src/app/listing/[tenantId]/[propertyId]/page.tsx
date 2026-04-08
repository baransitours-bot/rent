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
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 end-4 text-white/80 hover:text-white z-10 p-2"><X className="w-5 h-5" /></button>
      <div className="absolute top-4 start-4 text-white/60 text-sm z-10">{current + 1} / {images.length}</div>
      <div className="relative w-full h-full flex items-center justify-center px-16" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} className="absolute start-2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10">{isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}</button>
            <button onClick={() => setCurrent((c) => (c + 1) % images.length)} className="absolute end-2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10">{isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}</button>
          </>
        )}
        <img src={images[current]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg select-none" draggable={false} />
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
    ar: { contact: "تواصل معنا", whatsappChat: "واتساب", sendInquiry: "إرسال طلب", yourName: "اسمك", yourPhone: "رقم هاتفك", yourMessage: "رسالتك", send: "إرسال", inquirySent: "تم إرسال طلبك بنجاح!", shareCopied: "تم نسخ!", switchLang: "English", services: "الخدمات المشمولة", close: "إغلاق" },
    en: { contact: "Contact Us", whatsappChat: "WhatsApp", sendInquiry: "Send Inquiry", yourName: "Your Name", yourPhone: "Your Phone", yourMessage: "Your Message", send: "Send", inquirySent: "Inquiry sent!", shareCopied: "Copied!", switchLang: "العربية", services: "Included Services", close: "Close" },
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

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#fafafa]">
      {lightboxOpen && images.length > 0 && <Lightbox images={images} startIndex={activeImage} onClose={() => setLightboxOpen(false)} isRTL={isRTL} />}
      <Analytics gaTrackingId={data.gaTrackingId} userId={user.id} propertyId={property.id} page="property" />

      <header className="glass border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/listing/${user.slug || params.tenantId}`} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500"><BackIcon className="w-4 h-4" /></Link>
            <span className="text-zinc-200">|</span>
            <div className="flex items-center gap-2">
              {user.logo ? <img src={user.logo} alt="" className="w-7 h-7 object-contain" /> : <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: bc }}><span className="text-[11px] font-bold text-white">{(user.companyName || user.name || "?").charAt(0)}</span></div>}
              <span className="font-semibold text-zinc-900 text-[13px]">{user.companyName || user.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 relative">
              <Share2 className="w-3.5 h-3.5" />
              {linkCopied && <span className="absolute -bottom-6 start-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">{txt[locale].shareCopied}</span>}
            </button>
            <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-[13px] text-zinc-400 hover:text-zinc-600 font-medium">{txt[locale].switchLang}</button>
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-3 py-1.5 text-white text-[13px] font-medium rounded-lg" style={{ backgroundColor: bc }}>{locale === "ar" ? "لوحة التحكم" : "Dashboard"}</Link>
            ) : (
              <Link href="/login" className="px-3 py-1.5 text-white text-[13px] font-medium rounded-lg flex items-center gap-1.5" style={{ backgroundColor: bc }}><LogIn className="w-3 h-3" />{locale === "ar" ? "دخول" : "Sign In"}</Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Image Carousel */}
        {images.length > 0 && (
          <div className="mb-5">
            <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100 relative cursor-pointer group" onClick={() => setLightboxOpen(true)}>
              <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover transition-transform duration-500" />
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); goToImage((activeImage - 1 + images.length) % images.length); }} className="absolute start-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); goToImage((activeImage + 1) % images.length); }} className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="absolute bottom-2.5 start-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (<button key={i} onClick={(e) => { e.stopPropagation(); goToImage(i); }} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImage ? "bg-white" : "bg-white/40"}`} />))}
                  </div>
                </>
              )}
              <span className="absolute top-2 end-2 bg-black/40 text-white text-[11px] px-2 py-0.5 rounded-lg backdrop-blur-sm">{activeImage + 1}/{images.length}</span>
            </div>
            {images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto mt-2 pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => goToImage(i)} className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activeImage === i ? "border-zinc-900 ring-1 ring-zinc-300" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Info */}
        <div className="card p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 mb-1.5">{property.title}</h1>
              <p className="text-zinc-400 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" />{property.address}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600">{TYPE_LABELS[locale][property.type] || property.type}</span>
          </div>
          {property.description && <p className="text-zinc-500 text-[13px] leading-relaxed mb-5">{property.description}</p>}
          {property.amenities.length > 0 && (
            <div>
              <h3 className="text-[13px] font-semibold text-zinc-700 mb-2">{txt[locale].services}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {property.amenities.map((pa) => (
                  <div key={pa.amenity.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-[13px] font-medium">
                    <Check className="w-3.5 h-3.5 shrink-0" />{locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {inquirySent && <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4 text-emerald-600 text-[13px] font-medium text-center">{txt[locale].inquirySent}</div>}

        {/* Contact */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-zinc-700 mb-3">{txt[locale].contact}</h3>
          <div className="flex flex-wrap gap-2">
            {user.whatsapp && <button onClick={handleWhatsApp} className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-[13px] font-medium hover:bg-emerald-700"><MessageCircle className="w-3.5 h-3.5" />{txt[locale].whatsappChat}</button>}
            {user.phone && <a href={`tel:${user.phone}`} className="inline-flex items-center gap-2 px-3.5 py-2 text-white rounded-lg text-[13px] font-medium hover:opacity-90" style={{ backgroundColor: bc }}><Phone className="w-3.5 h-3.5" /><span dir="ltr">{user.phone}</span></a>}
            <button onClick={() => setShowInquiry(!showInquiry)} className="inline-flex items-center gap-2 px-3.5 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-[13px] font-medium hover:bg-zinc-50"><Send className="w-3.5 h-3.5" />{txt[locale].sendInquiry}</button>
          </div>

          {showInquiry && (
            <form onSubmit={handleInquirySubmit} className="mt-4 border-t border-zinc-100 pt-4 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input type="text" required placeholder={txt[locale].yourName} value={inquiryForm.senderName} onChange={(e) => setInquiryForm({ ...inquiryForm, senderName: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 placeholder-zinc-400" />
                <input type="text" placeholder={txt[locale].yourPhone} value={inquiryForm.senderPhone} onChange={(e) => setInquiryForm({ ...inquiryForm, senderPhone: e.target.value })} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 placeholder-zinc-400" dir="ltr" />
              </div>
              <textarea placeholder={txt[locale].yourMessage} value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 resize-none" />
              <div className="flex gap-2">
                <button type="submit" disabled={sendingInquiry} className="px-4 py-2.5 text-white rounded-lg text-[13px] font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: bc }}>{sendingInquiry ? "..." : txt[locale].send}</button>
                <button type="button" onClick={() => setShowInquiry(false)} className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-lg text-[13px] font-medium hover:bg-zinc-50">{txt[locale].close}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
