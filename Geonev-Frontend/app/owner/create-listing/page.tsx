"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import {
  Zap, Car, Bike, Truck, MapPin, Navigation, Gauge, IndianRupee,
  Image as ImageIcon, ListChecks, CheckCircle2, Plus, X, ArrowLeft,
  ArrowRight, Loader2, PartyPopper, Info,
} from "lucide-react";

type SpotType = "CAR" | "BIKE" | "TRUCK" | "EV_CHARGING";
type ChargerType = "AC" | "DC" | "BOTH";

const SPOT_TYPES = [
  { value: "EV_CHARGING", label: "EV Charging", icon: Zap },
  { value: "CAR", label: "Car Parking", icon: Car },
  { value: "BIKE", label: "Bike Parking", icon: Bike },
  { value: "TRUCK", label: "Truck Parking", icon: Truck },
] as const;

const CHARGER_TYPES = [
  { value: "AC", label: "AC", hint: "Slow / Fast" },
  { value: "DC", label: "DC", hint: "Fast charging" },
  { value: "BOTH", label: "AC + DC", hint: "Both supported" },
] as const;

const AMENITY_OPTIONS = [
  "CCTV", "Covered", "24/7 Access", "Security Guard",
  "Restroom", "Cafe Nearby", "Well Lit", "Wheelchair Access",
];

