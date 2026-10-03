import { Search, CalendarCheck, BatteryCharging } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Search nearby",
    desc: "Enter your location, filter by connector type, price, or speed. See live availability across thousands of stations.",
  },
  {
    n: "02",
    icon: CalendarCheck,
    title: "Reserve a slot",
    desc: "Book your charging slot in seconds. Pay securely in-app. Cancel for free up to 30 minutes before.",
  },
  {
    n: "03",
    icon: BatteryCharging,
    title: "Plug in &amp; go",
    desc: "Show up at your reserved time, scan the QR code on the station, and start charging. Receipt arrives in your inbox.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0066FF]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From search to charge in 3 steps.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            No apps to install per network, no membership cards, no surprises.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, i) => (
            <div key={step.n} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute left-[58px] top-7 hidden h-px w-[calc(100%-58px)] bg-gradient-to-r from-[#0066FF]/30 to-transparent md:block" />
              )}

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0066FF] text-white shadow-[0_8px_24px_-4px_rgba(0,102,255,0.4)]">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-5xl font-bold text-slate-100">{step.n}</span>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                {step.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed text-slate-600"
                dangerouslySetInnerHTML={{ __html: step.desc }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}