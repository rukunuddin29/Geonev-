import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Globe,
  Headphones,
  Car,
  Building2,
  Check,
  ArrowRight,
  Leaf,
} from "lucide-react";

export const metadata = {
  title: "About · GeoNEV",
  description:
    "GeoNEV is the marketplace connecting EV drivers with charging station hosts — cleaner roads, faster charging, and a network that grows with every plug.",
};

const stats = [
  { value: "50k+", label: "Active drivers" },
  { value: "2,500+", label: "Verified hosts" },
  { value: "10,000+", label: "Stations nationwide" },
  { value: "4.9", label: "Average rating" },
];

const values = [
  {
    icon: Zap,
    title: "Lightning-fast charging",
    body: "DC fast charging up to 350kW. Top up 80% in under 20 minutes at supported stations.",
  },
  {
    icon: ShieldCheck,
    title: "Every host verified",
    body: "All station owners undergo KYC verification. Every listing is inspected for safety and quality.",
  },
  {
    icon: Globe,
    title: "Nationwide network",
    body: "10,000+ stations across major cities, with real-time availability and pricing on every listing.",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    body: "Help is one tap away. Live support for drivers and hosts, any day, any time.",
  },
];

const driverPoints = [
  "Search nearby stations by location, connector, price or speed",
  "Reserve a charging slot in seconds and pay securely in-app",
  "Track active bookings and full charging history",
  "Save favorite stations and manage your profile",
];

const hostPoints = [
  "List your charging station in about 5 minutes",
  "Set your own prices, timings and availability",
  "Accept or decline bookings and monitor live sessions",
  "Track earnings, analytics and get paid weekly",
];

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900">
      {/* ---------------- HERO (light) ---------------- */}
      <section className="relative overflow-hidden border-b border-slate-100 px-6 pb-20 pt-36 sm:pt-44">
        {/* soft brand glows */}
        <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[#0066FF]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-[360px] w-[360px] rounded-full bg-[#FFB800]/10 blur-[120px]" />
        {/* dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0066FF]/20 bg-[#0066FF]/10 px-3 py-1.5 text-xs font-medium text-[#0066FF]">
            <Leaf className="h-3.5 w-3.5" />
            About GeoNEV
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Powering the shift to{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">electric</span>
              <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 bg-[#FFB800]/50" />
            </span>{" "}
            — one charge at a time.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
            GeoNEV is the marketplace connecting EV drivers with charging
            station hosts. We turn idle chargers into a living, nationwide
            network — so finding and booking a charge takes seconds, not faith.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-medium text-white shadow-[0_0_32px_rgba(0,102,255,0.3)] transition-colors hover:bg-[#0052CC]"
            >
              Find a station
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/become-host"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Become a host
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 divide-slate-100 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/60 lg:grid-cols-4 lg:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center">
              <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- MISSION ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
              Why we exist
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              EVs are outpacing the chargers built for them.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-slate-500">
            <p>
              Adoption is soaring, but public charging hasn&apos;t kept up — and
              meanwhile, thousands of perfectly good chargers sit idle in
              driveways and parking lots.
            </p>
            <p>
              <span className="font-semibold text-slate-900">
                GeoNEV turns that idle capacity into a living network.
              </span>{" "}
              Hosts list their stations in minutes and earn while they sleep.
              Drivers search nearby, reserve a slot, and charge on their own
              schedule — no per-network apps, no membership cards, no surprises.
            </p>
            <p>
              The result is a marketplace where supply meets demand street by
              street, making the switch to electric easier for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- TWO SIDES ---------------- */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
              One platform, two sides
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for drivers and hosts alike.
            </h2>
            <p className="mt-4 text-slate-500">
              Every driver who plugs in powers a host&apos;s earnings. Both get
              their own dashboard, permissions and tools.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Driver card */}
            <div className="rounded-3xl border border-slate-200 border-t-4 border-t-[#0066FF] bg-white p-8 shadow-sm transition-shadow hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF]/10 text-[#0066FF]">
                  <Car className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">For EV drivers</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {driverPoints.map((p) => (
                  <li key={p} className="flex gap-3 text-slate-600">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0066FF]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:gap-3 transition-all"
              >
                Start charging <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Host card */}
            <div className="rounded-3xl border border-slate-200 border-t-4 border-t-[#FFB800] bg-white p-8 shadow-sm transition-shadow hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFB800]/15 text-[#b07d00]">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">For station hosts</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {hostPoints.map((p) => (
                  <li key={p} className="flex gap-3 text-slate-600">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#b07d00]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/become-host"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b07d00] hover:gap-3 transition-all"
              >
                Earn while you sleep <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- VALUES ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
            What drives us
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Four things we refuse to compromise on.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#0066FF]/30 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF]/10 text-[#0066FF] transition-colors group-hover:bg-[#0066FF] group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-16 text-center sm:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-[520px] -translate-x-1/2 rounded-full bg-[#0066FF]/30 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[260px] w-[260px] rounded-full bg-[#FFB800]/15 blur-[100px]" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to plug in?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-400">
              Join thousands of EV drivers charging smarter every day.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-medium text-white shadow-[0_0_32px_rgba(0,102,255,0.4)] transition-colors hover:bg-[#0052CC]"
              >
                Find a station
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/become-host"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Become a host
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}