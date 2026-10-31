"use client";

import { createContext, useContext, useState, useEffect } from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check the browser's memory and initial class when the app first loads!
  useEffect(() => {
    const savedTheme = localStorage.getItem("wiki-theme");
    const isDark =
      savedTheme === "dark" ||
      (savedTheme === null && document.documentElement.classList.contains("dark"));

    if (isDark) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      try {
        localStorage.setItem("wiki-theme", nextTheme ? "dark" : "light");
      } catch {}

      // Apply synchronously to html tag immediately so Tailwind dark: rules update in current frame
      if (nextTheme) {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }

      return nextTheme;
    });
  };

  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [isDarkMode, mounted]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {/* This wrapper automatically applies 'dark' to every page! */}
      <div className={`${isDarkMode ? "dark" : ""} w-full min-h-screen bg-m3-surface-container dark:bg-m3-surface-dark text-gray-900 dark:text-white transition-colors duration-500`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);