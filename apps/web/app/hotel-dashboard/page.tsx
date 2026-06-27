"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

type RecentGuest = {
  id: string;
  guestName: string;
  room: string;
  checkedInAt: string;
};

type DashboardResponse = {
  hotelName: string;
  todaysArrivals: number;
  checkedIn: number;
  pendingCheckIns: number;
  recentGuests: RecentGuest[];
};

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <Card className="text-center">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>
    </Card>
  );
}

export default function HotelDashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  useEffect(() => {
    api("/hotel/dashboard")
      .then(setDashboard)
      .catch(console.error);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    router.push("/hotel-login");
  }

  if (!dashboard) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">

      <Container className="max-w-5xl">

        <div className="flex flex-col items-center mb-10">

          <Image
            src="/logo.png"
            alt="Pravaas"
            width={64}
            height={64}
            className="mb-4"
          />

          <h1 className="text-3xl font-bold">
            {dashboard.hotelName}
          </h1>

          <p className="mt-2 text-gray-500">
            Hotel Reception Dashboard
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <StatCard
            title="Today's Arrivals"
            value={dashboard.todaysArrivals}
          />

          <StatCard
            title="Checked In"
            value={dashboard.checkedIn}
          />

          <StatCard
            title="Pending"
            value={dashboard.pendingCheckIns}
          />

        </div>

        <div className="mb-10">

          <Link href="/hotel-scan">
            <Button>
              Scan Guest QR
            </Button>
          </Link>

        </div>

        <Card>

          <h2 className="text-xl font-semibold mb-6">
            Recent Check-ins
          </h2>

          {dashboard.recentGuests.length === 0 ? (

            <p className="text-gray-500">
              No recent check-ins.
            </p>

          ) : (

            <div className="space-y-4">

              {dashboard.recentGuests.map(
                (guest) => (

                  <Link
                    key={guest.id}
                    href={`/hotel-checkin/${guest.id}`}
                  >

                    <div className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition cursor-pointer">

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="font-semibold">
                            {guest.guestName}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Room {guest.room}
                          </p>

                        </div>

                        <p className="text-sm text-gray-400">
                          {guest.checkedInAt}
                        </p>

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </Card>

        <div className="mt-8">

          <Button
            variant="secondary"
            onClick={logout}
          >
            Sign Out
          </Button>

        </div>

      </Container>

    </main>
  );
}