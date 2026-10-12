"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GuestNavigation from "@/components/GuestNavigation";
import Container from "@/components/UI/Container";
import { api } from "@/lib/api";

type Booking = { id: string; destination?: string | null; hotelName?: string | null; checkIn?: string | null; checkOut?: string | null };
const categories = ["All trips", "Weekend escapes", "Food & cafés", "Nature", "Culture", "Adventure"];
const collections = [
  { id: "goa", title: "Goa beyond the beaches", destination: "Goa, India", days: "3 days", category: "Weekend escapes", description: "Mix coastal walks, heritage lanes, local food and unhurried beach time.", emoji: "🌴", gradient: "from-orange-100 to-rose-200", tips: ["Group stops by area to avoid crossing the region repeatedly", "Keep a flexible sunset stop"] },
  { id: "munnar", title: "A slow weekend in Munnar", destination: "Munnar, Kerala", days: "2 days", category: "Nature", description: "Tea gardens, misty viewpoints and a relaxed hill-station escape.", emoji: "🌿", gradient: "from-emerald-100 to-lime-200", tips: ["Start viewpoint visits early", "Allow extra time for winding roads"] },
  { id: "hyderabad", title: "Hyderabad food & heritage trail", destination: "Hyderabad, Telangana", days: "1 day", category: "Food & cafés", description: "A flavour-first route through iconic food stops and historic landmarks.", emoji: "🍲", gradient: "from-amber-100 to-orange-200", tips: ["Check local opening hours before setting out", "Leave room for traffic between old-city stops"] },
  { id: "jaipur", title: "Jaipur's colour and culture", destination: "Jaipur, Rajasthan", days: "3 days", category: "Culture", description: "Historic architecture, craft markets and Rajasthani flavours.", emoji: "🕌", gradient: "from-pink-100 to-fuchsia-200", tips: ["Visit outdoor forts earlier in the day", "Confirm monument hours before travel"] },
];
export default function ExplorePage() {
  const [category, setCategory] = useState("All trips");
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => { api("/bookings").then(setBookings).catch(() => setBookings([])); }, []);
  const filtered = useMemo(() => collections.filter((item) => (category === "All trips" || item.category === category) && (item.title + " " + item.destination + " " + item.description).toLowerCase().includes(query.toLowerCase().trim())), [category, query]);
  const latest = bookings[0];
  return <main className="traveller-workspace min-h-screen bg-[#f6f8fc] pb-24 md:pb-8"><GuestNavigation /><Container className="max-w-6xl py-7 sm:py-10">
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-xl sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Pravaas Explore</p>
      <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Find your next journey.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Discover trip ideas, get inspired by fellow travellers, and turn a travel Reel into a plan you can actually use.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/reel-to-itinerary" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-indigo-50">↗ Create itinerary from a Reel</Link>{latest && <Link href={`/itinerary/${latest.id}`} className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">Plan around my stay</Link>}</div>
    </section>
    <section className="mt-8">
      <label htmlFor="explore-search" className="sr-only">Search destinations and itineraries</label>
      <input id="explore-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search destinations, experiences or trip ideas" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400" />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === item ? "bg-indigo-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>{item}</button>)}</div>
    </section>
    <section className="mt-7"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Handpicked inspiration</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Explore itineraries</h2></div><span className="text-sm text-slate-500">{filtered.length} ideas</span></div>
      {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className={`flex h-36 items-end justify-between bg-gradient-to-br ${item.gradient} p-5`}><span className="text-5xl" aria-hidden="true">{item.emoji}</span><span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-700">{item.days}</span></div><div className="p-5"><p className="text-xs font-semibold text-indigo-700">{item.destination} · {item.category}</p><h3 className="mt-2 text-lg font-bold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p><details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-indigo-700">View travel tips</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{item.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></details><Link href={`/reel-to-itinerary?destination=${encodeURIComponent(item.destination)}`} className="mt-5 inline-flex text-sm font-bold text-indigo-700 hover:text-indigo-900">Build my version →</Link></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold text-slate-900">No matching itineraries yet</p><p className="mt-2 text-sm text-slate-500">Try another search or turn a Reel into a trip plan.</p><Link href="/reel-to-itinerary" className="mt-4 inline-flex rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white">Create from a Reel</Link></div>}
    </section>
    <p className="mt-6 text-xs leading-5 text-slate-500">These starter ideas are editorial examples, not community-voted listings. Creator publishing, persistent voting and saved-curation storage are the next data-backed layer.</p>
  </Container></main>;
}
