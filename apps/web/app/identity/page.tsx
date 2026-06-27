"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { api } from "@/lib/api";
import IdentityCard from "@/components/IdentityCard";

import Container from "@/components/ui/Container";

type IdentityDocument = {
  id: string;
  documentType: string;
  fullName?: string;
  documentNumber?: string;
};

export default function IdentityPage() {
  const [documents, setDocuments] = useState<IdentityDocument[]>([]);

  async function loadDocuments() {
    try {
      const data = await api("/identity");
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <Container className="max-w-lg">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Pravaas"
            width={64}
            height={64}
            className="mb-4"
          />

          <h1 className="text-3xl font-bold text-gray-900">
            Identity Wallet
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Securely manage your travel identity documents.
          </p>
        </div>

        <div className="space-y-4">
          <IdentityCard
            title="Aadhaar"
            type="AADHAAR"
            doc={documents.find(
              (d) => d.documentType === "AADHAAR"
            )}
            onUploaded={loadDocuments}
          />

          <IdentityCard
            title="Passport"
            type="PASSPORT"
            doc={documents.find(
              (d) => d.documentType === "PASSPORT"
            )}
            onUploaded={loadDocuments}
          />

          <IdentityCard
            title="Driving Licence"
            type="DRIVING_LICENSE"
            doc={documents.find(
              (d) => d.documentType === "DRIVING_LICENSE"
            )}
            onUploaded={loadDocuments}
          />
        </div>
      </Container>
    </main>
  );
}