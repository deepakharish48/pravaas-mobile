"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import HotelNavigation from "@/components/HotelNavigation";

type BookingPayload = {
  bookingId: string;
  hotelName: string;
  guestName: string;
  confirmationNumber: string;
  checkIn: string;
  checkOut: string;
  identityType: string;
  identityName: string;
  identityNumber: string;
};

export default function HotelCheckinContent() {
  const router = useRouter();
  const params = useSearchParams();

  const payload = params.get("payload");

  const [loading, setLoading] = useState(false);

  if (!payload) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] flex items-center justify-center lg:pl-64">
        <HotelNavigation />
        <Card className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">
            No Guest Selected
          </h2>

          <p className="text-gray-500 mb-6">
            Please scan a guest QR code first.
          </p>

          <Button
            variant="secondary"
            onClick={() => router.push("/hotel-scan")}
          >
            Back to Scanner
          </Button>
        </Card>
      </main>
    );
  }

  const booking: BookingPayload = JSON.parse(payload);

  async function approveCheckin() {
    try {
      setLoading(true);

      await api(`/hotel/checkin/${booking.bookingId}`, {
        method: "POST",
      });

      alert("Guest checked in successfully.");

      router.push("/hotel-dashboard");
    } catch (err) {
      console.error(err);
      alert("Unable to complete check-in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] py-6 pb-24 sm:py-8 lg:pl-64 lg:pb-10">
      <HotelNavigation />

      <Container className="max-w-[1100px]">

        <div className="mb-6">

          <Image
            src="/logo.png"
            alt="Pravaas"
            width={64}
            height={64}
            className="mb-4"
          />

          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">Reception operations</p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Guest Check-in
          </h1>

          <p className="mt-2 text-gray-500">
            Verify the traveller before approving check-in.
          </p>

        </div>

        <Card>

          <div className="space-y-6">

            <div>
              <p className="text-sm text-gray-500">
                Guest
              </p>

              <p className="font-semibold text-lg">
                {booking.guestName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Hotel
              </p>

              <p className="font-medium">
                {booking.hotelName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Confirmation Number
              </p>

              <p className="font-medium">
                {booking.confirmationNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Identity
              </p>

              <p className="font-medium">
                {booking.identityType}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Identity Name
              </p>

              <p className="font-medium">
                {booking.identityName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Identity Number
              </p>

              <p className="font-medium">
                {booking.identityNumber}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <p className="text-sm text-gray-500">
                  Check-in
                </p>

                <p className="font-medium">
                  {new Date(
                    booking.checkIn
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Check-out
                </p>

                <p className="font-medium">
                  {new Date(
                    booking.checkOut
                  ).toLocaleDateString()}
                </p>
              </div>

            </div>

          </div>

        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">

          <Button
            onClick={approveCheckin}
            disabled={loading}
          >
            {loading
              ? "Approving..."
              : "Approve Check-in"}
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              router.push("/hotel-dashboard")
            }
          >
            Cancel
          </Button>

        </div>

      </Container>

    </main>
  );
}