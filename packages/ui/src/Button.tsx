import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { usePravaasTheme } from "./ThemeProvider";

interface ButtonProps { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: "primary" | "secondary" | "outline"; style?: ViewStyle; }
export function Button({ title, onPress, loading = false, disabled = false, variant = "primary", style }: ButtonProps) {
  const { colors } = usePravaasTheme();
  const styles = createStyles(colors);
  const isDisabled = disabled || loading;
  const textStyle = variant === "primary" ? styles.primaryText : variant === "secondary" ? styles.secondaryText : styles.outlineText;
  return (
    <Pressable onPress={onPress} disabled={isDisabled} accessibilityRole="button"
      style={({ pressed }) => [styles.base, styles[variant], pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled, style]}>
      {loading ? <ActivityIndicator color={variant === "outline" ? colors.primary : "#FFFFFF"} /> : <Text style={[styles.text, textStyle]}>{title}</Text>}
    </Pressable>
  );
}
const createStyles = (colors: { primary: string; textSecondary: string }) => StyleSheet.create({
  base: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: "center", justifyContent: "center", minHeight: 52 },
  primary: { backgroundColor: colors.primary }, secondary: { backgroundColor: colors.textSecondary },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
  pressed: { opacity: 0.85 }, disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: "600" }, primaryText: { color: "#FFFFFF" },
  secondaryText: { color: "#FFFFFF" }, outlineText: { color: colors.primary },
});
