"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import Input from "@/components/UI/Input";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signup() {
    try {
      const data = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      localStorage.setItem("token", data.accessToken);

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
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
              Create Your Account
            </h1>

            <p className="mt-2 text-center text-sm text-gray-500">
              Start your digital travel journey with Pravaas.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button onClick={signup}>
              Create Account
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
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