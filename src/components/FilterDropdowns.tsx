"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function Dropdown({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-sm hover:border-stone-300 transition-colors min-w-[140px]"
      >
        <span className="text-stone-400 text-xs">{label}</span>
        <span className="font-medium text-gray-900 truncate">{selected?.label || label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 ms-auto shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 start-0 bg-white border border-stone-200 shadow-lg z-20 min-w-[200px] py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-start px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors ${value === opt.value ? "bg-amber-50 text-amber-800 font-medium" : "text-gray-700"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AmenityDropdown({ amenities, selected, onChange, locale }: {
  amenities: { id: string; nameAr: string; nameEn: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  locale: "ar" | "en";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-sm hover:border-stone-300 transition-colors"
      >
        <span className="text-stone-400 text-xs">{locale === "ar" ? "الخدمات" : "Amenities"}</span>
        {selected.length > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-1.5 py-0.5">{selected.length}</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 start-0 bg-white border border-stone-200 shadow-lg z-20 min-w-[240px] py-1 max-h-60 overflow-y-auto">
          {amenities.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`w-full text-start px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors flex items-center gap-2 ${selected.includes(a.id) ? "bg-amber-50" : ""}`}
            >
              <span className={`w-4 h-4 border flex items-center justify-center shrink-0 ${selected.includes(a.id) ? "bg-amber-700 border-amber-700 text-white" : "border-stone-300"}`}>
                {selected.includes(a.id) && <span className="text-[10px]">✓</span>}
              </span>
              {locale === "ar" ? a.nameAr : a.nameEn}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-start px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 border-t border-stone-100"
            >
              {locale === "ar" ? "مسح الكل" : "Clear all"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
