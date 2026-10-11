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
  status: string;
};

function statusStyles(status: string) {
  switch (status.toUpperCase()) {
    case "CHECKED_IN":
      return "travel-status-checked-in";
    case "CONFIRMED":
      return "travel-status-confirmed";
    case "COMPLETED":
      return "travel-status-completed";
    case "CANCELLED":
      return "travel-status-cancelled";
    case "PENDING":
    case "UPCOMING":
    default:
      return "travel-status-pending";
  }
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  if (!value) return "Date not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export default function TravelHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/bookings")
      .then((data: Booking[]) => {
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date(a.checkIn).getTime();
          const dateB = new Date(b.checkIn).getTime();
          const safeA = Number.isNaN(dateA) ? Number.NEGATIVE_INFINITY : dateA;
          const safeB = Number.isNaN(dateB) ? Number.NEGATIVE_INFINITY : dateB;
          return safeB - safeA;
        });
        setBookings(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="traveller-workspace flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-600">Loading your travels…</p>
      </main>
    );
  }

  return (
    <main className="traveller-workspace min-h-screen bg-[#f6f8fc] pb-24 md:pb-8">
      <GuestNavigation />
      <Container className="max-w-5xl">
        <div className="mb-8 mt-8 md:mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Trips</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My Travels</h1>
          <p className="mt-2 text-sm text-slate-500">Your past and upcoming hotel stays.</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">No trips found.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => (
              <Link key={booking.id} href={`/booking/${booking.id}`} className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <Card className="cursor-pointer transition hover:shadow-md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-slate-900">{booking.hotelName}</h2>
                      <p className="mt-1 text-sm text-gray-500">{formatDate(booking.checkIn)} · {formatDate(booking.checkOut)}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${statusStyles(booking.status)}`}>
                      <span className={`travel-status-dot mr-2 h-1.5 w-1.5 rounded-full ${booking.status.toUpperCase() === "CHECKED_IN" ? "is-checked-in" : booking.status.toUpperCase() === "CONFIRMED" ? "is-confirmed" : booking.status.toUpperCase() === "CANCELLED" ? "is-cancelled" : ""}`} aria-hidden="true" />
                      {statusLabel(booking.status)}
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
