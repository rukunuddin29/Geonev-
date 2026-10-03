"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import {
  Zap, MapPin, CalendarCheck, Wallet, Plus, Pencil, Trash2, Battery,
  Star, Users, TrendingUp, Car, Bike, Truck, CheckCircle2, Loader2,
} from "lucide-react";

interface Parking {
  id: string;
  name: string;
  address: string;
  city: string;
  spotType: "CAR" | "BIKE" | "TRUCK" | "EV_CHARGING";
  totalSlots: number;
  pricePerHour: number;
  chargerType: "NONE" | "AC" | "DC" | "BOTH";
  powerKw?: number | null;
  images: string[];
  isActive: boolean;
  isBooked: boolean;
}

// ---- DUMMY DATA ----
const earningsData = [
  { month: "Jan", amount: 18200 },
  { month: "Feb", amount: 21500 },
  { month: "Mar", amount: 19800 },
  { month: "Apr", amount: 26400 },
  { month: "May", amount: 31200 },
  { month: "Jun", amount: 28900 },
  { month: "Jul", amount: 34600 },
];

const recentBookings = [
  { id: "b1", driver: "Aarav Sharma", station: "Indiranagar Hub", date: "Jul 28", amount: 480, status: "Completed" },
  { id: "b2", driver: "Priya Nair", station: "Koramangala Fast", date: "Jul 28", amount: 360, status: "Upcoming" },
  { id: "b3", driver: "Rohit Verma", station: "Indiranagar Hub", date: "Jul 27", amount: 240, status: "Completed" },
  { id: "b4", driver: "Sneha Iyer", station: "Whitefield Point", date: "Jul 26", amount: 600, status: "Cancelled" },
  { id: "b5", driver: "Karan Mehta", station: "Koramangala Fast", date: "Jul 25", amount: 420, status: "Completed" },
];

const spotMeta = {
  EV_CHARGING: { icon: Zap, bg: "bg-blue-50", icon_c: "text-[#0066FF]" },
  CAR: { icon: Car, bg: "bg-sky-50", icon_c: "text-sky-500" },
  BIKE: { icon: Bike, bg: "bg-amber-50", icon_c: "text-[#FFB800]" },
  TRUCK: { icon: Truck, bg: "bg-indigo-50", icon_c: "text-indigo-500" },
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#0066FF]" : "bg-slate-300"}`}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow"
      />
    </button>
  );
}

function StatCard({ icon: Icon, label, value, accent, delay, sub }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {sub ? <p className="mt-1 text-[11px] font-medium text-emerald-600">{sub}</p> : null}
    </motion.div>
  );
}

