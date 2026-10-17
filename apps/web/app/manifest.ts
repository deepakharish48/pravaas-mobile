import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pravaas",
    short_name: "Pravaas",

    description: "Smart Digital Travel Companion",

    start_url: "/",

    display: "standalone",

    orientation: "portrait",

    background_color: "#ffffff",

    theme_color: "#1D4ED8",

    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
