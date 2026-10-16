"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

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
  const { flags } = useFeatureFlags();

  const [qr, setQr] = useState<QRResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api(`/qr/${id}`)
      .then((result) => { if (active) setQr(result); })
      .catch((reason) => { console.error(reason); if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function copyBookingId() {
    if (!qr?.bookingId) return;
    try {
      await navigator.clipboard.writeText(qr.bookingId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(true);
    }
  }

  if (loading) {
    return (
      <main className="traveller-workspace flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-600">Preparing your check-in pass…</p>
        </div>
      </main>
    );
  }

  if (!qr) {
    return (
      <main className="traveller-workspace flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md p-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-700">!</div>
          <h1 className="text-xl font-bold text-slate-950">We couldn’t load this QR code</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">The booking may be unavailable, or your session may have expired. Return to your dashboard and try again.</p>
          <Link href="/dashboard" className="mt-5 block"><Button className="w-full">Back to dashboard</Button></Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="traveller-workspace min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <Container className="max-w-5xl">
        <header className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center sm:mb-10">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
            <Image src="/logo.png" alt="Pravaas" width={36} height={36} priority />
          </div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> YOUR CHECK-IN PASS
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">You’re ready to check in</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Keep this QR code handy and show it to the hotel reception when you arrive.</p>
        </header>

        <div className="mx-auto grid max-w-4xl items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6">
          <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <p className="text-sm font-semibold text-slate-950">Pravaas check-in QR</p>
                <p className="mt-0.5 text-xs text-slate-500">Present at the front desk</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Ready</span>
            </div>
            <div className="px-5 py-7 sm:px-8 sm:py-8">
              <div className="mx-auto flex max-w-[300px] items-center justify-center rounded-3xl border border-slate-100 bg-white p-4 sm:p-5">
                <img src={qr.qrCodeDataUrl} alt="Booking check-in QR code" className="h-auto w-full max-w-[260px]" />
              </div>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">Turn your screen brightness up for easier scanning.</p>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Booking reference</p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="min-w-0 flex-1 break-all font-mono text-sm font-semibold text-slate-900">{qr.bookingId}</p>
                  <button type="button" onClick={copyBookingId} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>
              {error && <p role="status" className="mt-3 text-xs text-rose-700">Couldn’t complete that action. Please try again.</p>}
              <a href={qr.qrCodeDataUrl} download={`pravaas-check-in-${qr.bookingId}.png`} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                <span aria-hidden="true">↓</span> Save QR image
              </a>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm" aria-hidden="true">✦</div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Make the most of your stay</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Your trip is just getting started.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Discover nearby experiences, shape your itinerary, and spend less time planning from scratch.</p>
              <Link href={`/itinerary/${qr.bookingId}`} className="mt-5 block">
                <Button className="w-full">Plan your trip <span className="ml-2" aria-hidden="true">→</span></Button>
              </Link>
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-950">Before you arrive</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">1</span><span>Keep this QR code open or save it to your phone.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">2</span><span>Show it to the reception team when requested.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">3</span><span>Keep your official booking confirmation available too.</span></li>
              </ul>
            </Card>

            {(flags.explore || flags.reelToItinerary) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {flags.explore && <Link href="/explore" className="block"><Button variant="secondary" className="w-full">✦ Explore trips</Button></Link>}
                {flags.reelToItinerary && <Link href={`/reel-to-itinerary?bookingId=${qr.bookingId}`} className="block"><Button variant="secondary" className="w-full">Create from a Reel</Button></Link>}
              </div>
            )}
          </div>
        </div>

        <footer className="mx-auto mt-7 flex max-w-4xl flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="flex-1"><Button className="w-full">Back to dashboard</Button></Link>
          <Link href="/travel-history" className="flex-1"><Button variant="secondary" className="w-full">Travel history</Button></Link>
        </footer>
      </Container>
    </main>
  );
}
