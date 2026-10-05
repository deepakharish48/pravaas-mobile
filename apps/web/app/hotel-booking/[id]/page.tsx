"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import HotelNavigation from "@/components/HotelNavigation";

type Booking = { id: string; hotelName: string | null; guestName: string | null; confirmationNumber: string | null; checkIn: string | null; checkOut: string | null; roomType: string | null; numberOfGuests: number | null; totalPrice: string | null; currency: string | null; status: string; qrCode: string | null };

function Detail({ label, value }: { label: string; value: string | number | null }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-medium text-slate-900">{value ?? "--"}</p></div>;
}

export default function HotelBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) api(`/hotel/bookings/${id}`).then(setBooking).catch(console.error).finally(() => setLoading(false)); }, [id]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] text-slate-500">Loading booking…</main>;
  if (!booking) return <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] text-slate-500">Booking not found.</main>;

  return <main className="min-h-screen bg-[#f6f8fc] lg:pl-64">
    <HotelNavigation />
    <Container className="max-w-[1200px] py-6 pb-24 sm:py-8 lg:pb-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">Guest record</p><h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{booking.guestName ?? "Guest"}</h1><p className="mt-1 text-sm text-slate-500">{booking.hotelName ?? "Hotel"} · {booking.confirmationNumber ?? "No confirmation number"}</p></div>
        <Link href="/hotel-dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card><h2 className="mb-5 text-lg font-bold text-slate-950">Stay details</h2><div className="grid gap-5 sm:grid-cols-2"><Detail label="Check-in" value={booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : null}/><Detail label="Check-out" value={booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : null}/><Detail label="Room type" value={booking.roomType}/><Detail label="Guests" value={booking.numberOfGuests}/><Detail label="Total price" value={booking.totalPrice ? `${booking.totalPrice} ${booking.currency ?? ""}` : null}/><Detail label="Status" value={booking.status}/></div></Card>
          {booking.qrCode && <Card><h2 className="mb-4 text-lg font-bold text-slate-950">Guest QR</h2><div className="flex justify-center"><img src={booking.qrCode} alt="Booking QR" className="h-56 w-56 rounded-xl border border-slate-200 p-2" /></div></Card>}
        </div>
        <aside className="h-fit space-y-3 lg:sticky lg:top-24">
          <Card><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reception actions</p><Link href={`/hotel-booking/${id}/c-form`} className="mt-4 block"><Button className="w-full">Prepare Form III</Button></Link><Button variant="secondary" className="mt-3 w-full" onClick={() => router.push("/hotel-dashboard")}>Back to dashboard</Button></Card>
          <Card><p className="text-sm font-semibold text-slate-950">Confirmation</p><p className="mt-2 text-sm text-slate-500">{booking.confirmationNumber ?? "No confirmation number available."}</p></Card>
        </aside>
      </div>
    </Container>
  </main>;
}