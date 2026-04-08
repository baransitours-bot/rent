"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: brand.color }}>
                <Building2 className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-sm font-semibold text-zinc-900">{brand.name}</span>
          </Link>
          <Link href="/listing" className="text-[13px] text-zinc-400 hover:text-zinc-600 font-medium transition-colors">
            تصفّح السوق
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain mx-auto mb-4" />
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: brand.color }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="text-xl font-semibold text-zinc-900">تسجيل الدخول</h1>
            <p className="text-zinc-400 mt-1 text-[13px]">Sign in to your account</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-[13px] text-center font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: brand.color }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "تسجيل الدخول / Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
