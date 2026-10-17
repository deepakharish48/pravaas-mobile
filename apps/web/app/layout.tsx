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
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "Pravaas", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#080F20" };

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
