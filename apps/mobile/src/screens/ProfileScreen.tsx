import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Screen } from "@pravaas/ui";
import { useAuthStore } from "../store/authStore";
import type { MainStackParamList } from "../navigation/MainNavigator";

type Props = NativeStackScreenProps<MainStackParamList, "Profile">;

export function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <Screen
      title="Profile"
      subtitle="Manage your traveller identity"
    >
      <View style={styles.card}>
        <Text style={styles.name}>
          {user?.name ?? "Traveller"}
        </Text>

        <Text style={styles.email}>
          {user?.email}
        </Text>

        <Text style={styles.completion}>
          Identity Profile 20% Complete
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Identity Wallet
      </Text>

      <Pressable
        style={styles.walletCard}
        onPress={() =>
          navigation.navigate("IdentityWallet")
        }
      >
        <Text style={styles.walletTitle}>
          Passport
        </Text>

        <Text style={styles.walletStatus}>
          Not Uploaded
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>
        Travel Summary
      </Text>

      <View style={styles.card}>
        <Text>Bookings: --</Text>
        <Text>Verified Stays: --</Text>
      </View>

      <Button
        title="Logout"
        variant="outline"
        onPress={clearAuth}
        style={styles.logout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  email: {
    marginTop: 4,
    color: "#64748b",
  },

  completion: {
    marginTop: 12,
    fontWeight: "600",
    color: "#2563eb",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0f172a",
  },

  walletCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },

  walletTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  walletStatus: {
    marginTop: 4,
    color: "#64748b",
  },

  logout: {
    marginTop: 24,
  },
});