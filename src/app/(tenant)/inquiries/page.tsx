"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { t, type Locale } from "@/i18n/translations";
import { MessageCircle, Check, Trash2, Phone, User } from "lucide-react";

interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  senderName: string;
  senderPhone: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function InquiriesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inquiries").then((r) => r.json()).then((d) => { setInquiries(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/inquiries/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "read" }) });
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: "read" } : inq)));
  };

  const deleteInquiry = async (id: string) => {
    await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-900 mb-5">{t(locale, "inquiries")}</h1>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 card">
          <MessageCircle className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
          <p className="text-zinc-400 text-[13px]">{t(locale, "noInquiries")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`card p-4 ${inq.status === "new" ? "border-blue-100 bg-blue-50/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {inq.status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                    <h3 className="font-medium text-zinc-900 text-[13px] truncate">{inq.propertyTitle}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {inq.senderName}
                    </span>
                    {inq.senderPhone && (
                      <a href={`tel:${inq.senderPhone}`} className="flex items-center gap-1 text-blue-500 hover:underline" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {inq.senderPhone}
                      </a>
                    )}
                    <span>{new Date(inq.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</span>
                  </div>
                  {inq.message && <p className="text-[13px] text-zinc-500 leading-relaxed">{inq.message}</p>}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {inq.status === "new" && (
                    <button onClick={() => markRead(inq.id)} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title={t(locale, "markRead")}>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => deleteInquiry(inq.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
