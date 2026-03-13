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
    fetch("/api/inquiries")
      .then((r) => r.json())
      .then((d) => {
        setInquiries(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    });
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: "read" } : inq)));
  };

  const deleteInquiry = async (id: string) => {
    await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, "inquiries")}</h1>

      {inquiries.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t(locale, "noInquiries")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`bg-white rounded-xl border p-4 ${inq.status === "new" ? "border-blue-200 bg-blue-50/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {inq.status === "new" && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{inq.propertyTitle}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {inq.senderName}
                    </span>
                    {inq.senderPhone && (
                      <a href={`tel:${inq.senderPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {inq.senderPhone}
                      </a>
                    )}
                    <span>{new Date(inq.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</span>
                  </div>
                  {inq.message && <p className="text-sm text-gray-600">{inq.message}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {inq.status === "new" && (
                    <button
                      onClick={() => markRead(inq.id)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={t(locale, "markRead")}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteInquiry(inq.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
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
