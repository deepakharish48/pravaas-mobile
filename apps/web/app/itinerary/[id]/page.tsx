"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import BottomNav from "@/components/BottomNav";
import PravaasMap from "@/components/maps/PravaasMap";

type Activity = { time: string; name: string; description: string };
type Itinerary = { destination: string; days: Array<{ date: string; title: string; activities: Activity[] }> };
type Booking = { id: string; hotelName?: string | null; guestName?: string | null; checkIn?: string | null; checkOut?: string | null; numberOfGuests?: number | null; status?: string | null; destination?: string | null; itinerary?: Itinerary | null };
type Tab = "discover" | "itinerary" | "assistant";
type ChatMessage = { role: "user" | "assistant"; content: string };
type Place = { id: string; name: string; address: string; rating: number | null; category: string; url: string | null; location?: { lat: number; lng: number } | null };

const categories = [
  { name: "Sightseeing", icon: "🏛️", description: "Landmarks and local highlights" },
  { name: "Food & cafés", icon: "🍽️", description: "Local favourites and cafés" },
  { name: "Experiences", icon: "🎟️", description: "Things to do and places to explore" },
  { name: "Shopping", icon: "🛍️", description: "Markets, crafts and local finds" },
  { name: "Family", icon: "👨‍👩‍👧", description: "Ideas for every age" },
  { name: "Nightlife", icon: "🌙", description: "Evening plans and live events" },
];
const greeting = "Hi, I’m Shika! I’m your travel companion. Ask me anything about your trip, or tell me what you’d love to do. How can I help?";

