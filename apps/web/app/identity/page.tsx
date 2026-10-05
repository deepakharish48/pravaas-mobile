"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import IdentityCard from "@/components/IdentityCard";
import Container from "@/components/UI/Container";
import GuestNavigation from "@/components/GuestNavigation";

type IdentityDocument = {
  id: string;
  documentType: string;
  displayName?: string | null;
  fullName?: string | null;
  documentNumber?: string | null;
  verificationStatus?: string;
  createdAt?: string;
};

export default function IdentityPage() {
  const [documents, setDocuments] = useState<IdentityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDocuments() {
    try { setDocuments(await api("/identity")); setError(""); }
    catch (err: any) { setError(err?.message ?? "Could not load your wallet."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadDocuments(); }, []);
  const find = (type: string) => documents.find((doc) => doc.documentType === type);

  return <main className="min-h-screen bg-[#f6f8fc] pb-28">
    <GuestNavigation />
    <Container className="max-w-5xl py-8 sm:py-10">
      <div className="mb-8 flex items-center gap-4"><Image src="/logo.png" alt="Pravaas" width={54} height={54} className="rounded-xl" /><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Traveller wallet</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Your travel documents</h1><p className="mt-1 text-sm text-slate-500">Keep important documents together for your journeys.</p></div></div>
      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900"><strong>Privacy note:</strong> Only upload documents you need for your travels. Files are associated with your account. Uploaded documents are not automatically verified.</div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading your wallet…</div> : <div className="grid gap-4 md:grid-cols-2">
        <IdentityCard title="Aadhaar" type="AADHAAR" doc={find("AADHAAR")} onUploaded={loadDocuments} />
        <IdentityCard title="Passport" type="PASSPORT" doc={find("PASSPORT")} onUploaded={loadDocuments} />
        <IdentityCard title="Driving licence" type="DRIVING_LICENSE" doc={find("DRIVING_LICENSE")} onUploaded={loadDocuments} />
        <IdentityCard title="Visa" type="VISA" doc={find("VISA")} onUploaded={loadDocuments} />
        {[1, 2, 3].map((slot) => {
          const customDocs = documents.filter((doc) => doc.documentType === "OTHER");
          return <IdentityCard key={slot} title={`Additional document ${slot}`} type="OTHER" doc={customDocs[slot - 1]} custom onUploaded={loadDocuments} />;
        })}
      </div>}
      <p className="mt-5 text-xs leading-5 text-slate-400">Supported formats: PDF and images, up to 10 MB per file. Custom document names help you identify each upload.</p>
    </Container>
  </main>;
}