import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Button, Screen } from "@pravaas/ui";

export default function App() {
  return (
    <Screen
      title="Pravaas Hotel"
      subtitle="Hotel staff app — scan guest QR codes for check-in"
    >
      <View style={styles.card}>
        <Text style={styles.label}>Coming soon</Text>
        <Text style={styles.text}>
          QR scanner and guest verification will live here. Shared packages
          (@pravaas/ui, @pravaas/api-client, @pravaas/types) are wired up.
        </Text>
      </View>
      <Button title="Scan Guest QR" onPress={() => {}} disabled />
      <StatusBar style="dark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
  },
});
