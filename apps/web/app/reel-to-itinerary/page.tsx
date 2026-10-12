"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import GuestNavigation from "@/components/GuestNavigation";
import Container from "@/components/UI/Container";
import { api } from "@/lib/api";

type Booking = { id: string; destination?: string | null; hotelName?: string | null; checkIn?: string | null; checkOut?: string | null };
function ReelForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingId, setBookingId] = useState(search.get("bookingId") ?? "");
  const [url, setUrl] = useState("");
  const [destination, setDestination] = useState(search.get("destination") ?? "");
  const [sourceText, setSourceText] = useState("");
  const [interests, setInterests] = useState("sightseeing, local food, hidden gems");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api("/bookings").then((data: Booking[]) => { setBookings(data); setBookingId((current) => current || data[0]?.id || ""); }).catch(() => setBookings([])); }, []);
  const validInstagram = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\//i.test(url.trim());
  async function generate() {
    setError("");
    if (!validInstagram) { setError("Enter a valid public Instagram Reel or post URL."); return; }
    if (!bookingId) { setError("Add a booking with valid check-in and check-out dates first. Your itinerary will be saved to that trip."); return; }
    if (!destination.trim()) { setError("Enter the main destination shown in the Reel."); return; }
    if (!sourceText.trim()) { setError("Add the Reel caption, transcript, or your notes about the places shown. Pravaas does not automatically read Reel video content from a link."); return; }
    setBusy(true);
    try {
      const result = await api(`/bookings/${bookingId}/itinerary`, { method: "POST", body: JSON.stringify({ destination: destination.trim(), interests: interests.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8), sourceContext: `Instagram inspiration URL: ${url.trim()}\nTraveller-provided Reel caption/transcript/notes:\n${sourceText.trim()}` }) });
      if (!result?.destination) throw new Error("The itinerary service returned an unexpected response.");
      router.push(`/itinerary/${bookingId}`);
    } catch (err: any) { setError(err?.message ?? "Could not generate an itinerary. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="traveller-workspace min-h-screen bg-[#f6f8fc] pb-24 md:pb-8"><GuestNavigation /><Container className="max-w-3xl py-7 sm:py-10"><Link href="/explore" className="text-sm font-semibold text-indigo-700">← Back to Explore</Link>
    <section className="mt-5 rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Reel to itinerary</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Save the inspiration. Build the trip.</h1><p className="mt-3 text-sm leading-6 text-slate-300">Bring an Instagram Reel into Pravaas and turn its travel details into an editable itinerary connected to your stay.</p></section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="space-y-5">
      <div><label htmlFor="reel-url" className="block text-sm font-semibold text-slate-900">Instagram Reel or post URL</label><input id="reel-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.instagram.com/reel/..." className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400" /><p className="mt-1.5 text-xs leading-5 text-slate-500">We keep the source link for reference. A link alone does not give us access to analyze the video.</p></div>
      <div><label htmlFor="reel-destination" className="block text-sm font-semibold text-slate-900">Main destination</label><input id="reel-destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Jaipur, Rajasthan" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400" /></div>
      <div><label htmlFor="reel-source-text" className="block text-sm font-semibold text-slate-900">Caption, transcript, or your notes</label><textarea id="reel-source-text" rows={6} value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste the caption/transcript or list places, cafés, activities and tips mentioned in the Reel…" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400" /><p className="mt-1.5 text-xs text-slate-500">Only include content you have permission to share and process.</p></div>
      <div><label htmlFor="reel-interests" className="block text-sm font-semibold text-slate-900">Interests (comma-separated)</label><input id="reel-interests" value={interests} onChange={(e) => setInterests(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900" /></div>
      <div><label htmlFor="reel-booking" className="block text-sm font-semibold text-slate-900">Save itinerary to a trip</label><select id="reel-booking" value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900"><option value="">Choose a booking</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.destination || booking.hotelName || "Trip"} · {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "dates unavailable"}</option>)}</select>{!bookings.length && <p className="mt-2 text-sm text-amber-700">No bookings found. Add a booking first to generate a date-aware itinerary.</p>}</div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{typeof error === "string" ? error : "Please check your trip details and try again."}</p>}
      <button type="button" disabled={busy} onClick={generate} className="w-full rounded-xl bg-indigo-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Building your itinerary…" : "Generate itinerary from this inspiration →"}</button>
    </div></section>
    <p className="mt-4 text-xs leading-5 text-slate-500">Pravaas uses the text you provide as inspiration. Verify locations, opening hours and travel times before your trip; the Reel itself is not automatically downloaded or transcribed.</p>
  </Container></main>;
}
export default function ReelToItineraryPage() { return <Suspense fallback={<main className="min-h-screen p-8 text-slate-600">Loading Reel planner…</main>}><ReelForm /></Suspense>; }
