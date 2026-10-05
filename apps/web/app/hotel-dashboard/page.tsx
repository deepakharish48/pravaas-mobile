"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import HotelNavigation from "@/components/HotelNavigation";

type RecentGuest = { id: string; guestName: string; room: string; checkedInAt: string };
type DashboardResponse = { hotelName: string; todaysArrivals: number; checkedIn: number; pendingCheckIns: number; recentGuests: RecentGuest[] };

function StatCard({ title, value }: { title: string; value: number }) {
  return <Card className="h-full">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
  </Card>;
}

export default function HotelDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => { api("/hotel/dashboard").then(setDashboard).catch(console.error); }, []);

  if (!dashboard) return <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] text-slate-500">Loading dashboard…</main>;

  return (
    <main className="min-h-screen bg-[#f6f8fc] lg:pl-64">
      <HotelNavigation />
      <Container className="max-w-[1500px] py-6 pb-24 sm:py-8 lg:pb-10">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">Reception operations</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{dashboard.hotelName}</h1>
            <p className="mt-1 text-sm text-slate-500">Today’s arrivals, check-ins and guest compliance.</p>
          </div>
          <Link href="/hotel-scan" className="sm:w-auto"><Button className="w-full sm:w-auto">Scan guest QR</Button></Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
          <StatCard title="Today’s arrivals" value={dashboard.todaysArrivals} />
          <StatCard title="Checked in" value={dashboard.checkedIn} />
          <StatCard title="Pending check-ins" value={dashboard.pendingCheckIns} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Card>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Recent check-ins</h2>
                <p className="mt-1 text-sm text-slate-500">Open a guest record or prepare Form III.</p>
              </div>
            </div>

            {dashboard.recentGuests.length === 0 ? <p className="py-8 text-sm text-slate-500">No recent check-ins.</p> : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <tr><th className="pb-3 font-semibold">Guest</th><th className="pb-3 font-semibold">Room</th><th className="pb-3 font-semibold">Checked in</th><th className="pb-3 text-right font-semibold">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dashboard.recentGuests.map((guest) => <tr key={guest.id}>
                        <td className="py-4"><Link href={`/hotel-booking/${guest.id}`} className="font-semibold text-slate-950 hover:text-blue-700">{guest.guestName}</Link></td>
                        <td className="py-4 text-slate-600">Room {guest.room}</td>
                        <td className="py-4 text-slate-500">{guest.checkedInAt}</td>
                        <td className="py-4 text-right"><Link href={`/hotel-booking/${guest.id}/c-form`} className="font-semibold text-blue-700 hover:text-blue-800">Form III</Link></td>
                      </tr>)}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-3 md:hidden">
                  {dashboard.recentGuests.map((guest) => <div key={guest.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><Link href={`/hotel-booking/${guest.id}`} className="font-semibold text-slate-950">{guest.guestName}</Link><p className="mt-1 text-sm text-slate-500">Room {guest.room} · {guest.checkedInAt}</p></div>
                      <Link href={`/hotel-booking/${guest.id}/c-form`} className="shrink-0 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-blue-700">Form III</Link>
                    </div>
                  </div>)}
                </div>
              </>
            )}
          </Card>

          <aside className="space-y-4">
            <Card className="bg-slate-950 text-white">
              <p className="text-sm font-semibold text-blue-200">Fast check-in</p>
              <h2 className="mt-2 text-xl font-bold">Scan, verify, approve.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Use the guest QR workflow at reception. Pravaas keeps the flow focused on the information staff need.</p>
              <Link href="/hotel-scan" className="mt-5 block"><Button className="w-full">Open scanner</Button></Link>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-slate-950">Compliance</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Prepare Form III (earlier Form C) directly from eligible guest booking and identity data.</p>
            </Card>
            <Button variant="secondary" className="w-full" onClick={() => { localStorage.removeItem("token"); router.push("/hotel-login"); }}>Sign out</Button>
          </aside>
        </div>
      </Container>
    </main>
  );
}