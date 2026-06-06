import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { UploadBookingScreen } from "../screens/UploadBookingScreen";
import { BookingDetailsScreen } from "../screens/BookingDetailsScreen";
import { QrCodeScreen } from "../screens/QrCodeScreen";

export type MainStackParamList = {
  Home: undefined;
  UploadBooking: undefined;
  BookingDetails: { bookingId: string };
  QrCode: { bookingId: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#f8fafc" },
        headerShadowVisible: false,
        headerTintColor: "#2563eb",
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "My Bookings" }}
      />
      <Stack.Screen
        name="UploadBooking"
        component={UploadBookingScreen}
        options={{ title: "Upload Booking" }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ title: "Booking Details" }}
      />
      <Stack.Screen
        name="QrCode"
        component={QrCodeScreen}
        options={{ title: "Check-in QR" }}
      />
    </Stack.Navigator>
  );
}
