"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

type Booking = {
  id: string;
  hotelName: string | null;
  guestName: string | null;
  confirmationNumber: string | null;
  checkIn: string | null;
  checkOut: string | null;
  roomType: string | null;
  numberOfGuests: number | null;
  totalPrice: string | null;
  currency: string | null;
  status: string;
  qrCode: string | null;
};

export default function HotelBookingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!id) return;

    api(`/hotel/bookings/${id}`)
      .then((data) => {
        setBooking(data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading booking...
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Booking not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">

      <Container className="max-w-3xl">

        <div className="flex flex-col items-center mb-10">

          <Image
            src="/logo.png"
            alt="Pravaas"
            width={64}
            height={64}
            className="mb-4"
          />

          <h1 className="text-3xl font-bold">
            Booking Details
          </h1>

          <p className="mt-2 text-gray-500">
            View booking information.
          </p>

        </div>

        <Card>

          <div className="space-y-6">

            <div>
              <p className="text-sm text-gray-500">
                Guest
              </p>

              <p className="font-semibold text-lg">
                {booking.guestName ?? "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Hotel
              </p>

              <p>
                {booking.hotelName ?? "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Confirmation Number
              </p>

              <p>
                {booking.confirmationNumber ?? "--"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  Check-in
                </p>

                <p>
                  {booking.checkIn
                    ? new Date(
                        booking.checkIn,
                      ).toLocaleDateString()
                    : "--"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Check-out
                </p>

                <p>
                  {booking.checkOut
                    ? new Date(
                        booking.checkOut,
                      ).toLocaleDateString()
                    : "--"}
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  Room Type
                </p>

                <p>
                  {booking.roomType ?? "--"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Guests
                </p>

                <p>
                  {booking.numberOfGuests ?? "--"}
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  Total Price
                </p>

                <p>
                  {booking.totalPrice ?? "--"}{" "}
                  {booking.currency ?? ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p className="font-medium">
                  {booking.status}
                </p>
              </div>

            </div>

            {booking.qrCode && (

              <div className="pt-6 flex flex-col items-center">

                <p className="text-sm text-gray-500 mb-3">
                  Guest QR Code
                </p>

                <img
                  src={booking.qrCode}
                  alt="Booking QR"
                  className="w-56 h-56 rounded-lg border"
                />

              </div>

            )}

          </div>

        </Card>

        <div className="mt-8">

          <Button
            variant="secondary"
            onClick={() =>
              router.push("/hotel-dashboard")
            }
          >
            Back to Dashboard
          </Button>

        </div>

      </Container>

    </main>
  );
}