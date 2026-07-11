"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/browser";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

export default function HotelScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    let controls: any;

    async function startScanner() {
      try {
        const devices =
          await BrowserQRCodeReader.listVideoInputDevices();

        if (!devices.length) {
          alert("No camera found.");
          return;
        }

        controls =
          await codeReader.decodeFromVideoDevice(
            devices[0].deviceId,
            videoRef.current!,
            (result) => {
              if (!result) return;

              controls.stop();

              router.push(
                `/hotel-checkin?payload=${encodeURIComponent(
                  result.getText()
                )}`
              );
            }
          );
      } catch (err) {
        console.error(err);
        alert("Unable to access camera.");
      }
    }

    startScanner();

    return () => {
      controls?.stop();
      controls?.dispose?.();
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 py-10">

      <Container className="max-w-3xl">

        <div className="mb-8 flex flex-col items-center">

          <Image
            src="/logo.png"
            alt="Pravaas"
            width={64}
            height={64}
            className="mb-4"
          />

          <h1 className="text-3xl font-bold">
            Scan Guest QR
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Point your camera at the guest's Pravaas QR
            to begin check-in.
          </p>

        </div>

        <Card>

          <div className="overflow-hidden rounded-xl border border-gray-200">

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-xl"
            />

          </div>

          <p className="mt-6 text-center text-gray-500">
            Waiting for QR code...
          </p>

        </Card>

        <div className="mt-6">

          <Link href="/hotel-dashboard">
            <Button variant="secondary">
              Back to Dashboard
            </Button>
          </Link>

        </div>

      </Container>

    </main>
  );
}