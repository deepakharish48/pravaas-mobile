"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

export default function UploadBookingPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadBooking() {
    if (!file) {
      alert("Please choose a booking confirmation.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const booking = await api("/bookings/upload", {
        method: "POST",
        body: formData,
      });

      router.push(`/qr/${booking.id}`);
    } catch (err: any) {
      console.error(err);

      alert(
        err?.message ??
          "Booking upload failed."
      );
    } finally {
      setLoading(false);
    }
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
            Upload Booking
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Upload your hotel booking confirmation.
            We'll automatically extract the details.
          </p>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <input
                id="booking-file"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] ?? null
                  )
                }
              />

              <label
                htmlFor="booking-file"
                className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-blue-600 bg-white px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Choose File
              </label>

              <p className="mt-2 text-center text-sm text-gray-500">
                {file ? file.name : "No file chosen"}
              </p>
            </div>

            <Button
              onClick={uploadBooking}
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "Upload Booking"}
            </Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}