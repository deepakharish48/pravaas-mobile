"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

type Booking = {
  id: string;
  hotelName?: string | null;
  guestName?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  numberOfGuests?: number | null;
  status?: string | null;
};

type Tab = "discover" | "itinerary" | "assistant";

const categories = [
  { name: "Sightseeing", icon: "🏛️", description: "Landmarks and local highlights" },
  { name: "Food & cafés", icon: "🍽️", description: "Local favourites and cafés" },
  { name: "Experiences", icon: "🎟️", description: "Things to do and places to explore" },
  { name: "Shopping", icon: "🛍️", description: "Markets, crafts and local finds" },
  { name: "Family", icon: "👨‍👩‍👧", description: "Ideas for every age" },
  { name: "Nightlife", icon: "🌙", description: "Evening plans and live events" },
];

function formatDate(value?: string | null) {
  if (!value) return "Date not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not available"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ItineraryAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("discover");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    api(`/bookings/${id}`)
      .then((data) => {
        if (active) setBooking(data);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? "We couldn't load this booking.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const tripDates = useMemo(() => {
    if (!booking?.checkIn || !booking?.checkOut) return "Your stay";
    return `${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`;
  }, [booking]);

  function toggleCategory(name: string) {
    setSelectedCategories((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading your trip…</main>;
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <Card>
          <p className="font-semibold text-slate-900">Booking unavailable</p>
          <p className="mt-2 text-sm text-slate-600">{error || "We couldn't find this booking."}</p>
          <Link href="/travel-history" className="mt-5 inline-block text-sm font-semibold text-blue-700">Back to My Travels</Link>
        </Card>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "discover", label: "Discover", icon: "✦" },
    { id: "itinerary", label: "My itinerary", icon: "▤" },
    { id: "assistant", label: "AI assistant", icon: "✧" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-12">
      <div className="border-b border-slate-200 bg-white">
        <Container className="max-w-5xl py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/qr/${booking.id}`} className="text-sm font-medium text-slate-500 hover:text-slate-900">← Check-in QR</Link>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Your trip companion</span>
          </div>
        </Container>
      </div>

      <Container className="max-w-5xl py-8 sm:py-10">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Plan your stay</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Make every day count.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Explore nearby ideas and shape a trip that fits your pace. Your booking details are already here.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs text-slate-300">Hotel</p>
              <p className="mt-1 truncate font-semibold">{booking.hotelName || "Hotel details pending"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs text-slate-300">Stay</p>
              <p className="mt-1 font-semibold">{tripDates}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs text-slate-300">Guests</p>
              <p className="mt-1 font-semibold">{booking.numberOfGuests ? `${booking.numberOfGuests} guests` : "Not specified"}</p>
            </div>
          </div>
        </section>

        <nav aria-label="Trip planning sections" className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-current={tab === item.id ? "page" : undefined}
              className={`flex min-w-max flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
              <span aria-hidden="true">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {tab === "discover" && (
          <section className="mt-7">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-900">What are you in the mood for?</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a few interests to shape your recommendations.</p>
              </div>
              <span className="text-xs text-slate-400">Personalisation preview</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const selected = selectedCategories.includes(category.name);
                return (
                  <button key={category.name} type="button" onClick={() => toggleCategory(category.name)} aria-pressed={selected}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}>
                    <span className="text-2xl" aria-hidden="true">{category.icon}</span>
                    <span className="mt-3 block font-semibold text-slate-900">{category.name}</span>
                    <span className="mt-1 block text-sm text-slate-500">{category.description}</span>
                    <span className={`mt-3 inline-block text-xs font-semibold ${selected ? "text-blue-700" : "text-slate-400"}`}>{selected ? "Selected ✓" : "Tap to select"}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Ready to plan?</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedCategories.length ? `${selectedCategories.length} interests selected` : "You can start with any interests—or explore later."}</p>
                </div>
                <Button onClick={() => setTab("assistant")}>Continue to AI assistant</Button>
              </div>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-400">Partner and sponsored recommendations will appear here in a later release and will be clearly labelled.</p>
          </section>
        )}

        {tab === "itinerary" && (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="text-3xl" aria-hidden="true">🗓️</div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">Your itinerary will live here</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Once itinerary generation is connected, you’ll be able to review each day, move activities around, and keep your plan with this booking.</p>
            <Button className="mt-5" onClick={() => setTab("assistant")}>Start with the assistant</Button>
          </section>
        )}

        {tab === "assistant" && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700">✦</div>
                <div>
                  <h2 className="font-bold text-slate-900">Your AI travel assistant</h2>
                  <p className="text-xs text-slate-500">Chat and voice planning are coming next</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 bg-slate-50 p-5 sm:p-6">
              <div className="max-w-xl rounded-2xl rounded-tl-sm bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                I’ll use your booking dates and guest count to help plan your stay. What kind of trip would you like?
              </div>
              <div className="flex flex-wrap gap-2">
                {["Relaxed and scenic", "Food and local culture", "Family-friendly", "A little adventure"].map((prompt) => (
                  <button key={prompt} type="button" onClick={() => setSelectedCategories((current) => current.includes(prompt) ? current : [...current, prompt])}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700">{prompt}</button>
                ))}
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                This is the first UI milestone. It currently displays your booking and captures interest selections; AI generation, saved plans, and voice input will be connected in the next milestone.
              </div>
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-4">
              <input disabled aria-label="Message the assistant" placeholder="Ask about your trip…" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500" />
              <button disabled type="button" aria-label="Send message" className="rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500">Send</button>
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
