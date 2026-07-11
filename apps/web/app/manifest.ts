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
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}