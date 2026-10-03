"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Container from "@/components/UI/Container";
import BottomNav from "@/components/BottomNav";

type Booking = { id: string; hotelName?: string | null; destination?: string | null; checkIn?: string | null; checkOut?: string | null };

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => { api("/bookings").then(setBookings).catch(() => setBookings([])); }, []);
  const latest = bookings[0];

  return (
    <main className="min-h-screen bg-[#f6f8fc] pb-28">
      <header className="border-b border-slate-200/80 bg-white">
        <Container className="flex max-w-5xl items-center justify-between py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Pravaas" width={42} height={42} className="rounded-xl" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Pravaas</span>
          </Link>
          <Link href="/profile" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">My account</Link>
        </Container>
      </header>

      <Container className="max-w-5xl py-7 sm:py-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[48px] border-white/5" />
          <div className="pointer-events-none absolute -right-10 top-20 h-52 w-52 rounded-full border-[32px] border-white/[0.035]" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Your journey, made simpler</p>
          <h1 className="relative mt-3 max-w-2xl text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">Travel with everything in one place.</h1>
          <p className="relative mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Your bookings, travel documents and personal trip companion—thoughtfully brought together.</p>
          <div className="relative mt-7 flex flex-wrap gap-3">
            <Link href="/upload-booking" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-blue-50">＋ Add a booking</Link>
            <Link href="/travel-history" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Explore my travels →</Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-blue-700 shadow-sm">✦</span>
                <h2 className="text-lg font-bold text-slate-900">Meet Shika</h2>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">AI travel companion</span>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Get ideas for your stay and create a day-by-day itinerary with a little help from Shika.</p>
              {!latest && <p className="mt-2 text-xs text-slate-500">Upload a booking first to start planning your trip.</p>}
            </div>
            <Link href={latest ? `/itinerary/${latest.id}` : "/travel-history"} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">{latest ? "Plan with Shika →" : "Choose a trip →"}</Link>
          </div>
        </section>

        {latest && <p className="mt-4 text-center text-xs text-slate-400">Continue planning: {latest.hotelName || latest.destination || "Your latest stay"}</p>}
      </Container>

      <BottomNav />
    </main>
  );
}