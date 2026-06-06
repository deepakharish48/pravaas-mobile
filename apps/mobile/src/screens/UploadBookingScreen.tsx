import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Screen } from "@pravaas/ui";
import { useUploadBooking } from "@pravaas/api-client";
import { useApiClient } from "../providers/ApiProvider";
import type { MainStackParamList } from "../navigation/MainNavigator";

type Props = NativeStackScreenProps<MainStackParamList, "UploadBooking">;

export function UploadBookingScreen({ navigation }: Props) {
  const client = useApiClient();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState("booking.jpg");

  const upload = useUploadBooking(client, {
    onSuccess: (booking) => {
      Alert.alert("Success", "Booking extracted and saved!", [
        {
          text: "View Details",
          onPress: () =>
            navigation.replace("BookingDetails", { bookingId: booking.id }),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Upload failed", error.message || "Could not process booking");
    },
  });

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to continue");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setFileName(asset.fileName ?? `booking-${Date.now()}.jpg`);
    }
  };

  const handleUpload = () => {
    if (!imageUri) {
      Alert.alert("No image", "Please select a booking screenshot first");
      return;
    }
    upload.mutate({ uri: imageUri, fileName });
  };

  return (
    <Screen
      title="Upload Booking"
      subtitle="Take a photo or select a screenshot of your hotel booking confirmation"
    >
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <Button
            title="Change Image"
            variant="outline"
            onPress={() => setImageUri(null)}
            style={styles.changeButton}
          />
        </View>
      ) : (
        <View style={styles.pickerArea}>
          <Text style={styles.pickerHint}>
            GPT-4o will extract hotel name, dates, confirmation number, and more
            from your screenshot.
          </Text>
          <Button
            title="Choose from Gallery"
            onPress={() => pickImage(false)}
            style={styles.pickerButton}
          />
          <Button
            title="Take Photo"
            variant="secondary"
            onPress={() => pickImage(true)}
          />
        </View>
      )}

      {imageUri ? (
        <Button
          title="Upload & Extract Details"
          onPress={handleUpload}
          loading={upload.isPending}
          style={styles.uploadButton}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pickerArea: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  pickerHint: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  pickerButton: {
    marginBottom: 12,
  },
  previewContainer: {
    marginBottom: 24,
  },
  preview: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  changeButton: {
    marginTop: 12,
  },
  uploadButton: {
    marginTop: 8,
  },
});
