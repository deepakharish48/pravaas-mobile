"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import PravaasMap, { type MapRoute } from "@/components/maps/PravaasMap";

type Activity = { time: string; name: string; description: string };
type Itinerary = { destination: string; days: Array<{ date: string; title: string; activities: Activity[] }> };
type Booking = {
  id: string;
  hotelName?: string | null;
  destination?: string | null;
  itinerary?: Itinerary | null;
};
type LocationPoint = { lat: number; lng: number };
type DriveRoute = MapRoute & {
  destination: { name: string; location: LocationPoint; placeId: string | null };
};
type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  category: string;
  url: string | null;
  location: LocationPoint | null;
  distanceMeters: number | null;
};
type NearbyCategory = "food" | "fuel" | "ev" | "roadside";

const nearbyOptions: Array<{ id: NearbyCategory; label: string; icon: string }> = [
  { id: "food", label: "Food", icon: "🍽️" },
  { id: "fuel", label: "Fuel", icon: "⛽" },
  { id: "ev", label: "EV", icon: "⚡" },
  { id: "roadside", label: "Roadside", icon: "🛠️" },
];

function distanceBetweenMeters(a: LocationPoint, b: LocationPoint) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function formatDistance(meters: number) {
  return meters >= 1000 ? (meters / 1000).toFixed(1) + " km" : Math.round(meters) + " m";
}
function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return minutes + " min";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? hours + " hr " + remainder + " min" : hours + " hr";
}
function formatSpeed(kmh: number) {
  return Math.round(kmh) + " km/h";
}

