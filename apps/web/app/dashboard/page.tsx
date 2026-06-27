"use client";

import Image from "next/image";
import Link from "next/link";

import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

export default function DashboardPage() {
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

          <h1 className="text-3xl font-bold text-gray-900">
            Welcome
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Your digital travel companion.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/upload-booking">
            <Card className="cursor-pointer transition hover:shadow-md">
              <h2 className="text-lg font-semibold">
                Upload Booking
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add your hotel booking to generate a secure QR check-in.
              </p>
            </Card>
          </Link>

          <Link href="/identity">
            <Card className="cursor-pointer transition hover:shadow-md">
              <h2 className="text-lg font-semibold">
                Identity Wallet
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your verified travel identity documents.
              </p>
            </Card>
          </Link>

          <Link href="/travel-history">
            <Card className="cursor-pointer transition hover:shadow-md">
              <h2 className="text-lg font-semibold">
                My Travels
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View your past and upcoming hotel stays.
              </p>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="cursor-pointer transition hover:shadow-md">
              <h2 className="text-lg font-semibold">
                Profile
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View and update your traveller information.
              </p>
            </Card>
          </Link>
        </div>
      </Container>
    </main>
  );
}