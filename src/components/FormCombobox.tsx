"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

interface FormComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  required?: boolean;
  labelColor?: string;
  focusRingColor?: string;
  isMulti?: boolean;
  quickPills?: string[];
}

export default function FormCombobox({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  required = false,
  labelColor = "text-m3-secondary dark:text-m3-secondary-dark",
  focusRingColor = "focus:ring-m3-secondary",
  isMulti = false,
  quickPills,
}: FormComboboxProps) {
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

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      // If empty, show top 7 canonical suggestions
      return suggestions.slice(0, 7);
    }

    if (isMulti) {
      // For comma-separated, filter based on the last segment being typed
      const parts = value.split(",").map((s) => s.trim().toLowerCase());
      const currentSegment = parts[parts.length - 1] || "";
      return suggestions
        .filter((s) => {
          const sLower = s.toLowerCase();
          const alreadySelected = parts.slice(0, -1).includes(sLower);
          return !alreadySelected && sLower.includes(currentSegment);
        })
        .slice(0, 7);
    }

    return suggestions
      .filter((s) => s.toLowerCase().includes(trimmed) && s.toLowerCase() !== trimmed)
      .slice(0, 7);
  }, [suggestions, value, isMulti]);

  const handleSelect = (selected: string) => {
    if (isMulti) {
      const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      // Replace last segment if partially typed, otherwise append
      const last = parts[parts.length - 1]?.toLowerCase();
      if (last && selected.toLowerCase().startsWith(last)) {
        parts[parts.length - 1] = selected;
      } else if (!parts.includes(selected)) {
        parts.push(selected);
      }
      onChange(parts.join(", "));
    } else {
      onChange(selected);
    }
    setIsFocused(false);
  };

  const handleTogglePill = (pill: string) => {
    if (isMulti) {
      const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const index = parts.findIndex((p) => p.toLowerCase() === pill.toLowerCase());
      if (index >= 0) {
        parts.splice(index, 1);
      } else {
        parts.push(pill);
      }
      onChange(parts.join(", "));
    } else {
      onChange(pill);
    }
  };

  const showDropdown = isFocused && filteredSuggestions.length > 0;

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={`w-full bg-m3-surface-container dark:bg-m3-surface-high-dark text-gray-900 dark:text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-2 ${focusRingColor} transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400`}
        />

        {showDropdown && (
          <ul
            data-lenis-prevent="true"
            className="absolute z-50 top-[calc(100%+0.5rem)] left-0 right-0 bg-white dark:bg-m3-surface-container-dark rounded-[1.5rem] overflow-hidden border border-m3-surface-high dark:border-m3-surface-high-dark py-2 max-h-56 overflow-y-auto overscroll-contain m3-scrollbar animate-card"
          >
            {filteredSuggestions.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-6 py-2.5 text-gray-800 dark:text-gray-100 hover:bg-m3-surface-container dark:hover:bg-white/10 transition-colors font-medium text-sm flex items-center justify-between group cursor-pointer"
                >
                  <span>{item}</span>
                  <span className="material-symbols-rounded text-sm text-gray-400 group-hover:text-m3-primary dark:group-hover:text-m3-primary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                    north_west
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Pills if provided */}
      {quickPills && quickPills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {quickPills.map((pill) => {
            const isSelected = isMulti
              ? value
                  .toLowerCase()
                  .split(",")
                  .map((s) => s.trim())
                  .includes(pill.toLowerCase())
              : value.trim().toLowerCase() === pill.toLowerCase();

            return (
              <button
                key={pill}
                type="button"
                onClick={() => handleTogglePill(pill)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-m3-primary/20 dark:bg-m3-primary-dark/25 text-m3-primary dark:text-m3-primary-dark border-m3-primary/40 dark:border-m3-primary-dark/40"
                    : "bg-m3-surface dark:bg-m3-surface-dark border-m3-surface-high dark:border-m3-surface-high-dark text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
