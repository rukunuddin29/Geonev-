"use client";

// app/stations/[id]/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStationById, Station, StationStatus, ChargerType } from "../../../lib/stations";

// ─── helpers ────────────────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-base" : "text-sm";
  return (
    <span className={`flex items-center gap-0.5 ${cls}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= Math.round(rating) ? "text-amber-400" : "text-white/20"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: StationStatus }) {
  const map: Record<StationStatus, string> = {
    Available: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    Busy: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    Offline: "bg-red-500/15 text-red-400 border border-red-500/30",
  };
  const dot: Record<StationStatus, string> = {
    Available: "bg-emerald-400",
    Busy: "bg-amber-400",
    Offline: "bg-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: ChargerType }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
      {type}
    </span>
  );
}

// ─── Booking Panel ──────────────────────────────────────────────────────────

function BookingPanel({ station }: { station: Station }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00 AM");
  const [duration, setDuration] = useState(1);
  const [booked, setBooked] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const estKwh = Math.round(station.speed * 0.7 * duration);
  const estCost = estKwh * station.price;

  function handleBook() {
    if (!date) return;
    // TODO: replace with real API call
    // e.g. await fetch("/api/bookings", { method:"POST", body: JSON.stringify({ stationId: station.id, date, time, duration }) })
    setBooked(true);
  }

  if (booked) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-bold text-emerald-400 text-lg mb-1">Booking Confirmed!</h3>
        <p className="text-white/50 text-sm mb-1">
          {station.name} · {date} · {time}
        </p>
        <p className="text-white/50 text-sm mb-4">{duration}h · Est. ₹{estCost}</p>
        <button
          onClick={() => setBooked(false)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Book another slot
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#141c2e] border border-white/10 rounded-2xl p-5">
      <h3 className="font-['Syne',sans-serif] font-bold text-white text-base mb-4">
        ⚡ Book a Charging Slot
      </h3>

      {station.status === "Offline" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-400">
          This station is currently offline and cannot be booked.
        </div>
      )}

      <label className="block text-white/40 text-xs mb-1">Select Date</label>
      <input
        type="date"
        value={date}
        min={today}
        onChange={(e) => setDate(e.target.value)}
        disabled={station.status === "Offline"}
        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400 transition-colors mb-3 disabled:opacity-40"
      />

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-white/40 text-xs mb-1">Start Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={station.status === "Offline"}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400 transition-colors disabled:opacity-40"
          >
            {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM",
              "01:00 PM","02:00 PM","03:00 PM","04:00 PM","06:00 PM","08:00 PM"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-white/40 text-xs mb-1">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={station.status === "Offline"}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400 transition-colors disabled:opacity-40"
          >
            {[1,2,3,4].map((h) => (
              <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-xl p-3.5 mb-4 space-y-1.5">
        <div className="flex justify-between text-xs text-white/50">
          <span>Rate</span>
          <span>₹{station.price}/kWh</span>
        </div>
        <div className="flex justify-between text-xs text-white/50">
          <span>Est. energy ({duration}h)</span>
          <span>{estKwh} kWh</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-white border-t border-white/10 pt-2 mt-1">
          <span>Estimated Total</span>
          <span className="text-emerald-400">₹{estCost}</span>
        </div>
      </div>

      <button
        onClick={handleBook}
        disabled={station.status === "Offline" || !date}
        className="w-full bg-emerald-400 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-[#001a0f] font-bold text-sm py-3 rounded-xl transition-colors font-['Syne',sans-serif]"
      >
        Confirm Booking →
      </button>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const station = getStationById(Number(params.id));

  if (!station) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-white text-xl font-bold mb-2">Station not found</h2>
          <p className="text-white/40 text-sm mb-6">
            The station you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/stations"
            className="bg-emerald-400 text-[#001a0f] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-500 transition-colors"
          >
            ← Back to Stations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Back */}
        <Link
          href="/stations"
          className="inline-flex items-center gap-2 text-white/40 hover:text-emerald-400 text-sm transition-colors mb-6"
        >
          ← Back to all stations
        </Link>

        {/* Hero card */}
        <div className="bg-[#141c2e] border border-white/10 rounded-2xl overflow-hidden mb-6">
          {/* Image / Emoji thumb */}
          <div className="h-52 bg-gradient-to-br from-[#1a2235] to-[#1e2a40] flex items-center justify-center text-7xl">
            {station.emoji}
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-['Syne',sans-serif] font-extrabold text-2xl md:text-3xl text-white mb-1">
                  {station.name}
                </h1>
                <p className="text-white/40 text-sm mb-3">📍 {station.address}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <StatusBadge status={station.status} />
                  <TypeBadge type={station.type} />
                  <span className="text-white/30 text-xs">{station.distance} away</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-['Syne',sans-serif] font-extrabold text-3xl text-emerald-400 leading-none">
                  ₹{station.price}
                  <span className="text-sm font-normal text-white/40 ml-1">/kWh</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end mt-1.5">
                  <StarRating rating={station.rating} size="lg" />
                  <span className="text-white/40 text-xs">
                    {station.rating} ({station.reviewCount})
                  </span>
                </div>
              </div>
            </div>

            <p className="text-white/50 text-sm leading-relaxed">{station.description}</p>
          </div>
        </div>

        {/* Two-column: info + booking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

          {/* Left: Station info */}
          <div className="space-y-5">
            <div className="bg-[#141c2e] border border-white/10 rounded-2xl p-5">
              <h2 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
                Station Info
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["Charger Type", station.type],
                    ["Power Output", station.power],
                    ["Total Slots", station.slots],
                    ["Free Slots", `${station.freeSlots} available`],
                    ["Operating Hours", station.hours],
                    ["Host", station.host],
                    ["Member Since", station.hostJoined],
                  ].map(([key, val]) => (
                    <tr
                      key={key}
                      className="border-b border-white/8 last:border-0"
                    >
                      <td className="py-2 text-white/40">{key}</td>
                      <td
                        className={`py-2 text-right font-medium ${
                          key === "Free Slots" && station.freeSlots > 0
                            ? "text-emerald-400"
                            : key === "Free Slots"
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Amenities */}
            <div className="bg-[#141c2e] border border-white/10 rounded-2xl p-5">
              <h2 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((a) => (
                  <span
                    key={a}
                    className="bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking panel */}
          <BookingPanel station={station} />
        </div>

        {/* Reviews */}
        <div className="bg-[#141c2e] border border-white/10 rounded-2xl p-5">
          <h2 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
            Reviews ({station.reviews.length} shown)
          </h2>
          <div className="space-y-3">
            {station.reviews.map((r, i) => (
              <div
                key={i}
                className="bg-white/4 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-white">{r.user}</span>
                  <StarRating rating={r.stars} />
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}