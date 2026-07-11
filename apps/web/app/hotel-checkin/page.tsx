"use client";

import { Suspense } from "react";
import HotelCheckinContent from "./HotelCheckinContent";

export default function HotelCheckinPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <HotelCheckinContent />
    </Suspense>
  );
}