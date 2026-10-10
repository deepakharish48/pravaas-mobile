"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import GuestNavigation from "@/components/GuestNavigation";
import { useHotelTheme, type HotelTheme } from "@/providers/HotelThemeProvider";

type User = { id: string; name: string; email: string };

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useHotelTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api("/auth/me").then((data) => setUser(data.user)).catch(console.error);
  }, []);

  function signOut() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const appearanceOptions: { value: HotelTheme; label: string; description: string }[] = [
    { value: "system", label: "System", description: "Follow your device appearance" },
    { value: "light", label: "Light", description: "Bright background" },
    { value: "dark", label: "Midnight", description: "Dark navy surfaces" },
  ];

  return (
    <div className="traveller-workspace min-h-screen pb-24 md:pb-8">
      <GuestNavigation />
      <Container className="max-w-5xl">
        <div className="mb-8 mt-8 md:mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="mt-2 text-sm text-slate-500">Your traveller identity and account details.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <Card>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="mt-1 text-lg font-medium text-slate-900">{user?.name || "-"}</p>
                </div>
                <div className="border-t border-slate-200" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="mt-1 text-lg font-medium text-slate-900">{user?.email || "-"}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
                  <p className="mt-1 text-sm text-slate-500">Choose how Pravaas looks on this device.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3" role="group" aria-label="Appearance theme">
                  {appearanceOptions.map((option) => {
                    const selected = theme === option.value;
                    return (
                      <button key={option.value} type="button" aria-pressed={selected}
                        onClick={() => setTheme(option.value)}
                        className={`rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${selected ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-400"}`}>
                        <span className="block font-semibold text-slate-900">{option.label}</span>
                        <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-5">
            <Link href="/info" className="traveller-info-card flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 p-4 transition hover:border-blue-200 hover:bg-blue-100">
              <div>
                <p className="font-semibold text-blue-950">Traveller information</p>
                <p className="mt-1 text-sm text-blue-800">Emergency help, embassy contacts and India immigration info</p>
              </div>
              <span className="text-lg text-blue-700" aria-hidden="true">→</span>
            </Link>
            <Button variant="secondary" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
