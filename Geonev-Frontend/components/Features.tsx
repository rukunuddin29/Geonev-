import { Zap, ShieldCheck, MapPinned, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning-fast charging",
    desc: "DC fast charging up to 350kW. Top up 80% in under 20 minutes at supported stations.",
    accent: "bg-[#0066FF]",
    soft: "bg-[#EFF6FF]",
    iconColor: "text-[#0066FF]",
  },
  {
    icon: ShieldCheck,
    title: "Every host verified",
    desc: "All station owners undergo KYC verification. Every listing inspected for safety and quality.",
    accent: "bg-[#FFB800]",
    soft: "bg-[#FEF3C7]",
    iconColor: "text-[#B45309]",
  },
  {
    icon: MapPinned,
    title: "Nationwide network",
    desc: "10,000+ stations across major cities. Real-time availability and pricing on every listing.",
    accent: "bg-[#0066FF]",
    soft: "bg-[#EFF6FF]",
    iconColor: "text-[#0066FF]",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 support",
    desc: "Help is one tap away. Live support for drivers and hosts, any day, any time.",
    accent: "bg-[#FFB800]",
    soft: "bg-[#FEF3C7]",
    iconColor: "text-[#B45309]",
  },
];

export default function Features() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0066FF]">
            Why VoltGrid
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for the road ahead.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything an EV driver needs, and everything a station host wants —
            in one platform.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#0066FF]/30 hover:shadow-[0_12px_40px_-12px_rgba(0,102,255,0.2)]"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.soft}`}
              >
                <f.icon className={`h-6 w-6 ${f.iconColor}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}