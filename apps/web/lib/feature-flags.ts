export type FeatureFlags = {
  explore: boolean;
  reelToItinerary: boolean;
  community: boolean;
  driveMode: boolean;
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  explore: true,
  reelToItinerary: true,
  community: true,
  driveMode: true,
};

export function readFeatureFlags(env: NodeJS.ProcessEnv = process.env): FeatureFlags {
  const enabled = (key: string) => env[key]?.trim().toLowerCase() !== "false";
  return {
    explore: enabled("FEATURE_EXPLORE_ENABLED"),
    reelToItinerary: enabled("FEATURE_REEL_TO_ITINERARY_ENABLED"),
    community: enabled("FEATURE_COMMUNITY_ENABLED"),
    driveMode: enabled("FEATURE_DRIVE_MODE_ENABLED"),
  };
}