function EarningsChart() {
  const max = Math.max(...earningsData.map((d) => d.amount));
  return (
    <div className="flex h-44 items-end gap-2 px-1 sm:gap-3">
      {earningsData.map((d, i) => (
        <div key={d.month} className="flex flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[10px] font-semibold text-slate-500">{(d.amount / 1000).toFixed(0)}k</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: (d.amount / max) * 130 }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
            className="w-full max-w-[30px] rounded-t-md bg-gradient-to-t from-[#0066FF] to-[#7AB0FF]"
          />
          <span className="text-[10px] text-slate-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function OwnerDashboard() {
  const [stations, setStations] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<Parking | null>(null);
  const [editForm, setEditForm] = useState({ name: "", pricePerHour: "", totalSlots: "", isActive: true });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/parkings/my");
        setStations(res.data?.data ?? []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load your stations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const res = await api.patch(`/parkings/${id}/status`);
      const updated = res.data?.data;
      setStations((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch {
      setError("Could not update availability");
    }
  };

  const deleteStation = async (id: string) => {
    if (!confirm("Delete this station? This cannot be undone.")) return;
    try {
      await api.delete(`/parkings/${id}`);
      setStations((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Could not delete station");
    }
  };

  const openEdit = (s: Parking) => {
    setEditing(s);
    setEditForm({
      name: s.name,
      pricePerHour: String(s.pricePerHour),
      totalSlots: String(s.totalSlots),
      isActive: s.isActive,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const res = await api.put(`/parkings/${editing.id}`, {
        name: editForm.name,
        pricePerHour: Number(editForm.pricePerHour),
        totalSlots: Number(editForm.totalSlots),
        isActive: editForm.isActive,
      });
      const updated = res.data?.data;
      setStations((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditing(null);
    } catch {
      setError("Could not save changes");
    } finally {
      setSavingEdit(false);
    }
  };

  const totalStations = stations.length;
  const activeStations = useMemo(() => stations.filter((s) => s.isActive).length, [stations]);
  const totalEarnings = earningsData.reduce((a, b) => a + b.amount, 0);
  const thisMonth = earningsData[earningsData.length - 1].amount;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Zap className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-slate-900">
              Volt<span className="text-amber-500">Grid</span>
            </span>
          </Link>
          <Link
            href="/owner/create-listing"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Station
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Here's how your stations are performing.</p>
        </div>

        {error ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total earnings" value={inr(totalEarnings)} accent="bg-blue-50 text-blue-600" delay={0} sub="+12% vs last mo" />
          <StatCard icon={TrendingUp} label="This month" value={inr(thisMonth)} accent="bg-amber-50 text-amber-500" delay={0.05} />
          <StatCard icon={CalendarCheck} label="Total bookings" value="128" accent="bg-emerald-50 text-emerald-600" delay={0.1} />
          <StatCard icon={MapPin} label="Active stations" value={`${activeStations}/${totalStations}`} accent="bg-indigo-50 text-indigo-600" delay={0.15} />
        </div>

        {/* Earnings + side */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Earnings overview</h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">Last 7 months</span>
            </div>
            <EarningsChart />
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center gap-2 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
                <span className="text-2xl font-extrabold text-slate-900">4.8</span>
              </div>
              <p className="text-xs text-slate-400">Avg. rating across stations</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center gap-2 text-blue-600">
                <Users className="h-4 w-4" />
                <span className="text-2xl font-extrabold text-slate-900">312</span>
              </div>
              <p className="text-xs text-slate-400">Unique drivers served</p>
            </div>
          </div>
        </div>

        {/* Stations */}
        <section className="mb-6">
          <h2 className="mb-3 font-bold text-slate-900">My stations</h2>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : stations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold text-slate-700">No stations yet</p>
              <p className="mb-4 text-sm text-slate-400">List your first charging point to start earning.</p>
              <Link href="/owner/create-listing" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" /> Add Station
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stations.map((s, i) => {
                const meta = spotMeta[s.spotType] ?? spotMeta.EV_CHARGING;
                const Icon = meta.icon;
                const thumb = s.images?.find(Boolean);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className={`relative flex h-28 items-center justify-center ${thumb ? "" : meta.bg}`}>
                      {thumb ? (
                        <img src={thumb} alt={s.name} className="h-full w-full object-cover" />
                      ) : (
                        <Icon className={`h-10 w-10 ${meta.icon_c}`} />
                      )}
                      <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="truncate font-bold text-slate-900">{s.name}</h3>
                      <p className="mb-3 text-xs text-slate-400">{s.city}</p>
                      <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{inr(s.pricePerHour)}/hr</span>
                        <span>· {s.totalSlots} slots</span>
                        {s.powerKw ? (
                          <span className="flex items-center gap-1"><Battery className="h-3 w-3" /> {s.powerKw}kW</span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={s.isActive} onChange={() => toggleStatus(s.id)} />
                          <span className="text-xs text-slate-400">Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteStation(s.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bookings (dummy) */}
        <section>
          <h2 className="mb-3 font-bold text-slate-900">Recent bookings</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {recentBookings.map((b, i) => (
              <div key={b.id} className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm ${i !== 0 ? "border-t border-slate-100" : ""}`}>
                <div className="flex min-w-[140px] items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    {b.driver.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{b.driver}</p>
                    <p className="text-xs text-slate-400">{b.station}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{b.date}</span>
                <span className="font-semibold text-slate-900">{inr(b.amount)}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  b.status === "Completed" ? "bg-emerald-50 text-emerald-700"
                  : b.status === "Upcoming" ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600"
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Bookings & earnings are sample data until the booking model is built.</p>
        </section>
      </main>

      {/* Edit modal */}
      <AnimatePresence>
        {editing ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              <h3 className="mb-4 text-lg font-bold text-slate-900">Edit station</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Name</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Price/hr (₹)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={editForm.pricePerHour}
                      onChange={(e) => setEditForm({ ...editForm, pricePerHour: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Slots</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={editForm.totalSlots}
                      onChange={(e) => setEditForm({ ...editForm, totalSlots: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Available for booking</span>
                  <Switch checked={editForm.isActive} onChange={() => setEditForm({ ...editForm, isActive: !editForm.isActive })} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingEdit ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving</> : <><CheckCircle2 className="h-4 w-4" /> Save</>}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}