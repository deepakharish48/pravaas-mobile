import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Input, Screen } from "@pravaas/ui";
import { useLogin } from "@pravaas/api-client";
import { useApiClient } from "../providers/ApiProvider";
import { useAuthStore } from "../store/authStore";
import type { AuthStackParamList } from "../navigation/AuthNavigator";
import type { AuthResponse } from "@pravaas/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const client = useApiClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useLogin(client, {
    onSuccess: async (data: AuthResponse) => {
      await setAuth(data.accessToken, data.user);
    },
    onError: (error: Error) => {
      Alert.alert("Login failed", error.message || "Invalid credentials");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Validation", "Please enter email and password");
      return;
    }
    login.mutate({ email, password });
  };

  return (
    <Screen
      title="Pravaas"
      subtitle="Sign in to manage your hotel bookings"
    >
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />
      <Button
        title="Sign In"
        onPress={handleLogin}
        loading={login.isPending}
        style={styles.button}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Button
          title="Create Account"
          variant="outline"
          onPress={() => navigation.navigate("Signup")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    gap: 12,
  },
  footerText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
});
