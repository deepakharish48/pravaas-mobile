"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";

type IdentityDocument = {
  id: string;
  documentType: string;
  displayName?: string | null;
  fullName?: string | null;
  documentNumber?: string | null;
  verificationStatus?: string;
  createdAt?: string;
};
type Props = {
  title: string;
  type: string;
  doc?: IdentityDocument;
  onUploaded: () => void;
  custom?: boolean;
};

export default function IdentityCard({ title, type, doc, onUploaded, custom = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState(doc?.displayName ?? "");
  const [error, setError] = useState("");

  async function upload() {
    if (!file) { setError("Choose a file to upload."); return; }
    if (custom && !customName.trim()) { setError("Enter a name for this document."); return; }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", type);
      if (custom) formData.append("displayName", customName.trim());
      await api("/identity/upload", { method: "POST", body: formData });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (err: any) {
      setError(err?.message ?? "Upload failed. Please try again.");
    } finally { setLoading(false); }
  }

  return <Card className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div><h2 className="font-semibold text-slate-900">{doc?.displayName || title}</h2><p className="mt-1 text-xs text-slate-500">{custom ? "Your own document" : type === "VISA" ? "Visa and entry permit" : "Travel identity document"}</p></div>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{doc ? (doc.verificationStatus || "PENDING") : "Not added"}</span>
    </div>
    {doc && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><p>{doc.fullName || "File saved in your wallet"}</p>{doc.documentNumber && <p className="mt-1">Document no.: {doc.documentNumber}</p>}{doc.verificationStatus !== "VERIFIED" && <p className="mt-1 text-amber-700">Uploaded; verification is pending.</p>}</div>}
    {custom && <label className="mt-4 block text-xs font-semibold text-slate-700">Document name<input value={customName} onChange={(e) => setCustomName(e.target.value)} maxLength={80} placeholder="e.g. Travel insurance" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>}
    <div className="mt-4"><input ref={inputRef} hidden type="file" accept="image/*,.pdf,application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(""); }} /><button type="button" onClick={() => inputRef.current?.click()} className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-left text-sm text-slate-600 transition hover:border-blue-400 hover:bg-blue-50"><span className="font-semibold text-blue-700">{file ? "Change file" : doc ? "Replace document" : "Choose file"}</span><span className="mt-1 block truncate text-xs text-slate-500">{file?.name || "PDF or image · max 10 MB"}</span></button><div className="mt-3"><Button onClick={upload} disabled={loading || !file || (custom && !customName.trim())}>{loading ? "Uploading…" : doc ? "Replace upload" : `Upload ${custom ? "document" : title}`}</Button></div>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>
  </Card>;
}