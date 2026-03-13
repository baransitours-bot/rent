"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Phone, ArrowRight, ArrowLeft, Check, Share2, MessageCircle, Send, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Amenity {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  type: string;
  description: string;
  images: string;
  thumbnail: number;
  status: string;
  amenities: Array<{ amenity: Amenity }>;
}

interface TenantUser {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  whatsapp: string;
  locale: string;
  currency: string;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ar: { apartment: "شقة", house: "منزل", shop: "محل", land: "أرض", other: "أخرى" },
  en: { apartment: "Apartment", house: "House", shop: "Shop", land: "Land", other: "Other" },
};

function Lightbox({ images, startIndex, onClose, isRTL }: {
  images: string[];
  startIndex: number;
  onClose: () => void;
  isRTL: boolean;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 end-4 text-white/80 hover:text-white z-10 p-2">
        <X className="w-6 h-6" />
      </button>
      <div className="absolute top-4 start-4 text-white/60 text-sm z-10">
        {current + 1} / {images.length}
      </div>
      <div className="relative w-full h-full flex items-center justify-center px-16" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute start-2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10">
              {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </button>
            <button onClick={next} className="absolute end-2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10">
              {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
          </>
        )}
        <img
          src={images[current]}
          alt=""
          className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
          draggable={false}
        />
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const [data, setData] = useState<{ user: TenantUser; property: Property } | null>(null);
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
  const autoSlideTimer = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("lang") === "en") setLocale("en");
  }, []);

  useEffect(() => {
    fetch(`/api/listing/${params.tenantId}/${params.propertyId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.user?.locale) setLocale(d.user.locale as "ar" | "en");
        if (d.property) setActiveImage(d.property.thumbnail || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.tenantId, params.propertyId]);

  const images = data?.property ? JSON.parse(data.property.images || "[]") as string[] : [];

  // Auto-slide every 4s, pauses on interaction
  const startAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    if (images.length > 1 && !isPaused) {
      autoSlideTimer.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % images.length);
      }, 4000);
    }
  }, [images.length, isPaused]);

  useEffect(() => {
    startAutoSlide();
    return () => { if (autoSlideTimer.current) clearInterval(autoSlideTimer.current); };
  }, [startAutoSlide]);

  const goToImage = (i: number) => {
    setActiveImage(i);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const isRTL = locale === "ar";
  const txt = {
    ar: {
      contact: "تواصل معنا",
      whatsappChat: "محادثة واتساب",
      sendInquiry: "إرسال طلب",
      yourName: "اسمك",
      yourPhone: "رقم هاتفك",
      yourMessage: "رسالتك",
      send: "إرسال",
      inquirySent: "تم إرسال طلبك بنجاح!",
      shareCopied: "تم نسخ الرابط!",
      switchLang: "English",
      services: "الخدمات المشمولة",
      close: "إغلاق",
    },
    en: {
      contact: "Contact Us",
      whatsappChat: "WhatsApp Chat",
      sendInquiry: "Send Inquiry",
      yourName: "Your Name",
      yourPhone: "Your Phone",
      yourMessage: "Your Message",
      send: "Send",
      inquirySent: "Your inquiry has been sent successfully!",
      shareCopied: "Link copied!",
      switchLang: "العربية",
      services: "Included Services",
      close: "Close",
    },
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!data) return;
    const { user, property } = data;
    const pageUrl = window.location.href;
    const message =
      locale === "ar"
        ? `مرحباً، أنا مهتم بالعقار:\n${property.title}\n${property.address}\nالرابط: ${pageUrl}`
        : `Hello, I'm interested in the property:\n${property.title}\n${property.address}\nLink: ${pageUrl}`;
    const whatsappNum = user.whatsapp.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSendingInquiry(true);
    await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: data.user.id,
        propertyId: data.property.id,
        propertyTitle: data.property.title,
        senderName: inquiryForm.senderName,
        senderPhone: inquiryForm.senderPhone,
        message: inquiryForm.message,
      }),
    });
    setSendingInquiry(false);
    setInquirySent(true);
    setShowInquiry(false);
    setInquiryForm({ senderName: "", senderPhone: "", message: "" });
    setTimeout(() => setInquirySent(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data?.property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Not found</p>
      </div>
    );
  }

  const { user, property } = data;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      {lightboxOpen && images.length > 0 && (
        <Lightbox images={images} startIndex={activeImage} onClose={() => setLightboxOpen(false)} isRTL={isRTL} />
      )}

      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/listing/${params.tenantId}`} className="p-2 hover:bg-gray-100 rounded-lg">
              <BackIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">{user.companyName || user.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 relative">
              <Share2 className="w-4 h-4" />
              {linkCopied && (
                <span className="absolute -bottom-7 start-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                  {txt[locale].shareCopied}
                </span>
              )}
            </button>
            <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              {txt[locale].switchLang}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Image Carousel */}
        {images.length > 0 && (
          <div className="mb-6">
            <div
              className="aspect-video rounded-xl overflow-hidden bg-gray-100 relative cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={images[activeImage]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToImage((activeImage - 1 + images.length) % images.length); }}
                    className="absolute start-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToImage((activeImage + 1) % images.length); }}
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div className="absolute bottom-3 start-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); goToImage(i); }}
                        className={`w-2 h-2 rounded-full transition-colors ${i === activeImage ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
              <span className="absolute top-2 end-2 bg-black/40 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                {activeImage + 1}/{images.length}
              </span>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => goToImage(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activeImage === i ? "border-blue-500 ring-1 ring-blue-300" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Info */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4 shrink-0" />
                {property.address}
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
              {TYPE_LABELS[locale][property.type] || property.type}
            </span>
          </div>

          {property.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{property.description}</p>
          )}

          {property.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">{txt[locale].services}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.amenities.map((pa) => (
                  <div key={pa.amenity.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    {locale === "ar" ? pa.amenity.nameAr : pa.amenity.nameEn}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {inquirySent && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 text-sm font-medium text-center">
            {txt[locale].inquirySent}
          </div>
        )}

        {/* Contact Actions */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{txt[locale].contact}</h3>
          <div className="flex flex-wrap gap-3">
            {user.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                {txt[locale].whatsappChat}
              </button>
            )}
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                <span dir="ltr">{user.phone}</span>
              </a>
            )}
            <button
              onClick={() => setShowInquiry(!showInquiry)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              {txt[locale].sendInquiry}
            </button>
          </div>

          {showInquiry && (
            <form onSubmit={handleInquirySubmit} className="mt-4 border-t pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder={txt[locale].yourName}
                  value={inquiryForm.senderName}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, senderName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder={txt[locale].yourPhone}
                  value={inquiryForm.senderPhone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, senderPhone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  dir="ltr"
                />
              </div>
              <textarea
                placeholder={txt[locale].yourMessage}
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                >
                  {sendingInquiry ? "..." : txt[locale].send}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInquiry(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  {txt[locale].close}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