export default function DriveModePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialDay = Math.max(0, Number.parseInt(searchParams.get("day") ?? "0", 10) || 0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeDay, setActiveDay] = useState(initialDay);
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [route, setRoute] = useState<DriveRoute | null>(null);
  const [driveActive, setDriveActive] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [routeBusy, setRouteBusy] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [distanceDriven, setDistanceDriven] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [nearbyCategory, setNearbyCategory] = useState<NearbyCategory>("food");
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [nearbyBusy, setNearbyBusy] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ point: LocationPoint; timestamp: number } | null>(null);
  const speedSamplesRef = useRef<number[]>([]);
  const lastRouteRef = useRef<{ point: LocationPoint; timestamp: number } | null>(null);
  const routeRequestRef = useRef(false);
  const destinationLocationRef = useRef<LocationPoint | null>(null);

  useEffect(() => {
    let active = true;
    api("/bookings/" + id)
      .then((data) => {
        if (!active) return;
        setBooking(data);
        setPageError("");
      })
      .catch((error: any) => {
        if (active) setPageError(error?.message ?? "We couldn't load this trip.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [id]);

  const itinerary = booking?.itinerary ?? null;
  const selectedDay = itinerary?.days?.[activeDay] ?? itinerary?.days?.[0] ?? null;
  const activities = selectedDay?.activities ?? [];
  const selectedActivity = activities[destinationIndex] ?? activities[0] ?? null;
  const destinationName = selectedActivity?.name?.trim() || booking?.hotelName?.trim() || booking?.destination?.trim() || "";

  const dayOptions = useMemo(() => itinerary?.days?.map((day, index) => ({
    index,
    label: day.title || "Explore",
    date: day.date,
  })) ?? [], [itinerary]);

  function speak(text: string) {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.96;
    utterance.pitch = 1.08;
    const voices = window.speechSynthesis.getVoices();
    const english = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
    if (english) utterance.voice = english;
    window.speechSynthesis.speak(utterance);
  }

  async function refreshRoute(point: LocationPoint, force = false) {
    if (!destinationName || routeRequestRef.current) return;
    const previous = lastRouteRef.current;
    const now = Date.now();
    if (!force && previous && now - previous.timestamp < 20000 && distanceBetweenMeters(previous.point, point) < 150) return;

    routeRequestRef.current = true;
    setRouteBusy(true);
    setRouteError("");
    try {
      const result = await api("/bookings/" + id + "/drive/route", {
        method: "POST",
        body: JSON.stringify({
          currentLocation: point,
          destinationName,
          destinationLocation: destinationLocationRef.current,
        }),
      });
      setRoute(result);
      destinationLocationRef.current = result.destination.location;
      lastRouteRef.current = { point, timestamp: now };
    } catch (error: any) {
      setRouteError(error?.message ?? "The driving route could not be updated.");
    } finally {
      routeRequestRef.current = false;
      setRouteBusy(false);
    }
  }

  function handlePosition(position: GeolocationPosition) {
    const point = { lat: position.coords.latitude, lng: position.coords.longitude };
    const timestamp = position.timestamp || Date.now();
    const previous = lastPointRef.current;

    if (previous) {
      const elapsedSeconds = Math.max(0.1, (timestamp - previous.timestamp) / 1000);
      const segmentMeters = distanceBetweenMeters(previous.point, point);
      if (segmentMeters < 1000 && elapsedSeconds < 120) {
        setDistanceDriven((value) => value + segmentMeters);
        const derivedKmh = segmentMeters / elapsedSeconds * 3.6;
        const gpsKmh = Number.isFinite(position.coords.speed) && (position.coords.speed ?? -1) >= 0
          ? (position.coords.speed ?? 0) * 3.6
          : derivedKmh;
        if (gpsKmh <= 180) {
          speedSamplesRef.current = [...speedSamplesRef.current.slice(-59), gpsKmh];
          const samples = speedSamplesRef.current;
          setAverageSpeed(samples.reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length));
          setMaxSpeed((value) => Math.max(value, gpsKmh));
        }
      }
    } else {
      const gpsKmh = Number.isFinite(position.coords.speed) && (position.coords.speed ?? -1) >= 0 ? (position.coords.speed ?? 0) * 3.6 : 0;
      if (gpsKmh > 0 && gpsKmh <= 180) {
        speedSamplesRef.current = [gpsKmh];
        setAverageSpeed(gpsKmh);
        setMaxSpeed(gpsKmh);
      }
    }

    lastPointRef.current = { point, timestamp };
    setCurrentLocation(point);
    void refreshRoute(point);
  }

  function startDrive() {
    if (!destinationName) {
      setLocationError("Add an activity to your itinerary before starting Drive Mode.");
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("This browser does not support location services.");
      return;
    }

    setLocationError("");
    setRouteError("");
    setDriveActive(true);
    setDistanceDriven(0);
    setAverageSpeed(0);
    setMaxSpeed(0);
    speedSamplesRef.current = [];
    lastPointRef.current = null;
    lastRouteRef.current = null;
    destinationLocationRef.current = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (error) => {
        setLocationError(error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow location access to use Drive Mode."
          : "We couldn't get your current location. Please try again.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    speak("Drive Mode started. I'll keep your destination and route visible while you travel.");
  }

  function stopDrive() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setDriveActive(false);
    speak("Drive Mode stopped.");
  }

  useEffect(() => {
    if (!driveActive || !currentLocation) return;
    void refreshRoute(currentLocation, true);
    // Refresh is deliberately throttled inside refreshRoute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationName]);

  async function loadNearby(category = nearbyCategory) {
    if (!currentLocation) {
      setNearbyError("Start Drive Mode first so we can find places near you.");
      return;
    }
    setNearbyCategory(category);
    setNearbyBusy(true);
    setNearbyError("");
    try {
      const result = await api("/bookings/" + id + "/drive/nearby", {
        method: "POST",
        body: JSON.stringify({ ...currentLocation, category }),
      });
      setNearbyPlaces(result);
    } catch (error: any) {
      setNearbyError(error?.message ?? "Nearby places could not be loaded.");
      setNearbyPlaces([]);
    } finally {
      setNearbyBusy(false);
    }
  }

  useEffect(() => {
    if (route?.distanceMeters && route.distanceMeters < 100 && driveActive) {
      speak("You have arrived at " + route.destination.name + ".");
    }
  }, [route?.destination.name, route?.distanceMeters, driveActive]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Loading Drive Mode…</main>;
  if (pageError || !booking) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><Card><p className="font-semibold text-slate-900">Trip unavailable</p><p className="mt-2 text-sm text-slate-600">{pageError || "We couldn't find this trip."}</p><Link href="/travel-history" className="mt-5 inline-block text-sm font-semibold text-blue-700">Back to My Travels</Link></Card></main>;

  return (
    <main className="min-h-screen bg-slate-950 pb-10 text-white">
      <div className="border-b border-white/10 bg-slate-950/95">
        <Container className="max-w-6xl py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href={"/itinerary/" + id} className="text-sm font-semibold text-slate-400 hover:text-white">← Itinerary</Link>
            <div className="flex items-center gap-2">
              <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (driveActive ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-slate-300")}>{driveActive ? "Drive Mode active" : "Drive Mode"}</span>
              <button type="button" onClick={() => setVoiceEnabled((value) => !value)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300">{voiceEnabled ? "Shika voice on" : "Voice off"}</button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="max-w-6xl py-5 sm:py-7">
        <section className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Pravaas Drive Mode</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Drive with your trip beside you.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Live location, route, travel stats and useful places nearby. Location stays in your browser unless you explicitly use a route or nearby search.</p>
        </section>

        <div className="mb-5 grid gap-2 overflow-x-auto sm:flex">
          {dayOptions.map((day) => (
            <button key={day.index} type="button" onClick={() => { setActiveDay(day.index); setDestinationIndex(0); setRoute(null); destinationLocationRef.current = null; }} className={"min-w-[150px] rounded-xl border px-4 py-3 text-left " + (activeDay === day.index ? "border-blue-400 bg-blue-500/15" : "border-white/10 bg-white/5")}>
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Day {day.index + 1}</span>
              <span className="mt-1 block truncate text-sm font-semibold text-white">{day.label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              <PravaasMap destination={booking.destination ?? itinerary?.destination ?? ""} route={route} currentLocation={currentLocation} className="rounded-none border-0" />
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
                <div className="p-4"><p className="text-xs text-slate-500">To go</p><p className="mt-1 text-lg font-bold">{route ? formatDistance(route.distanceMeters) : "—"}</p></div>
                <div className="p-4"><p className="text-xs text-slate-500">ETA</p><p className="mt-1 text-lg font-bold">{route ? formatDuration(route.durationSeconds) : "—"}</p></div>
                <div className="p-4"><p className="text-xs text-slate-500">Current</p><p className="mt-1 text-lg font-bold">{currentLocation ? "Live" : "—"}</p></div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-500">Distance driven</p><p className="mt-1 text-xl font-bold">{formatDistance(distanceDriven)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-500">Average speed</p><p className="mt-1 text-xl font-bold">{formatSpeed(averageSpeed)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-500">Max speed</p><p className="mt-1 text-xl font-bold">{formatSpeed(maxSpeed)}</p></div>
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Next stop</p>
                  <h2 className="mt-1 text-xl font-bold">{destinationName || "Add an itinerary activity"}</h2>
                  <p className="mt-1 text-sm text-slate-400">Choose where you are driving next.</p>
                </div>
                {driveActive ? (
                  <Button onClick={stopDrive} variant="secondary">Stop Drive Mode</Button>
                ) : (
                  <Button onClick={startDrive}>Start Drive Mode</Button>
                )}
              </div>
              {activities.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {activities.map((activity, index) => (
                    <button key={index} type="button" onClick={() => { setDestinationIndex(index); setRoute(null); destinationLocationRef.current = null; }} className={"min-w-[190px] rounded-xl border p-3 text-left " + (destinationIndex === index ? "border-blue-400 bg-blue-500/10" : "border-white/10 bg-slate-950/40")}>
                      <span className="block text-xs font-semibold text-blue-300">{activity.time || "Anytime"}</span>
                      <span className="mt-1 block truncate text-sm font-semibold">{activity.name || "Unnamed activity"}</span>
                    </button>
                  ))}
                </div>
              )}
              {locationError && <p role="alert" className="mt-3 text-sm text-amber-300">{locationError}</p>}
              {routeBusy && <p className="mt-3 text-xs text-blue-300">Updating route with live traffic…</p>}
              {routeError && <p role="alert" className="mt-3 text-sm text-amber-300">{routeError}</p>}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Nearby help</p>
                <h2 className="mt-1 text-lg font-bold">What do you need?</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {nearbyOptions.map((option) => (
                  <button key={option.id} type="button" onClick={() => void loadNearby(option.id)} className={"rounded-xl border p-3 text-left text-sm font-semibold " + (nearbyCategory === option.id ? "border-blue-400 bg-blue-500/10" : "border-white/10 bg-slate-950/40")}>
                    <span className="mr-2">{option.icon}</span>{option.label}
                  </button>
                ))}
              </div>
              {nearbyBusy && <p className="mt-3 text-xs text-blue-300">Finding nearby places…</p>}
              {nearbyError && <p role="alert" className="mt-3 text-sm text-amber-300">{nearbyError}</p>}
              <div className="mt-4 space-y-2">
                {nearbyPlaces.map((place) => (
                  <div key={place.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                    <p className="font-semibold">{place.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{[place.category, place.distanceMeters != null ? formatDistance(place.distanceMeters) : null].filter(Boolean).join(" · ")}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{place.address}</p>
                    {place.url && <a href={place.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-300">Open in Google Maps ↗</a>}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-6 text-amber-100">
              <p className="font-semibold">Drive safely</p>
              <p className="mt-1 text-amber-200/80">Pravaas is a travel companion, not a substitute for attentive driving. Only interact with the screen when safely stopped.</p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-500">
              <p><strong className="text-slate-300">Current version:</strong> Drive Mode uses browser geolocation while this page is active. A future native Navigation SDK implementation can provide true turn-by-turn and stronger background navigation support.</p>
            </section>
          </aside>
        </div>
      </Container>
      <BottomNav />
    </main>
  );
}
