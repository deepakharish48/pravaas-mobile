"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Activity = { time: string; title: string; detail: string; kind: string };
type Message = { role: "assistant" | "guest"; text: string };

const days: { label: string; date: string; title: string; activities: Activity[] }[] = [
  {
    label: "Day 1",
    date: "12 Apr",
    title: "Arrival & local favourites",
    activities: [
      { time: "2:00 PM", title: "Check in at Taj Holiday Village", detail: "Your hotel · Allow time to settle in", kind: "stay" },
      { time: "4:30 PM", title: "Relax at Candolim Beach", detail: "Beach walk · 10 min from hotel", kind: "explore" },
      { time: "7:30 PM", title: "Dinner by the sea", detail: "Seafood and Goan favourites · Suggested", kind: "food" },
    ],
  },
  {
    label: "Day 2",
    date: "13 Apr",
    title: "Explore North Goa",
    activities: [
      { time: "9:30 AM", title: "Fort Aguada", detail: "Historic fort and coastal views", kind: "explore" },
      { time: "1:00 PM", title: "Lunch in Anjuna", detail: "Choose a café that suits your mood", kind: "food" },
      { time: "5:00 PM", title: "Anjuna flea market", detail: "Browse local crafts and souvenirs", kind: "explore" },
    ],
  },
  {
    label: "Day 3",
    date: "14 Apr",
    title: "A relaxed final day",
    activities: [
      { time: "10:00 AM", title: "Breakfast & free time", detail: "Keep the morning flexible", kind: "food" },
      { time: "12:30 PM", title: "Check out", detail: "Taj Holiday Village · Confirm with hotel", kind: "stay" },
    ],
  },
];

const suggestions = ["Find family-friendly places", "Suggest local food", "Make the day more relaxed"];

