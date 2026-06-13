import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Button, Screen } from "@pravaas/ui";
import {
  useIdentityDocuments,
  useUploadIdentity,
} from "@pravaas/api-client";

import { useApiClient } from "../providers/ApiProvider";

export function IdentityWalletScreen() {
  const client = useApiClient();

  const {
    data: documents,
    isLoading,
    refetch,
  } = useIdentityDocuments(client);

  const uploadIdentity =
    useUploadIdentity(client);

  const uploadDocument = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Allow photo access",
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

    if (
      result.canceled ||
      !result.assets[0]
    ) {
      return;
    }

    const asset = result.assets[0];

    uploadIdentity.mutate(
      {
        uri: asset.uri,
        fileName:
          asset.fileName ??
          `identity-${Date.now()}.jpg`,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Success",
            "Document uploaded",
          );

          refetch();
        },

        onError: (error: any) => {
          Alert.alert(
            "Upload Failed",
            error?.message ??
              "Could not upload document",
          );
        },
      },
    );
  };

  const aadhaar =
    documents?.find(
      (d) =>
        d.documentType === "AADHAAR",
    );

  const passport =
    documents?.find(
      (d) =>
        d.documentType === "PASSPORT",
    );

  const drivingLicense =
    documents?.find(
      (d) =>
        d.documentType ===
        "DRIVING_LICENSE",
    );

  if (isLoading) {
    return (
      <Screen title="Identity Wallet">
        <ActivityIndicator />
      </Screen>
    );
  }

  return (
    <Screen
      title="Identity Wallet"
      subtitle="Preferred identity is Aadhaar"
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          Aadhaar
        </Text>

        <Text style={styles.status}>
          {aadhaar
            ? "Uploaded"
            : "Not Uploaded"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Passport
        </Text>

        <Text style={styles.status}>
          {passport
            ? "Uploaded"
            : "Not Uploaded"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Driving License
        </Text>

        <Text style={styles.status}>
          {drivingLicense
            ? "Uploaded"
            : "Not Uploaded"}
        </Text>
      </View>

      <Button
        title="Upload Document"
        onPress={uploadDocument}
        loading={
          uploadIdentity.isPending
        }
      />
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
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  status: {
    color: "#64748b",
  },
});