"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";

import { api } from "@/lib/api";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

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
      <main className="min-h-screen flex items-center justify-center">
        Loading QR...
      </main>
    );
  }

  if (!qr) {
    return (
      <main className="min-h-screen flex items-center justify-center">
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

          <h1 className="text-3xl font-bold">
            Check-in QR
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Present this QR at the hotel reception for a
            faster check-in.
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

            <p className="mt-1 font-medium">
              {qr.bookingId}
            </p>

          </div>

        </Card>

        <div className="mt-6 space-y-3">

          <Link href="/dashboard">
            <Button>
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/travel-history">
            <Button variant="secondary">
              Travel History
            </Button>
          </Link>

        </div>

      </Container>
    </main>
  );
}