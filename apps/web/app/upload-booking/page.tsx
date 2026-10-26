"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import BrandLogo from "@/components/BrandLogo";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export default function UploadBookingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  function selectFile(nextFile?: File) {
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError("Please choose a JPG, PNG, WebP image, or PDF.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setError("Your file must be smaller than 15 MB.");
      return;
    }
    setError("");
    setFile(nextFile);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function uploadBooking() {
    if (!file) {
      setError("Choose your booking confirmation to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      const booking = await api("/bookings/upload", {
        method: "POST",
        body: formData,
      });
      router.push(`/qr/${booking.id}`);
    } catch (err: unknown) {
      console.error(err);
      setError((err instanceof Error ? err.message : undefined) ?? "Booking upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="traveller-workspace min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <Container className="max-w-5xl">
        <header className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center sm:mb-10">
          <BrandLogo size={42} className="mb-5 h-10 w-auto" priority />
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-800">
            <span aria-hidden="true">✦</span> YOUR TRIP, IN ONE PLACE
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Bring your booking to Pravaas
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Upload your hotel confirmation and we’ll organise the important details for your trip.
            No need to enter everything by hand.
          </p>
        </header>

        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)] lg:gap-6">
          <Card className="border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Booking confirmation</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a screenshot or your booking PDF.</p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Step 1 of 2</span>
            </div>

            <input
              ref={inputRef}
              id="booking-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={onFileChange}
              aria-describedby="booking-file-help"
            />

            <label
              htmlFor="booking-file"
              onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition sm:min-h-64 ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/60"}`}
            >
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200 transition group-hover:-translate-y-0.5" aria-hidden="true">
                {file?.type === "application/pdf" ? "▤" : "↑"}
              </span>
              <span className="text-base font-semibold text-slate-900">
                {file ? "Choose a different file" : "Drop your booking here"}
              </span>
              <span className="mt-1 text-sm text-slate-500">or <span className="font-semibold text-blue-700 underline underline-offset-2">browse files</span></span>
              <span id="booking-file-help" className="mt-4 text-xs text-slate-500">JPG, PNG, WebP or PDF · up to 15 MB</span>
            </label>

            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-emerald-700" aria-hidden="true">✓</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload</p>
                </div>
                <button type="button" onClick={() => { setFile(null); setError(""); if (inputRef.current) inputRef.current.value = ""; }} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                  Remove
                </button>
              </div>
            )}

            {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={uploadBooking} disabled={loading || !file} className="w-full rounded-xl py-3.5 shadow-sm sm:flex-1">
                {loading ? "Uploading and reading details…" : "Upload booking"}
                {!loading && <span className="ml-2" aria-hidden="true">→</span>}
              </Button>
              <p className="text-center text-xs leading-5 text-slate-500 sm:max-w-40 sm:text-left">Usually takes a few moments to process.</p>
            </div>
          </Card>

          <aside className="flex flex-col gap-4">
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm" aria-hidden="true">✦</div>
              <h2 className="text-base font-semibold text-slate-950">A little less admin. A lot more travel.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Pravaas reads the confirmation and helps turn the details into a trip you can actually use.</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                <li className="flex gap-2.5"><span className="font-bold text-blue-700" aria-hidden="true">✓</span><span>Hotel and booking details, organised</span></li>
                <li className="flex gap-2.5"><span className="font-bold text-blue-700" aria-hidden="true">✓</span><span>Check-in QR code for reception</span></li>
                <li className="flex gap-2.5"><span className="font-bold text-blue-700" aria-hidden="true">✓</span><span>Tools to plan your time at the destination</span></li>
              </ul>
            </Card>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg" aria-hidden="true">⌑</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Your information stays yours</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Only upload a booking document you’re authorised to share. Keep sensitive payment details out of screenshots when possible.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
