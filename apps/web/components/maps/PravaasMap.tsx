"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

type MapPlace = {
  id: string;
  name: string;
  location?: { lat: number; lng: number } | null;
};

type PravaasMapProps = {
  destination?: string;
  places?: MapPlace[];
  className?: string;
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

let googleMapsLoader: Promise<any> | null = null;

function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps is only available in the browser."));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (googleMapsLoader) return googleMapsLoader;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error("Google Maps API key is not configured."));

  googleMapsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pravaas-google-maps="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Google Maps could not be loaded.")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.pravaasGoogleMaps = "true";
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google Maps could not be loaded."));
    document.head.appendChild(script);
  });

  return googleMapsLoader;
}

export default function PravaasMap({ destination, places = [], className = "" }: PravaasMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const placeMarkersRef = useRef<any[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [statusMessage, setStatusMessage] = useState("Loading map…");

  useEffect(() => {
    let cancelled = false;

    async function initialise() {
      try {
        const google = await loadGoogleMaps();
        if (cancelled || !mapElementRef.current) return;

        const map = new google.maps.Map(mapElementRef.current, {
          center: DEFAULT_CENTER,
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: true,
        });

        mapRef.current = map;
        setStatus("ready");
        setStatusMessage("");

        if (destination?.trim()) {
          await geocodeDestination(google, map, destination);
        }
      } catch (error: any) {
        if (!cancelled) {
          setStatus("error");
          setStatusMessage(error?.message ?? "Google Maps could not be loaded.");
        }
      }
    }

    void initialise();

    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = null;
      placeMarkersRef.current.forEach((marker) => marker.setMap(null));
      placeMarkersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    let cancelled = false;

    async function updateMap() {
      try {
        const google = await loadGoogleMaps();
        if (cancelled) return;

        if (destination?.trim()) {
          await geocodeDestination(google, mapRef.current, destination);
        } else if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }

        placeMarkersRef.current.forEach((marker) => marker.setMap(null));
        placeMarkersRef.current = [];

        const validPlaces = places.filter((place) => place.location);
        if (!validPlaces.length) return;

        const bounds = new google.maps.LatLngBounds();
        validPlaces.forEach((place) => {
          const position = place.location!;
          const marker = new google.maps.Marker({
            map: mapRef.current,
            position,
            title: place.name,
          });
          placeMarkersRef.current.push(marker);
          bounds.extend(position);
        });

        if (!destination?.trim()) {
          mapRef.current.fitBounds(bounds, 70);
        }
      } catch {
        // Keep the existing map visible if geocoding or marker rendering fails.
      }
    }

    void updateMap();
    return () => { cancelled = true; };
  }, [destination, places, status]);
  async function geocodeDestination(google: any, map: any, query: string) {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address: query });
    const location = result.results?.[0]?.geometry?.location;

    if (!location) throw new Error(`We couldn't find "${query}". Try a city or destination name.`);

    map.panTo(location);
    map.setZoom(12);

    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new google.maps.Marker({
      map,
      position: location,
      title: query,
      animation: google.maps.Animation.DROP,
    });
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${className}`}>
      <div ref={mapElementRef} className="h-[320px] w-full sm:h-[380px]" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 p-6 text-center">
          <div>
            <p className="font-semibold text-slate-900">
              {status === "loading" ? "Loading your map…" : "Map unavailable"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">{statusMessage}</p>
          </div>
        </div>
      )}
      {status === "ready" && destination?.trim() && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
          {destination}
        </div>
      )}
      {status === "ready" && !destination?.trim() && places.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-white/95 px-4 py-3 text-center text-sm font-medium text-slate-600 shadow-sm">
          Enter your destination above to centre the map.
        </div>
      )}
    </div>
  );
}
