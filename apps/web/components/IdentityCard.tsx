"use client";

import { useRef, useState } from "react";

import { api } from "@/lib/api";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";

type IdentityDocument = {
  id: string;
  documentType: string;
  fullName?: string;
  documentNumber?: string;
};

type Props = {
  title: string;
  type: string;
  doc?: IdentityDocument;
  onUploaded: () => void;
};

export default function IdentityCard({
  title,
  type,
  doc,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  async function upload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("documentType", type);

      await api("/identity/upload", {
        method: "POST",
        body: formData,
      });

      alert("Document uploaded!");

      onUploaded();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      {doc ? (
        <div className="mt-4 space-y-2">
          <p className="font-medium">
            {doc.fullName}
          </p>

          <p className="text-sm text-gray-500">
            {doc.documentNumber}
          </p>

          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            ✓ Verified
          </span>
        </div>
      ) : (
        <div className="mt-4">
          <p className="mb-4 text-sm text-gray-500">
            No document uploaded.
          </p>

          <Button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : `Upload ${title}`}
          </Button>

          <input
            ref={inputRef}
            hidden
            type="file"
            accept="image/*"
            onChange={upload}
          />
        </div>
      )}
    </Card>
  );
}