function formatDate(value?: string | null) {
  if (!value) return "Date not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ItineraryAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("discover");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [destination, setDestination] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([{ role: "assistant", content: greeting }]);
  const [message, setMessage] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [placeQuery, setPlaceQuery] = useState("popular attractions");
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesBusy, setPlacesBusy] = useState(false);
  const [placesError, setPlacesError] = useState("");
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    api(`/bookings/${id}`).then((data) => {
      if (active) { setBooking(data); setDestination(data.destination ?? ""); setItinerary(data.itinerary ?? null); }
    }).catch((err) => { if (active) setError(err?.message ?? "We couldn't load this booking."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; recognitionRef.current?.stop?.(); };
  }, [id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, chatBusy]);

  const tripDates = useMemo(() => booking?.checkIn && booking?.checkOut ? `${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}` : "Your stay", [booking]);

  async function generateItinerary() {
    setGenerating(true); setGenerationError("");
    try {
      const result = await api(`/bookings/${id}/itinerary`, { method: "POST", body: JSON.stringify({ destination: destination.trim(), interests: selectedCategories }) });
      setItinerary(result); setDestination(result.destination); setTab("itinerary"); setSaveMessage("Your new itinerary is saved.");
    } catch (err: any) { setGenerationError(err?.message ?? "We couldn’t generate your itinerary. Please try again."); }
    finally { setGenerating(false); }
  }

  async function saveItinerary() {
    if (!itinerary) return;
    setSaving(true); setSaveMessage("");
    try {
      const saved = await api(`/bookings/${id}/itinerary/save`, { method: "POST", body: JSON.stringify({ itinerary }) });
      setItinerary(saved); setDestination(saved.destination); setSaveMessage("Your changes are saved.");
    } catch (err: any) { setSaveMessage(err?.message ?? "Could not save your changes."); }
    finally { setSaving(false); }
  }

  function updateActivity(dayIndex: number, activityIndex: number, field: keyof Activity, value: string) {
    setItinerary((current) => current ? ({ ...current, days: current.days.map((day, di) => di !== dayIndex ? day : ({ ...day, activities: day.activities.map((activity, ai) => ai !== activityIndex ? activity : ({ ...activity, [field]: value })) })) }) : current);
  }

  const categorySearchTerms: Record<string, string> = {
    "Sightseeing": "tourist attractions landmarks",
    "Food & cafés": "restaurants cafes local food",
    "Experiences": "things to do local experiences",
    "Shopping": "shopping markets malls",
    "Family": "family friendly attractions",
    "Nightlife": "nightlife evening entertainment",
  };

  function toggleCategory(name: string) {
    setSelectedCategories((current) => {
      const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
      if (!destination.trim()) return next;
      if (!next.length) {
        setPlaces([]);
        setPlacesError("");
        return next;
      }
      const query = next.map((item) => categorySearchTerms[item] ?? item).join(" and ");
      setPlaceQuery(query);
      void searchPlaces(query);
      return next;
    });
  }

  async function sendMessage(text = message) {
    const clean = text.trim();
    if (!clean || chatBusy) return;
    const next = [...chat, { role: "user" as const, content: clean }];
    setChat(next); setMessage(""); setChatBusy(true); setChatError("");
    try {
      const result = await api(`/bookings/${id}/assistant`, { method: "POST", body: JSON.stringify({ message: clean, history: next.slice(0, -1).slice(-10) }) });
      setChat((current) => [...current, { role: "assistant", content: result.reply }]);
      speak(result.reply);
    } catch (err: any) { setChatError(err?.message ?? "Shika is having trouble responding. Please try again."); }
    finally { setChatBusy(false); }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN"; utterance.rate = 0.96; utterance.pitch = 1.08;
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find((voice) => /female|woman|samantha|karen|moira|tessa|zira|google.*english.*(uk|us).*female/i.test(voice.name));
    const english = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
    if (female || english) utterance.voice = female || english || null;
    window.speechSynthesis.speak(utterance);
  }

  function toggleListening() {
    setVoiceError("");
    if (listening) { recognitionRef.current?.stop?.(); setListening(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError("Voice input isn’t supported in this browser. You can still type to Shika."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; recognition.interimResults = true; recognition.continuous = false;
    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript; else interim += transcript;
      }
      setMessage((finalTranscript + interim).trim());
    };
    recognition.onerror = (event: any) => { setVoiceError(event.error === "not-allowed" ? "Please allow microphone access to speak with Shika." : "I couldn’t hear that clearly. Please try again."); setListening(false); };
    recognition.onend = () => { setListening(false); if (finalTranscript.trim()) void sendMessage(finalTranscript.trim()); };
    recognitionRef.current = recognition; recognition.start(); setListening(true);
  }

  async function searchPlaces(queryOverride?: string) {
    const query = (queryOverride ?? placeQuery).trim() || "popular attractions";
    setPlacesBusy(true); setPlacesError("");
    try {
      const result = await api(`/bookings/${id}/recommendations`, { method: "POST", body: JSON.stringify({ query, destination: destination.trim() }) });
      setPlaces(result);
    } catch (err: any) { setPlacesError(err?.message ?? "Could not load live recommendations."); setPlaces([]); }
    finally { setPlacesBusy(false); }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading your trip…</main>;
  if (error || !booking) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><Card><p className="font-semibold text-slate-900">Booking unavailable</p><p className="mt-2 text-sm text-slate-600">{error || "We couldn't find this booking."}</p><Link href="/travel-history" className="mt-5 inline-block text-sm font-semibold text-blue-700">Back to My Travels</Link></Card></main>;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "discover", label: "Discover", icon: "✦" }, { id: "itinerary", label: "My itinerary", icon: "▤" }, { id: "assistant", label: "AI assistant", icon: "✧" },
  ];

  return <main className="min-h-screen bg-[#f7f8fa] pb-28">
    <div className="border-b border-slate-200 bg-white"><Container className="max-w-5xl py-4"><div className="flex items-center justify-between gap-3"><Link href={`/qr/${booking.id}`} className="text-sm font-medium text-slate-500 hover:text-slate-900">← Check-in QR</Link><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Your trip companion</span></div></Container></div>
    <Container className="max-w-5xl py-8 sm:py-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-9"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Plan your stay</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Make every day count.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Explore nearby ideas and shape a trip that fits your pace. Your booking details are already here.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-slate-300">Hotel</p><p className="mt-1 truncate font-semibold">{booking.hotelName || "Hotel details pending"}</p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-slate-300">Stay</p><p className="mt-1 font-semibold">{tripDates}</p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-slate-300">Guests</p><p className="mt-1 font-semibold">{booking.numberOfGuests ? `${booking.numberOfGuests} guests` : "Not specified"}</p></div></div></section>
      <nav aria-label="Trip planning sections" className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">{tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-current={tab === item.id ? "page" : undefined} className={`flex min-w-max flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><label htmlFor="trip-destination" className="block text-sm font-semibold text-slate-900">Where are you travelling?</label><p className="mt-1 text-xs text-slate-500">Enter the city or destination for your stay. You can change it before generating.</p><input id="trip-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g., Hyderabad" maxLength={120} className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></section>
      {tab === "discover" && <section className="mt-7"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold text-slate-900">What are you in the mood for?</h2><p className="mt-1 text-sm text-slate-500">Choose a few interests to shape your recommendations.</p></div><span className="text-xs text-slate-400">Personalisation preview</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => { const selected = selectedCategories.includes(category.name); return <button key={category.name} type="button" onClick={() => toggleCategory(category.name)} aria-pressed={selected} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}><span className="text-2xl" aria-hidden="true">{category.icon}</span><span className="mt-3 block font-semibold text-slate-900">{category.name}</span><span className="mt-1 block text-sm text-slate-500">{category.description}</span><span className={`mt-3 inline-block text-xs font-semibold ${selected ? "text-blue-700" : "text-slate-400"}`}>{selected ? "Selected ✓" : "Tap to select"}</span></button>; })}</div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-semibold text-slate-900">Places for your mood</h3><p className="mt-1 text-sm text-slate-500">{selectedCategories.length ? "Your selected interests are now driving the live place search." : "Select an interest above to discover real places near your destination."}</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={placeQuery} onChange={(e) => setPlaceQuery(e.target.value)} placeholder="Or search for something specific…" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm" /><Button disabled={!destination.trim() || placesBusy} onClick={() => void searchPlaces()}>{placesBusy ? "Searching…" : "Search places"}</Button></div>{placesError && <p role="alert" className="mt-3 text-sm text-amber-700">{placesError}</p>}{places.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{places.map((place) => <article key={place.id} className="rounded-xl border border-slate-200 p-4"><p className="font-semibold text-slate-900">{place.name}</p><p className="mt-1 text-xs text-slate-500">{[place.category, place.rating ? `★ ${place.rating}` : null].filter(Boolean).join(" · ")}</p><p className="mt-1 text-xs text-slate-500">{place.address}</p>{place.url && <a href={place.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700">View on Google Maps ↗</a>}</article>)}</div>}</div>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">Ready to plan?</p><p className="mt-1 text-sm text-slate-500">{selectedCategories.length ? `${selectedCategories.length} interests selected` : "You can start with any interests—or explore later."}</p></div><Button disabled={!destination.trim() || generating} onClick={generateItinerary}>{generating ? "Creating your plan…" : "Generate my itinerary"}</Button></div>{generationError && <p role="alert" className="mt-3 text-sm text-red-700">{generationError}</p>}</div><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="font-semibold text-slate-900">Explore your destination</h3><p className="mt-1 text-sm text-slate-500">See your destination on the map. Routes and nearby places will build on this next.</p></div><PravaasMap destination={destination} places={places} /></div>
