"use client";

import { useState, useEffect, useRef } from "react";

interface BandishComboboxProps {
  value: string;
  onChange: (value: string) => void;
  allTitles: string[];
}

export default function BandishCombobox({ value, onChange, allTitles }: BandishComboboxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTitles = allTitles.filter(t => 
    t.toLowerCase().includes(value.toLowerCase()) && t.toLowerCase() !== value.toLowerCase()
  ).slice(0, 6); // Limit to 6

  const showDropdown = isFocused && filteredTitles.length > 0;

  return (
    <div className="relative flex-1" ref={containerRef}>
      <input 
        type="text" 
        required
        placeholder="e.g. Khwaajaa Din Duniyaa Me" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="w-full bg-m3-surface-container dark:bg-m3-surface-container-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-m3-secondary transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400" 
      />
      
      {showDropdown && (
        <ul data-lenis-prevent="true" className="absolute z-50 top-[calc(100%+0.5rem)] left-0 right-0 bg-white dark:bg-m3-surface-high-dark rounded-[1.5rem] overflow-hidden border border-m3-surface-high dark:border-gray-600 origin-top py-2 max-h-60 overflow-y-auto overscroll-contain m3-scrollbar animate-card">
          {filteredTitles.map((title) => (
            <li key={title}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // prevent input blur before click fires
                onClick={() => {
                  onChange(title);
                  setIsFocused(false);
                }}
                className="w-full text-left px-6 py-3 text-gray-800 dark:text-gray-100 hover:bg-m3-surface-container dark:hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
