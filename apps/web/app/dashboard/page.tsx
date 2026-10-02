"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Container from "@/components/UI/Container";

type Booking = { id: string; hotelName?: string | null; destination?: string | null; checkIn?: string | null; checkOut?: string | null };

const actions = [
  { href: "/upload-booking", icon: "▧", title: "Upload a booking", description: "Add your hotel confirmation and create your check-in QR.", accent: "bg-blue-50 text-blue-700" },
  { href: "/identity", icon: "▣", title: "Traveller wallet", description: "Keep your identity, visa and travel documents together.", accent: "bg-violet-50 text-violet-700" },
  { href: "/travel-history", icon: "⌁", title: "My travels", description: "View your stays and continue planning a trip.", accent: "bg-emerald-50 text-emerald-700" },
  { href: "/profile", icon: "◉", title: "My profile", description: "Manage your traveller information and account.", accent: "bg-amber-50 text-amber-700" },
];

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => { api("/bookings").then(setBookings).catch(() => setBookings([])); }, []);
  const latest = bookings[0];
  return <main className="min-h-screen bg-[#f6f8fc] pb-12">
    <header className="border-b border-slate-200/80 bg-white"><Container className="flex max-w-5xl items-center justify-between py-4"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Pravaas" width={42} height={42} /><span className="text-xl font-bold tracking-tight text-slate-900">Pravaas</span></div><Link href="/profile" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">My account</Link></Container></header>
    <Container className="max-w-5xl py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[48px] border-white/5" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Your journey, made simpler</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Travel with everything in one place.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Your bookings, travel documents and personal trip companion—thoughtfully brought together.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/upload-booking" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-blue-50">＋ Add a booking</Link><Link href="/travel-history" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Explore my travels →</Link></div>
      </section>
      <section className="mt-9"><div className="mb-4"><h2 className="text-xl font-bold text-slate-900">Your travel tools</h2><p className="mt-1 text-sm text-slate-500">Everything you need before and during your stay.</p></div><div className="grid gap-4 sm:grid-cols-2">{actions.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:p-6"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.accent}`} aria-hidden="true">{item.icon}</div><div className="mt-4 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">{item.title}</h3><span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900">→</span></div><p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p></Link>)}</div></section>
      <section className="mt-9 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-blue-700 shadow-sm">✦</span><h2 className="text-lg font-bold text-slate-900">Meet Shika</h2><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">AI travel companion</span></div><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Get ideas for your stay and create a day-by-day itinerary with a little help from Shika.</p>{!latest && <p className="mt-2 text-xs text-slate-500">Upload a booking first to start planning your trip.</p>}</div><Link href={latest ? `/itinerary/${latest.id}` : "/travel-history"} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">{latest ? "Plan with Shika →" : "Choose a trip →"}</Link></div></section>
      {latest && <p className="mt-4 text-center text-xs text-slate-400">Continue planning: {latest.hotelName || latest.destination || "Your latest stay"}</p>}
    </Container>
  </main>;
}