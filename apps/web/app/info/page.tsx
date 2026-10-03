"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import { api } from "@/lib/api";

type EmbassyContact = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
};

type TravellerInfo = {
  nationality: string | null;
  destination: string | null;
  isForeignTraveller: boolean;
  embassyContacts: EmbassyContact[];
  googleMapsAttribution: boolean;
};

export default function TravellerInfoPage() {
  const [info, setInfo] = useState<TravellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/bookings/traveller-info")
      .then((data) => setInfo(data))
      .catch((err: any) => setError(err?.message ?? "Could not load traveller information."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f8fc] pb-28">
      <header className="border-b border-slate-200 bg-white">
        <Container className="max-w-5xl py-4">
          <Link href="/profile" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
            ← More
          </Link>
        </Container>
      </header>

      <Container className="max-w-3xl py-8 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Traveller information</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Help while you’re in India</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pravaas uses your passport nationality and current trip destination to surface useful local contacts.
          </p>
        </div>

        {loading && (
          <Card>
            <p className="text-sm text-slate-500">Finding information for your trip…</p>
          </Card>
        )}

        {error && (
          <Card>
            <p className="text-sm font-semibold text-red-700">Could not load this information.</p>
            <p className="mt-1 text-sm text-slate-600">{error}</p>
          </Card>
        )}

        {!loading && !error && info && (
          <div className="space-y-5">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your trip</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{info.destination || "Destination not available"}</p>
                </div>
                {info.nationality && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {info.nationality}
                  </span>
                )}
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-lg font-semibold text-slate-900">Emergency help</p>
                <p className="mt-1 text-sm text-slate-500">For immediate emergencies anywhere in India.</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a href="tel:112" className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">National emergency</p>
                  <p className="mt-1 text-xl font-bold text-red-800">112</p>
                  <p className="mt-1 text-xs text-red-700">Police, fire and medical emergency response</p>
                </a>
                <a href="tel:1363" className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Tourist helpline</p>
                  <p className="mt-1 text-xl font-bold text-blue-800">1363</p>
                  <p className="mt-1 text-xs text-blue-700">Government tourist assistance</p>
                </a>
              </div>
            </Card>

            {info.isForeignTraveller ? (
              <>
                <Card>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Your embassy / consulate</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Contacts near your trip destination, based on your passport nationality.
                    </p>
                  </div>

                  {info.embassyContacts.length ? (
                    <div className="mt-5 space-y-3">
                      {info.embassyContacts.map((contact) => (
                        <div key={contact.id} className="rounded-2xl border border-slate-200 p-4">
                          <p className="font-semibold text-slate-900">{contact.name}</p>
                          {contact.address && <p className="mt-1 text-sm leading-5 text-slate-600">{contact.address}</p>}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {contact.phone && (
                              <a href={`tel:${contact.phone}`} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                                Call {contact.phone}
                              </a>
                            )}
                            {contact.website && (
                              <a href={contact.website} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                                Official website
                              </a>
                            )}
                            {contact.mapsUrl && (
                              <a href={contact.mapsUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                                Open in Google Maps
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      We could not find a nearby diplomatic mission automatically. Use your government’s official consular website or search for your embassy/consulate in India.
                    </div>
                  )}

                  {info.googleMapsAttribution && (
                    <p className="mt-4 text-xs text-slate-400">Embassy and consulate location details provided by Google Maps.</p>
                  )}
                </Card>

                <Card>
                  <p className="text-lg font-semibold text-slate-900">India immigration services</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    For registration, visa extension/conversion, exit permits and other immigration services, use the official e-FRRO service.
                  </p>
                  <a
                    href="https://indianfrro.gov.in/efrro/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Open e-FRRO
                  </a>
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    Government of India service. Pravaas does not submit immigration applications on your behalf.
                  </p>
                </Card>
              </>
            ) : (
              <Card>
                <p className="text-lg font-semibold text-slate-900">Traveller information</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {info.nationality
                    ? "Your passport is marked as Indian, so embassy/consular contacts are not shown for this trip."
                    : "Add your passport to the Travel Wallet to let Pravaas personalize this section for foreign travel."}
                </p>
                {!info.nationality && (
                  <Link href="/identity" className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">
                    Open Travel Wallet
                  </Link>
                )}
              </Card>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
              <strong className="text-slate-700">Important:</strong> Contact details and office availability can change. Verify critical information on the linked official website before visiting.
            </div>
          </div>
        )}
      </Container>

      <BottomNav />
    </main>
  );
}
