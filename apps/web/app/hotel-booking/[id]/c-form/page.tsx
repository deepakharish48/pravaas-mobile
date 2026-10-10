"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import Container from "@/components/UI/Container";
import HotelNavigation from "@/components/HotelNavigation";

type CFormData = {
  hotelName: string; hotelAddress: string; hotelPhone: string;
  guestName: string; nationality: string; passportNumber: string;
  visaNumber: string; visaType: string; indiaContactPhone: string;
  email: string; remarks: string; arrivedFrom: string; arrivalDate: string;
  arrivalTime: string; purposeOfVisit: string; previousPlaceOfStay: string;
  departureDate: string; departureTime: string; nextDestination: string;
};

const labels: Record<keyof CFormData, string> = {
  hotelName: "Name of premises", hotelAddress: "Hotel address", hotelPhone: "Hotel phone / mobile",
  guestName: "Foreign visitor name (as in passport)", nationality: "Nationality",
  passportNumber: "Passport number", visaNumber: "Visa number / OCI number",
  visaType: "Visa type", indiaContactPhone: "Contact phone in India", email: "Email ID",
  remarks: "Other details / remarks", arrivedFrom: "Arrived from", arrivalDate: "Date of arrival",
  arrivalTime: "Time of arrival", purposeOfVisit: "Purpose of visit", previousPlaceOfStay: "Previous place of stay",
  departureDate: "Date of departure", departureTime: "Time of departure", nextDestination: "Next destination / proceed to",
};

const groups: { title: string; fields: (keyof CFormData)[] }[] = [
  { title: "Accommodation", fields: ["hotelName", "hotelAddress", "hotelPhone"] },
  { title: "Foreigner details", fields: ["guestName", "nationality", "passportNumber", "visaNumber", "visaType", "indiaContactPhone", "email", "remarks"] },
  { title: "Arrival details", fields: ["arrivedFrom", "arrivalDate", "arrivalTime", "purposeOfVisit", "previousPlaceOfStay"] },
  { title: "Departure details", fields: ["departureDate", "departureTime", "nextDestination"] },
];

