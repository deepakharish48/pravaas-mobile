"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { api } from "@/lib/api";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

type Booking = {
  id: string;
  hotelName: string;
  guestName: string;
  confirmationNumber: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  totalPrice: string;
  currency: string;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b last:border-b-0 py-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api(`/bookings/${id}`)
      .then((data) => {
        console.log("BOOKING:", data);
        setBooking(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
      <Container className="max-w-lg">

        <div className="mb-8 flex flex-col items-center">

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

          <p className="mt-2 text-center text-sm text-gray-500">
            View your hotel booking information.
          </p>

        </div>

        <Card>

          <DetailRow
            label="Hotel"
            value={booking.hotelName}
          />

          <DetailRow
            label="Guest"
            value={booking.guestName}
          />

          <DetailRow
            label="Confirmation"
            value={booking.confirmationNumber}
          />

          <DetailRow
            label="Check-in"
            value={new Date(
              booking.checkIn
            ).toLocaleDateString()}
          />

          <DetailRow
            label="Check-out"
            value={new Date(
              booking.checkOut
            ).toLocaleDateString()}
          />

          <DetailRow
            label="Room"
            value={booking.roomType}
          />

          <DetailRow
            label="Total"
            value={`${booking.currency} ${booking.totalPrice}`}
          />

        </Card>

        <div className="mt-6 space-y-3">

          <Link href={`/qr/${booking.id}`}>
            <Button>
              View Check-in QR
            </Button>
          </Link>

          <Link href="/travel-history">
            <Button variant="secondary">
              Back to My Travels
            </Button>
          </Link>

        </div>

      </Container>
    </main>
  );
}