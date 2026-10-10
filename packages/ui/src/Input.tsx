import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { usePravaasTheme } from "./ThemeProvider";

interface InputProps extends TextInputProps { label: string; error?: string; }
export function Input({ label, error, style, ...props }: InputProps) {
  const { colors } = usePravaasTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, error && styles.inputError, style]} placeholderTextColor={colors.placeholder} {...props} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
const createStyles = (colors: { text: string; textSecondary: string; border: string; input: string; placeholder: string; danger: string }) => StyleSheet.create({
  container: { marginBottom: 16 }, label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, backgroundColor: colors.input },
  inputError: { borderColor: colors.danger }, error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
