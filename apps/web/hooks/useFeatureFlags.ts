"use client";

import { useEffect, useState } from "react";
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from "@/lib/feature-flags";

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/features", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load feature flags");
        return response.json() as Promise<FeatureFlags>;
      })
      .then((value) => {
        if (active) setFlags({ ...DEFAULT_FEATURE_FLAGS, ...value });
      })
      .catch(() => {
        // Safe fallback: all features remain enabled if runtime config is temporarily unavailable.
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => { active = false; };
  }, []);

  return { flags, loaded };
}
