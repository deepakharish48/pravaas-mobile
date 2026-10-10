import React from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Screen, usePravaasTheme } from "@pravaas/ui";
import { useBookings } from "@pravaas/api-client";
import type { Booking } from "@pravaas/types";
import { useApiClient } from "../providers/ApiProvider";
import { useAuthStore } from "../store/authStore";
import type { MainStackParamList } from "../navigation/MainNavigator";

type Props = NativeStackScreenProps<MainStackParamList, "Home">;
export function HomeScreen({ navigation }: Props) {
  const client = useApiClient();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { colors } = usePravaasTheme();
  const styles = createStyles(colors);
  const { data: bookings, isLoading, error, status, refetch, isRefetching } = useBookings(client);
  console.log("BOOKINGS QUERY", { status, isLoading, error });
  const renderItem = ({ item }: { item: Booking }) => (
    <Pressable accessibilityRole="button" style={styles.card} onPress={() => navigation.navigate("BookingDetails", { bookingId: item.id })}>
      <Text style={styles.hotelName}>{item.hotelName ?? "Processing..."}</Text>
      <Text style={styles.meta}>{item.checkIn ? formatDate(item.checkIn) + " → " + formatDate(item.checkOut) : "Dates pending extraction"}</Text>
      <View style={styles.badge}><Text style={styles.badgeText}>{item.status}</Text></View>
    </Pressable>
  );
  return (
    <Screen title={"Hello, " + (user?.name?.split(" ")[0] ?? "Guest")} subtitle="Your hotel bookings">
      <Button title="Upload Booking Screenshot" onPress={() => navigation.navigate("UploadBooking")} style={styles.uploadButton} />
      <Button title="My Profile" variant="secondary" onPress={() => navigation.navigate("Profile")} style={{ marginBottom: 12 }} />
      <Button title="Identity Wallet" variant="outline" onPress={() => navigation.navigate("IdentityWallet")} style={{ marginBottom: 16 }} />
      {isLoading ? <ActivityIndicator size="large" color={colors.primary} style={styles.loader} /> : (
        <FlatList data={bookings ?? []} keyExtractor={(item) => item.id} renderItem={renderItem} refreshing={isRefetching} onRefresh={refetch}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No bookings yet</Text><Text style={styles.emptyText}>Upload a booking confirmation screenshot to get started.</Text></View>}
          contentContainerStyle={styles.list} />
      )}
      <Button title="Sign Out" variant="outline" onPress={clearAuth} style={styles.signOut} />
    </Screen>
  );
}
function formatDate(iso: string | null) { if (!iso) return "—"; return new Date(iso).toLocaleDateString(); }
const createStyles = (colors: { surface: string; text: string; textSecondary: string; border: string; primarySoft: string; onPrimarySoft: string }) => StyleSheet.create({
  uploadButton: { marginBottom: 20 }, loader: { marginTop: 40 }, list: { paddingBottom: 24, flexGrow: 1 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  hotelName: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 4 },
  meta: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  badge: { alignSelf: "flex-start", backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "600", color: colors.onPrimarySoft },
  empty: { alignItems: "center", paddingTop: 48 }, emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 }, signOut: { marginTop: 16 },
});
