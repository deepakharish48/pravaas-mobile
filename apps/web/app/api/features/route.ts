import { NextResponse } from "next/server";
import { readFeatureFlags } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const flags = readFeatureFlags();
  return NextResponse.json(flags, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
