"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-stone-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-9 h-9 object-contain" />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: brand.color }}>
                <Home className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-lg font-bold text-gray-900">{brand.name}</span>
          </Link>
          <Link href="/listing" className="text-sm text-stone-500 hover:text-stone-700 font-medium">
            تصفّح السوق
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h1>
            <p className="text-stone-500 mt-2 text-sm">Sign in to your account</p>
          </div>

          <div className="bg-white border border-stone-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  البريد الإلكتروني أو رقم الهاتف / Email or Phone
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-gray-900 placeholder-stone-400 outline-none transition-all"
                  style={{ "--tw-ring-color": brand.color } as any}
                  placeholder="email@example.com / +970599123456"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  كلمة المرور / Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-gray-900 placeholder-stone-400 outline-none transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: brand.color }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>...</span>
                  </>
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
