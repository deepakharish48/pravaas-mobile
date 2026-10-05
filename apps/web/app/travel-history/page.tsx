"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { api } from "@/lib/api";

import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import GuestNavigation from "@/components/GuestNavigation";

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
    <main className="min-h-screen bg-[#f6f8fc] pb-24 md:pb-8">
      <Container className="max-w-5xl">

        <GuestNavigation />

        <div className="mb-8 mt-8 md:mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Trips</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My Travels</h1>
          <p className="mt-2 text-sm text-slate-500">Your past and upcoming hotel stays.</p>
        </div>

        {bookings.length === 0 ? (
          <Card>

            <p className="text-center text-gray-500">
              No trips found.
            </p>

          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">

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