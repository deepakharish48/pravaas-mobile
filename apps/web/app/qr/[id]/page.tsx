"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

type QRResponse = {
  bookingId: string;
  qrCodeDataUrl: string;
  payload: string;
};

export default function QRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [qr, setQr] = useState<QRResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/qr/${id}`)
      .then(setQr)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading QR...
      </main>
    );
  }

  if (!qr) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        QR not found.
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

          <h1 className="text-3xl font-bold">Check-in QR</h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Present this QR at the hotel reception for a faster check-in.
          </p>
        </div>

        <Card>
          <img
            src={qr.qrCodeDataUrl}
            alt="Check-in QR"
            className="mx-auto rounded-xl"
          />

          <div className="mt-6 rounded-xl bg-gray-100 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Booking ID
            </p>
            <p className="mt-1 font-medium">{qr.bookingId}</p>
          </div>
        </Card>

        <Card className="mt-5 border border-blue-100 bg-blue-50">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl">
              ✦
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Your stay, planned for you</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                Explore things to do, discover local experiences, and plan your days around this booking.
              </p>
            </div>
          </div>
          <Link href={`/itinerary/${qr.bookingId}`} className="mt-4 block">
            <Button>Plan Your Trip</Button>
          </Link>
        </Card>

        <div className="mt-6 space-y-3">
          <Link href="/dashboard" className="block">
            <Button>Back to Dashboard</Button>
          </Link>
          <Link href="/travel-history" className="block">
            <Button variant="secondary">Travel History</Button>
          </Link>
        </div>
      </Container>
    </main>
  );
}
