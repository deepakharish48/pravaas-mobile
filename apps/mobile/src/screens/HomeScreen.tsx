import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Screen } from "@pravaas/ui";
import { useBookings } from "@pravaas/api-client";
import type { Booking } from "@pravaas/types";
import { useApiClient } from "../providers/ApiProvider";
import { useAuthStore } from "../store/authStore";
import type { MainStackParamList } from "../navigation/MainNavigator";
import { useQuery } from "@tanstack/react-query";
//import { useBookings } from "../../../packages/api-client/src/hooks";

type Props = NativeStackScreenProps<MainStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  console.log("HOME RENDER START");
  const client = useApiClient();
  console.log("BEFORE USEBOOKINGS");
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  //const { data: bookings, isLoading, refetch, isRefetching } = useBookings(client);
  const {
    data: bookings,
    isLoading,
    error,
    status,
    refetch,
    isRefetching,
  } = useBookings(client);
  
  console.log("BOOKINGS QUERY", {
    status,
    isLoading,
    bookings,
    error,
  });
  //console.log("TEST QUERY", testQuery.status);
  //console.log("AFTER USEBOOKINGS");
  //const bookings: any[] = [];
  //const isLoading = false;
  //const isRefetching = false;
  //const refetch = async () => {};

  const renderItem = ({ item }: { item: Booking }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("BookingDetails", { bookingId: item.id })
      }
    >
      <Text style={styles.hotelName}>
        {item.hotelName ?? "Processing..."}
      </Text>
      <Text style={styles.meta}>
        {item.checkIn
          ? `${formatDate(item.checkIn)} → ${formatDate(item.checkOut)}`
          : "Dates pending extraction"}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>
    </Pressable>
  );

  return (
    <Screen
      //scrollable={false}
      title={`Hello, ${user?.name?.split(" ")[0] ?? "Guest"}`}
      subtitle="Your hotel bookings"
    >
      <Button
        title="Upload Booking Screenshot"
        onPress={() => navigation.navigate("UploadBooking")}
        style={styles.uploadButton}
      />
      <Button
        title="My Profile"
        variant="secondary"
        onPress={() => navigation.navigate("Profile")}
        style={{ marginBottom: 12 }}
     />
      <Button
        title="Identity Wallet"
        variant="outline"
        onPress={() => navigation.navigate("IdentityWallet")}
        style={{ marginBottom: 16 }}
     />

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>
                Upload a booking confirmation screenshot to get started.
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}

      <Button
        title="Sign Out"
        variant="outline"
        onPress={clearAuth}
        style={styles.signOut}
      />
    </Screen>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

const styles = StyleSheet.create({
  uploadButton: {
    marginBottom: 20,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  signOut: {
    marginTop: 16,
  },
});
