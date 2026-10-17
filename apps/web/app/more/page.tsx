"use client";

import Link from "next/link";
import Container from "@/components/UI/Container";
import GuestNavigation from "@/components/GuestNavigation";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const items = [
  {
    href: "/profile",
    title: "My Profile",
    description: "Your traveller identity and account details",
    icon: "👤",
  },
  {
    href: "/info",
    title: "Traveller information",
    description: "Emergency help, embassy contacts and India immigration info",
    icon: "🛂",
  },
  {
    href: "/travel-history",
    title: "Drive Mode",
    description: "Open a trip to start driving navigation and find nearby services",
    icon: "🚗",
  },
];

export default function MorePage() {
  const { flags } = useFeatureFlags();
  const visibleItems = items.filter((item) => item.title !== "Drive Mode" || flags.driveMode);
  return (
    <main className="min-h-screen bg-[#f6f8fc] pb-24 md:pb-8">
      <GuestNavigation />

      <Container className="max-w-3xl py-7 sm:py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-2xl" aria-hidden="true">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">{item.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
              </span>
              <span className="text-lg text-slate-400" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
