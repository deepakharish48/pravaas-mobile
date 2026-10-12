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
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaStatus, setMediaStatus] = useState("");
  const [interests, setInterests] = useState("sightseeing, local food, hidden gems");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api("/bookings").then((data: Booking[]) => { setBookings(data); setBookingId((current) => current || data[0]?.id || ""); }).catch(() => setBookings([])); }, []);
  const validInstagram = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\//i.test(url.trim());
  function appendSource(label: string, text: string) {
    setSourceText((current) => [current.trim(), `[${label}]\n${text.trim()}`].filter(Boolean).join("\n\n"));
  }
  async function analyzeVideo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("video/")) { setMediaStatus("Choose a video file."); return; }
    if (file.size > 100 * 1024 * 1024) { setMediaStatus("Video must be 100 MB or smaller."); return; }
    setMediaBusy(true); setMediaStatus("Sampling a few frames from your video…");
    const objectUrl = URL.createObjectURL(file);
    try {
      const video = document.createElement("video");
      video.preload = "metadata"; video.muted = true; video.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not read this video file."));
      });
      if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error("This video has no readable duration.");
      const duration = video.duration;
      const times = Array.from(new Set([0.08, 0.25, 0.42, 0.58, 0.75, 0.92].map((fraction) => Math.min(Math.max(0, duration * fraction), Math.max(0, duration - 0.08)))));
      const frames: string[] = [];
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 512 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser cannot process video frames.");
      for (const time of times) {
        video.currentTime = time;
        await new Promise<void>((resolve, reject) => {
          video.onseeked = () => resolve();
          video.onerror = () => reject(new Error("Could not sample a frame from this video."));
        });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.62));
      }
      setMediaStatus("Analyzing sampled frames with AI…");
      const result = await api("/bookings/reel/analyze-frames", { method: "POST", body: JSON.stringify({ frames }) });
      if (!result?.analysis) throw new Error("No visual analysis was returned.");
      appendSource("AI analysis of sampled video frames (verify suggested locations)", result.analysis);
      setMediaStatus("Visual analysis added to your inspiration notes. Place names may need verification.");
    } catch (err: any) {
      setMediaStatus(err?.message ?? "Could not analyze this video.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setMediaBusy(false);
    }
  }
  async function transcribeAudio(file?: File) {
    if (!file) return;
    const allowed = ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/m4a", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg", "audio/flac"];
    if (!allowed.includes(file.type) && !/\\.(mp3|m4a|wav|webm|ogg|flac)$/i.test(file.name)) {
      setMediaStatus("Choose an MP3, M4A, WAV, WebM, OGG or FLAC audio file."); return;
    }
    if (file.size > 25 * 1024 * 1024) { setMediaStatus("Audio must be 25 MB or smaller."); return; }
    setMediaBusy(true); setMediaStatus("Transcribing audio with OpenAI…");
    try {
      const form = new FormData(); form.append("file", file);
      const result = await api("/bookings/reel/transcribe-audio", { method: "POST", body: form });
      if (!result?.transcript) throw new Error("No transcript was returned.");
      appendSource("AI transcript of user-provided audio", result.transcript);
      setMediaStatus("Transcript added to your inspiration notes.");
    } catch (err: any) {
      setMediaStatus(err?.message ?? "Could not transcribe this audio.");
    } finally { setMediaBusy(false); }
  }
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
    <section className="mt-5 rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Reel to itinerary</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Save the inspiration. Build the trip.</h1><p className="mt-3 text-sm leading-6 text-slate-300">Paste a Reel link, analyze sampled video frames, add an audio transcript or notes, and turn travel inspiration into an editable itinerary.</p></section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="space-y-5">
      <div><label htmlFor="reel-url" className="block text-sm font-semibold text-slate-900">Instagram Reel or post URL</label><input id="reel-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.instagram.com/reel/..." className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400" /><p className="mt-1.5 text-xs leading-5 text-slate-500">We keep the source link for reference. A link alone does not give us access to analyze the video.</p></div>
      <div><label htmlFor="reel-destination" className="block text-sm font-semibold text-slate-900">Main destination</label><input id="reel-destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Jaipur, Rajasthan" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400" /></div>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
        <h2 className="text-sm font-bold text-slate-900">Analyze a video (optional)</h2>
        <p className="mt-1 text-xs leading-5 text-slate-600">Upload a video you are allowed to process. Pravaas samples up to six frames in your browser and asks AI to identify visible travel clues. The video itself is not uploaded for visual analysis.</p>
        <input aria-label="Upload Reel video for frame analysis" type="file" accept="video/*" disabled={mediaBusy} onChange={(e) => { void analyzeVideo(e.target.files?.[0]); e.currentTarget.value = ""; }} className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold" />
        <div className="mt-4 border-t border-indigo-100 pt-4">
          <label htmlFor="reel-audio-file" className="block text-sm font-semibold text-slate-900">Audio file (optional)</label>
          <p className="mt-1 text-xs leading-5 text-slate-600">Upload an audio track separately to transcribe speech. Pravaas does not extract audio from video files yet.</p>
          <input id="reel-audio-file" type="file" accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg,.flac" disabled={mediaBusy} onChange={(e) => { void transcribeAudio(e.target.files?.[0]); e.currentTarget.value = ""; }} className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold" />
        </div>
        {mediaBusy && <p role="status" className="mt-3 text-sm font-medium text-indigo-800">{mediaStatus}</p>}
        {!mediaBusy && mediaStatus && <p role="status" className="mt-3 text-sm text-slate-700">{mediaStatus}</p>}
      </div>
      <div><label htmlFor="reel-source-text" className="block text-sm font-semibold text-slate-900">Caption, transcript, visual analysis, or your notes</label><textarea id="reel-source-text" rows={6} value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste the caption/transcript or list places, cafés, activities and tips mentioned in the Reel…" className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400" /><p className="mt-1.5 text-xs text-slate-500">Only include content you have permission to share and process.</p></div>
      <div><label htmlFor="reel-interests" className="block text-sm font-semibold text-slate-900">Interests (comma-separated)</label><input id="reel-interests" value={interests} onChange={(e) => setInterests(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900" /></div>
      <div><label htmlFor="reel-booking" className="block text-sm font-semibold text-slate-900">Save itinerary to a trip</label><select id="reel-booking" value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900"><option value="">Choose a booking</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.destination || booking.hotelName || "Trip"} · {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "dates unavailable"}</option>)}</select>{!bookings.length && <p className="mt-2 text-sm text-amber-700">No bookings found. Add a booking first to generate a date-aware itinerary.</p>}</div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{typeof error === "string" ? error : "Please check your trip details and try again."}</p>}
      <button type="button" disabled={busy} onClick={generate} className="w-full rounded-xl bg-indigo-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Building your itinerary…" : "Generate itinerary from this inspiration →"}</button>
    </div></section>
    <p className="mt-4 text-xs leading-5 text-slate-500">Pravaas does not download arbitrary Instagram links. Visual analysis uses up to six frames sampled locally from your uploaded video; speech transcription requires a separate audio file. Verify suggested locations, opening hours and travel times.</p>
  </Container></main>;
}
export default function ReelToItineraryPage() { return <Suspense fallback={<main className="min-h-screen p-8 text-slate-600">Loading Reel planner…</main>}><ReelForm /></Suspense>; }
