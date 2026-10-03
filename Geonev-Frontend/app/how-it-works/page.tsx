"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Search,
  MapPin,
  CalendarCheck,
  QrCode,
  BatteryCharging,
  Zap,
  Flag,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

/* ----------------------------- content ----------------------------- */
const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    blurb:
      "Getting started takes under a minute. Browse the whole map as a guest — you only need an account once you're ready to book a charge.",
    points: [
      "Sign up with just an email and password",
      "Pick the EV driver role to unlock booking",
      "Your session is saved, so you're ready next time",
    ],
  },
  {
    icon: Search,
    title: "Search nearby",
    blurb:
      "Type in a city or postal code and GeoNEV maps every station around you in real time — so you never drive out to a dead charger again.",
    points: [
      "Filter by connector type, price and charging speed",
      "See live availability before you set off",
      "Sort results by distance, rating or cost",
    ],
  },
  {
    icon: MapPin,
    title: "Compare stations",
    blurb:
      "Tap any pin to open its full profile. Everything you need to choose with confidence sits on one screen — no guesswork, no surprises at the plug.",
    points: [
      "Photos, power output (kW) and host rating",
      "Transparent per-kWh pricing with no hidden fees",
      "Honest reviews from drivers who've charged there",
    ],
  },
  {
    icon: CalendarCheck,
    title: "Reserve a slot",
    blurb:
      "Found the one? Lock it in. Choose your window, pay securely in the app, and the slot is held just for you until you arrive.",
    points: [
      "Choose your date, time and charging duration",
      "Pay securely — your card is never shared with hosts",
      "Free cancellation up to 30 minutes before",
    ],
  },
  {
    icon: QrCode,
    title: "Arrive & scan",
    blurb:
      "Roll up at your reserved time and scan the QR code on the unit. The station recognises your booking and unlocks for you instantly.",
    points: [
      "No membership cards or extra apps to fumble with",
      "The charger activates for your slot only",
      "Plug in and power starts flowing right away",
    ],
  },
  {
    icon: BatteryCharging,
    title: "Charge & go",
    blurb:
      "Top up and head off. Your receipt and session summary are waiting in your inbox before you've even left the lot.",
    points: [
      "Itemised receipt emailed to you automatically",
      "Every session saved to your charging history",
      "Rate the station to guide the next driver",
    ],
  },
];

/* --------------------------- road geometry --------------------------- */
const AMP = 26; // horizontal swing (% of width)
const WAVES = 2.1; // number of bends
const TOP = 0.08; // vertical padding (normalized)
const SPAN = 0.84; // usable vertical span

const roadX = (yNorm: number) => 50 + AMP * Math.sin(yNorm * Math.PI * WAVES);
const anchorY = (i: number) => TOP + (i / (STEPS.length - 1)) * SPAN;
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

function buildRoad() {
  const N = 80;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const y = i / N;
    pts.push(`${roadX(y).toFixed(2)} ${(y * 100).toFixed(2)}`);
  }
  return "M " + pts.join(" L ");
}
const ROAD = buildRoad();

