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
  destination?: string | null;
  itinerary?: { destination: string; days: Array<{ date: string; title: string; activities: Array<{ time: string; name: string; description: string }> }> } | null;
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
  const [destination, setDestination] = useState("");
  const [itinerary, setItinerary] = useState<{ destination: string; days: Array<{ date: string; title: string; activities: Array<{ time: string; name: string; description: string }> }> } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  useEffect(() => {
    let active = true;
    api(`/bookings/${id}`)
      .then((data) => {
        if (active) { setBooking(data); setDestination(data.destination ?? ""); setItinerary(data.itinerary ?? null); }
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

  async function generateItinerary() {
    setGenerating(true);
    setGenerationError("");
    try {
      const result = await api(`/bookings/${id}/itinerary`, { method: "POST", body: JSON.stringify({ destination: destination.trim(), interests: selectedCategories }) });
      setItinerary(result);
      setTab("itinerary");
    } catch (err: any) {
      setGenerationError(err?.message ?? "We couldn’t generate your itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

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

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <label htmlFor="trip-destination" className="block text-sm font-semibold text-slate-900">Where are you travelling?</label>
          <p className="mt-1 text-xs text-slate-500">Enter the city or destination for your stay. You can change it before generating.</p>
          <input id="trip-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g., Hyderabad" maxLength={120} className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </section>

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
                <Button disabled={!destination.trim() || generating} onClick={generateItinerary}>{generating ? "Creating your plan…" : "Generate my itinerary"}</Button>
              </div>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-400">Partner and sponsored recommendations will appear here in a later release and will be clearly labelled.</p>
          </section>
        )}

        {tab === "itinerary" && (
          <section className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-bold text-slate-900">Your trip itinerary</h2><p className="mt-1 text-sm text-slate-500">{itinerary ? `A suggested plan for ${itinerary.destination}` : "Generate a plan based on your stay and interests."}</p></div>
              <Button disabled={!destination.trim() || generating} onClick={generateItinerary}>{generating ? "Generating…" : itinerary ? "Regenerate plan" : "Generate itinerary"}</Button>
            </div>
            {generationError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{generationError}</p>}
            {!itinerary ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Choose your destination and interests, then generate your day-by-day plan.</div> :
              <div className="mt-5 space-y-5">{itinerary.days.map((day, index) => <article key={day.date || index} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline gap-2"><span className="text-xs font-bold uppercase tracking-wide text-blue-700">Day {index + 1}</span><h3 className="text-lg font-bold text-slate-900">{day.title}</h3><span className="text-xs text-slate-500">{formatDate(day.date)}</span></div>
                <div className="mt-4 space-y-3">{day.activities.map((activity, activityIndex) => <div key={activityIndex} className="flex gap-3 rounded-xl bg-slate-50 p-3"><span className="mt-0.5 min-w-16 text-xs font-semibold text-blue-700">{activity.time || "Anytime"}</span><div><p className="text-sm font-semibold text-slate-900">{activity.name}</p><p className="mt-1 text-sm leading-5 text-slate-600">{activity.description}</p></div></div>)}</div>
              </article>)}</div>}
          </section>
        )}

        {tab === "assistant" && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700">✦</div>
                <div>
                  <h2 className="font-bold text-slate-900">Your AI travel assistant</h2>
                  <p className="text-xs text-slate-500">Itinerary generation is now available</p>
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
                Tell the assistant what you enjoy by selecting interests in Discover. Your itinerary is generated on request; plans are not yet saved between sessions.
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
