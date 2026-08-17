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

  // Check the browser's memory when the app first loads!
  useEffect(() => {
    const savedTheme = localStorage.getItem("wiki-theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("wiki-theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  // Prevents the page from flashing before we check the memory
  if (!mounted) {
    return <div className="min-h-screen bg-[#FDF8FD]" />;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {/* This wrapper automatically applies 'dark' to every page! */}
      <div className={`${isDarkMode ? "dark" : ""} w-full min-h-screen`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);