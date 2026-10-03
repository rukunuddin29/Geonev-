"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Plug,
  ImagePlus,
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Building2,
  Clock,
  Upload,
  Trash2,
  Wifi,
  Coffee,
  Car,
  Lightbulb,
  ShieldCheck,
  Zap,
} from "lucide-react";

/* ----------------------------- config ----------------------------- */
const STEPS = [
  { icon: User, title: "About you", sub: "Who's listing the station" },
  { icon: MapPin, title: "Station", sub: "Name & location" },
  { icon: Plug, title: "Charging", sub: "Connectors & pricing" },
  { icon: ImagePlus, title: "Details", sub: "Photos & description" },
  { icon: ClipboardCheck, title: "Review", sub: "Confirm & submit" },
];

const CONNECTORS = ["CCS", "Type 2", "CHAdeMO", "Tesla", "GB/T"];

const AMENITIES = [
  { label: "Parking", icon: Car },
  { label: "Wi‑Fi", icon: Wifi },
  { label: "Café", icon: Coffee },
  { label: "Lighting", icon: Lightbulb },
  { label: "Security", icon: ShieldCheck },
  { label: "24/7 access", icon: Clock },
];

type ImageItem = { name: string; url: string };

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  accountType: "individual" | "business";
  businessName: string;
  stationName: string;
  address: string;
  city: string;
  region: string;
  postal: string;
  connectorTypes: string[];
  connectors: string;
  power: string;
  pricePerKwh: string;
  availability: "247" | "custom";
  openTime: string;
  closeTime: string;
  amenities: string[];
  description: string;
  images: ImageItem[];
  agree: boolean;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  accountType: "individual",
  businessName: "",
  stationName: "",
  address: "",
  city: "",
  region: "",
  postal: "",
  connectorTypes: [],
  connectors: "1",
  power: "",
  pricePerKwh: "",
  availability: "247",
  openTime: "08:00",
  closeTime: "20:00",
  amenities: [],
  description: "",
  images: [],
  agree: false,
};

/* ----------------------------- styles ----------------------------- */
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";
const errCls = "mt-1 text-xs font-medium text-red-500";