<p className="mt-5 text-xs leading-5 text-slate-400">Live place results are provided by Google. Check details with the venue before visiting.</p></section>}
      {tab === "itinerary" && <section className="mt-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Your trip itinerary</h2><p className="mt-1 text-sm text-slate-500">{itinerary ? `A suggested plan for ${itinerary.destination}` : "Generate a plan based on your stay and interests."}</p></div><div className="flex gap-2"><Button disabled={!itinerary || saving} onClick={saveItinerary}>{saving ? "Saving…" : "Save changes"}</Button><Button disabled={!destination.trim() || generating} onClick={generateItinerary}>{generating ? "Generating…" : itinerary ? "Regenerate plan" : "Generate itinerary"}</Button></div></div>{saveMessage && <p role="status" className="mt-3 text-sm text-emerald-700">{saveMessage}</p>}{generationError && <p role="alert" className="mt-3 text-sm text-red-700">{generationError}</p>}{!itinerary ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Choose your destination and interests, then generate your day-by-day plan.</div> : <div className="mt-5 space-y-5">{itinerary.days.map((day, di) => <article key={day.date || di} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-baseline gap-2"><span className="text-xs font-bold uppercase tracking-wide text-blue-700">Day {di + 1}</span><input aria-label={`Day ${di + 1} title`} value={day.title} onChange={(e) => setItinerary((current) => current ? ({ ...current, days: current.days.map((d, i) => i === di ? { ...d, title: e.target.value } : d) }) : current)} className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 text-lg font-bold text-slate-900 focus:border-slate-300" /><span className="text-xs text-slate-500">{formatDate(day.date)}</span></div><div className="mt-4 space-y-3">{day.activities.map((activity, ai) => <div key={ai} className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[100px_1fr]"><input aria-label="Activity time" value={activity.time} onChange={(e) => updateActivity(di, ai, "time", e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-blue-700" /><div className="space-y-2"><input aria-label="Activity name" value={activity.name} onChange={(e) => updateActivity(di, ai, "name", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" /><textarea aria-label="Activity description" value={activity.description} onChange={(e) => updateActivity(di, ai, "description", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600" /><button type="button" onClick={() => setItinerary((current) => current ? ({ ...current, days: current.days.map((d, i) => i === di ? { ...d, activities: d.activities.filter((_, j) => j !== ai) } : d) }) : current)} className="text-xs font-medium text-red-600">Remove activity</button></div></div>)}</div><button type="button" onClick={() => setItinerary((current) => current ? ({ ...current, days: current.days.map((d, i) => i === di ? { ...d, activities: [...d.activities, { time: "Anytime", name: "", description: "" }] } : d) }) : current)} className="mt-3 text-xs font-semibold text-blue-700">+ Add activity</button></article>)}</div>}</section>}
      {tab === "assistant" && <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-700">✦</div><div><h2 className="font-bold text-slate-900">Shika</h2><p className="text-xs text-slate-500">Your friendly AI travel companion · Voice enabled</p></div></div></div><div className="max-h-[55vh] min-h-64 space-y-3 overflow-y-auto bg-slate-50 p-5 sm:p-6" aria-live="polite">{chat.map((item, index) => <div key={index} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-6 shadow-sm ${item.role === "user" ? "rounded-br-sm bg-blue-700 text-white" : "rounded-tl-sm bg-white text-slate-700"}`}>{item.content}</div></div>)}{chatBusy && <p className="text-xs text-slate-500">Shika is typing…</p>}<div ref={chatEndRef} /></div><div className="border-t border-slate-100 p-4"><div className="flex gap-2"><input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }} aria-label="Message Shika" placeholder={listening ? "Listening… speak now" : "Ask Shika about your trip…"} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900" /><button type="button" onClick={toggleListening} aria-pressed={listening} aria-label={listening ? "Stop voice input" : "Speak to Shika"} className={`rounded-xl border px-4 text-lg ${listening ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-700"}`}>{listening ? "■" : "🎙️"}</button><button type="button" disabled={!message.trim() || chatBusy} onClick={() => void sendMessage()} className="rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500">Send</button></div>{voiceError && <p role="alert" className="mt-2 text-xs text-amber-700">{voiceError}</p>}{chatError && <p role="alert" className="mt-2 text-xs text-red-700">{chatError}</p>}<p className="mt-2 text-xs text-slate-400">Tap the microphone and allow access to speak. Your recognized words appear in the chat before Shika replies. Audio uses an available browser voice.</p></div></section>}
    </Container>
      <BottomNav />
  </main>;
}
