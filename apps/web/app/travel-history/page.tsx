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
      return "border border-emerald-400/40 bg-emerald-400/15 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-300";
    case "CONFIRMED":
      return "border border-amber-400/50 bg-amber-400/15 text-amber-800 dark:border-amber-300/40 dark:bg-amber-300/15 dark:text-amber-200";
    case "COMPLETED":
      return "border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/50 dark:bg-slate-400/15 dark:text-slate-200";
    case "CANCELLED":
      return "border border-rose-400/40 bg-rose-400/15 text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/15 dark:text-rose-300";
    case "PENDING":
    case "UPCOMING":
    default:
      return "border border-sky-400/40 bg-sky-400/15 text-sky-700 dark:border-sky-300/40 dark:bg-sky-300/15 dark:text-sky-200";
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
      .then(setBookings)
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
                      <span className={`mr-2 h-1.5 w-1.5 rounded-full ${booking.status.toUpperCase() === "CHECKED_IN" ? "bg-emerald-600 dark:bg-emerald-300" : booking.status.toUpperCase() === "CONFIRMED" ? "bg-amber-600 dark:bg-amber-300" : booking.status.toUpperCase() === "CANCELLED" ? "bg-rose-600 dark:bg-rose-300" : "bg-current"}`} aria-hidden="true" />
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
