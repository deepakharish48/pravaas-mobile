import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen, usePravaasTheme } from "@pravaas/ui";
import { useBookingQr, useBooking } from "@pravaas/api-client";
import { useApiClient } from "../providers/ApiProvider";
import type { MainStackParamList } from "../navigation/MainNavigator";
type Props = NativeStackScreenProps<MainStackParamList, "QrCode">;
export function QrCodeScreen({ route }: Props) {
  const { bookingId } = route.params;
  const client = useApiClient();
  const { colors } = usePravaasTheme();
  const styles = createStyles(colors);
  const { data: booking } = useBooking(client, bookingId);
  const { data: qr, isLoading, error } = useBookingQr(client, bookingId);
  if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (error || !qr) return <View style={styles.centered}><Text style={styles.error}>Could not generate QR code</Text></View>;
  return <Screen title="Check-in QR" subtitle="Show this code at the hotel front desk for quick check-in">
    <View style={styles.qrContainer}><Image source={{ uri: qr.qrCodeDataUrl }} style={styles.qrImage} resizeMode="contain" /></View>
    <View style={styles.info}><Text style={styles.hotel}>{booking?.hotelName ?? "Your Booking"}</Text>
      {booking?.confirmationNumber ? <Text style={styles.confirmation}>Confirmation: {booking.confirmationNumber}</Text> : null}
      <Text style={styles.hint}>Scan this QR code to verify your booking instantly.</Text>
    </View>
  </Screen>;
}
const createStyles = (colors: { background: string; surface: string; text: string; textSecondary: string; border: string; danger: string }) => StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }, error: { color: colors.danger, fontSize: 16 },
  qrContainer: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  qrImage: { width: 260, height: 260 }, info: { alignItems: "center" },
  hotel: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 4, textAlign: "center" },
  confirmation: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 }, hint: { fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
});
