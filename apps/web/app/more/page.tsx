"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/UI/Container";

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
    href: "/drive",
    title: "Drive Mode",
    description: "Live route, GPS driving stats and nearby services",
    badge: "Premium · Coming soon",
    icon: "🚗",
  },
];

export default function MorePage() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] pb-28">
      <header className="border-b border-slate-200 bg-white">
        <Container className="max-w-2xl py-5">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Pravaas" width={44} height={44} className="rounded-xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Pravaas</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">More</h1>
            </div>
          </div>
        </Container>
      </header>

      <Container className="max-w-2xl py-6">
        <div className="space-y-3">
          {items.map((item) => (
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
                {item.badge ? (
                  <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="text-lg text-slate-400" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
