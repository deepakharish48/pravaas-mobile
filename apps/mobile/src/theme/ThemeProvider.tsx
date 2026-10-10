import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { darkColors, lightColors, type PravaasColors, type ThemePreference } from "./theme";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isDark: boolean;
  colors: PravaasColors;
};

const STORAGE_KEY = "pravaas-traveller-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (active && (stored === "light" || stored === "dark" || stored === "system")) {
          setPreferenceState(stored);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => undefined);
  };

  const isDark = preference === "system" ? systemScheme === "dark" : preference === "dark";
  const value = useMemo(
    () => ({ preference, setPreference, isDark, colors: isDark ? darkColors : lightColors }),
    [preference, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function usePravaasTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("usePravaasTheme must be used within ThemeProvider");
  return context;
}