/* ============================== page ============================== */
export default function BecomeHostPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(initialForm);

  const ref = `GEO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const toggleIn = (key: "connectorTypes" | "amenities", value: string) => {
    setForm((f) => {
      const arr = f[key];
      return {
        ...f,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setForm((f) => ({ ...f, images: [...f.images, ...next].slice(0, 6) }));
  };

  /* ------------------------- validation ------------------------- */
  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.fullName.trim()) e.fullName = "Required";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
      if (!form.phone.trim()) e.phone = "Required";
      if (form.accountType === "business" && !form.businessName.trim())
        e.businessName = "Required for businesses";
    }
    if (s === 1) {
      if (!form.stationName.trim()) e.stationName = "Required";
      if (!form.address.trim()) e.address = "Required";
      if (!form.city.trim()) e.city = "Required";
    }
    if (s === 2) {
      if (form.connectorTypes.length === 0)
        e.connectorTypes = "Pick at least one connector";
      if (!form.power.trim()) e.power = "Required";
      if (!form.pricePerKwh.trim()) e.pricePerKwh = "Required";
    }
    if (s === 3) {
      if (form.description.trim().length < 20)
        e.description = "Tell drivers a bit more (20+ characters)";
      if (!form.agree) e.agree = "Please accept to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = () => setSubmitted(true);

  const progress = ((step + 1) / STEPS.length) * 100;

  /* ============================ success ============================ */
  if (submitted) {
    return (
      <main className="bg-white text-slate-900">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-[#0066FF]/10 blur-[120px]" />
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Application submitted
            </h1>
            <p className="mt-3 text-slate-500">
              Thanks, {form.fullName.split(" ")[0] || "host"}. Your station{" "}
              <span className="font-medium text-slate-700">
                {form.stationName}
              </span>{" "}
              is now with our team for review.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Reference
              </p>
              <p className="text-lg font-semibold text-[#0066FF]">{ref}</p>
            </div>

            <div className="mt-6 space-y-3 text-left">
              {[
                "We review your application within 48 hours",
                "KYC verification & a quick safety check",
                "Once approved, your station goes live to drivers",
              ].map((t, i) => (
                <div key={t} className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0066FF]/10 text-xs font-semibold text-[#0066FF]">
                    {i + 1}
                  </span>
                  {t}
                </div>
              ))}
            </div>

            <Link
              href="/"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0052CC]"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* ============================== form ============================== */
  return (
    <main className="bg-white text-slate-900">
      {/* header */}
      <section className="relative overflow-hidden border-b border-slate-100 px-6 pb-12 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute -top-32 right-0 h-[400px] w-[400px] rounded-full bg-[#0066FF]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-[320px] w-[320px] rounded-full bg-[#FFB800]/10 blur-[120px]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFB800]/30 bg-[#FFB800]/10 px-3 py-1.5 text-xs font-medium text-[#b07d00]">
            <Zap className="h-3.5 w-3.5" fill="currentColor" />
            Become a host
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            List your charging station
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Tell us about your station and we&apos;ll get it reviewed. Approval
            usually takes under 48 hours — then you start earning.
          </p>
        </div>
      </section>

      {/* body */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* step rail */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <ol className="hidden gap-1 lg:grid">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                const Icon = s.icon;
                return (
                  <li
                    key={s.title}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                      active ? "bg-[#0066FF]/5" : ""
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition ${
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                          ? "bg-[#0066FF] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span>
                      <span
                        className={`block text-sm font-semibold ${
                          active || done ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="block text-xs text-slate-400">{s.sub}</span>
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* mobile progress */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{STEPS[step].title}</span>
                <span className="text-slate-400">
                  Step {step + 1} of {STEPS.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0066FF] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </aside>

          {/* form card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            {/* desktop progress bar */}
            <div className="mb-8 hidden h-1.5 w-full overflow-hidden rounded-full bg-slate-100 lg:block">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0066FF] to-[#3b8bff] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* STEP 0 — about you */}
            {step === 0 && (
              <div className="space-y-5">
                <StepHead title="About you" desc="The person responsible for this listing." />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input
                      className={inputCls}
                      placeholder="Jordan Rivera"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                    />
                    {errors.fullName && <p className={errCls}>{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      className={inputCls}
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                    {errors.email && <p className={errCls}>{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={inputCls}
                    placeholder="+1 555 000 1234"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                  {errors.phone && <p className={errCls}>{errors.phone}</p>}
                </div>

                <div>
                  <label className={labelCls}>I&apos;m listing as</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "individual", label: "Individual", icon: User },
                      { id: "business", label: "Business", icon: Building2 },
                    ].map(({ id, label, icon: Icon }) => {
                      const active = form.accountType === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => set("accountType", id as FormState["accountType"])}
                          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                            active
                              ? "border-[#0066FF] bg-[#0066FF]/5"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${active ? "text-[#0066FF]" : "text-slate-400"}`}
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {form.accountType === "business" && (
                  <div>
                    <label className={labelCls}>Business name</label>
                    <input
                      className={inputCls}
                      placeholder="Rivera Energy Ltd."
                      value={form.businessName}
                      onChange={(e) => set("businessName", e.target.value)}
                    />
                    {errors.businessName && <p className={errCls}>{errors.businessName}</p>}
                  </div>
                )}
              </div>
            )}

            {/* STEP 1 — station */}
            {step === 1 && (
              <div className="space-y-5">
                <StepHead title="Station location" desc="Where drivers will find and plug in." />
                <div>
                  <label className={labelCls}>Station name</label>
                  <input
                    className={inputCls}
                    placeholder="Downtown PowerHub"
                    value={form.stationName}
                    onChange={(e) => set("stationName", e.target.value)}
                  />
                  {errors.stationName && <p className={errCls}>{errors.stationName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Street address</label>
                  <input
                    className={inputCls}
                    placeholder="120 Market Street"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                  {errors.address && <p className={errCls}>{errors.address}</p>}
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>City</label>
                    <input
                      className={inputCls}
                      placeholder="San Francisco"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                    />
                    {errors.city && <p className={errCls}>{errors.city}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>State / region</label>
                    <input
                      className={inputCls}
                      placeholder="CA"
                      value={form.region}
                      onChange={(e) => set("region", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Postal code</label>
                    <input
                      className={inputCls}
                      placeholder="94103"
                      value={form.postal}
                      onChange={(e) => set("postal", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — charging */}
            {step === 2 && (
              <div className="space-y-6">
                <StepHead title="Charging & pricing" desc="What you offer and what it costs." />
                <div>
                  <label className={labelCls}>Connector types</label>
                  <div className="flex flex-wrap gap-2">
                    {CONNECTORS.map((c) => {
                      const active = form.connectorTypes.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleIn("connectorTypes", c)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "border-[#0066FF] bg-[#0066FF] text-white"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {errors.connectorTypes && <p className={errCls}>{errors.connectorTypes}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>Connectors</label>
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      value={form.connectors}
                      onChange={(e) => set("connectors", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Max power (kW)</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="150"
                      value={form.power}
                      onChange={(e) => set("power", e.target.value)}
                    />
                    {errors.power && <p className={errCls}>{errors.power}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Price / kWh ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls}
                      placeholder="0.32"
                      value={form.pricePerKwh}
                      onChange={(e) => set("pricePerKwh", e.target.value)}
                    />
                    {errors.pricePerKwh && <p className={errCls}>{errors.pricePerKwh}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Availability</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "247", label: "Open 24/7" },
                      { id: "custom", label: "Custom hours" },
                    ].map(({ id, label }) => {
                      const active = form.availability === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => set("availability", id as FormState["availability"])}
                          className={`rounded-xl border p-3 text-sm font-medium transition ${
                            active
                              ? "border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF]"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {form.availability === "custom" && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Opens</label>
                        <input
                          type="time"
                          className={inputCls}
                          value={form.openTime}
                          onChange={(e) => set("openTime", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Closes</label>
                        <input
                          type="time"
                          className={inputCls}
                          value={form.closeTime}
                          onChange={(e) => set("closeTime", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Amenities (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map(({ label, icon: Icon }) => {
                      const active = form.amenities.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleIn("amenities", label)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                            active
                              ? "border-[#FFB800] bg-[#FFB800]/10 text-[#b07d00]"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — details */}
            {step === 3 && (
              <div className="space-y-6">
                <StepHead title="Photos & description" desc="Help drivers choose your station." />
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={5}
                    className={`${inputCls} resize-none`}
                    placeholder="Covered bay near the main entrance, easy access, well lit at night…"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                  {errors.description && <p className={errCls}>{errors.description}</p>}
                </div>

                <div>
                  <label className={labelCls}>Photos (up to 6)</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center transition hover:border-[#0066FF]/40 hover:bg-[#0066FF]/5">
                    <Upload className="h-7 w-7 text-slate-400" />
                    <span className="mt-2 text-sm font-medium text-slate-600">
                      Click to upload or drag & drop
                    </span>
                    <span className="mt-1 text-xs text-slate-400">PNG or JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onFiles(e.target.files)}
                    />
                  </label>

                  {form.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {form.images.map((img, i) => (
                        <div
                          key={img.url}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                images: f.images.filter((_, idx) => idx !== i),
                              }))
                            }
                            className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={(e) => set("agree", e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#0066FF]"
                  />
                  <span className="text-sm text-slate-600">
                    I confirm the details are accurate and agree to GeoNEV&apos;s
                    host terms and KYC verification.
                  </span>
                </label>
                {errors.agree && <p className={errCls}>{errors.agree}</p>}
              </div>
            )}

            {/* STEP 4 — review */}
            {step === 4 && (
              <div className="space-y-6">
                <StepHead title="Review & submit" desc="One last look before it goes to our team." />
                <ReviewBlock title="Applicant" rows={[
                  ["Name", form.fullName],
                  ["Email", form.email],
                  ["Phone", form.phone],
                  ["Type", form.accountType === "business" ? `Business · ${form.businessName}` : "Individual"],
                ]} />
                <ReviewBlock title="Station" rows={[
                  ["Name", form.stationName],
                  ["Address", [form.address, form.city, form.region, form.postal].filter(Boolean).join(", ")],
                ]} />
                <ReviewBlock title="Charging" rows={[
                  ["Connectors", form.connectorTypes.join(", ") || "—"],
                  ["Count", form.connectors],
                  ["Max power", form.power ? `${form.power} kW` : "—"],
                  ["Price", form.pricePerKwh ? `$${form.pricePerKwh}/kWh` : "—"],
                  ["Hours", form.availability === "247" ? "24/7" : `${form.openTime}–${form.closeTime}`],
                  ["Amenities", form.amenities.join(", ") || "—"],
                  ["Photos", `${form.images.length} uploaded`],
                ]} />
                <div className="rounded-2xl border border-[#0066FF]/20 bg-[#0066FF]/5 p-4 text-sm text-slate-600">
                  After you submit, our team reviews your application within
                  <span className="font-semibold text-slate-900"> 48 hours</span>.
                  You&apos;ll get an email once it&apos;s approved.
                </div>
              </div>
            )}

            {/* nav */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <span />
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0052CC]"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                >
                  Submit application <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* --------------------------- small parts --------------------------- */
function StepHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
}

function ReviewBlock({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <dl className="grid gap-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-xs text-slate-400">{k}</dt>
            <dd className="text-sm font-medium text-slate-800 break-words">
              {v || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}