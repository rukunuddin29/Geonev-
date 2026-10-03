import Link from "next/link";
import { MapPin, Star, Zap, ArrowRight, Battery } from "lucide-react";

import hero1 from '../image/hero1.png'
import hero2 from '../image/hero2.png'

const stations = [
  {
    id: 1,
    name: "Downtown PowerHub",
    location: "San Francisco, CA",
    distance: "0.8 mi",
    price: "0.32",
    rating: 4.9,
    reviews: 142,
    power: "150 kW",
    connectors: ["CCS", "Type 2"],
    status: "available",
    gradient: "from-[#0066FF] to-[#0052CC]",
  },
  {
    id: 2,
    name: "Greenfield Express",
    location: "Palo Alto, CA",
    distance: "2.1 mi",
    price: "0.28",
    rating: 4.8,
    reviews: 89,
    power: "250 kW",
    connectors: ["CCS", "CHAdeMO"],
    status: "busy",
    gradient: "from-[#FFB800] to-[#F59E0B]",
  },
  {
    id: 3,
    name: "Metro Charge Plaza",
    location: "Oakland, CA",
    distance: "3.4 mi",
    price: "0.35",
    rating: 4.7,
    reviews: 203,
    power: "350 kW",
    connectors: ["CCS", "Type 2", "Tesla"],
    status: "available",
    gradient: "from-slate-700 to-slate-900",
  },
];

export default function PopularStations() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0066FF]">
              Popular near you
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Top-rated stations.
            </h2>
            <p className="mt-3 max-w-lg text-slate-600">
              The most booked, best reviewed charging stations in your area.
            </p>
          </div>
          <Link
            href="/stations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:text-[#0052CC]"
          >
            View all stations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stations.map((s) => (
            <Link
              key={s.id}
              href={`/stations/${s.id}`}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-[#0066FF]/30 hover:shadow-[0_16px_48px_-12px_rgba(0,102,255,0.18)]"
            >
              {/* Cover */}
              <div
                className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${s.gradient}`}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(white 1.5px, transparent 1.5px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <Zap className="relative h-16 w-16 text-white" fill="currentColor" />
                <div
                  className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur ${
                    s.status === "available"
                      ? "bg-white/90 text-emerald-700"
                      : "bg-white/90 text-amber-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      s.status === "available" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {s.status === "available" ? "Available" : "Busy"}
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-[#0066FF]">
                      {s.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {s.location} · {s.distance}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1">
                    <Star className="h-3 w-3 fill-[#FFB800] text-[#FFB800]" />
                    <span className="text-xs font-semibold text-amber-900">
                      {s.rating}
                    </span>
                    <span className="text-[10px] text-amber-700">({s.reviews})</span>
                  </div>
                </div>

                <div className="my-4 flex flex-wrap gap-1.5">
                  {s.connectors.map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">From</p>
                    <p className="text-xl font-bold text-slate-900">
                      ${s.price}
                      <span className="text-sm font-normal text-slate-500">/kWh</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Battery className="h-4 w-4 text-emerald-500" />
                    {s.power}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}