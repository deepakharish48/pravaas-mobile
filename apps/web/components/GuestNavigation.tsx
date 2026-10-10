"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Booking = { id: string };

const items = [
  { key: "home", label: "Home", icon: "⌂", href: "/dashboard" },
  { key: "itinerary", label: "Itinerary", icon: "▤", href: "/travel-history" },
  { key: "wallet", label: "Travel wallet", icon: "▣", href: "/identity" },
  { key: "more", label: "More", icon: "•••", href: "/more" },
];

function activeFor(pathname: string | null, key: string) {
  if (key === "home") return pathname === "/dashboard";
  if (key === "wallet") return pathname?.startsWith("/identity");
  if (key === "itinerary") return pathname?.startsWith("/itinerary") || pathname?.startsWith("/travel-history") || pathname?.startsWith("/booking");
  return pathname === "/more" || pathname?.startsWith("/profile") || pathname?.startsWith("/info") || pathname?.startsWith("/drive");
}

export default function GuestNavigation() {
  const pathname = usePathname();
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    api("/bookings")
      .then((bookings: Booking[]) => {
        if (bookings?.[0]?.id) setBookingId(bookings[0].id);
      })
      .catch(() => {});
  }, []);

  const hrefFor = (key: string, fallback: string) =>
    key === "itinerary" && bookingId ? `/itinerary/${bookingId}` : fallback;

  return (
    <>
      <header className="traveller-navigation sticky top-0 z-50 hidden border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur md:block">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="Pravaas home">
            <Image src="/logo.png" alt="" width={36} height={36} className="rounded-xl" priority />
            <span className="text-lg font-bold tracking-tight text-slate-950">Pravaas</span>
          </Link>

          <nav aria-label="Primary navigation" className="flex min-w-0 flex-1 items-center gap-1">
            {items.map((item) => {
              const active = activeFor(pathname, item.key);
              return (
                <Link
                  key={item.key}
                  href={hrefFor(item.key, item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/upload-booking"
            className="hidden rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 lg:inline-flex"
          >
            + Add booking
          </Link>
          <Link
            href="/profile"
            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Account
          </Link>
        </div>
      </header>

      <nav
        aria-label="Primary navigation"
        className="traveller-navigation fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(15,23,42,0.06)] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {items.map((item) => {
            const href = hrefFor(item.key, item.href);
            const active = activeFor(pathname, item.key);
            return (
              <Link
                key={item.key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition ${active ? "text-blue-700" : "text-slate-400 hover:text-slate-700"}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-lg leading-none ${active ? "bg-blue-50" : ""}`} aria-hidden="true">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
