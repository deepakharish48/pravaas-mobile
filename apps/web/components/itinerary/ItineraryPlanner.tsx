"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import PravaasMap, { type MapRoute } from "@/components/maps/PravaasMap";

type Activity = { time: string; name: string; description: string };
type Itinerary = { destination: string; days: Array<{ date: string; title: string; activities: Activity[] }> };

type Props = {
  id: string;
  destination: string;
  itinerary: Itinerary | null;
  saving: boolean;
  generating: boolean;
  saveMessage: string;
  generationError: string;
  onItineraryChange: (value: Itinerary | null) => void;
  onSave: () => void;
  onRegenerate: () => void;
};

function formatDate(value?: string | null) {
  if (!value) return "Date not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
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

export default function ItineraryPlanner(props: Props) {
  const { id, destination, itinerary, saving, generating, saveMessage, generationError, onItineraryChange, onSave, onRegenerate } = props;
  const [activeDay, setActiveDay] = useState(0);
  const [route, setRoute] = useState<MapRoute | null>(null);
  const [routeBusy, setRouteBusy] = useState(false);
  const [routeError, setRouteError] = useState("");

  if (!itinerary) {
    return <section className="mt-7"><div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-900">Your itinerary is ready to build</p><p className="mt-2 text-sm text-slate-500">Choose your destination and interests in Discover, then generate a day-by-day plan.</p><Button className="mt-5" disabled={!destination.trim() || generating} onClick={onRegenerate}>{generating ? "Creating your plan…" : "Generate itinerary"}</Button></div></section>;
  }

  const selectedDayIndex = itinerary.days[activeDay] ? activeDay : 0;
  const selectedDay = itinerary.days[selectedDayIndex];
  const currentItinerary: Itinerary = itinerary;

  async function buildRoute(dayIndex: number) {
    setActiveDay(dayIndex);
    setRouteBusy(true);
    setRouteError("");
    try {
      const result = await api("/bookings/" + id + "/itinerary/route", { method: "POST", body: JSON.stringify({ dayIndex }) });
      setRoute(result);
    } catch (error: any) {
      setRoute(null);
      setRouteError(error?.message || "Could not build this route.");
    } finally {
      setRouteBusy(false);
    }
  }

  function updateActivity(dayIndex: number, activityIndex: number, field: keyof Activity, value: string) {
    onItineraryChange({
      ...currentItinerary,
      days: currentItinerary.days.map((day, di) => di !== dayIndex ? day : { ...day, activities: day.activities.map((activity, ai) => ai !== activityIndex ? activity : { ...activity, [field]: value }) }),
    });
  }

  function updateDayTitle(dayIndex: number, value: string) {
    onItineraryChange({ ...currentItinerary, days: currentItinerary.days.map((day, index) => index === dayIndex ? { ...day, title: value } : day) });
  }

  function removeActivity(dayIndex: number, activityIndex: number) {
    onItineraryChange({ ...currentItinerary, days: currentItinerary.days.map((day, di) => di !== dayIndex ? day : { ...day, activities: day.activities.filter((_, ai) => ai !== activityIndex) }) });
  }

  function addActivity(dayIndex: number) {
    onItineraryChange({ ...currentItinerary, days: currentItinerary.days.map((day, di) => di !== dayIndex ? day : { ...day, activities: [...day.activities, { time: "Anytime", name: "", description: "" }] }) });
  }

  return (
    <section className="mt-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">My itinerary</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{itinerary.destination}</h2><p className="mt-1 text-sm text-slate-500">Pick a day to see its route and edit the plan.</p></div>
        <div className="flex gap-2"><Button disabled={saving} onClick={onSave}>{saving ? "Saving…" : "Save changes"}</Button><Button disabled={!destination.trim() || generating} onClick={onRegenerate}>{generating ? "Generating…" : "Regenerate"}</Button></div>
      </div>
      {saveMessage && <p role="status" className="mb-3 text-sm text-emerald-700">{saveMessage}</p>}
      {generationError && <p role="alert" className="mb-3 text-sm text-red-700">{generationError}</p>}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {itinerary.days.map((day, index) => <button key={day.date || index} type="button" onClick={() => { setActiveDay(index); setRoute(null); setRouteError(""); }} className={"min-w-[145px] rounded-2xl border px-4 py-3 text-left transition " + (selectedDayIndex === index ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300")}><span className="block text-xs font-bold uppercase tracking-wide opacity-70">Day {index + 1}</span><span className="mt-1 block truncate font-semibold">{day.title || "Explore"}</span><span className="mt-1 block text-xs opacity-70">{formatDate(day.date)}</span></button>)}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Day {selectedDayIndex + 1} route</p><p className="font-semibold text-slate-900">{selectedDay?.title || "Explore the city"}</p></div>{route && <div className="text-right text-xs font-semibold text-slate-600">{formatDistance(route.distanceMeters)} · {formatDuration(route.durationSeconds)}</div>}</div>
            <PravaasMap destination={destination} route={route} className="rounded-none border-0" />
            <div className="border-t border-slate-100 p-4"><Button disabled={routeBusy || !selectedDay?.activities.length} onClick={() => void buildRoute(selectedDayIndex)}>{routeBusy ? "Building route…" : route ? "Refresh day route" : "Show day route"}</Button>{routeError && <p role="alert" className="mt-3 text-sm text-amber-700">{routeError}</p>}{route && <p className="mt-3 text-xs leading-5 text-slate-500">Driving route includes the resolved stops below. Review the route before travelling.</p>}</div>
          </div>
        </div>

        <div className="space-y-3">
          {itinerary.days.map((day, dayIndex) => <article key={day.date || dayIndex} className={"rounded-2xl border bg-white p-4 shadow-sm " + (selectedDayIndex === dayIndex ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200")}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{dayIndex + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><input aria-label={"Day " + (dayIndex + 1) + " title"} value={day.title} onChange={(event) => updateDayTitle(dayIndex, event.target.value)} className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 text-lg font-bold text-slate-900 focus:border-slate-300" /><span className="text-xs text-slate-500">{formatDate(day.date)}</span></div>
                <div className="mt-3 space-y-2">{day.activities.map((activity, activityIndex) => <div key={activityIndex} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex gap-3"><span className="mt-1 min-w-[60px] text-xs font-bold text-blue-700">{activity.time || "Anytime"}</span><div className="min-w-0 flex-1"><input aria-label="Activity name" value={activity.name} onChange={(event) => updateActivity(dayIndex, activityIndex, "name", event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-slate-900 focus:border-slate-300 focus:bg-white" /><textarea aria-label="Activity description" value={activity.description} onChange={(event) => updateActivity(dayIndex, activityIndex, "description", event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs leading-5 text-slate-600 focus:border-slate-300 focus:bg-white" /><button type="button" onClick={() => removeActivity(dayIndex, activityIndex)} className="mt-1 text-xs font-medium text-red-600">Remove</button></div></div></div>)}</div>
                <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => { setActiveDay(dayIndex); setRoute(null); setRouteError(""); }} className="text-xs font-semibold text-blue-700">View on map</button><button type="button" onClick={() => addActivity(dayIndex)} className="text-xs font-semibold text-slate-600">+ Add activity</button><button type="button" onClick={() => void buildRoute(dayIndex)} disabled={routeBusy} className="text-xs font-semibold text-slate-600">{routeBusy && selectedDayIndex === dayIndex ? "Building…" : "Show route"}</button></div>
              </div>
            </div>
          </article>)}
        </div>
      </div>
    </section>
  );
}
