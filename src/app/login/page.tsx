"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Home } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [brand, setBrand] = useState({ name: "دارك", nameEn: "Darak", logo: "", color: "#b45309" });

  useEffect(() => {
    fetch("/api/branding").then((r) => r.json()).then((data) => {
      if (data) setBrand({ name: data.name || "دارك", nameEn: data.nameEn || "Darak", logo: data.logo || "", color: data.color || "#b45309" });
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: identifier,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("SUSPENDED")) {
        setError("تم تعليق حسابك. تواصل مع الإدارة. / Your account has been suspended.");
      } else {
        setError("بيانات الدخول غير صحيحة / Invalid credentials");
      }
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const user = session?.user;

    if (user?.subscriptionStatus === "expired") {
      router.push("/expired");
    } else if (user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const c = brand.color;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]" dir="rtl">
      {/* ── Header ── */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: c }}>
                <Home className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <span className="text-[14px] font-bold text-zinc-900">{brand.name}</span>
          </Link>
          <Link href="/listing" className="text-[13px] text-zinc-400 hover:text-zinc-600 font-medium transition-colors">
            تصفّح السوق
          </Link>
        </div>
      </header>

      {/* ── Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-14 h-14 object-contain mx-auto mb-4" />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: c }}>
                <Home className="w-6 h-6 text-white" />
              </div>
            )}
            <h1 className="text-xl font-bold text-zinc-900">تسجيل الدخول</h1>
            <p className="text-zinc-400 mt-1.5 text-[13px]">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[13px] text-center font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-300 transition-all"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-300 transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-xl text-[14px] font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: c }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "تسجيل الدخول / Sign In"
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-5 text-[12px] text-zinc-400">
            <Link href="/" className="hover:text-zinc-600 font-medium transition-colors">العودة للرئيسية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
