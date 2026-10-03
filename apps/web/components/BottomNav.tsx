"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Booking = { id: string };

const items = [
  { key: "home", label: "Home", icon: "⌂", href: "/dashboard" },
  { key: "itinerary", label: "Itinerary", icon: "▤", href: "/travel-history" },
  { key: "wallet", label: "Travel wallet", icon: "▣", href: "/identity" },
  { key: "more", label: "More", icon: "•••", href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    api("/bookings").then((bookings: Booking[]) => {
      if (bookings?.[0]?.id) setBookingId(bookings[0].id);
    }).catch(() => {});
  }, []);

  const activeKey = pathname === "/dashboard"
    ? "home"
    : pathname?.startsWith("/identity")
      ? "wallet"
      : pathname?.startsWith("/itinerary") || pathname?.startsWith("/travel-history")
        ? "itinerary"
        : "more";

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {items.map((item) => {
          const href = item.key === "itinerary" && bookingId ? `/itinerary/${bookingId}` : item.href;
          const active = activeKey === item.key;
          return (
            <Link key={item.key} href={href} className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition ${active ? "text-blue-700" : "text-slate-400 hover:text-slate-700"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-lg leading-none ${active ? "bg-blue-50" : ""}`} aria-hidden="true">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}