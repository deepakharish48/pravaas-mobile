import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "../providers/QueryProvider";

export const metadata: Metadata = {
  title: "Pravaas",
  description: "Smart Digital Travel Companion",

  manifest: "/manifest.webmanifest",

  applicationName: "Pravaas",

  appleWebApp: {
    capable: true,
    title: "Pravaas",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1D4ED8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}