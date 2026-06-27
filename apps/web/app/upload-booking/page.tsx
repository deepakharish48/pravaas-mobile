"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

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

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Booking upload failed."
        );
      }

      router.push("/qr");
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong."
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
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ?? null
                )
              }
            />

            {file && (
              <div className="rounded-lg bg-gray-100 p-3">
                <p className="text-sm text-gray-500">
                  Selected File
                </p>

                <p className="mt-1 font-medium">
                  {file.name}
                </p>
              </div>
            )}

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