import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size={40} priority />
          <span className="text-xl font-bold tracking-tight">
            Pravaas
          </span>
        </Link>

        <Link
          href="/hotel-login"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
        >
          Hotel Login
        </Link>
      </div>
    </header>
  );
}