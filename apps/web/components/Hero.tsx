import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">

      <p className="mb-4 rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-600">
        Digital Traveller Identity
      </p>

      <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
        Travel.
        <br />
        Stay.
        <br />
        Simplified.
      </h1>

      <p className="mt-8 max-w-xl text-lg leading-8 text-gray-600">
        Create your secure digital travel identity once and enjoy seamless
        hotel check-ins without repetitive paperwork.
      </p>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">

        <Link
          href="/signup"
          className="rounded-full bg-blue-600 px-8 py-4 text-white font-semibold transition hover:bg-blue-700"
        >
          Create your Travel ID
        </Link>

        <Link
          href="/login"
          className="rounded-full border border-gray-300 px-8 py-4 font-semibold transition hover:bg-gray-100"
        >
          Sign In
        </Link>

      </div>
    </section>
  );
}