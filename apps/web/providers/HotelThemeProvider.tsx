"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type HotelTheme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: HotelTheme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: HotelTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "pravaas-hotel-theme";

function systemTheme(): "light" | "dark" {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function HotelThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<HotelTheme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: HotelTheme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setTheme(initial);
    setResolvedTheme(initial === "system" ? systemTheme() : initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const resolved = theme === "system" ? systemTheme() : theme;
    setResolvedTheme(resolved);
    document.documentElement.dataset.hotelTheme = resolved;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, ready]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (theme === "system") setResolvedTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useHotelTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useHotelTheme must be used within HotelThemeProvider");
  return context;
}