/* =============================== page =============================== */
export default function HowItWorksPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const p = (window.innerHeight * 0.5 - rect.top) / rect.height;
        setProgress(clamp(p));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const carY = TOP + progress * SPAN; // normalized 0..1
  const carLeft = roadX(carY);
  const slope = AMP * Math.cos(carY * Math.PI * WAVES) * Math.PI * WAVES;
  const angle = clamp(slope * -0.45, -16, 16);
  const activeIndex = STEPS.reduce(
    (best, _, i) =>
      Math.abs(anchorY(i) - carY) < Math.abs(anchorY(best) - carY) ? i : best,
    0,
  );

  return (
    <main className="bg-white text-slate-900">
      {/* keyframes */}
      <style>{`
        @keyframes geo-dash { to { stroke-dashoffset: -32; } }
        @keyframes geo-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes geo-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
      `}</style>

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white px-6 pb-16 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full bg-[#0066FF]/10 blur-[120px]" />
        {/* mountains */}
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-0 left-0 h-40 w-full"
        >
          <path d="M0 220 L300 70 L520 180 L760 40 L1040 170 L1260 90 L1440 200 L1440 220 Z" fill="#e2e8f0" />
          <path d="M0 220 L240 130 L480 200 L720 110 L980 200 L1220 140 L1440 210 L1440 220 Z" fill="#cbd5e1" />
          {/* snow caps */}
          <path d="M740 52 L760 40 L782 58 L770 56 L760 50 L750 57 Z" fill="#fff" />
        </svg>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0066FF]/20 bg-[#0066FF]/10 px-3 py-1.5 text-xs font-medium text-[#0066FF]">
            <Zap className="h-3.5 w-3.5" fill="currentColor" />
            How it works
          </div>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            From search to charged,{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">one road</span>
              <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 bg-[#FFB800]/50" />
            </span>{" "}
            ahead.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
            Follow the route. Every turn is a step — scroll down and ride along
            as we walk you from sign-up to a full battery.
          </p>
          <div
            className="mt-10 inline-flex flex-col items-center gap-1 text-sm font-medium text-slate-400"
            style={{ animation: "geo-float 2s ease-in-out infinite" }}
          >
            Start the drive
            <ArrowDown className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* ---------------- JOURNEY ---------------- */}
      <section
        ref={sectionRef}
        className="relative mx-auto max-w-5xl px-4"
        style={{ height: `${STEPS.length * 46}vh` }}
      >
        {/* the road */}
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* asphalt */}
          <path
            d={ROAD}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={26}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={ROAD}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={20}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* center dashes */}
          <path
            d={ROAD}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={2}
            strokeDasharray="2 10"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ animation: "geo-dash 1s linear infinite" }}
          />
          {/* glowing progress trail */}
          <path
            d={ROAD}
            fill="none"
            stroke="#0066FF"
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            style={{ strokeDashoffset: 1 - progress, transition: "stroke-dashoffset 0.15s linear" }}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* trailhead */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-slate-400"
          style={{ left: `${roadX(0.02)}%`, top: "1%" }}
        >
          Trailhead
        </div>

        {/* markers + cards */}
        {STEPS.map((s, i) => {
          const y = anchorY(i);
          const x = roadX(y);
          const active = i === activeIndex && progress > 0.01;
          const visible = carY >= y - 0.13;
          const right = x < 50;
          const Icon = s.icon;
          return (
            <div key={s.title}>
              {/* marker on the road */}
              <div
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y * 100}%` }}
              >
                {active && (
                  <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-[#0066FF]/30" />
                )}
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white shadow-lg transition-all duration-300 ${
                    active
                      ? "scale-110 bg-[#0066FF] text-white"
                      : visible
                      ? "bg-[#0066FF] text-white"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB800] text-xs font-bold text-slate-900 shadow">
                    {i + 1}
                  </span>
                </div>
              </div>

              {/* card */}
              <div
                className="absolute w-[46%] max-w-[22rem] transition-all duration-500"
                style={{
                  top: `${y * 100}%`,
                  ...(right
                    ? { left: `calc(${x}% + 3rem)` }
                    : { right: `calc(${100 - x}% + 3rem)` }),
                  transform: `translateY(-50%) translateY(${visible ? 0 : 24}px)`,
                  opacity: visible ? 1 : 0,
                }}
              >
                <div
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
                    active ? "border-[#0066FF]/40 shadow-xl" : "border-slate-100"
                  }`}
                >
                  <h3 className="text-base font-bold sm:text-lg">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.blurb}</p>
                  <ul className="mt-3 space-y-1.5">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-xs text-slate-600 sm:text-sm"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FFB800]" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        {/* the car */}
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${carLeft}%`, top: `${carY * 100}%` }}
        >
          <div style={{ transform: `rotate(${angle}deg)` }}>
            <div style={{ animation: "geo-bob 1.4s ease-in-out infinite" }}>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0066FF] text-white shadow-[0_8px_24px_rgba(0,102,255,0.5)]">
                <Zap className="h-6 w-6" fill="currentColor" />
                {/* headlight glow */}
                <span className="absolute -bottom-1 left-1/2 h-4 w-10 -translate-x-1/2 rounded-full bg-[#FFB800]/40 blur-md" />
              </div>
            </div>
          </div>
        </div>

        {/* summit / finish */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${roadX(0.99)}%`, top: "99%" }}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-xl transition-colors duration-500 ${
              progress > 0.97 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
            }`}
          >
            <Flag className="h-7 w-7" />
          </div>
        </div>
      </section>

      {/* ---------------- OUTRO ---------------- */}
      <section className="px-6 pb-24 pt-8">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-16 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[520px] -translate-x-1/2 rounded-full bg-[#0066FF]/30 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#FFB800]/15 blur-[100px]" />
          <div className="relative">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <BatteryCharging className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              That&apos;s the whole route.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-400">
              From sign-up to a full battery in minutes — no apps per network, no
              membership cards, no surprises.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-medium text-white shadow-[0_0_32px_rgba(0,102,255,0.4)] transition-colors hover:bg-[#0052CC]"
              >
                Find a station <ArrowRight className="h-4 w-4" />
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