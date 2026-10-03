import Link from "next/link";
import { ArrowRight, TrendingUp, DollarSign, Users } from "lucide-react";

const highlights = [
  { icon: DollarSign, value: "$300", label: "Avg monthly earnings" },
  { icon: Users, value: "50k+", label: "Active drivers" },
  { icon: TrendingUp, value: "97%", label: "Booking success rate" },
];

export default function HostCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 sm:px-16">
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#0066FF]/30 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#FFB800]/20 blur-[100px]" />

          {/* Dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#FFB800] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFB800]" />
                For station owners
              </div>

              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Own a charger?{" "}
                <span className="text-[#FFB800]">Earn while you sleep.</span>
              </h2>

              <p className="mt-5 max-w-md text-lg text-slate-300">
                List your charging station in 5 minutes. Set your own prices,
                manage availability, and get paid weekly.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_32px_rgba(0,102,255,0.4)] transition-colors hover:bg-[#0052CC]"
                >
                  Start hosting
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/become-host"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  Learn more
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFB800]/20">
                    <h.icon className="h-5 w-5 text-[#FFB800]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{h.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{h.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}