function Field({ name, value, onChange }: { name: keyof CFormData; value: string; onChange: (v: string) => void }) {
  const date = name === "arrivalDate" || name === "departureDate";
  const time = name === "arrivalTime" || name === "departureTime";
  const long = name === "hotelAddress" || name === "remarks" || name === "previousPlaceOfStay";
  return <label className="block">
    <span className="text-sm font-semibold text-slate-700">{labels[name]}</span>
    {long ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /> :
      <input type={date ? "date" : time ? "time" : "text"} value={value} onChange={e => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />}
  </label>;
}

function Preview({ data }: { data: CFormData }) {
  const purpose = ["Tourism", "Business", "Employment", "Medical", "Student", "Conference", "Others"].map(x => `${data.purposeOfVisit === x ? "☑" : "☐"} ${x}`).join("   ");
  return <div className="form-print-area mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
    <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Government of India · Hotel report</p><h1 className="mt-2 text-2xl font-bold text-slate-950">FORM III</h1><p className="mt-1 text-sm text-slate-600">Report on foreigners accommodated or admitted</p><p className="text-xs text-slate-500">(Earlier Form C)</p></div>
      <div className="flex h-24 w-20 items-end justify-center border border-slate-400 pb-2 text-[10px] text-slate-500">Photograph</div>
    </div>
    <div className="mt-6 space-y-7 text-sm">
      <section><h2 className="mb-3 font-bold text-slate-900">1–2. Accommodation</h2><div className="grid gap-3 sm:grid-cols-2"><div><b>Name & address:</b><p>{data.hotelName || "—"}{data.hotelAddress ? `, ${data.hotelAddress}` : ""}</p></div><div><b>Phone / mobile:</b><p>{data.hotelPhone || "—"}</p></div></div></section>
      <section><h2 className="mb-3 font-bold text-slate-900">Foreigner details</h2><div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{(["guestName","nationality","passportNumber","visaNumber","visaType","indiaContactPhone","email","remarks"] as (keyof CFormData)[]).map(k => <div key={k}><b>{labels[k]}:</b><p className="whitespace-pre-wrap">{data[k] || "—"}</p></div>)}</div></section>
      <section><h2 className="mb-3 font-bold text-slate-900">Arrival details (check-in time)</h2><div className="grid gap-x-6 gap-y-3 sm:grid-cols-2"><div><b>Arrived from:</b><p>{data.arrivedFrom || "—"}</p></div><div><b>Date:</b><p>{data.arrivalDate || "—"}</p></div><div><b>Time:</b><p>{data.arrivalTime || "—"}</p></div><div className="sm:col-span-2"><b>Purpose:</b><p>{purpose}</p></div><div><b>Previous place of stay:</b><p>{data.previousPlaceOfStay || "—"}</p></div></div></section>
      <section><h2 className="mb-3 font-bold text-slate-900">Departure details (check-out time)</h2><div className="grid gap-x-6 gap-y-3 sm:grid-cols-2"><div><b>Date:</b><p>{data.departureDate || "—"}</p></div><div><b>Time:</b><p>{data.departureTime || "—"}</p></div><div><b>Next destination / proceed to:</b><p>{data.nextDestination || "—"}</p></div></div></section>
    </div>
    <div className="mt-10 grid grid-cols-2 gap-10 border-t pt-6 text-xs text-slate-500"><div>Guest signature / mark: ____________________</div><div>Keeper / manager signature: ____________________</div></div>
  </div>;
}

export default function CFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [data, setData] = useState<CFormData | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api(`/hotel/bookings/${id}/c-form`).then(r => { setData(r.data); setSaved(Boolean(r.saved)); setSavedAt(r.savedAt ?? ""); }).catch(e => setError(e?.message ?? "Could not load Form III.")).finally(() => setLoading(false)); }, [id]);

  const missing = useMemo(() => data ? ["guestName","nationality","passportNumber","visaNumber"].filter(k => !data[k as keyof CFormData]) : [], [data]);

  async function save() {
    if (!data) return;
    setSaving(true); setError("");
    try { const r = await api(`/hotel/bookings/${id}/c-form`, { method: "POST", body: JSON.stringify(data) }); setData(r.data); setSaved(true); setSavedAt(r.savedAt ?? ""); setPreview(true); }
    catch (e: any) { setError(e?.message ?? "Could not save Form III."); }
    finally { setSaving(false); }
  }

  if (loading || !data) return <main className="hotel-workspace min-h-screen bg-[#f6f8fc] flex items-center justify-center"><p className="text-slate-500">{loading ? "Loading Form III…" : error}</p></main>;

  return <main className="hotel-workspace min-h-screen bg-[#f6f8fc] py-6 pb-24 sm:py-8 lg:pl-64 lg:pb-10">
    <HotelNavigation />
    <Container className="max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Pravaas" width={48} height={48} className="rounded-xl" /><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Hotel compliance</p><h1 className="text-2xl font-bold text-slate-950">Form III (earlier Form C)</h1></div></div><Link href={`/hotel-booking/${id}`} className="text-sm font-semibold text-slate-500">← Booking</Link></div>
      <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900 print:hidden"><b>Auto-filled from Pravaas:</b> booking details, passport data and visa/OCI number where available. Review every field before saving. Fields that are not available are intentionally left blank for hotel staff to complete.</div>
      {!preview ? <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><Card className="print:hidden"><div className="space-y-8">{groups.map(group => <section key={group.title}><h2 className="mb-4 text-lg font-bold text-slate-900">{group.title}</h2><div className="grid gap-4 md:grid-cols-2">{group.fields.map(field => <Field key={field} name={field} value={data[field]} onChange={v => setData({ ...data, [field]: v })} />)}</div></section>)}</div>{missing.length > 0 && <p className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Required before saving: {missing.map(k => labels[k as keyof CFormData]).join(", ")}.</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-7 flex flex-wrap gap-3"><Button onClick={save} disabled={saving || missing.length > 0}>{saving ? "Saving…" : saved ? "Save changes & preview" : "Save & preview"}</Button><Button variant="secondary" onClick={() => setPreview(true)}>Preview without saving</Button></div></Card><aside className="hidden h-fit lg:block lg:sticky lg:top-24 print:hidden"><Card><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Review</p><p className="mt-2 text-sm leading-6 text-slate-500">Check passport, visa/OCI, arrival and departure details before saving.</p><p className="mt-4 text-xs text-slate-400">Required fields: guest name, nationality, passport number and visa/OCI number.</p></Card></aside></div> : <><div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden"><div><p className="text-sm text-slate-500">{saved ? `Saved ${savedAt ? new Date(savedAt).toLocaleString() : ""}` : "Preview only — not saved"}</p></div><div className="flex gap-3"><Button variant="secondary" onClick={() => setPreview(false)}>Edit</Button>{saved && <Button onClick={() => window.print()}>Generate PDF</Button>}</div></div><Preview data={data} /><p className="mx-auto mt-4 max-w-4xl text-xs text-slate-400 print:hidden">Generate PDF opens the browser's print dialog; choose “Save as PDF”.</p></>}
      <div className="mt-6 text-xs leading-5 text-slate-400 print:hidden">Form III is the current successor to Form C under the Immigration and Foreigners Rules, 2025. Pravaas is providing a preparation/preview workflow; the hotel's statutory electronic submission remains through the designated government portal.</div>
    </Container>
    <style jsx global>{`@media print { @page { size: A4; margin: 12mm; } body { background: white !important; } .form-print-area { border: 0 !important; box-shadow: none !important; max-width: none !important; padding: 0 !important; } }`}</style>
  </main>;
}