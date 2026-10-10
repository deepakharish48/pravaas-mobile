import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Screen, usePravaasTheme } from "@pravaas/ui";
import { useBooking } from "@pravaas/api-client";
import { useApiClient } from "../providers/ApiProvider";
import type { MainStackParamList } from "../navigation/MainNavigator";
type Props = NativeStackScreenProps<MainStackParamList, "BookingDetails">;
export function BookingDetailsScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const client = useApiClient();
  const { colors } = usePravaasTheme();
  const styles = createStyles(colors);
  const { data: booking, isLoading, error } = useBooking(client, bookingId);
  if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (error || !booking) return <View style={styles.centered}><Text style={styles.error}>Could not load booking details</Text></View>;
  return (
    <Screen title="Booking Details">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <DetailRow label="Hotel" value={booking.hotelName} colors={colors} />
          <DetailRow label="Guest" value={booking.guestName} colors={colors} />
          <DetailRow label="Check-in" value={formatDate(booking.checkIn)} colors={colors} />
          <DetailRow label="Check-out" value={formatDate(booking.checkOut)} colors={colors} />
          <DetailRow label="Confirmation #" value={booking.confirmationNumber} colors={colors} />
          <DetailRow label="Room Type" value={booking.roomType} colors={colors} />
          <DetailRow label="Guests" value={booking.numberOfGuests != null ? String(booking.numberOfGuests) : null} colors={colors} />
          <DetailRow label="Total" value={booking.totalPrice ? (booking.currency ?? "") + " " + booking.totalPrice : null} colors={colors} />
          <DetailRow label="Status" value={booking.status} highlight colors={colors} />
        </View>
      </ScrollView>
      <Button title="Show Check-in QR Code" onPress={() => navigation.navigate("QrCode", { bookingId })} style={styles.qrButton} />
    </Screen>
  );
}
type Colors = { background: string; surface: string; text: string; textSecondary: string; border: string; primary: string; danger: string; divider: string };
function DetailRow({ label, value, highlight, colors }: { label: string; value: string | null | undefined; highlight?: boolean; colors: Colors }) {
  const styles = createStyles(colors);
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value, highlight && styles.highlight]}>{value ?? "—"}</Text></View>;
}
function formatDate(iso: string | null) { if (!iso) return null; return new Date(iso).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" }); }
const createStyles = (colors: Colors) => StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  error: { color: colors.danger, fontSize: 16 }, scroll: { flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 4, fontWeight: "500" },
  value: { fontSize: 16, color: colors.text, fontWeight: "600" }, highlight: { color: colors.primary }, qrButton: { marginTop: 16 },
});
