import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { usePravaasTheme } from "./ThemeProvider";

interface ScreenProps { title?: string; subtitle?: string; children: React.ReactNode; style?: ViewStyle; }
export function Screen({ title, subtitle, children, style }: ScreenProps) {
  const { colors } = usePravaasTheme();
  const styles = createStyles(colors);
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.content, style]} keyboardShouldPersistTaps="handled">
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const createStyles = (colors: { background: string; text: string; textSecondary: string }) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, paddingTop: 28 },
  title: { fontSize: 28, fontWeight: "700", color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 24, lineHeight: 22 },
  body: { flex: 1 },
});
