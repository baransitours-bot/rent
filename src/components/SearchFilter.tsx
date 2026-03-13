"use client";

import { Search } from "lucide-react";

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchFilter({ placeholder, value, onChange }: SearchFilterProps) {
  return (
    <div className="relative">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full ps-10 pe-4 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
}
