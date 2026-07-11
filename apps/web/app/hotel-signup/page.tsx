"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import Input from "@/components/UI/Input";

export default function HotelSignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    hotelName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotel/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hotelName: form.hotelName,
            email: form.email,
            password: form.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to create hotel account");
      }

      router.push("/hotel-login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <Container>
        <Card>
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="Pravaas"
              width={64}
              height={64}
              className="mb-4"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Register Your Hotel
            </h1>

            <p className="mt-2 text-center text-sm text-gray-500">
              Join Pravaas and start managing guest check-ins digitally.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              type="text"
              name="hotelName"
              placeholder="Hotel Name"
              value={form.hotelName}
              onChange={handleChange}
              required
            />

            <Input
              type="email"
              name="email"
              placeholder="Hotel Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Hotel Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have a hotel account?{" "}
            <Link
              href="/hotel-login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </p>
        </Card>
      </Container>
    </main>
  );
}