const STEPS = [
  { id: "basics", title: "Basics", icon: Info },
  { id: "location", title: "Location", icon: MapPin },
  { id: "details", title: "Details", icon: Gauge },
  { id: "media", title: "Media", icon: ImageIcon },
  { id: "review", title: "Review", icon: CheckCircle2 },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

export default function CreateListingPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    spotType: "EV_CHARGING" as SpotType,
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    latitude: "",
    longitude: "",
    totalSlots: "1",
    pricePerHour: "",
    chargerType: "DC" as ChargerType,
    powerKw: "",
    images: [""] as string[],
    amenities: [] as string[],
  });

  const update = (k: keyof typeof form, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const isEV = form.spotType === "EV_CHARGING";

  // ---- validation per step ----
  const validate = (s: number): string | null => {
    if (s === 0 && !form.name.trim()) return "Please enter a listing name";
    if (s === 1) {
      if (!form.address.trim()) return "Address is required";
      if (!form.city.trim()) return "City is required";
      if (form.latitude === "" || isNaN(Number(form.latitude)))
        return "A valid latitude is required";
      if (form.longitude === "" || isNaN(Number(form.longitude)))
        return "A valid longitude is required";
    }
    if (s === 2) {
      if (form.pricePerHour === "" || isNaN(Number(form.pricePerHour)))
        return "Price per hour is required";
      if (Number(form.pricePerHour) < 0) return "Price cannot be negative";
      if (isEV && (form.powerKw === "" || isNaN(Number(form.powerKw))))
        return "Power (kW) is required for an EV charging point";
    }
    return null;
  };

  const next = () => {
    const err = validate(step);
    if (err) return setError(err);
    setError("");
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError("");
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("latitude", pos.coords.latitude.toFixed(6));
        update("longitude", pos.coords.longitude.toFixed(6));
        setError("");
      },
      () => setError("Could not fetch your location"),
    );
  };

  // ---- images ----
  const addImage = () => update("images", [...form.images, ""]);
  const setImage = (i: number, v: string) =>
    update("images", form.images.map((x, idx) => (idx === i ? v : x)));
  const removeImage = (i: number) =>
    update("images", form.images.filter((_, idx) => idx !== i));

  const toggleAmenity = (a: string) =>
    update(
      "amenities",
      form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    );

  // ---- submit (integration) ----
  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim() || undefined,
        country: form.country.trim() || "India",
        pincode: form.pincode.trim() || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        spotType: form.spotType,
        totalSlots: Number(form.totalSlots) || 1,
        pricePerHour: Number(form.pricePerHour),
        chargerType: isEV ? form.chargerType : "NONE",
        powerKw: isEV ? Number(form.powerKw) : undefined,
        images: form.images.map((s) => s.trim()).filter(Boolean),
        amenities: form.amenities,
      };

      await api.post("/parkings/create", payload);
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  // ---- success screen ----
  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-blue-50 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/60"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100"
          >
            <PartyPopper className="h-8 w-8 text-amber-500" />
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            Listing published!
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Your charging point is now live and ready for drivers to find.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/owner/dashboard")}
              className="rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
            >
              Go to dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Add another listing
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-blue-50 px-4 py-10">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-400/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-amber-300/25 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-2xl">
        {/* Brand + heading */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <span className="text-lg font-bold text-slate-900">
            Volt<span className="text-amber-500">Grid</span>
          </span>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-slate-900">
          List your charging point
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          A few quick steps and your station goes live.
        </p>

        {/* Stepper */}
        <div className="mb-8">
          <div className="relative mb-3 flex justify-between">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
            <motion.div
              className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-blue-600"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const complete = i < step;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                      complete
                        ? "border-blue-600 bg-blue-600 text-white"
                        : active
                        ? "border-blue-600 bg-white text-blue-600"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {complete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </motion.div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium ${
                      active ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* STEP 0 — Basics */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Listing type</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {SPOT_TYPES.map((t) => {
                        const Icon = t.icon;
                        const selected = form.spotType === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => update("spotType", t.value)}
                            className={`rounded-xl border-2 p-3 text-center transition-all ${
                              selected
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <Icon
                              className={`mx-auto mb-1.5 h-5 w-5 ${
                                selected ? "text-blue-600" : "text-slate-400"
                              }`}
                            />
                            <span className="text-xs font-medium text-slate-700">
                              {t.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Indiranagar Fast Charging Hub"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows={3}
                      className={inputClass}
                      placeholder="Covered bay with DC fast chargers, easy access..."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 1 — Location */}
              {step === 1 && (
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                  >
                    <Navigation className="h-4 w-4" />
                    Use my current location
                  </button>

                  <div>
                    <label className={labelClass}>Address</label>
                    <input
                      className={inputClass}
                      placeholder="100 Feet Road, Indiranagar"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        className={inputClass}
                        placeholder="Bengaluru"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input
                        className={inputClass}
                        placeholder="Karnataka"
                        value={form.state}
                        onChange={(e) => update("state", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input
                        className={inputClass}
                        value={form.country}
                        onChange={(e) => update("country", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Pincode</label>
                      <input
                        className={inputClass}
                        placeholder="560038"
                        value={form.pincode}
                        onChange={(e) => update("pincode", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Latitude</label>
                      <input
                        className={inputClass}
                        placeholder="12.9719"
                        value={form.latitude}
                        onChange={(e) => update("latitude", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Longitude</label>
                      <input
                        className={inputClass}
                        placeholder="77.6412"
                        value={form.longitude}
                        onChange={(e) => update("longitude", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Details */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Total slots</label>
                      <input
                        type="number"
                        min={1}
                        className={inputClass}
                        value={form.totalSlots}
                        onChange={(e) => update("totalSlots", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Price / hour (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          min={0}
                          className={`${inputClass} pl-9`}
                          placeholder="120"
                          value={form.pricePerHour}
                          onChange={(e) => update("pricePerHour", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* EV-only fields */}
                  <AnimatePresence>
                    {isEV && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-5 overflow-hidden"
                      >
                        <div>
                          <label className={labelClass}>Charger type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {CHARGER_TYPES.map((c) => {
                              const selected = form.chargerType === c.value;
                              return (
                                <button
                                  key={c.value}
                                  type="button"
                                  onClick={() => update("chargerType", c.value)}
                                  className={`rounded-xl border-2 p-3 text-center transition-all ${
                                    selected
                                      ? "border-blue-600 bg-blue-50"
                                      : "border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  <span className="block text-sm font-semibold text-slate-800">
                                    {c.label}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {c.hint}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Power output (kW)</label>
                          <input
                            type="number"
                            min={0}
                            className={inputClass}
                            placeholder="60"
                            value={form.powerKw}
                            onChange={(e) => update("powerKw", e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* STEP 3 — Media + amenities */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Image URLs</label>
                    <div className="space-y-2">
                      {form.images.map((img, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className={inputClass}
                            placeholder="https://..."
                            value={img}
                            onChange={(e) => setImage(i, e.target.value)}
                          />
                          {form.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addImage}
                      className="mt-2 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" /> Add another image
                    </button>
                    <p className="mt-1 text-xs text-slate-400">
                      Paste image URLs for now — file uploads come later.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITY_OPTIONS.map((a) => {
                        const selected = form.amenities.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => toggleAmenity(a)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 — Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ListChecks className="h-4 w-4 text-blue-600" /> Review your listing
                  </h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {[
                      ["Name", form.name],
                      ["Type", form.spotType],
                      ["Address", `${form.address}, ${form.city}`],
                      ["Coordinates", `${form.latitude}, ${form.longitude}`],
                      ["Slots", form.totalSlots],
                      ["Price / hour", `₹${form.pricePerHour}`],
                      ...(isEV
                        ? [
                            ["Charger", form.chargerType],
                            ["Power", `${form.powerKw} kW`],
                          ]
                        : []),
                      ["Images", `${form.images.filter(Boolean).length} added`],
                      ["Amenities", form.amenities.join(", ") || "None"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between px-4 py-2.5 text-sm">
                        <span className="text-slate-500">{k}</span>
                        <span className="max-w-[60%] text-right font-medium text-slate-900">
                          {v as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div className="mt-7 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    Publish listing <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}