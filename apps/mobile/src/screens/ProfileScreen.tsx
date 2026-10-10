import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Screen, usePravaasTheme, type ThemePreference } from "@pravaas/ui";
import { useAuthStore } from "../store/authStore";
import type { MainStackParamList } from "../navigation/MainNavigator";

type Props = NativeStackScreenProps<MainStackParamList, "Profile">;
const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Midnight" },
];
export function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { colors, preference, setPreference } = usePravaasTheme();
  const styles = createStyles(colors);
  return (
    <Screen title="Profile" subtitle="Manage your traveller identity">
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name ?? "Traveller"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.completion}>Identity Profile 20% Complete</Text>
      </View>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.themeOptions} accessibilityRole="radiogroup">
        {themeOptions.map((option) => {
          const selected = preference === option.value;
          return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setPreference(option.value)} style={[styles.themeOption, selected && styles.themeOptionSelected]}>
            <Text style={[styles.themeOptionText, selected && styles.themeOptionTextSelected]}>{option.label}</Text>
          </Pressable>;
        })}
      </View>
      <Text style={styles.sectionTitle}>Identity Wallet</Text>
      <Pressable style={styles.walletCard} onPress={() => navigation.navigate("IdentityWallet")}>
        <Text style={styles.walletTitle}>Passport</Text><Text style={styles.walletStatus}>Not Uploaded</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>Travel Summary</Text>
      <View style={styles.card}><Text style={styles.summaryText}>Bookings: --</Text><Text style={styles.summaryText}>Verified Stays: --</Text></View>
      <Button title="Logout" variant="outline" onPress={clearAuth} style={styles.logout} />
    </Screen>
  );
}
const createStyles = (colors: { surface: string; text: string; textSecondary: string; border: string; primary: string; primarySoft: string; onPrimarySoft: string }) => StyleSheet.create({
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "700", color: colors.text }, email: { marginTop: 4, color: colors.textSecondary },
  completion: { marginTop: 12, fontWeight: "600", color: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: colors.text },
  themeOptions: { flexDirection: "row", gap: 8, marginBottom: 24 },
  themeOption: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  themeOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  themeOptionText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  themeOptionTextSelected: { color: colors.onPrimarySoft },
  walletCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  walletTitle: { fontSize: 16, fontWeight: "600", color: colors.text }, walletStatus: { marginTop: 4, color: colors.textSecondary },
  summaryText: { color: colors.text, marginBottom: 6 }, logout: { marginTop: 24 },
});
