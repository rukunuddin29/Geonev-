"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, MapPin, Plug, Search, SlidersHorizontal, Wifi, Coffee,
  ParkingSquare, ShieldCheck, Sun, Car, Bike, Truck, Battery, ChevronDown,
} from "lucide-react";
import api from "@/lib/api";

type SpotType = "CAR" | "BIKE" | "TRUCK" | "EV_CHARGING";
type StationStatus = "Available" | "Busy" | "Offline";
type SortOption = "newest" | "price-asc" | "price-desc" | "speed";

interface Parking {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string | null;
  latitude: number;
  longitude: number;
  spotType: SpotType;
  totalSlots: number;
  pricePerHour: number;
  chargerType: "NONE" | "AC" | "DC" | "BOTH";
  powerKw?: number | null;
  images: string[];
  amenities: string[];
  isActive: boolean;
  isBooked: boolean;
  createdAt: string;
}

const SPOT_TYPES = [
  { value: "EV_CHARGING", label: "EV Charging" },
  { value: "CAR", label: "Car" },
  { value: "BIKE", label: "Bike" },
  { value: "TRUCK", label: "Truck" },
];

const STATUS_OPTIONS: StationStatus[] = ["Available", "Busy", "Offline"];

const SPOT_LABEL = {
  EV_CHARGING: "EV Charging",
  CAR: "Car",
  BIKE: "Bike",
  TRUCK: "Truck",
};

// plain object — no generic annotation, TS infers it
const spotMeta = {
  EV_CHARGING: { icon: Zap, bg: "bg-blue-50", icon_c: "text-[#0066FF]", border: "border-blue-100" },
  CAR: { icon: Car, bg: "bg-sky-50", icon_c: "text-sky-500", border: "border-sky-100" },
  BIKE: { icon: Bike, bg: "bg-amber-50", icon_c: "text-[#FFB800]", border: "border-amber-100" },
  TRUCK: { icon: Truck, bg: "bg-indigo-50", icon_c: "text-indigo-500", border: "border-indigo-100" },
};

const getStatus = (p: Parking): StationStatus =>
  !p.isActive ? "Offline" : p.isBooked ? "Busy" : "Available";

function StatusBadge({ status }: { status: StationStatus }) {
  const map = {
    Available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Busy: "bg-amber-50 text-amber-700 border border-amber-200",
    Offline: "bg-red-50 text-red-600 border border-red-200",
  };
  const dot = {
    Available: "bg-emerald-500",
    Busy: "bg-amber-500",
    Offline: "bg-red-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

function TypeBadge({ station }: { station: Parking }) {
  const label =
    station.spotType === "EV_CHARGING" && station.chargerType !== "NONE"
      ? station.chargerType
      : SPOT_LABEL[station.spotType];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20">
      {label}
    </span>
  );
}

function AmenityIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("wifi")) return <Wifi className="w-3.5 h-3.5" />;
  if (lower.includes("cafe") || lower.includes("café")) return <Coffee className="w-3.5 h-3.5" />;
  if (lower.includes("park") || lower.includes("covered")) return <ParkingSquare className="w-3.5 h-3.5" />;
  if (lower.includes("cctv") || lower.includes("security") || lower.includes("guard")) return <ShieldCheck className="w-3.5 h-3.5" />;
  if (lower.includes("solar") || lower.includes("lit")) return <Sun className="w-3.5 h-3.5" />;
  return <Plug className="w-3.5 h-3.5" />;
}

