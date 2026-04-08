"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

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
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] hover:border-zinc-300 transition-colors min-w-[120px]"
      >
        <span className="text-zinc-400 text-[11px]">{label}:</span>
        <span className="font-medium text-zinc-900 truncate">{selected?.label || label}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 ms-auto shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 start-0 bg-white border border-zinc-200 rounded-lg shadow-lg shadow-zinc-100 z-20 min-w-[180px] py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-start px-3 py-2 text-[13px] hover:bg-zinc-50 transition-colors flex items-center justify-between ${value === opt.value ? "bg-zinc-50 text-zinc-900 font-medium" : "text-zinc-600"}`}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5 text-zinc-900" />}
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
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] hover:border-zinc-300 transition-colors"
      >
        <span className="text-zinc-400 text-[11px]">{locale === "ar" ? "الخدمات" : "Amenities"}</span>
        {selected.length > 0 && (
          <span className="bg-zinc-900 text-white text-[10px] font-semibold w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none min-w-[18px] min-h-[18px]">{selected.length}</span>
        )}
        <ChevronDown className={`w-3 h-3 text-zinc-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 start-0 bg-white border border-zinc-200 rounded-lg shadow-lg shadow-zinc-100 z-20 min-w-[220px] py-1 max-h-60 overflow-y-auto">
          {amenities.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`w-full text-start px-3 py-2 text-[13px] hover:bg-zinc-50 transition-colors flex items-center gap-2.5 ${selected.includes(a.id) ? "bg-zinc-50" : ""}`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.includes(a.id) ? "bg-zinc-900 border-zinc-900 text-white" : "border-zinc-300"}`}>
                {selected.includes(a.id) && <Check className="w-2.5 h-2.5" />}
              </span>
              <span className={selected.includes(a.id) ? "text-zinc-900 font-medium" : "text-zinc-600"}>
                {locale === "ar" ? a.nameAr : a.nameEn}
              </span>
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-start px-3 py-2 text-[11px] text-red-500 hover:bg-red-50 border-t border-zinc-100 font-medium"
            >
              {locale === "ar" ? "مسح الكل" : "Clear all"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
