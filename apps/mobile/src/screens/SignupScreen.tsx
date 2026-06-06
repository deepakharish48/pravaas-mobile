import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Input, Screen } from "@pravaas/ui";
import { useSignup } from "@pravaas/api-client";
import { useApiClient } from "../providers/ApiProvider";
import { useAuthStore } from "../store/authStore";
import type { AuthStackParamList } from "../navigation/AuthNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const client = useApiClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = useSignup(client, {
    onSuccess: async (data) => {
      await setAuth(data.accessToken, data.user);
    },
    onError: (error) => {
      Alert.alert("Signup failed", error.message || "Could not create account");
    },
  });

  const handleSignup = () => {
    if (!name || !email || !password) {
      Alert.alert("Validation", "Please fill in all fields");
      return;
    }
    signup.mutate({ name, email, password });
  };

  return (
    <Screen
      title="Create Account"
      subtitle="Join Pravaas to digitize your hotel bookings"
    >
      <Input
        label="Full Name"
        value={name}
        onChangeText={setName}
        placeholder="John Doe"
      />
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
        placeholder="Min 6 characters"
      />
      <Button
        title="Sign Up"
        onPress={handleSignup}
        loading={signup.isPending}
        style={styles.button}
      />
      <View style={styles.footer}>
        <Button
          title="Back to Sign In"
          variant="outline"
          onPress={() => navigation.goBack()}
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
    marginTop: 24,
  },
});