function StationCard({ station, index }: { station: Parking; index: number }) {
  const meta = spotMeta[station.spotType] ?? spotMeta.EV_CHARGING;
  const Icon = meta.icon;
  const status = getStatus(station);
  const thumb = station.images?.find(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/stations/${station.id}`} className="block group">
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-shadow duration-200 group-hover:shadow-xl group-hover:border-slate-200 h-full flex flex-col">
          {/* Thumb */}
          <div className={`relative h-44 flex items-center justify-center flex-shrink-0 overflow-hidden ${thumb ? "" : `${meta.bg} ${meta.border} border-b`}`}>
            {thumb ? (
              <img src={thumb} alt={station.name} className="h-full w-full object-cover" />
            ) : (
              <>
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                    maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                  }}
                />
                <Icon className={`w-14 h-14 ${meta.icon_c} opacity-90 relative z-10`} />
              </>
            )}
            <div className="absolute top-3 right-3 z-10"><StatusBadge status={status} /></div>
            <div className="absolute top-3 left-3 z-10"><TypeBadge station={station} /></div>
            {station.powerKw ? (
              <div className="absolute bottom-3 right-3 z-10 bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <Battery className="w-3.5 h-3.5 text-[#0066FF]" />
                <span className="text-xs font-bold text-slate-800">{station.powerKw} kW</span>
              </div>
            ) : null}
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-1">{station.name}</h3>
            <p className="text-slate-400 text-xs mb-3 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" /> {station.address}
            </p>

            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-500 flex items-center gap-1.5">
                <Plug className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-700">{station.totalSlots}</span> slots
              </span>
              <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-700">{station.city}</span>
              </span>
            </div>

            {station.amenities?.length > 0 && (
              <div className="flex gap-1.5 mb-4">
                {station.amenities.slice(0, 4).map((a) => (
                  <span key={a} title={a} className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <AmenityIcon name={a} />
                  </span>
                ))}
                {station.amenities.length > 4 && (
                  <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                    +{station.amenities.length - 4}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
              <div>
                <div className="text-xl font-extrabold text-slate-900 leading-none">
                  ₹{station.pricePerHour}
                  <span className="text-slate-400 text-xs font-normal ml-1">/hr</span>
                </div>
                <div className="text-slate-400 text-xs mt-1.5">
                  {station.state ? `${station.city}, ${station.state}` : station.city}
                </div>
              </div>
              <span className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_0_16px_rgba(0,102,255,0.25)]">
                Book Now
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
        active
          ? "bg-[#0066FF] border-[#0066FF] text-white shadow-[0_0_12px_rgba(0,102,255,0.3)]"
          : "bg-white border-slate-200 text-slate-500 hover:border-[#0066FF]/40 hover:text-[#0066FF]"
      }`}
    >
      {label}
    </button>
  );
}

export default function StationsPage() {
  const [stations, setStations] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<SpotType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StationStatus | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/parkings");
        setStations(res.data?.data ?? []);
      } catch (err: any) {
        setFetchError(err?.response?.data?.message || "Failed to load stations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = stations.filter((s) => {
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || s.spotType === typeFilter;
      const matchStatus = statusFilter === "all" || getStatus(s) === statusFilter;
      return matchQuery && matchType && matchStatus;
    });
    if (sort === "price-asc") result = [...result].sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.pricePerHour - a.pricePerHour);
    if (sort === "speed") result = [...result].sort((a, b) => (b.powerKw ?? 0) - (a.powerKw ?? 0));
    if (sort === "newest")
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [stations, query, typeFilter, statusFilter, sort]);

  const availableCount = stations.filter((s) => getStatus(s) === "Available").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100 px-4 pt-28 pb-10">
        <div className="pointer-events-none absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-[#0066FF]/8 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[#FFB800]/8 blur-[100px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative max-w-6xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 border border-[#0066FF]/30 bg-[#0066FF]/8 text-[#0066FF] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Zap className="w-3.5 h-3.5 fill-[#0066FF] text-[#0066FF]" />
            {availableCount} stations available right now
          </div>
          <h1 className="font-extrabold text-4xl md:text-5xl text-slate-900 mb-3 leading-tight tracking-tight">
            Find &amp; book{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">EV charging</span>
              <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 bg-[#FFB800]/40" />
            </span>{" "}
            near you.
          </h1>
          <p className="text-slate-500 text-base mb-8 max-w-xl">
            Browse, filter and book charging points listed by hosts across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, area or station name…"
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,102,255,0.35)] transition-colors hover:bg-[#0052CC] whitespace-nowrap">
              <Search className="h-4 w-4" /> Find Stations
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">{stations.length}</p>
              <p className="text-xs text-slate-400">Listed stations</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{availableCount}</p>
              <p className="text-xs text-slate-400">Available now</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-2 items-center">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
          <span className="text-slate-400 text-xs uppercase tracking-wider mr-1">Type:</span>
          <FilterChip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
          {SPOT_TYPES.map((t) => (
            <FilterChip key={t.value} label={t.label} active={typeFilter === t.value} onClick={() => setTypeFilter(t.value as SpotType)} />
          ))}
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <span className="text-slate-400 text-xs uppercase tracking-wider mr-1">Status:</span>
          <FilterChip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
          {STATUS_OPTIONS.map((s) => (
            <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
          <div className="ml-auto relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-600 outline-none cursor-pointer hover:border-[#0066FF]/40 transition-colors font-medium"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="speed">Fastest Speed</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-slate-400 text-xs font-medium ml-2 hidden sm:block">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-10 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-8 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-24">
            <p className="text-red-500 text-lg font-semibold mb-1">{fetchError}</p>
            <p className="text-slate-400 text-sm">Make sure your API server is running.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 text-lg font-semibold mb-1">No stations found</p>
            <p className="text-slate-400 text-sm">
              {stations.length === 0 ? "No hosts have listed a station yet." : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((station, i) => (
              <StationCard key={station.id} station={station} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}