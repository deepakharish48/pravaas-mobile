"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHotelTheme } from "@/providers/HotelThemeProvider";

const items = [
  { href: "/hotel-dashboard", label: "Dashboard" },
  { href: "/hotel-scan", label: "Scan guest QR" },
];

export default function HotelNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useHotelTheme();

  function logout() {
    localStorage.removeItem("token");
    router.push("/hotel-login");
  }

  const themeToggle = (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span aria-hidden="true">{resolvedTheme === "dark" ? "☀" : "☾"}</span>
      <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex min-h-20 items-center justify-between gap-2 border-b border-slate-200 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="Pravaas" width={40} height={40} className="rounded-xl" />
            <div className="min-w-0">
              <p className="font-bold text-slate-950">Pravaas</p>
              <p className="text-xs text-slate-500">Hotel workspace</p>
            </div>
          </div>
          {themeToggle}
        </div>
        <nav className="flex-1 space-y-1 p-4" aria-label="Hotel navigation">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <button type="button" onClick={logout} className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-950">
            Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="Pravaas" width={36} height={36} className="rounded-lg" />
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-950">Hotel workspace</p>
              <p className="text-xs text-slate-500">Reception operations</p>
            </div>
          </div>
          {themeToggle}
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden" aria-label="Hotel navigation">
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={`rounded-xl px-3 py-2.5 text-center text-xs font-semibold ${active ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
