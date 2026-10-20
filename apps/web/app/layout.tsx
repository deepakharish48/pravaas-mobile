import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "../providers/QueryProvider";
import { HotelThemeProvider } from "../providers/HotelThemeProvider";

export const metadata: Metadata = {
  title: "Pravaas",
  description: "Smart Digital Travel Companion",
  manifest: "/manifest.webmanifest",
  applicationName: "Pravaas",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: { capable: true, title: "Pravaas", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#101a30" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <HotelThemeProvider>{children}</HotelThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
