import React from "react";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { ApiProvider } from "./src/providers/ApiProvider";
import { ThemeProvider, usePravaasTheme } from "@pravaas/ui";

const queryClient = new QueryClient();
function AppShell() {
  const { isDark, colors } = usePravaasTheme();
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    dark: isDark,
    colors: { ...(isDark ? DarkTheme.colors : DefaultTheme.colors), primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, notification: colors.primary },
  };
  return <NavigationContainer theme={navigationTheme}><StatusBar style={isDark ? "light" : "dark"} /><AppNavigator /></NavigationContainer>;
}
export default function App() {
  return <SafeAreaProvider><QueryClientProvider client={queryClient}><ApiProvider><ThemeProvider><AppShell /></ThemeProvider></ApiProvider></QueryClientProvider></SafeAreaProvider>;
}
