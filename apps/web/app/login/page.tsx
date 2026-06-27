"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("LOGIN RESPONSE", data);

      localStorage.setItem("token", data.accessToken);

      router.push("/dashboard");
    } catch (error) {
      console.error("LOGIN FAILED", error);
      alert("Login failed");
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
              Welcome Back
            </h1>

            <p className="mt-2 text-center text-sm text-gray-500">
              Sign in to continue your journey with Pravaas.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <Button onClick={login}>
              Sign In
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create Account
            </Link>
          </p>
        </Card>
      </Container>
    </main>
  );
}