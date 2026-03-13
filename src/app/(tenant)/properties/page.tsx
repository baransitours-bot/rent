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

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  rented: "bg-amber-100 text-amber-700",
};

const ownershipColors: Record<string, string> = {
  owned: "bg-blue-100 text-blue-700",
  managed: "bg-purple-100 text-purple-700",
};

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

  const typeLabel = (type: string) => {
    const key = type as any;
    return t(locale, key) || type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t(locale, "properties")}</h1>
        {!isPaused && (
          <Link
            href="/properties/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {t(locale, "addProperty")}
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t(locale, "search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t(locale, "noProperties")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "propertyTitle")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "propertyType")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "propertyAddress")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "ownershipType")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "status")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "dateAdded")}</th>
                  <th className="text-start p-3 font-medium text-gray-600">{t(locale, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3">{typeLabel(p.type)}</td>
                    <td className="p-3 text-gray-500">{p.address}</td>
                    <td className="p-3">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", ownershipColors[p.ownershipType])}>
                        {t(locale, p.ownershipType as any)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusColors[p.status])}>
                        {t(locale, p.status as any)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/properties/${p.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {!isPaused && (
                          <Link href={`/properties/${p.id}/edit`} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded">
                            <Pencil className="w-4 h-4" />
                          </Link>
                        )}
                        {!isPaused && (
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
