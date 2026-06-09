import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Screen } from "@pravaas/ui";

export function IdentityWalletScreen() {
  return (
    <Screen
      title="Identity Wallet"
      subtitle="Store travel documents securely"
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          Passport
        </Text>

        <Text style={styles.status}>
          Not Uploaded
        </Text>

        <Button
          title="Upload Passport"
          onPress={() => {}}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  status: {
    marginBottom: 16,
    color: "#64748b",
  },
});