import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Screen } from "@pravaas/ui";
import { useBooking } from "@pravaas/api-client";
import { useApiClient } from "../providers/ApiProvider";
import type { MainStackParamList } from "../navigation/MainNavigator";

type Props = NativeStackScreenProps<MainStackParamList, "BookingDetails">;

export function BookingDetailsScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const client = useApiClient();
  const { data: booking, isLoading, error } = useBooking(client, bookingId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Could not load booking details</Text>
      </View>
    );
  }

  return (
    <Screen title="Booking Details">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <DetailRow label="Hotel" value={booking.hotelName} />
          <DetailRow label="Guest" value={booking.guestName} />
          <DetailRow label="Check-in" value={formatDate(booking.checkIn)} />
          <DetailRow label="Check-out" value={formatDate(booking.checkOut)} />
          <DetailRow
            label="Confirmation #"
            value={booking.confirmationNumber}
          />
          <DetailRow label="Room Type" value={booking.roomType} />
          <DetailRow
            label="Guests"
            value={
              booking.numberOfGuests != null
                ? String(booking.numberOfGuests)
                : null
            }
          />
          <DetailRow
            label="Total"
            value={
              booking.totalPrice
                ? `${booking.currency ?? ""} ${booking.totalPrice}`.trim()
                : null
            }
          />
          <DetailRow label="Status" value={booking.status} highlight />
        </View>
      </ScrollView>

      <Button
        title="Show Check-in QR Code"
        onPress={() => navigation.navigate("QrCode", { bookingId })}
        style={styles.qrButton}
      />
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.highlight]}>
        {value ?? "—"}
      </Text>
    </View>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  error: {
    color: "#ef4444",
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  label: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  highlight: {
    color: "#2563eb",
  },
  qrButton: {
    marginTop: 16,
  },
});
