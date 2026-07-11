"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";

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
    <main className="min-h-screen bg-gray-50 py-10">
      <Container className="max-w-lg">

        <div className="mb-8 flex flex-col items-center">

          <Image
            src="/logo.png"
            alt="Pravaas"
            width={64}
            height={64}
            className="mb-4"
          />

          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Your traveller identity.
          </p>

        </div>

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

        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>

      </Container>
    </main>
  );
}