"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/browser";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import HotelNavigation from "@/components/HotelNavigation";

export default function HotelScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let controls: any;
    async function startScanner() {
      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        if (!devices.length) { alert("No camera found."); return; }
        const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
        const handleResult = (result: any) => { if (!result) return; controls?.stop(); router.push(`/hotel-checkin?payload=${encodeURIComponent(result.getText())}`); };
        if (isMobile) {
          try {
            controls = await codeReader.decodeFromConstraints({ video: { facingMode: { exact: "environment" } }, audio: false }, videoRef.current!, handleResult);
            return;
          } catch {}
        }
        const preferredDevice = devices.find((device) => /back|rear|environment|world/i.test(device.label)) ?? devices[0];
        controls = await codeReader.decodeFromVideoDevice(preferredDevice.deviceId, videoRef.current!, handleResult);
      } catch (err) { console.error(err); alert("Unable to access camera."); }
    }
    startScanner();
    return () => { controls?.stop(); controls?.dispose?.(); };
  }, [router]);

  return <main className="min-h-screen bg-[#f6f8fc] lg:pl-64">
    <HotelNavigation />
    <Container className="max-w-[1100px] py-6 pb-24 sm:py-8 lg:pb-10">
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">Reception operations</p><h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Scan guest QR</h1><p className="mt-1 text-sm text-slate-500">Point the camera at the traveller’s Pravaas QR to begin check-in.</p></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-3 sm:p-5"><div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950"><video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full object-cover sm:aspect-video"/><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-56 w-56 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)] sm:h-64 sm:w-64"/></div></div><p className="mt-4 text-center text-sm text-slate-500">Waiting for QR code…</p></Card>
        <aside className="h-fit space-y-4 lg:sticky lg:top-24"><Card><p className="text-sm font-semibold text-slate-950">Reception tip</p><p className="mt-2 text-sm leading-6 text-slate-500">On phones, Pravaas requests the rear camera first. Keep the QR inside the frame until it is detected.</p></Card><Link href="/hotel-dashboard"><Button variant="secondary" className="w-full">Back to dashboard</Button></Link></aside>
      </div>
    </Container>
  </main>;
}