export default function ItineraryPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi Deepak! I’ve drafted a Goa plan around your hotel stay. Tell me what you enjoy, or ask me to change any part of it." },
  ]);
  const [listening, setListening] = useState(false);
  const recognition = useRef<any>(null);

  useEffect(() => () => recognition.current?.stop(), []);

  function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { role: "guest", text: trimmed },
      { role: "assistant", text: "Got it. I can help adjust this plan. In the connected version, I’ll use your hotel dates and destination to generate an updated itinerary and relevant recommendations." },
    ]);
    setInput("");
  }

  function startVoice() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. You can still use chat.");
      return;
    }
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const instance = new SpeechRecognition();
    instance.lang = "en-IN";
    instance.interimResults = false;
    instance.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setInput(transcript);
      setListening(false);
    };
    instance.onerror = () => setListening(false);
    instance.onend = () => setListening(false);
    recognition.current = instance;
    setListening(true);
    instance.start();
  }

  const day = days[activeDay];

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg text-white">✦</span>
            <span className="text-xl">Pravaas</span>
            <span className="ml-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">Trip planner</span>
          </Link>
          <Link href="/travel-history" className="text-sm font-medium text-slate-600 hover:text-blue-700">My travels <span aria-hidden>↗</span></Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:py-10">
        <section className="min-w-0">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#123c73] via-[#1766ad] to-[#55b6d5] p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-100">Your trip, made personal</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Goa, at your pace.</h1>
                <p className="mt-2 max-w-lg text-sm text-blue-50 sm:text-base">A starter itinerary built around your hotel reservation.</p>
              </div>
              <div className="hidden rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-right text-xs sm:block">
                <div className="font-semibold">12–14 Apr</div><div className="mt-1 text-blue-100">2 adults · 1 child</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-2">⌂ Taj Holiday Village</span>
              <span className="rounded-full bg-white/15 px-3 py-2">⌖ North Goa</span>
              <span className="rounded-full bg-white/15 px-3 py-2 sm:hidden">2 adults · 1 child</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div><h2 className="text-xl font-bold">Your itinerary</h2><p className="mt-1 text-sm text-slate-500">A flexible plan. Change anything with chat.</p></div>
            <button onClick={() => sendMessage("Please regenerate my itinerary")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-300">↻ Refresh plan</button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {days.map((item, index) => (
              <button key={item.label} onClick={() => setActiveDay(index)} className={`min-w-[100px] rounded-2xl border px-4 py-3 text-left transition ${activeDay === index ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>
                <span className="block text-xs font-semibold">{item.label}</span><span className={`mt-1 block text-sm ${activeDay === index ? "text-blue-100" : "text-slate-400"}`}>{item.date}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{day.date} · {day.label}</p><h3 className="mt-1 text-lg font-bold">{day.title}</h3></div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Suggested</span>
            </div>
            <div className="space-y-5">
              {day.activities.map((activity, index) => (
                <div key={activity.title} className="relative flex gap-4">
                  <div className="flex w-16 shrink-0 flex-col items-center">
                    <span className="text-[11px] font-semibold text-slate-500">{activity.time}</span>
                    <span className={`mt-2 grid h-9 w-9 place-items-center rounded-full text-sm ${activity.kind === "stay" ? "bg-blue-50 text-blue-700" : activity.kind === "food" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-700"}`}>{activity.kind === "stay" ? "⌂" : activity.kind === "food" ? "♨" : "✦"}</span>
                    {index < day.activities.length - 1 && <span className="absolute left-[31px] top-12 h-[calc(100%-34px)] w-px bg-slate-200" />}
                  </div>
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <h4 className="font-semibold">{activity.title}</h4><p className="mt-1 text-sm leading-5 text-slate-500">{activity.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="mt-6">
            <div className="flex items-end justify-between"><div><h2 className="text-xl font-bold">Ideas for your trip</h2><p className="mt-1 text-sm text-slate-500">Partner offers and local experiences</p></div><span className="text-xs text-slate-400">Sponsored</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex h-24 items-center justify-between bg-gradient-to-r from-orange-500 to-amber-400 px-5 text-white"><span className="text-2xl font-black tracking-wide">swiggy</span><span className="text-3xl">🍽</span></div>
                <div className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Food & delivery · Sponsored</p><h3 className="mt-1 font-bold">Local flavours, delivered</h3><p className="mt-1 text-sm text-slate-500">Discover nearby restaurants and food offers.</p><button className="mt-3 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600">Explore offer ↗</button></div>
              </article>
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex h-24 items-center justify-between bg-gradient-to-r from-rose-700 to-pink-500 px-5 text-white"><span className="text-2xl font-black tracking-tight">book<span className="text-amber-200">my</span>show</span><span className="text-3xl">✦</span></div>
                <div className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Events & experiences · Sponsored</p><h3 className="mt-1 font-bold">Make an evening of it</h3><p className="mt-1 text-sm text-slate-500">Browse shows, events and things to do nearby.</p><button className="mt-3 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800">View experiences ↗</button></div>
              </article>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">Partner cards are illustrative placeholders. Offers and booking links will be connected after partner integration.</p>
          </section>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-lg text-blue-700">✦</span><div><h2 className="font-bold">Pravaas AI</h2><p className="text-xs text-slate-500">Chat or speak to plan</p></div><span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Preview</span></div>
            </div>
            <div className="flex min-h-[230px] flex-col gap-3 p-4">
              {messages.map((message, index) => <div key={index} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-5 ${message.role === "guest" ? "ml-auto rounded-br-md bg-blue-600 text-white" : "mr-auto rounded-bl-md bg-slate-100 text-slate-700"}`}>{message.text}</div>)}
            </div>
            <div className="px-4 pb-3">
              <p className="mb-2 text-[11px] font-semibold text-slate-400">TRY ASKING</p>
              <div className="flex flex-wrap gap-2">{suggestions.map((item) => <button key={item} onClick={() => sendMessage(item)} className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover:border-blue-300 hover:text-blue-700">{item}</button>)}</div>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex items-center gap-2 border-t border-slate-100 p-3">
              <button type="button" onClick={startVoice} aria-label="Voice input" className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${listening ? "bg-rose-100 text-rose-700" : "bg-blue-50 text-blue-700"}`}>{listening ? "■" : "🎙"}</button>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={listening ? "Listening…" : "Ask Pravaas anything"} className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5 text-sm outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2" />
              <button type="submit" disabled={!input.trim()} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white disabled:opacity-40">↑</button>
            </form>
          </div>
          <p className="mt-3 px-1 text-xs leading-5 text-slate-400">This is a UI preview. It uses sample trip data and a local chat response; itinerary generation and reservation linking are the next integration step.</p>
        </aside>
      </div>
    </main>
  );
}
