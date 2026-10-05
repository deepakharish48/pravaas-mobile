"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import GuestNavigation from "@/components/GuestNavigation";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(console.error);
  }, []);

  function signOut() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] pb-24 md:pb-8">
      <Container className="max-w-3xl">

        <GuestNavigation />

        <div className="mb-8 mt-8 md:mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="mt-2 text-sm text-slate-500">Your traveller identity and account details.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">

        <Card>
          <div className="space-y-6">

            <div>

              <p className="text-sm text-gray-500">
                Full Name
              </p>

              <p className="mt-1 text-lg font-medium">
                {user?.name || "-"}
              </p>

            </div>

            <div className="border-t" />

            <div>

              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="mt-1 text-lg font-medium">
                {user?.email || "-"}
              </p>

            </div>

          </div>

        </Card>

        <div className="space-y-5">
          <Link
            href="/info"
            className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 p-4 transition hover:border-blue-200 hover:bg-blue-100"
          >
            <div>
              <p className="font-semibold text-blue-950">Traveller information</p>
              <p className="mt-1 text-sm text-blue-800">Emergency help, embassy contacts and India immigration info</p>
            </div>
            <span className="text-lg text-blue-700" aria-hidden="true">→</span>
          </Link>
        </div>

        <div>
          <Button
            variant="secondary"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>

        </div>
      </Container>
    </main>
  );
}