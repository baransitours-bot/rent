"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/i18n/translations";
import { Plus, Eye, Pencil, Trash2, Search, Building2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface Property {
  id: string;
  title: string;
  address: string;
  type: string;
  status: string;
  ownershipType: string;
  createdAt: string;
}

export default function PropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const user = session?.user as any;
  const locale = (user?.locale || "ar") as Locale;
  const isPaused = user?.subscriptionStatus === "paused";

  const load = () => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t(locale, "deletePropertyConfirm"))) return;
    setDeleting(id);
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    load();
    setDeleting(null);
  };

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = (type: string) => t(locale, type as any) || type;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-zinc-900">{t(locale, "properties")}</h1>
        {!isPaused && (
          <Link
            href="/properties/new"
            className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors text-[13px]"
          >
            <Plus className="w-3.5 h-3.5" />
            {t(locale, "addProperty")}
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="p-3 border-b border-zinc-100">
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={t(locale, "search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none bg-zinc-50 placeholder-zinc-400 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-10 h-10 mx-auto mb-2 text-zinc-200" />
            <p className="text-zinc-400 text-[13px]">{t(locale, "noProperties")}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "propertyTitle")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "propertyType")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "ownershipType")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "status")}</th>
                    <th className="text-start p-3 font-medium text-zinc-400 text-[11px] uppercase tracking-wider">{t(locale, "actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="p-3">
                        <div className="font-medium text-zinc-900">{p.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{p.address}</div>
                      </td>
                      <td className="p-3 text-zinc-500">{typeLabel(p.type)}</td>
                      <td className="p-3">
                        <span className={clsx("px-2 py-0.5 rounded text-[11px] font-medium",
                          p.ownershipType === "owned" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"
                        )}>
                          {t(locale, p.ownershipType as any)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={clsx("px-2 py-0.5 rounded text-[11px] font-medium",
                          p.status === "available" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {t(locale, p.status as any)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/properties/${p.id}`} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {!isPaused && (
                            <Link href={`/properties/${p.id}/edit`} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg">
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {!isPaused && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={deleting === p.id}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-zinc-50">
              {filtered.map((p) => (
                <div key={p.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[13px] text-zinc-900 truncate">{p.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{p.address}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/properties/${p.id}`} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {!isPaused && (
                        <Link href={`/properties/${p.id}/edit`} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {!isPaused && (
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-medium",
                      p.status === "available" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {t(locale, p.status as any)}
                    </span>
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-medium",
                      p.ownershipType === "owned" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"
                    )}>
                      {t(locale, p.ownershipType as any)}
                    </span>
                    <span className="text-[10px] text-zinc-400">{typeLabel(p.type)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
