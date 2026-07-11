"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { api } from "@/lib/api";

import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

type Booking = {
  id: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  status: "UPCOMING" | "COMPLETED";
};

export default function TravelHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/bookings")
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
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
            My Travels
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Your past and upcoming hotel stays.
          </p>

        </div>

        {bookings.length === 0 ? (
          <Card>

            <p className="text-center text-gray-500">
              No trips found.
            </p>

          </Card>
        ) : (
          <div className="space-y-4">

            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/booking/${booking.id}`}
              >
                <Card className="cursor-pointer transition hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-lg font-semibold">
                        {booking.hotelName}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {booking.checkIn} • {booking.checkOut}
                      </p>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        booking.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {booking.status}
                    </span>

                  </div>

                </Card>
              </Link>
            ))}

          </div>
        )}

      </Container>
    </main>
  );
}